// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 👈 Add the Auth SDK for your login system
import { getFirestore } from "firebase/firestore"; // 👈 If you use Firestore later

const firebaseConfig = {
  // Pull from Vite environment variables (highly recommended to hide raw keys in source control)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPIVq2CcZuYQYM5kBUY4uVGoltD3fQGvQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sed-marking.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sed-marking",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sed-marking.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "262772119357",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:262772119357:web:1069c5f15ba86a74515754",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8BLC3MG9P1"
};

// Initialize Firebase App instance
const app = initializeApp(firebaseConfig);

// 🚀 Initialize and export the core services you actually need across pages
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
