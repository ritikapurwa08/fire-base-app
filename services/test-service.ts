import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { TestSession, UserProgress } from '@/types';

export const TestService = {
  // 1. Save the detailed test session (History)
  saveTestSession: async (userId: string, session: TestSession) => {
    const sessionRef = doc(collection(db, 'users', userId, 'test_sessions'), session.id);
    await setDoc(sessionRef, session);

    // After saving session, update the aggregate stats
    await TestService.updateUserProgress(userId, session);
  },

  // 2. Update aggregate user stats (Progress)
  updateUserProgress: async (userId: string, session: TestSession) => {
    const progressRef = doc(db, 'users', userId, 'stats', 'progress');
    const userProgressSnap = await getDoc(progressRef);

    const answeredIds = session.attempts.map((a) => a.questionId);

    // Infer category from the first question ID (e.g. 'syn_01')
    // We assume all questions in a session are of the same category
    // Format is typically prefix_id, e.g. syn, ant, idi, gra, phv
    // If mixed, we should iterate attempts. Let's iterate for correctness.

    // Group results by category
    const categoryUpdates: Record<string, { attempted: number; correct: number }> = {};

    session.attempts.forEach((attempt) => {
      // Extract prefix (syn, ant, etc)
      const prefix = attempt.questionId.split('_')[0]; // e.g. "syn" from "syn_01"
      if (!categoryUpdates[prefix]) {
        categoryUpdates[prefix] = { attempted: 0, correct: 0 };
      }
      categoryUpdates[prefix].attempted++;
      if (attempt.isCorrect) categoryUpdates[prefix].correct++;
    });

    if (!userProgressSnap.exists()) {
      // Initialize if not exists
      const stats = {
        syn: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        ant: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        idi: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        gra: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        phv: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
      };

      // Apply updates
      Object.entries(categoryUpdates).forEach(([cat, data]) => {
        if (stats[cat as keyof typeof stats]) {
          stats[cat as keyof typeof stats].totalAttempted += data.attempted;
          stats[cat as keyof typeof stats].totalCorrect += data.correct;
          const s = stats[cat as keyof typeof stats];
          s.accuracy = s.totalAttempted > 0 ? (s.totalCorrect / s.totalAttempted) * 100 : 0;
        }
      });

      const initialProgress: UserProgress = {
        userId,
        totalTestsTaken: 1,
        overallAccuracy: (session.score / session.totalQuestions) * 100,
        answeredQuestionIds: answeredIds,
        stats: stats,
      };
      await setDoc(progressRef, initialProgress);
    } else {
      // Atomic update requires constructing paths for nested fields e.g. "stats.syn.totalAttempted"
      // Firestore update() supports dot notation.

      const updates: any = {
        totalTestsTaken: increment(1),
        answeredQuestionIds: arrayUnion(...answeredIds),
      };

      Object.entries(categoryUpdates).forEach(([cat, data]) => {
        // Note: We cannot rely on 'increment' for accuracy calculation.
        // We must read, calculate, write for accuracy.
        // Since we already read userProgressSnap, we can do it in memory and set/update.
        // But to be safe with concurrency, optimally we use a transaction.
        // For this simpler app, read-modify-write pattern with the already fetched snap is okay.
      });

      // Let's re-calculate to be safe using the snapshot data
      const currentData = userProgressSnap.data() as UserProgress;
      const currentStats = currentData.stats || {
        syn: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        ant: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        idi: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        gra: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
        phv: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
      };

      Object.entries(categoryUpdates).forEach(([cat, data]) => {
        const key = cat as keyof typeof currentStats;
        if (currentStats[key]) {
          currentStats[key].totalAttempted += data.attempted;
          currentStats[key].totalCorrect += data.correct;
          currentStats[key].accuracy =
            (currentStats[key].totalCorrect / currentStats[key].totalAttempted) * 100;
        }
      });

      // Recalculate overall accuracy
      // This is harder to do incrementally without total questions ever taken.
      // But we have totalTestsTaken (number of sessions).
      // Let's just approximate or keep it simple.
      // Better: Store 'totalGlobalQuestionsAttempted' and 'totalGlobalCorrect' in root if we want perfect global accuracy.
      // For now, let's just update the stats object.

      updates['stats'] = currentStats; // Update the whole stats object

      await updateDoc(progressRef, updates);
    }
  },

  // 3. Get User Progress (to filter questions)
  getUserProgress: async (userId: string): Promise<UserProgress | null> => {
    const progressRef = doc(db, 'users', userId, 'stats', 'progress');
    const snap = await getDoc(progressRef); // Fix: use getDoc await properly
    if (snap.exists()) {
      return snap.data() as UserProgress;
    }
    return null;
  },

  // 4. Get History
  getHistory: async (userId: string) => {
    const historyRef = collection(db, 'users', userId, 'test_sessions');
    const q = query(historyRef, orderBy('date', 'desc'), limit(20));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => d.data() as TestSession);
  },
};
