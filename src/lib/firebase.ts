import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPeasiProfileKey1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "peasiprofile.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "peasiprofile-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "peasiprofile-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Only initialize Firebase in browser environments
if (typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn(
      "[Firebase] Initialization notice (using safe offline layer if live config is missing):",
      err,
    );
  }
}

export { app, auth, db };
