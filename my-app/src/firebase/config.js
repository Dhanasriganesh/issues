import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyA5atsWG-tRpSJLMHSqiVUG5let0sb87Uo",
  authDomain: "ticketing-9965a.firebaseapp.com",
  projectId: "ticketing-9965a",
  storageBucket: "ticketing-9965a.firebasestorage.app",
  messagingSenderId: "751610285833",
  appId: "1:751610285833:web:2bb70e7b22577eb5760dd8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 