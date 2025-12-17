// ==========================================
// 1. USER & PROFILE
// ==========================================

export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  emailVerified: boolean;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
  // Access Control
  role: UserRole;
  isDeleted: boolean;
  isPremium: boolean; // Good for monetization later
  // Gamification & Stats Summary (Denormalized for fast read)
}


type QuestionType = "syn" | "ant" | "idi" | "gra" | "phv";

interface QuestionOptionType {
  id: string;
  option: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: QuestionOptionType[];
  correctOptionId: string; // matched to QuestionOptionType.id
  answerExplanation: string;
}
export interface UserAttempt {
  questionId: string;      // Link to the Question
  selectedOptionId: string; // What they picked
  isCorrect: boolean;      // Calculated immediately
  timestamp: number;       // When they took it
}

export interface TestSession {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  attempts: UserAttempt[]; // Array of answers for this specific test
}

// Stats for a single category (e.g., Synonyms)
export interface CategoryStat {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number; // (totalCorrect / totalAttempted) * 100
}

// The Main User Object
export interface UserProgress {
  userId: string;
  totalTestsTaken: number;
  overallAccuracy: number;

  // Track specific IDs to know "from where to give them question"
  answeredQuestionIds: string[];

  // Accuracy per category
  stats: {
    syn: CategoryStat;
    ant: CategoryStat;
    idi: CategoryStat;
    gra: CategoryStat;
    phv: CategoryStat;
  };
}
