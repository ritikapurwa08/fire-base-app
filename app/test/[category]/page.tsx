'use client';

import { useEffect, useState, use } from 'react';
// import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { QuestionService } from '@/services/question-service';
import { TestService } from '@/services/test-service';
import { Question } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Helper for category titles
const CATEGORY_MAP: Record<string, string> = {
  syn: 'Synonyms',
  ant: 'Antonyms',
  idi: 'Idioms',
  gra: 'Grammar',
  phv: 'Phrasal Verbs',
};

export default function TestRunnerPage({ params }: { params: Promise<{ category: string }> }) {
  // Unwrap params using React.use() or await in async component (Next.js 15)
  // For 'use client' we usually need to await logic if it's a promise, but params acts weird in client components.
  // Actually, in Next 15 client components, params is a Promise. We should use `use(params)`.
  const { category } = use(params);

  const { user } = useAuth();
  // const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store user answers: { questionId: selectedOptionId }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Store detailed attempts for final result
  const [attempts, setAttempts] = useState<
    {
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
      timestamp: number;
      explanation: string;
    }[]
  >([]);

  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function initTest() {
      if (!user) return; // Wait for auth

      try {
        // 1. Get user progress to find answered IDs
        const progress = await TestService.getUserProgress(user.uid);
        const answeredIds = progress?.answeredQuestionIds || [];

        // 2. Fetch new questions
        // Cast category string to expected type
        const cat = category as 'syn' | 'ant' | 'idi' | 'gra' | 'phv';
        const newQuestions = QuestionService.getQuestions(cat, answeredIds, 10);

        setQuestions(newQuestions);
      } catch (error) {
        console.error('Failed to load test', error);
      } finally {
        setLoading(false);
      }
    }

    initTest();
  }, [user, category]);

  const handleOptionSelect = (optionId: string) => {
    if (isFinished) return;

    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: optionId,
    }));
  };

  const handleNext = () => {
    // Record the attempt immediately or at the end?
    // Let's record locally now.
    const currentQ = questions[currentIndex];
    const selectedOptionId = answers[currentQ.id];

    // Check correctness
    const isCorrect = selectedOptionId === currentQ.correctOptionId; // Note: Interface mismatch check
    // Wait, the interface says 'correctOptionId'. In questions.json it was 'correctAnswer' string text sometimes.
    // But my store/question.ts uses correctOptionId and explicit IDs. So we are good!

    setAttempts((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOptionId,
        isCorrect,
        timestamp: Date.now(),
        explanation: currentQ.answerExplanation,
      },
    ]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setIsFinished(true);
    if (!user) return;

    // Calculate Final Attempt List (sync with state)
    // Actually we are updating 'attempts' on every next.
    // But for the LAST question, we need to make sure it's added.
    // Ah, 'handleNext' is called > updates attempts state.
    // If I call finishTest directly from handleNext, the state might not be updated yet due to closure.
    // Better way: Calculate the last attempt specifically or use a ref.
    // Or simpler: Just calculate all attempts from 'answers' map at the end.

    const finalAttempts = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
      isCorrect: answers[q.id] === q.correctOptionId,
      timestamp: Date.now(),
    }));

    const score = finalAttempts.filter((a) => a.isCorrect).length;

    const sessionData = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      attempts: finalAttempts,
    };

    setIsSaving(true);
    await TestService.saveTestSession(user.uid, sessionData);
    setIsSaving(false);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Category Complete!</h2>
        <p className="text-muted-foreground mt-2">
          You have answered all available questions in {CATEGORY_MAP[category] || category}.
        </p>
        <Link
          href="/test"
          className="border-muted-foreground rounded-md border-2 px-5 py-2 transition-all duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (isFinished) {
    const score = attempts.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Test Results</h2>
            <p className="text-muted-foreground">{CATEGORY_MAP[category]}</p>
          </div>

          <div className="bg-card flex flex-col items-center justify-center rounded-2xl border p-8 shadow-sm">
            <div className="text-primary text-6xl font-bold">{percentage}%</div>
            <p className="text-muted-foreground mt-2 text-lg font-medium">
              You got {score} out of {questions.length} correct
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Review</h3>
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctOptionId;
              const correctOption = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <div
                  key={q.id}
                  className={`rounded-lg border p-4 ${isCorrect ? 'border-green-100' : 'border-red-400'}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {idx + 1}. {q.question}
                      </p>
                      {!isCorrect && (
                        <div className="mt-2 text-sm">
                          <p className="text-red-700">
                            Your answer: {q.options.find((o) => o.id === userAnswer)?.option}
                          </p>
                          <p className="text-green-700">Correct answer: {correctOption?.option}</p>
                          <p className="text-muted-foreground mt-1 italic">{q.answerExplanation}</p>
                        </div>
                      )}
                      {isCorrect && (
                        <p className="text-muted-foreground mt-2 text-sm italic">
                          {q.answerExplanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-6">
            <Link
              href="/test"
              className="border-muted-foreground rounded-md border-2 px-5 py-2 transition-all duration-300 ease-in-out hover:bg-white hover:text-black"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  // Calculate completion percentage for bar
  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
      {/* Header / Progress */}
      <div className="mb-8 w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/test"
            className="text-muted-foreground hover:text-foreground flex items-center text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Exit
          </Link>
          <span className="text-muted-foreground text-sm font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border p-6 shadow-sm md:p-8"
          >
            <div className="mb-6">
              <span className="bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                {CATEGORY_MAP[category] || category}
              </span>
              <h2 className="mt-4 text-2xl leading-tight font-bold md:text-3xl">
                {currentQ.question}
              </h2>
            </div>

            <div className="grid gap-3">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium">{option.option}</span>
                    {isSelected && <CheckCircle2 className="text-primary h-5 w-5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          <Button
            variant={'outline'}
            onClick={handleNext}
            disabled={!answers[currentQ.id]}
            className="bg-primary hover:bg-primary/90 flex items-center rounded-lg px-6 py-3 font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
