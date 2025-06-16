import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA5atsWG-tRpSJLMHSqiVUG5let0sb87Uo",
  authDomain: "ticketing-9965a.firebaseapp.com",
  projectId: "ticketing-9965a",
  storageBucket: "ticketing-9965a.appspot.com",
  messagingSenderId: "751610285833",
  appId: "1:751610285833:web:2bb70e7b22577eb5760dd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 