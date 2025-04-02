// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Configurazione Firebase
// NOTA: Sostituisci questi valori con quelli del tuo progetto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCDAjB7qNMPNa8Fx_fT8Fkmt9C5ibUFiOA",
  authDomain: "we-here-f2a4b.firebaseapp.com",
  projectId: "we-here-f2a4b",
  storageBucket: "we-here-f2a4b.firebasestorage.app",
  messagingSenderId: "585323036284",
  appId: "1:585323036284:web:f2d28206c60eb6733253f9",
  measurementId: "G-Z2MWG2XD7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inizializza servizi
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };


