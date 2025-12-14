import { db } from "@/lib/firebase";
import { UserActivityLog } from "@/types/index";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const ActivityService = {
  /**
   * Logs a user action (e.g., Login, Study).
   */
  async logActivity(userId: string, action: UserActivityLog["action"], details?: string, minutesActive: number = 0) {
    try {
      await addDoc(collection(db, "activity_logs"), {
        userId,
        action,
        details,
        minutesActive,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
      // Fail silently for analytics
    }
  }
};
