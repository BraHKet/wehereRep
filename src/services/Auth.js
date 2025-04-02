// src/services/auth.js
import axios from 'axios';
import { auth, db } from '../firebase/config.js';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Funzione per gestire il login con Google
export const handleGoogleLogin = async (credentialResponse) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verifica se l'utente esiste già nel database
    const userData = await getDoc(doc(db, 'users', user.uid));
    
    if (!userData.exists()) {
      // Crea un nuovo documento utente
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.photoURL,
        authProvider: 'google',
        authProviderId: user.uid,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: {
          theme: 'light',
          notifications: true
        }
      });
};
    // Salva i dati utente nel localStorage per mantenerli tra le sessioni
    localStorage.setItem('weHereUser', JSON.stringify(userData));
    
    return { success: true, user: {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      picture: user.photoURL
    }};
  } catch (error) {
    console.error('Errore durante l\'autenticazione con Google:', error);
    return { success: false, error: error.message };
  }
};

// Funzione per verificare se l'utente è già loggato
export const checkUserAuthentication = () => {
  const userDataString = localStorage.getItem('weHereUser');
  if (!userDataString) {
    return null;
  }
  
  try {
    return JSON.parse(userDataString);
  } catch (e) {
    localStorage.removeItem('weHereUser');
    return null;
  }
};

// Funzione per il logout
export const logout = () => {
  localStorage.removeItem('weHereUser');
  // Se hai un backend, qui potresti fare una chiamata per invalidare la sessione
};