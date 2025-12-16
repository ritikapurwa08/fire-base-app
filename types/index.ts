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


