import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  authModalSuccessCallback?: () => void;
}

const LOCAL_USER_KEY = "peasiprofile:demo_user:v1";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(u: FirebaseUser | null): UserProfile | null {
  if (!u) return null;
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName || (u.email ? u.email.split("@")[0] : "User"),
    photoURL: u.photoURL,
    isAnonymous: u.isAnonymous,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCb, setAuthSuccessCb] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Check if live Firebase auth listener is ready
    if (auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser(mapFirebaseUser(firebaseUser));
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(LOCAL_USER_KEY);
            }
          } else {
            // Check if there was an offline/local session
            if (typeof window !== "undefined") {
              const saved = window.localStorage.getItem(LOCAL_USER_KEY);
              if (saved) {
                try {
                  setUser(JSON.parse(saved));
                } catch {
                  setUser(null);
                }
              } else {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn("[Auth] onAuthStateChanged fallback to local storage:", err);
      }
    }

    // SSR or fallback
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
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

  const signInWithEmail = async (email: string, pass: string) => {
    if (auth && auth.app.options.apiKey && !auth.app.options.apiKey.startsWith("AIzaSyDemo")) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser(mapFirebaseUser(cred.user));
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      } catch (err: unknown) {
        // If live firebase rejects or is misconfigured, handle accordingly
        console.error("Firebase auth error:", err);
        throw err;
      }
    }

    // Offline / Demo fallback
    const mockUser: UserProfile = {
      uid: "user_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      displayName: email.split("@")[0] || "User",
      photoURL: null,
    };
    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (auth && auth.app.options.apiKey && !auth.app.options.apiKey.startsWith("AIzaSyDemo")) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name && cred.user) {
          await updateProfile(cred.user, { displayName: name });
        }
        setUser(mapFirebaseUser(cred.user));
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      } catch (err: unknown) {
        console.error("Firebase signup error:", err);
        throw err;
      }
    }

    // Offline / Demo fallback
    const mockUser: UserProfile = {
      uid: "user_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      displayName: name || email.split("@")[0] || "User",
      photoURL: null,
    };
    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  };

  const signInWithGoogle = async () => {
    if (auth && auth.app.options.apiKey && !auth.app.options.apiKey.startsWith("AIzaSyDemo")) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        setUser(mapFirebaseUser(cred.user));
        setIsAuthModalOpen(false);
        triggerSuccess();
        return;
      } catch (err: unknown) {
        console.error("Firebase Google signin error:", err);
        throw err;
      }
    }

    // Offline / Demo fallback
    const mockUser: UserProfile = {
      uid: "google_user_demo",
      email: "alex.taylor@example.com",
      displayName: "Alex Taylor",
      photoURL:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    setUser(mockUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  };

  const signInGuest = async () => {
    const guestUser: UserProfile = {
      uid: "guest_" + Math.random().toString(36).substring(2, 8),
      email: "guest@peasiprofile.io",
      displayName: "Alex (Guest)",
      photoURL: null,
      isAnonymous: true,
    };
    setUser(guestUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    }
    setIsAuthModalOpen(false);
    triggerSuccess();
  };

  const signOut = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {}
    }
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName, photoURL });
      } catch {}
    }
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, displayName, photoURL: photoURL ?? prev.photoURL };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInGuest,
        signOut,
        updateUserProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalSuccessCallback: authSuccessCb,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
