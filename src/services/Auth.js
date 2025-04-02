// src/services/auth.js
import axios from 'axios';

// Funzione per gestire il login con Google
export const handleGoogleLogin = async (credentialResponse) => {
    try {
      // Ottieni il token ID dalla risposta di Google
      const { credential } = credentialResponse;
      
      // Decodifica il token JWT per ottenere le informazioni dell'utente
      const decodedToken = JSON.parse(atob(credential.split('.')[1]));
      
      // Estrai le informazioni necessarie dal token decodificato
      const userData = {
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    
    // Salva i dati utente nel localStorage per mantenerli tra le sessioni
    localStorage.setItem('weHereUser', JSON.stringify(userData));
    
    return { success: true, user: userData };
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