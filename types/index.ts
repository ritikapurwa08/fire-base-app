// ==========================================
// 1. USER & PROFILE
// ==========================================

export type UserRole = "user" | "admin" | "moderator";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
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
  stats: UserStats;
}

// Keep stats separate or embedded, but essential for "Dashboard" speed
export interface UserStats {
  totalWordsLearned: number;
  totalTestsTaken: number;
  averageTestScore: number;
  currentStreakDays: number;
  lastStudyDate: Date | null;
  xp: number; // Experience points
  level: number;
}

// ==========================================
// 2. CONTENT (WORDS)
// ==========================================

export type WordType =
  | "Noun"
  | "Verb"
  | "Adjective"
  | "Adverb"
  | "PhrasalVerb"
  | "Idiom"
  | "Proverb";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";


export interface Word {
  id: string; // Firestore Doc ID
  word: string; // Renamed from text

  // Meanings & Context
  meaning: string; // Renamed from definition
  hindiMeanings: string[]; // Changed from string to string[]
  sentence: string; // Renamed from exampleSentence

  // Classification
  type: string; // Loosened to string to accept "word"
  level: string; // Loosened to string to accept "B2", "C1"
  step?: number; // Added from JSON
  isFavorite?: boolean; // Added from JSON

  tags?: string[]; // Kept optional

  // Relations (Advanced Logic)
  rootWordId?: string;

  // Related lists
  synonyms: string[];
  antonyms?: string[]; // Made optional

  // Multimedia (Advanced Features)
  audioUrl?: string;
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}


// ==========================================
// 3. LEARNING PROGRESS (The Advanced Part)
// ==========================================

// Instead of simple arrays, we track the "State" of every word for the user.
// This supports Spaced Repetition (SRS) algorithms like Anki.

export type LearningStatus = "New" | "Learning" | "Review" | "Mastered";

export interface UserWordProgress {
  id: string; // Usually combination of userId_wordId
  userId: string;
  wordId: string;

  status: LearningStatus;

  // Spaced Repetition Data
  easeFactor: number; // Multiplier for next interval (e.g., 2.5)
  interval: number;   // Days until next review
  nextReviewAt: Date; // The critical date for "Words to Review"
  lastReviewAt: Date;

  // Stats for this specific word
  timesReviewed: number;
  timesForgotten: number; // How many times they got it wrong
}

// ==========================================
// 4. TESTS & QUIZZES
// ==========================================

export type QuestionType = "MultipleChoice" | "FillBlank" | "MatchPair" | "TrueFalse";

export interface Question {
  id: string;
  linkedWordId?: string; // The word this question is testing

  question: string; // Renamed from text
  type: string; // Loosened to string (e.g. "multiple-choice")
  category: string; // Added from JSON (e.g. "grammar")
  difficulty: string; // Renamed from level (e.g. "B1")

  // Options for Multiple Choice
  options: string[];
  correctAnswer: string;

  explanation?: string; // Shown after user answers
}

export interface TestResult {
  id: string;
  userId: string;
  score: number;       // e.g., 85 (percent)
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number; // To track speed
  createdAt: Date;

  // Optional: Detailed breakdown of what they got wrong
  wrongAnswers: {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
  }[];
}

// ==========================================
// 5. ACTIVITY TRACKING (For Graphs/Charts)
// ==========================================

export interface UserActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD (easier for grouping)
  action: "Login" | "Study" | "Test" | "WordAdded";
  details?: string; // e.g., "Learned 5 new words"
  minutesActive: number; // Duration of session
}
