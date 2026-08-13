"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase";

interface AuthContextValue {
  /** Current Firebase user, or null when signed out. */
  user: User | null;
  /** True until the initial auth state has resolved (avoids UI flicker/redirects). */
  loading: boolean;
  /** False when .env is missing Firebase keys — auth actions will reject with a clear message. */
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  /** `remember` picks local (survives browser restarts) vs session-only persistence. */
  logIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Creates/refreshes the `users/{uid}` profile doc used by the rest of the app.
 * Best-effort: a Firestore failure (e.g. rules not yet deployed) must never
 * block sign-in/sign-up — the user is already authenticated at that point.
 */
async function upsertUserProfile(user: User): Promise<void> {
  try {
    const db = getFirebaseDb();
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email,
        photoURL: user.photoURL ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn("[auth] Failed to write user profile to Firestore:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect never runs during SSR, so this is the safe place to touch the
  // Firebase Auth SDK for the first time. This must never throw synchronously
  // — an uncaught error here would blow up the root layout for every page,
  // not just auth pages, since AuthProvider wraps the whole app.
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn(
        "[auth] Firebase isn't configured — see FIREBASE_SETUP.md. Auth features are disabled.",
      );
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
        },
        (error) => {
          console.error("[auth] onAuthStateChanged error:", error);
          setLoading(false);
        },
      );
      return unsubscribe;
    } catch (error) {
      console.error("[auth] Failed to initialize Firebase Auth:", error);
      setLoading(false);
      return;
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }
    await upsertUserProfile(credential.user);
  }, []);

  const logIn = useCallback(async (email: string, password: string, remember = true) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const credential = await signInWithPopup(auth, googleProvider);
    await upsertUserProfile(credential.user);
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured(),
      signUp,
      logIn,
      logInWithGoogle,
      logOut,
      resetPassword,
    }),
    [user, loading, signUp, logIn, logInWithGoogle, logOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
