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
  Timestamp,
} from 'firebase/firestore';
import {
  Question,
  QuestionCategory,
  TestAttempt,
  QuestionBase,
  TestMode,
} from '@/data/question/types';

export const QuestionService = {
  /**
   * Fetch questions by category and limit
   */
  async getQuestions(category: QuestionCategory, count: number = 10): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('category', '==', category), limit(count));

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });

      return questions;
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  },

  /**
   * Submit a test attempt result
   */
  async submitTestAttempt(
    attempt: Omit<TestAttempt, 'attemptId' | 'startedAt' | 'completedAt'> & {
      startedAt: Date;
      completedAt: Date;
    },
  ): Promise<string | null> {
    try {
      // Store dates as ISO strings for simpler querying/display, or Timestamps if strict backend needed.
      // The Type definition says 'string' for dates.
      const data = {
        ...attempt,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt.toISOString(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'test_attempts'), data);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting test attempt:', error);
      return null;
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
};
