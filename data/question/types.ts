/* =====================================================
   QUESTION SYSTEM — CORE TYPES
   ===================================================== */

/* ---------- Question Categories ---------- */
export type QuestionCategory = 'synonym' | 'antonym' | 'idiom' | 'proverb' | 'grammar';

/* ---------- Question Type ---------- */
export type QuestionType = 'mcq' | 'descriptive';

/* ---------- Difficulty ---------- */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/* ---------- MCQ Option ---------- */
export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

/* ---------- Base Question ---------- */
export interface QuestionBase {
  questionId: string;
  category: QuestionCategory;
  questionType: QuestionType;
  questionText: string;
  difficulty: DifficultyLevel;
  examTags: string[];
  explanation?: string;
  createdAt?: string;
}

/* ---------- MCQ Question ---------- */
export interface MCQQuestion extends QuestionBase {
  questionType: 'mcq';
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

/* ---------- Descriptive Question ---------- */
export interface DescriptiveQuestion extends QuestionBase {
  questionType: 'descriptive';
  modelAnswer: string;
}

/* ---------- Unified Question ---------- */
export type Question = MCQQuestion | DescriptiveQuestion;

/* =====================================================
   TEST GENERATION & ATTEMPTS
   ===================================================== */

/* ---------- Test Modes ---------- */
export type TestMode =
  | 'diagnostic' // first & final score
  | 'practice' // unlimited attempts
  | 'revision' // only wrong questions
  | 'challenge'; // hard / timed

/* ---------- User Response ---------- */
export interface QuestionResponse {
  questionId: string;
  selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
  descriptiveAnswer?: string | null;
  isCorrect: boolean;
}

/* ---------- Test Attempt ---------- */
export interface TestAttempt {
  attemptId: string;
  userId: string;
  category: QuestionCategory;
  testMode: TestMode;

  totalQuestions: number;
  correctAnswers: number;
  score: number;
  maxScore: number;

  usedForRanking: boolean;
  responses: QuestionResponse[];

  startedAt: string;
  completedAt: string;
}

/* =====================================================
   USER–QUESTION MASTERY TRACKING
   ===================================================== */

/*
  masteryLevel meaning:
  0 → weak
  1 → improving
  2 → good
  3 → mastered
*/
export type MasteryLevel = 0 | 1 | 2 | 3;

/* ---------- Per Question User Stats ---------- */
export interface UserQuestionStat {
  userId: string;
  questionId: string;
  category: QuestionCategory;

  totalAttempts: number;
  correctAttempts: number;

  lastResult: 'correct' | 'wrong';
  masteryLevel: MasteryLevel;

  lastAttemptedAt: string;
}

/* =====================================================
   USER ANALYTICS (AGGREGATED)
   ===================================================== */

export interface CategoryPerformance {
  testsGiven: number;
  averageScore: number; // percentage
  accuracy: number; // 0–1
  lastAttemptAt: string;
}

/* ---------- User Analytics ---------- */
export interface UserAnalytics {
  userId: string;
  totalTestsGiven: number;

  categoryWise: Record<QuestionCategory, CategoryPerformance>;

  strongestCategory?: QuestionCategory;
  weakestCategory?: QuestionCategory;

  lastActiveAt: string;
}
