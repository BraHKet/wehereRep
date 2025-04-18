// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Creazione del contesto
const AuthContext = createContext(null);

// Hook personalizzato per utilizzare il contesto di autenticazione
export const useAuth = () => useContext(AuthContext);

// Provider del contesto di autenticazione
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controlla se l'utente è già autenticato all'avvio dell'app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({
          id: authUser.uid,
          email: authUser.email,
          name: authUser.displayName,
          picture: authUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Funzione per aggiornare lo stato dell'utente dopo il login
  const login = (userData) => {
    setUser(userData);
  };

  // Funzione per gestire il logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Valore da fornire al contesto
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;