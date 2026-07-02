import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasJoined: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseUserDoc(uid: string, data: Record<string, unknown>): User {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();

  return {
    uid,
    role: data.role as User['role'],
    teamId: data.teamId as User['teamId'],
    displayName: data.displayName as string | undefined,
    fcmToken: data.fcmToken as string | undefined,
    createdAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (snapshot.exists()) {
      setUser(parseUserDoc(firebaseUser.uid, snapshot.data()));
    } else {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }
    await loadUserProfile(auth.currentUser);
  }, [loadUserProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (!firebaseUser) {
          await signInAnonymously(auth);
          return;
        }

        setIsAuthenticated(true);
        await loadUserProfile(firebaseUser);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [loadUserProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      hasJoined: user !== null,
      refreshUser,
    }),
    [user, loading, isAuthenticated, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
