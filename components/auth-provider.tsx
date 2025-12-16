'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

import { useAtom } from 'jotai';
import { userAtom } from '@/store/user-atoms';

// ... interface AuthContextType remains ...

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [storedUser, setStoredUser] = useAtom(userAtom);
  // Initialize with storedUser if available (optimistic), cast to User for compatibility
  // Note: storedUser lacks methods like .reload(), calling them before full hydation might error
  // but for initial rendering of UI (display name/avatar) it works perfectly.
  const [user, setUser] = useState<User | null>((storedUser as unknown as User) || null);
  const [loading, setLoading] = useState(!storedUser);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const currentUser = auth.currentUser;
      setUser({ ...currentUser });

      // Update store
      setStoredUser({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setStoredUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
        setStoredUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setStoredUser]); // Added dependency

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
