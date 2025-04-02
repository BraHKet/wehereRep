// src/components/MyParties.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserParties } from '../services/Database';
import { useAuth } from '../contexts/AuthContext';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import './MyParties.css';

const MyParties = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setLoading(true);
        const userParties = await getUserParties();
        setParties(userParties);
        setLoading(false);
      } catch (err) {
        console.error('Errore nel recupero dei party:', err);
        setError('Si è verificato un errore nel caricamento dei party. Riprova più tardi.');
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePartyClick = (partyId) => {
    // In futuro, qui potresti navigare a una pagina di dettaglio del party
    navigate(`/party/${partyId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCreateParty = () => {
    navigate('/create-party');
  };

  // Funzione per formattare la data
  // Funzione per formattare la data
const formatDate = (dateString) => {
  // Se la data è vuota o non definita, mostra messaggio predefinito
  if (!dateString) return 'Data non impostata';
  
  // Prova a creare un oggetto Date valido
  const date = new Date(dateString);
  
  // Verifica che la data sia valida
  if (isNaN(date.getTime())) {
    console.warn('Data non valida:', dateString);
    return 'Data non valida';
  }
  
  // Formatta la data in formato italiano
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-small">We Here</div>
        <div className="user-menu">
          <NotificationIcon />
          <div className="user-info">
            <img 
              src={user?.picture || "https://via.placeholder.com/40"} 
              alt="Profile" 
              className="user-avatar" 
            />
            <span className="user-name">{user?.name || 'Utente'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <NotificationPanel />
      </header>

      <div className="my-parties-container">
        <div className="back-navigation">
          <button className="back-arrow-button" onClick={handleBackToDashboard}>
            <span className="back-arrow">←</span> Torna alla dashboard
          </button>
        </div>

        <div className="my-parties-header">
          <h1>I Miei Party</h1>
          <button className="create-party-btn" onClick={handleCreateParty}>
            Crea Nuovo Party
          </button>
        </div>

        {loading ? (
          <div className="loading-message">Caricamento party in corso...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : parties.length === 0 ? (
          <div className="empty-parties">
            <div className="empty-state">
              <p>Non hai ancora creato o partecipato a nessun party</p>
              <button 
                className="create-party-btn empty-state-btn"
                onClick={handleCreateParty}
              >
                Crea il tuo primo party
              </button>
            </div>
          </div>
        ) : (
          <div className="parties-grid">
            {parties.map(party => (
              <div 
                key={party.id} 
                className="party-card"
                onClick={() => handlePartyClick(party.id)}
              >
                <div className="party-image">
                  {party.imageUrl ? (
                    <img src={party.imageUrl} alt={party.name} />
                  ) : (
                    <div className="party-image-placeholder">
                      <span>🎭</span>
                    </div>
                  )}
                </div>
                <div className="party-info">
                  <h3 className="party-name">{party.name}</h3>
                  <p className="party-date">{formatDate(party.date)}</p>
                  {party.isCreator && <span className="creator-badge">Creatore</span>}
                  <div className="party-status">
                    <span className={`status-indicator ${party.status}`}></span>
                    <span className="status-text">
                      {party.status === 'active' ? 'Attivo' : 
                       party.status === 'completed' ? 'Completato' : 'In attesa'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale</p>
      </footer>
    </div>
  );
};

export default MyParties;