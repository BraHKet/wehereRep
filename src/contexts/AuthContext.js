// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkUserAuthentication, logout } from '../services/Auth';

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
    const checkAuth = async () => {
      const userData = checkUserAuthentication();
      setUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Funzione per aggiornare lo stato dell'utente dopo il login
  const login = (userData) => {
    setUser(userData);
  };

  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
    setUser(null);
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