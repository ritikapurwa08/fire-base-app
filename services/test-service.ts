import { db } from "@/lib/firebase";
import { Question, TestResult } from "@/types/index";
import { collection, serverTimestamp, doc, runTransaction } from "firebase/firestore";

export const TestService = {
  /**
   * Fetches questions for a test.
   * Currently returns mock questions for demonstration.
   */
  async getQuestions(limitCount = 5): Promise<Question[]> {
    // Mock data updated to match questions.json structure
    return [
      {
        id: "q1",
        question: "What is a synonym for 'Abundant'?",
        type: "multiple-choice",
        category: "vocabulary",
        difficulty: "Beginner", // or "B1"
        options: ["Scarce", "Plentiful", "Tiny", "Weak"],
        correctAnswer: "Plentiful",
        explanation: "Abundant means existing in large quantities."
      },
      {
        id: "q2",
        question: "Choose the correct type for 'Run'.",
        type: "multiple-choice",
        category: "grammar",
        difficulty: "Beginner",
        options: ["Noun", "Verb", "Adjective", "Adverb"],
        correctAnswer: "Verb",
        explanation: "Run is an action."
      }
    ];
  },

  /**
   * Submits a test result and updates user stats atomically.
   */
  async submitTestResult(userId: string, resultData: Omit<TestResult, "id" | "userId" | "createdAt">) {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Prepare Refs
        const newResultRef = doc(collection(db, "test_results"));
        const userRef = doc(db, "users", userId);

        // 2. READ FIRST (Firestore Requirement: All reads before any writes)
        const userSnap = await transaction.get(userRef);

        // 3. WRITE Operations
        // 3a. Create Test Result
        transaction.set(newResultRef, {
          userId,
          ...resultData,
          createdAt: serverTimestamp(),
        });

        // 3b. Update User Stats if user exists
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentStats = userData.stats || {
             totalTestsTaken: 0,
             averageTestScore: 0,
             xp: 0
          };

          const newTotalTests = (currentStats.totalTestsTaken || 0) + 1;
          const currentAvg = currentStats.averageTestScore || 0;
          // New Avg = ((Old Avg * Old Count) + New Score) / New Count
          const newAvg = Math.round(((currentAvg * (newTotalTests - 1)) + resultData.score) / newTotalTests);

          transaction.update(userRef, {
            "stats.totalTestsTaken": newTotalTests,
            "stats.averageTestScore": newAvg,
            "stats.xp": (currentStats.xp || 0) + 10 + (resultData.score / 10), // Simple XP logic
            "stats.lastStudyDate": serverTimestamp(),
          });
        }
      });
      return true;
    } catch (error) {
      console.error("Error submitting test:", error);
      throw error;
    }
  }
};
