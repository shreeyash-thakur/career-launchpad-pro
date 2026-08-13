import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6Yq3Zza49qcaUmu3TvpfzHGz135Rnhqw",
  authDomain: "resumemaker-4dcec.firebaseapp.com",
  projectId: "resumemaker-4dcec",
  storageBucket: "resumemaker-4dcec.firebasestorage.app",
  messagingSenderId: "110761102358",
  appId: "1:110761102358:web:8a48f113a449bbc055b937",
  measurementId: "G-CBVKGZZLY3",
};

/**
 * CareerGPT runs on TanStack Start, which server-renders every route
 * (including /login and /signup). The Firebase Auth/Firestore/Storage/Analytics
 * SDKs assume a browser (window, indexedDB, etc.) and must never be touched
 * during SSR. Everything below is lazily created — the getters are only
 * ever called from client-only code (useEffect bodies and user-triggered
 * event handlers), never from module top-level or SSR render paths.
 */

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;
let analyticsInstance: Analytics | undefined;

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDKs are only available in the browser.");
  }
}

/** True once real Firebase config values are present. Config is hardcoded, so this is always true. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

function getFirebaseApp(): FirebaseApp {
  assertBrowser();
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

/**
 * Lazily initializes Firebase Analytics. `isSupported()` guards against
 * environments where analytics isn't available (e.g. some webviews), and
 * the whole call is browser-only so it never runs during SSR.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  assertBrowser();
  if (!analyticsInstance) {
    if (await isSupported()) {
      analyticsInstance = getAnalytics(getFirebaseApp());
    } else {
      return null;
    }
  }
  return analyticsInstance;
}

// Plain class instantiation — no browser APIs touched, safe at module scope.
export const googleProvider = new GoogleAuthProvider();