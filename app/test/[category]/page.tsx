'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionService } from '@/services/question-service';
import { Question } from '@/data/question/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryTestPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const category = params.category as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      // @ts-expect-error - Assuming category matches the type for now
      const q = await QuestionService.getQuestions(category, 5);
      setQuestions(q);
      setLoading(false);
    };

    if (category) {
      fetchQuestions();
    }
  }, [category]);

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
      if (q.questionType === 'mcq' && answers[q.questionId] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    if (user) {
      await QuestionService.submitTestAttempt({
        userId: user.uid,
        // @ts-expect-error - category from params is string but backend expects enum
        category: category,
        testMode: 'practice',
        totalQuestions: questions.length,
        correctAnswers: calculatedScore,
        score: calculatedScore,
        maxScore: questions.length,
        usedForRanking: false,
        responses: questions.map((q) => ({
          questionId: q.questionId,
          selectedOption: (answers[q.questionId] || null) as 'A' | 'B' | 'C' | 'D' | null,
          isCorrect: q.questionType === 'mcq' ? answers[q.questionId] === q.correctAnswer : false,
        })),
        startedAt: new Date(), // Should ideally track real start time
        completedAt: new Date(),
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
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No questions found for this category.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMcq = currentQuestion.questionType === 'mcq';
  const selectedAnswer = answers[currentQuestion.questionId];

  return (
    <div className="container mx-auto max-w-2xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold capitalize">{category} Test</h1>
        <span className="text-muted-foreground text-sm">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          {isMcq && (
            <RadioGroup
              key={currentQuestion.questionId}
              value={selectedAnswer || ''}
              onValueChange={handleSelectOption}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = submitted && option.id === currentQuestion.correctAnswer;
                const isWrong =
                  submitted && isSelected && option.id !== currentQuestion.correctAnswer;

                let borderClass = 'border-input';
                if (isCorrect) borderClass = 'border-green-500 bg-green-50 dark:bg-green-950/20';
                if (isWrong) borderClass = 'border-red-500 bg-red-50 dark:bg-red-950/20';
                if (isSelected && !submitted) borderClass = 'border-primary';

                return (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-2 rounded-lg border p-4 ${borderClass}`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} disabled={submitted} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <span className="mr-2 font-semibold">{option.id}.</span>
                      {option.text}
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
              <Button onClick={() => router.push('/test')}>Back to Dashboard</Button>
            )
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </CardFooter>
      </Card>

      {submitted && (
        <div className="bg-card rounded-lg border p-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">Test Complete!</h2>
          <p className="text-xl">
            Your Score: {score} / {questions.length}
          </p>
        </div>
      )}
    </div>
  );
}
