import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "FIREBASE_CONFIG_PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "FIREBASE_CONFIG_PLACEHOLDER",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "FIREBASE_CONFIG_PLACEHOLDER",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "FIREBASE_CONFIG_PLACEHOLDER",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "FIREBASE_CONFIG_PLACEHOLDER",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "FIREBASE_CONFIG_PLACEHOLDER"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Easypaisa payment config (only shown at checkout)
export const EASYPAISA_CONFIG = {
  number: "03148305851",
  accountHolder: "Tanveer Ahmed"
};
