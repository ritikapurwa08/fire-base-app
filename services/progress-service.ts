import { db } from "@/lib/firebase";
import { UserWordProgress, LearningStatus } from "@/types/index";
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

export const ProgressService = {
  /**
   * Initializes progress for a word (When user first marks it as "Learning")
   */
  async initializeWordProgress(userId: string, wordId: string) {
    const progressId = `${userId}_${wordId}`;
    const docRef = doc(db, "word_progress", progressId);

    // Check if exists to avoid overwriting
    const snap = await getDoc(docRef);
    if (snap.exists()) return;

    const newProgress: Omit<UserWordProgress, 'nextReviewAt' | 'lastReviewAt'> = {
      id: progressId,
      userId,
      wordId,
      status: "Learning",
      easeFactor: 2.5,
      interval: 0,
      timesReviewed: 0,
      timesForgotten: 0,
    };

    await setDoc(docRef, {
      ...newProgress,
      nextReviewAt: serverTimestamp(), // Due immediately
      lastReviewAt: serverTimestamp(),
    });
  },

  /**
   * Updates progress based on review result (SRS Logic).
   * Simple logic: Correct -> Increase interval. Incorrect -> Reset interval.
   */
  async updateProgress(userId: string, wordId: string, isCorrect: boolean) {
    const progressId = `${userId}_${wordId}`;
    const docRef = doc(db, "word_progress", progressId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return; // Should allow init here ideally

    const data = snap.data() as any; // Cast to access fields easily
    let { easeFactor, interval, timesReviewed, timesForgotten, status } = data;

    // SRS Logic (Simplified SuperMemo-2)
    if (isCorrect) {
      if (interval === 0) interval = 1;
      else if (interval === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);

      timesReviewed += 1;
      if (status === "New" || status === "Learning") status = "Review";
    } else {
      interval = 0; // Reset
      timesForgotten += 1;
      status = "Learning"; // Back to learning
      easeFactor = Math.max(1.3, easeFactor - 0.2); // Decrease ease
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    await updateDoc(docRef, {
      status,
      easeFactor,
      interval,
      timesReviewed,
      timesForgotten,
      lastReviewAt: serverTimestamp(),
      nextReviewAt: nextReviewDate, // Firestore can take Date objects
    });
  },

  /**
   * Get all words due for review for a user.
   */
  async getDueWords(userId: string) {
    const now = new Date();
    const q = query(
      collection(db, "word_progress"),
      where("userId", "==", userId),
      where("nextReviewAt", "<=", now)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as UserWordProgress);
  }
};
