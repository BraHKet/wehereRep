// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import NotificationDemo from '../shared/NotificationDemo';
import { getUserParties } from '../services/Database';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userParties, setUserParties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carica i party dell'utente
  useEffect(() => {
    const fetchParties = async () => {
      try {
        setLoading(true);
        const parties = await getUserParties();
        setUserParties(parties);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel recupero dei party:', error);
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
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

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h1>Benvenuto, {user?.name?.split(' ')[0] || 'Utente'}!</h1>
          <p>Inizia a creare il tuo party di shopping con gli amici</p>
        </div>

        <div className="action-cards">
          <div className="action-card">
            <div className="card-icon">🎭</div>
            <h3>Crea un Party</h3>
            <p>Crea un nuovo party e invita i tuoi amici</p>
            <button 
              className="action-btn" 
              onClick={() => navigate('/create-party')}
            >
              Crea ora
            </button>
          </div>

          <div className="action-card">
            <div className="card-icon">👚</div>
            <h3>Sfoglia Prodotti</h3>
            <p>Esplora i nostri prodotti da diversi brand</p>
            <button 
              className="action-btn" 
              onClick={() => navigate('/products')}
            >
              Sfoglia
            </button>
          </div>

          <div className="action-card">
            <div className="card-icon">📋</div>
            <h3>I Miei Party</h3>
            <p>Visualizza i party a cui partecipi</p>
            <button 
              className="action-btn"
              onClick={() => navigate('/my-parties')}
            >
              Visualizza
            </button>
          </div>
        </div>

        <div className="recent-section">
          <h2>Party Recenti</h2>
          {loading ? (
            <div className="loading-state">Caricamento party in corso...</div>
          ) : userParties.length === 0 ? (
            <div className="empty-state">
              <p>Non hai ancora partecipato a nessun party</p>
              <button 
                className="create-party-btn"
                onClick={() => navigate('/create-party')} 
              >
                Crea il tuo primo party
              </button>
            </div>
          ) : (
            <div className="recent-parties-list">
              {/* Mostra solo i 3 party più recenti */}
              {userParties.slice(0, 3).map(party => (
                <div key={party.id} className="recent-party-item" onClick={() => navigate(`/party/${party.id}`)}>
                  <div className="recent-party-content">
                    <h3>{party.name}</h3>
                    <p>Data: {formatDate(party.date)}</p>
                    {party.isCreator && <span className="party-creator-badge">Creatore</span>}
                  </div>
                  <div className="view-party-button">
                    <span>Visualizza →</span>
                  </div>
                </div>
              ))}
              {userParties.length > 3 && (
                <button 
                  className="view-all-parties-btn"
                  onClick={() => navigate('/my-parties')}
                >
                  Vedi tutti i party
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale</p>
      </footer>
    </div>
  );
};

export default Dashboard;