import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import type { AuthUser } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
  };
}

/**
 * AuthProvider — wraps the app and provides Firebase auth state.
 * Exposes login, logout, current user, and loading state.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const friendlyMessage = message.includes('invalid-credential')
        ? 'Invalid email or password'
        : message.includes('too-many-requests')
          ? 'Too many failed attempts. Try again later.'
          : 'Login failed. Please try again.';
      toast.error(friendlyMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
