"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { WordService } from "@/services/word-service";
import { ProgressService } from "@/services/progress-service";
import { TestService } from "@/services/test-service";
import { ActivityService } from "@/services/activity-service";
import { Word } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [newWordText, setNewWordText] = useState("");
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchWords = async () => {
    setLoadingWords(true);
    try {
      const data = await WordService.getWords();
      setWords(data);
    } catch (error) {
       console.error(error);
       toast.error("Failed to fetch words");
    } finally {
      setLoadingWords(false);
    }
  };

  useEffect(() => {
    if (user) fetchWords();
  }, [user]);

  const handleAddWord = async () => {
    if (!newWordText) return;
    try {
      await WordService.addWord({
        word: newWordText,
        meaning: "A generated definition for testing.",
        hindiMeanings: ["परीक्षण अर्थ"],
        sentence: `This is an example for ${newWordText}.`,
        type: "word",
        level: "B2",
        tags: ["Test"],
        synonyms: [],
        antonyms: []
      });
      toast.success("Word added!");
      setNewWordText("");
      fetchWords(); // Refresh list
      // Log activity
      await ActivityService.logActivity(user!.uid, "WordAdded", `Added ${newWordText}`);
    } catch (error) {
      toast.error("Error adding word");
    }
  };

  const handleLearn = async (wordId: string) => {
    if (!user) return;
    try {
      await ProgressService.initializeWordProgress(user.uid, wordId);
      await ActivityService.logActivity(user.uid, "Study", "Started learning a word");
      toast.success("Started learning word! Activity logged.");
    } catch (error) {
      toast.error("Failed to start learning");
    }
  };

  const handleReview = async (wordId: string, correct: boolean) => {
     if (!user) return;
     try {
       await ProgressService.updateProgress(user.uid, wordId, correct);
       toast.success(correct ? "Marked Correct!" : "Marked Incorrect");
     } catch (error) {
       toast.error("Failed to update progress");
     }
  };

  const handleTakeMockTest = async () => {
    if (!user) return;
    try {
      // 1. Get Questions
      const questions = await TestService.getQuestions();
      console.log("Fetched Questions:", questions);

      // 2. Simulate Result (Score 100%)
      await TestService.submitTestResult(user.uid, {
        score: 100,
        totalQuestions: questions.length,
        correctAnswers: questions.length,
        timeTakenSeconds: 60,
        wrongAnswers: []
      });

      await ActivityService.logActivity(user.uid, "Test", "Completed mock test", 1);
      toast.success("Mock Test Completed! Score: 100%. Stats and Activity updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to take test");
    }
  };

  if (loading || !user) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Dashboard (Full System Test)</h1>
      <p className="text-muted-foreground">Verify all 5 Core Services: User, Word, Progress, Test, Activity.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>1. Vocabulary Manager</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New word..."
                value={newWordText}
                onChange={(e) => setNewWordText(e.target.value)}
              />
              <Button onClick={handleAddWord}>Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. Simulation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <Button className="w-full" variant="secondary" onClick={handleTakeMockTest}>
               Take Mock Quiz (Simulate 100% Score)
             </Button>
             <p className="text-xs text-muted-foreground">
               *Fetches questions, submits result, updates user XP/Stats, logs activity.
             </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>3. Word List & Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
             {loadingWords ? <Loader2 className="animate-spin" /> : words.map(word => (
               <div key={word.id} className="border p-4 rounded flex justify-between items-center bg-card">
                 <div>
                   <p className="font-bold text-lg">{word.word}</p>
                   <p className="text-sm text-muted-foreground">{word.meaning}</p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => handleLearn(word.id)}>Learn</Button>
                   <Button variant="ghost" size="sm" onClick={() => handleReview(word.id, true)}>Review (✓)</Button>
                 </div>
               </div>
             ))}
             {words.length === 0 && <p className="text-muted-foreground">No words found. Add one above!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
