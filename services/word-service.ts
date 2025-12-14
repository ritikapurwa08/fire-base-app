import { db } from "@/lib/firebase";
import { Word } from "@/types/index";
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, limit, serverTimestamp, DocumentSnapshot } from "firebase/firestore";

export const WordService = {
  /**
   * Adds a new word to the database.
   */
  async addWord(wordData: Omit<Word, "id" | "createdAt" | "updatedAt">) {
    try {
      const docRef = await addDoc(collection(db, "words"), {
        ...wordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  },

  /**
   * Fetches a list of words.
   * TODO: Add pagination support later.
   */
  async getWords(limitCount = 20): Promise<Word[]> {
    try {
      const q = query(collection(db, "words"), orderBy("createdAt", "desc"), limit(limitCount));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to Dates if needed
      } as Word));
    } catch (error) {
      console.error("Error getting words:", error);
      throw error;
    }
  },

  async getWordById(id: string): Promise<Word | null> {
    const docRef = doc(db, "words", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Word;
    }
    return null;
  }
};
