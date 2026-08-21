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
  auth,
  getFirebaseAuth,
  getFirebaseDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const LOCAL_USER_KEY = "peasiprofile:demo_user:v1";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function upsertUserProfile(u: User): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (db && !db.app.options.apiKey?.startsWith("AIzaSyDemo")) {
      await setDoc(
        doc(db, "users", u.uid),
        {
          uid: u.uid,
          name: u.displayName ?? "",
          email: u.email,
          photoURL: u.photoURL ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  } catch (error) {
    console.warn("[auth] Best-effort profile sync notice:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCb, setAuthSuccessCb] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth && !fbAuth.app.options.apiKey?.startsWith("AIzaSyDemo")) {
        const unsubscribe = onAuthStateChanged(
          fbAuth,
          (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
          },
          (error) => {
            console.error("[auth] onAuthStateChanged error:", error);
            setLoading(false);
          },
        );
        return () => unsubscribe();
      }
    } catch (error) {
      console.warn("[auth] Firebase Auth notice:", error);
    }

    // Local / Demo user fallback
    const saved = window.localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const openAuthModal = useCallback((onSuccess?: () => void) => {
    setAuthSuccessCb(() => onSuccess);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthSuccessCb(undefined);
  }, []);

  const triggerSuccess = useCallback(() => {
    if (authSuccessCb) {
      const cb = authSuccessCb;
      setAuthSuccessCb(undefined);
      cb();
    }
  }, [authSuccessCb]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth && !fbAuth.app.options.apiKey?.startsWith("AIzaSyDemo")) {
        const credential = await createUserWithEmailAndPassword(fbAuth, email, password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
        await upsertUserProfile(credential.user);
        setUser(credential.user);
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      }
    } catch (err) {
      console.warn("Firebase signup error, using local mode:", err);
    }

    const mockUser = {
      uid: "user_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      displayName: name || email.split("@")[0] || "User",
      photoURL: null,
    } as unknown as User;

    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  }, [triggerSuccess]);

  const logIn = useCallback(async (email: string, password: string, remember = true) => {
    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth && !fbAuth.app.options.apiKey?.startsWith("AIzaSyDemo")) {
        await setPersistence(fbAuth, remember ? browserLocalPersistence : browserSessionPersistence);
        const cred = await signInWithEmailAndPassword(fbAuth, email, password);
        setUser(cred.user);
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      }
    } catch (err) {
      console.warn("Firebase login error, using local mode:", err);
    }

    const mockUser = {
      uid: "user_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      displayName: email.split("@")[0] || "User",
      photoURL: null,
    } as unknown as User;

    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  }, [triggerSuccess]);

  const logInWithGoogle = useCallback(async () => {
    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth && !fbAuth.app.options.apiKey?.startsWith("AIzaSyDemo")) {
        const credential = await signInWithPopup(fbAuth, googleProvider);
        await upsertUserProfile(credential.user);
        setUser(credential.user);
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      }
    } catch (err) {
      console.warn("Google login notice:", err);
    }

    const mockUser = {
      uid: "google_user_demo",
      email: "alex.taylor@example.com",
      displayName: "Alex Taylor",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    } as unknown as User;

    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  }, [triggerSuccess]);

  const signInGuest = useCallback(async () => {
    const guestUser = {
      uid: "guest_" + Math.random().toString(36).substring(2, 8),
      email: "guest@peasiprofile.io",
      displayName: "Guest User",
      photoURL: null,
      isAnonymous: true,
    } as unknown as User;

    setUser(guestUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  }, [triggerSuccess]);

  const logOut = useCallback(async () => {
    try {
      const fbAuth = getFirebaseAuth();
      await firebaseSignOut(fbAuth);
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_USER_KEY);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const fbAuth = getFirebaseAuth();
    await sendPasswordResetEmail(fbAuth, email);
  }, []);

  const updateUserProfile = useCallback(async (displayName: string, photoURL?: string) => {
    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth.currentUser) {
        await updateProfile(fbAuth.currentUser, { displayName, photoURL });
      }
    } catch {}
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        displayName,
        photoURL: photoURL ?? prev.photoURL,
      } as User;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured(),
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      signUp,
      logIn,
      logInWithGoogle,
      logOut,
      resetPassword,
      signInWithEmail: (e, p) => logIn(e, p),
      signUpWithEmail: (e, p, n) => signUp(n || "", e, p),
      signInWithGoogle: logInWithGoogle,
      signInGuest,
      signOut: logOut,
      updateUserProfile,
    }),
    [
      user,
      loading,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      signUp,
      logIn,
      logInWithGoogle,
      logOut,
      resetPassword,
      signInGuest,
      updateUserProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
