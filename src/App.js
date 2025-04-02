// App.js - Componente principale dell'applicazione
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import { NotificationProvider } from './contexts/NotificationContext';

// Altri componenti da implementare
// import CreateParty from './components/CreateParty';
// import ProductCatalog from './components/ProductCatalog';
// import PartyDetail from './components/PartyDetail';
// import Checkout from './components/Checkout';
// Componente per proteggere le rotte che richiedono autenticazione
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // Mostra un loader mentre verifichiamo l'autenticazione
    return <div className="loading">Caricamento...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {

  // Inserisci qui il tuo ID cliente Google OAuth
  // Puoi ottenerlo dalla Google Developer Console: https://console.developers.google.com/
  const GOOGLE_CLIENT_ID = '719117789519-hmf8k0bvp8uqjbk9bk18dndbbpk4immb.apps.googleusercontent.com'; // Sostituisci con il tuo ID cliente Google

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Nuove rotte aggiunte */}
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <ProductCatalog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product/:productId" 
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Altre rotte protette possono essere aggiunte qui */}
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
    
  );
};

export default App;

