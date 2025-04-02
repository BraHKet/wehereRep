import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { handleGoogleLogin } from './services/Auth';
import { auth } from './firebase/config.js';
import { useAuth } from './contexts/AuthContext';
//import { auth } from './firebase/Config';  // Assicurati che il percorso sia corretto
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Componente principale della homepage
const HomePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, login } = useAuth();
  
    // Se l'utente è già autenticato, reindirizza alla dashboard
    useEffect(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      }
    }, [isAuthenticated, navigate]);
  
    // Gestisce la risposta di successo dall'autenticazione Google
    const handleLoginSuccess = async () => {
      try {
        // Chiama direttamente handleGoogleLogin senza passare credentialResponse
        const result = await handleGoogleLogin();
        if (result.success) {
          login(result.user);
          navigate('/dashboard');
        } else {
          console.error('Errore durante il login:', result.error);
          alert('Si è verificato un errore durante l\'accesso. Riprova più tardi.');
        }
      } catch (error) {
        console.error('Errore nel processare la risposta di Google:', error);
        alert('Si è verificato un errore imprevisto. Riprova più tardi.');
      }
    };
  
    // Gestisce gli errori di autenticazione Google
    const handleLoginError = () => {
      console.error('Login fallito');
      alert('Accesso fallito. Riprova più tardi.');
    };

  return (
    <div className="home-container">
    <div className="home-content">
      <div className="logo">We Here</div>
      <div className="tagline">Crea un party di shopping con i tuoi amici, prova i vestiti insieme e paga solo ciò che ti piace!</div>
      
      <div className="auth-container">
        <h2 className="auth-title">Accedi o Registrati</h2>
        
        {/* Componente GoogleLogin dalla libreria @react-oauth/google */}
        <div className="google-login-wrapper">
          <button 
            className="google-btn"
            onClick={handleLoginSuccess}
          >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <GoogleIcon className="google-icon" />
            <span>Continua con Google</span>
          </div>
          </button>
        </div>
        
        <div className="separator">
          <span>Cosa puoi fare</span>
        </div>
      </div>
      
      <div className="features">
        <Feature 
          icon="👗" 
          title="Scegli i capi" 
          description="Sfoglia prodotti di vari brand e aggiungi al tuo party i vestiti che ti piacciono." 
        />
        
        <Feature 
          icon="👥" 
          title="Invita amici" 
          description="Crea un party di shopping con i tuoi amici e condividi l'esperienza." 
        />
        
        <Feature 
          icon="🏠" 
          title="Prova a casa" 
          description="Ricevi i prodotti a casa, provalo con gli amici e paga solo ciò che decidi di tenere." 
        />
      </div>
      
      <div className="footer">
        &copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale
      </div>
    </div>
  </div>
);
};


// Componente per le caratteristiche
const Feature = ({ icon, title, description }) => {
  return (
    <div className="feature">
      <div className="feature-icon">{icon}</div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{description}</div>
    </div>
  );
};

// Componente per l'icona di Google
const GoogleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

export default HomePage;