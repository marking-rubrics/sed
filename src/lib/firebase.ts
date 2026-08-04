// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 👈 Add the Auth SDK for your login system
import { getFirestore } from "firebase/firestore"; // 👈 If you use Firestore later

const firebaseConfig = {
  // Pull from Vite environment variables (highly recommended to hide raw keys in source control)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App instance
const app = initializeApp(firebaseConfig);

// 🚀 Initialize and export the core services you actually need across pages
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
