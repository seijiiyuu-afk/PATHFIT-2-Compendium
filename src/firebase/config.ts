import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - replace with your own Firebase project config
// To get your own config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project
// 3. Add a web app
// 4. Copy the config object here
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForPlaceholder",
  authDomain: "pathfit2-compendium.firebaseapp.com",
  projectId: "pathfit2-compendium",
  storageBucket: "pathfit2-compendium.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
