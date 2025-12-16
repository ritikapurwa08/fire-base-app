import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  addDoc,
  serverTimestamp,
  writeBatch,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { Question, QuestionCategory, TestAttempt, QuestionSet } from '@/data/question/types';

export const QuestionService = {
  /**
   * Fetch questions by category, excluding those already attempted by the user.
   * Logic:
   * 1. Fetch user's past attempts for this category.
   * 2. Collect IDs of answered questions.
   * 3. Fetch a batch of questions from the category.
   * 4. Filter out the answered ones.
   * 5. If we run out of new questions, we could return previously mastered ones (Review Mode) - for now, we return fresh ones only.
   */
  async getQuestions(
    category: QuestionCategory,
    count: number = 10,
    userId?: string,
  ): Promise<Question[]> {
    try {
      // 1. Get raw questions (limit is higher to allow for filtering)
      // Note: In a real app with thousands of questions, we'd need a "cursor" or "unanswered_questions" array in user profile.
      // For this size, fetching 100 and filtering is fine.
      const q = query(collection(db, 'questions'), where('category', '==', category), limit(100));
      const querySnapshot = await getDocs(q);
      const allQuestions: Question[] = [];
      querySnapshot.forEach((doc) => allQuestions.push(doc.data() as Question));

      // 2. If no userId, return random subset
      if (!userId) {
        return allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
      }

      // 3. Fetch user's past test attempts for this category to find utilized questions
      // Optimization: We only need the 'responses' field, or better, we should have aggregated this.
      // For now, we query the attempts.
      const attemptsQuery = query(
        collection(db, 'test_attempts'),
        where('userId', '==', userId),
        where('category', '==', category),
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);

      const attemptedQuestionIds = new Set<string>();
      attemptsSnapshot.forEach((doc) => {
        const attempt = doc.data() as TestAttempt;
        attempt.responses.forEach((r) => attemptedQuestionIds.add(r.questionId));
      });

      // 4. Filter
      const freshQuestions = allQuestions.filter((q) => !attemptedQuestionIds.has(q.questionId));

      // 5. If we have enough fresh questions, return them
      if (freshQuestions.length >= count) {
        return freshQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
      }

      // 6. Fallback: If we don't have enough fresh questions, fill the rest with old questions (Review)
      // Or just return what we have if the user really wants new stuff.
      // Let's mix them: Fresh first, then random old ones.
      const remainingCount = count - freshQuestions.length;
      const reusedQuestions = allQuestions
        .filter((q) => attemptedQuestionIds.has(q.questionId))
        .sort(() => 0.5 - Math.random())
        .slice(0, remainingCount);

      return [...freshQuestions, ...reusedQuestions];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  /**
   * Submit a test attempt
   */
  async submitTestAttempt(attempt: Omit<TestAttempt, 'attemptId'>): Promise<void> {
    try {
      await addDoc(collection(db, 'test_attempts'), {
        ...attempt,
        attemptId: crypto.randomUUID(), // For querying consistency
        timestamp: serverTimestamp(), // Redundant but good for simple ordering
      });
    } catch (error) {
      console.error('Error submitting test attempt:', error);
      throw error;
    }
  },
  /**
   * Seed questions from JSON data (Admin only utility)
   */
  async seedQuestions(questions: Question[]): Promise<void> {
    const batch = writeBatch(db);

    questions.forEach((question) => {
      // Use questionId as document ID for easier deduping
      const docRef = doc(db, 'questions', question.questionId);
      batch.set(docRef, { ...question, createdAt: new Date().toISOString() });
    });

    await batch.commit();
  },

  /**
   * Get the next available set number for a category
   */
  async getNextSetNumber(category: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'question_sets'),
        where('category', '==', category),
        orderBy('setNumber', 'desc'),
        limit(1),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return 1;
      const lastSet = snapshot.docs[0].data() as QuestionSet;
      return lastSet.setNumber + 1;
    } catch (error) {
      console.error('Error getting next set number:', error);
      return 1;
    }
  },

  /**
   * Create a new Question Set
   */
  async createQuestionSet(set: QuestionSet): Promise<void> {
    const docRef = doc(db, 'question_sets', set.id);
    await setDoc(docRef, set);

    // Also seed the individual questions if they don't exist?
    // Yes, for querying purposes, it's good to have them in the main 'questions' collection too.
    // But to save writes/complexity, maybe we just keep them in the set?
    // User wants "Practice Mode" later, so having them in 'questions' allows global search/stats.
    // Let's reuse 'seedQuestions' logic here efficiently.
    await this.seedQuestions(set.questions);
  },

  /**
   * Get all sets for a category
   */
  async getQuestionSets(category: QuestionCategory): Promise<QuestionSet[]> {
    try {
      const q = query(
        collection(db, 'question_sets'),
        where('category', '==', category),
        orderBy('setNumber', 'asc'),
      );
      const snapshot = await getDocs(q);
      const sets: QuestionSet[] = [];
      snapshot.forEach((doc) => sets.push(doc.data() as QuestionSet));
      return sets;
    } catch (error) {
      console.error('Error getting question sets:', error);
      return [];
    }
  },
};
