import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6rExfNgJkKod1rbqFYD56-Xkd47UUjA8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vithoperibbbon.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vithoperibbbon",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vithoperibbbon.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "836323928620",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:836323928620:web:93b0f7daccd3ee4a8f3f89",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-M7XWQCXQ5S"
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw new Error('Firebase initialization failed');
}

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  // Import analytics dynamically to avoid SSR issues
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(error => {
    console.error('Analytics failed to load:', error);
  });
}
export { analytics };

// Initialize Firestore with error handling
let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firestore:', error);
  throw new Error('Firestore initialization failed');
}
export { db };

// Initialize Auth with error handling
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  throw new Error('Firebase Auth initialization failed');
}
export { auth };

// Connect to Firebase emulators in development environment
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator on port 8080');
  } catch (error) {
    console.warn('Failed to connect to Firestore emulator:', error);
  }
  
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('Connected to Auth emulator on port 9099');
  } catch (error) {
    console.warn('Failed to connect to Auth emulator:', error);
  }
}

export default app;