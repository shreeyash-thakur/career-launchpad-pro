import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] || "AIzaSyDemoPeasiProfileKey1234567890",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] || "peasiprofile.firebaseapp.com",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] || "peasiprofile-app",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] || "peasiprofile-app.appspot.com",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "123456789012",
  appId: env["VITE_FIREBASE_APP_ID"] || "1:123456789012:web:abcdef123456",
};

export function isFirebaseConfigured(): boolean {
  const key = env["VITE_FIREBASE_API_KEY"];
  return Boolean(key && !key.startsWith("AIzaSyDemo") && key !== "YOUR_API_KEY");
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("[Firebase] Initialization notice:", err);
  }
}

export const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth(): Auth {
  if (!auth) {
    if (!app) {
      app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    if (!app) {
      app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    }
    db = getFirestore(app);
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    if (!app) {
      app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    }
    storage = getStorage(app);
  }
  return storage;
}

export { app, auth, db, storage };