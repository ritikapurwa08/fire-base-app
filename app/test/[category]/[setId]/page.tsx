'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionService } from '@/services/question-service';
import { Question, QuestionSet } from '@/data/question/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestSetEnginePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const category = params.category as string;
  const setId = params.setId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [setInfo, setSetInfo] = useState<QuestionSet | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const docRef = doc(db, 'question_sets', setId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as QuestionSet;
          setSetInfo(data);
          setQuestions(data.questions);
        } else {
          toast.error('Test Set not found');
          router.push(`/test/${category}`);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    if (setId) {
      fetchSet();
    }
  }, [setId, category, router]);

  const handleSelectOption = (value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let calculatedScore = 0;

    questions.forEach((q) => {
      // Allow lowercase comparison just in case
      if (answers[q.questionId] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    if (user) {
      await QuestionService.submitTestAttempt({
        attemptId: crypto.randomUUID(), // Fill missing field
        userId: user.uid,
        category: category,
        setNumber: setInfo?.setNumber, // Link this attempt to the set
        score: calculatedScore,
        totalQuestions: questions.length,
        isPracticeMode: false, // TODO: Detect logic for "Practice" if re-taking
        responses: questions.map((q) => ({
          questionId: q.questionId,
          selectedOption: (answers[q.questionId] || null) as any,
          isCorrect:
            q.type === 'MULTIPLE_CHOICE' || q.type === 'mcq'
              ? answers[q.questionId] === (q as any).correctAnswer
              : false,
        })),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      toast.success('Test submitted successfully!');
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return null; // Redirect handled in useEffect
  }

  const currentQuestion = questions[currentIndex];
  // Safe cast for MCQ - currently assuming all are MCQ as per AI prompt
  const isMcq = currentQuestion.type === 'MULTIPLE_CHOICE';
  const selectedAnswer = answers[currentQuestion.questionId];

  return (
    <div className="container mx-auto max-w-2xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl font-bold capitalize">
              {category} Set #{setInfo?.setNumber}
            </h1>
            <p className="text-muted-foreground text-xs">
              Question {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          {isMcq && 'options' in currentQuestion && (
            <RadioGroup
              key={currentQuestion.questionId}
              value={selectedAnswer || ''}
              onValueChange={handleSelectOption}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => {
                // If option is just a string, handle it. If object {id, text}, handle it.
                // Types say string[] but old code used object.
                // Just in case, let's treat options as strings based on recent types.
                // Wait, types.ts says `options: string[]`.
                // Old code mapped `option.id`.
                const optionText = typeof option === 'string' ? option : (option as any).text;
                const optionId = typeof option === 'string' ? option : (option as any).id;

                const isSelected = selectedAnswer === optionId;
                // Double check property existence for safety
                const correctAnswer =
                  'correctAnswer' in currentQuestion
                    ? (currentQuestion.correctAnswer as string)
                    : '';
                const isCorrect = submitted && optionId === correctAnswer;
                const isWrong = submitted && isSelected && optionId !== correctAnswer;

                let borderClass = 'border-input';
                if (isCorrect) borderClass = 'border-green-500 bg-green-50 dark:bg-green-950/20';
                if (isWrong) borderClass = 'border-red-500 bg-red-50 dark:bg-red-950/20';
                if (isSelected && !submitted) borderClass = 'border-primary';

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 rounded-lg border p-4 ${borderClass}`}
                  >
                    <RadioGroupItem
                      value={optionId}
                      id={`${currentQuestion.questionId}-${idx}`}
                      disabled={submitted}
                    />
                    <Label
                      htmlFor={`${currentQuestion.questionId}-${idx}`}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="mr-2 font-semibold">{String.fromCharCode(65 + idx)}.</span>
                      {optionText}
                    </Label>
                    {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {isWrong && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {submitted && currentQuestion.explanation && (
            <div className="bg-muted mt-6 rounded-lg p-4 text-sm">
              <span className="mb-1 block font-semibold">Explanation:</span>
              {currentQuestion.explanation}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            !submitted ? (
              <Button onClick={handleSubmit} disabled={submitting || !selectedAnswer}>
                {submitting ? 'Submitting...' : 'Submit Test'}
              </Button>
            ) : (
              <Button onClick={() => router.push(`/test/${category}`)}>Back to Sets</Button>
            )
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </CardFooter>
      </Card>

      {submitted && (
        <div className="bg-card rounded-lg border p-6 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Set Complete!</h2>
          <div className="text-primary mb-2 text-4xl font-black">
            {score} / {questions.length}
          </div>
          <p className="text-muted-foreground">
            {score === questions.length ? 'Perfect Score! 🎉' : 'Good practice! Keep going.'}
          </p>
        </div>
      )}
    </div>
  );
}
