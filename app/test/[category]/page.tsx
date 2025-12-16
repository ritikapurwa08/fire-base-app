'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionService } from '@/services/question-service';
import { QuestionSet } from '@/data/question/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, PlayCircle, CheckCircle, Lock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function CategorySetsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const category = params.category as string;

  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        // @ts-expect-error - category type casting
        const data = await QuestionService.getQuestionSets(category.toUpperCase());
        setSets(data);
      } catch (error) {
        console.error('Failed to fetch sets:', error);
        toast.error('Failed to load question sets.');
      } finally {
        setDataLoading(false);
      }
    };

    if (category && user) {
      fetchSets();
    } else if (!authLoading && !user) {
      // Not logged in
      setDataLoading(false);
    }
  }, [category, user, authLoading]);

  const handleStartSet = (setId: string) => {
    router.push(`/test/${category}/${setId}`);
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Lock className="text-muted-foreground h-10 w-10" />
        <h2 className="text-xl font-semibold">Login Required</h2>
        <p className="text-muted-foreground">Please sign in to access practice sets.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight capitalize">{category} Preparation</h1>
        <p className="text-muted-foreground">
          Complete sets to master this topic. Select a set to begin.
        </p>
      </div>

      {sets.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <BookOpen className="text-muted-foreground mb-4 h-10 w-10 opacity-50" />
          <h3 className="text-lg font-semibold">No Sets Available</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            No question sets have been uploaded for {category} yet. Check back later or ask an admin
            to upload content.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <Card
              key={set.id}
              className="hover:border-primary/50 group cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleStartSet(set.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    Set {set.setNumber}
                  </Badge>
                  {/* Placeholder for "Completed" status check later */}
                  {/* <CheckCircle className="h-4 w-4 text-green-500" /> */}
                </div>
                <CardTitle className="mt-2 text-xl">Practice Set {set.setNumber}</CardTitle>
                <CardDescription>{set.totalQuestions} Questions • Mixed Difficulty</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                    <div className="bg-primary h-full w-0 transition-all duration-500 ease-out group-hover:w-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="group-hover:bg-primary/90 w-full">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
