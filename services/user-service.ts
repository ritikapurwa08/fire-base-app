import { db } from "@/lib/firebase";
import { User, UserRole, UserStats } from "@/types/index";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { User as AuthUser } from "firebase/auth";

// Default stats for a new user
const DEFAULT_STATS: UserStats = {
  totalWordsLearned: 0,
  totalTestsTaken: 0,
  averageTestScore: 0,
  currentStreakDays: 0,
  lastStudyDate: null,
  xp: 0,
  level: 1,
};

export const UserService = {
  /**
   * Creates a user document in Firestore when they sign up.
   */
  async createUserDocument(authUser: AuthUser) {
    const userRef = doc(db, "users", authUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser: User = {
        uid: authUser.uid,
        email: authUser.email || "",
        displayName: authUser.displayName || "",
        photoUrl: authUser.photoURL || undefined,
        emailVerified: authUser.emailVerified,
        createdAt: new Date(), // stored as Timestamp in Firestore, converted back in real app
        updatedAt: new Date(),
        lastSignInAt: new Date(),
        role: "user", // Default role
        isDeleted: false,
        isPremium: false,
        stats: DEFAULT_STATS,
      };

      try {
        await setDoc(userRef, {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastSignInAt: serverTimestamp()
        });
        return newUser;
      } catch (error) {
        console.error("Error creating user document", error);
        throw error;
      }
    }

    return userSnap.data() as User;
  },

  /**
   * Fetches the user's profile data from Firestore.
   */
  async getUserProfile(uid: string): Promise<User | null> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      // Convert User Timestamps to Dates if needed, or handle in component
      return {
          ...data,
          // Firestore Timestamps need conversion if you strictly use Date in TS
          // For simplicity in this step, we cast, but in prod we'd use a converter
      } as User;
    }
    return null;
  },

  /**
   * Updates only the specific fields provided.
   */
  async updateUserProfile(uid: string, data: Partial<User>) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
};
