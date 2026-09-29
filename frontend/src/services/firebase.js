import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyAssignmentor",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "assignmentor-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "assignmentor-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "assignmentor-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demoassignmentorapp"
};

let app;
let auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
} catch (error) {
  console.warn("[Firebase] Client initialization note:", error.message);
}

export { app, auth };
