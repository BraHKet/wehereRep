// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import NotificationDemo from '../shared/NotificationDemo';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
      </header>

      <NotificationPanel />

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
            <button className="action-btn">Crea ora</button>
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
            <button className="action-btn">Visualizza</button>
          </div>
        </div>

        <div className="recent-section">
          <h2>Party Recenti</h2>
          {/* Questo sarà sostituito con dati reali in futuro */}
          <div className="empty-state">
            <p>Non hai ancora partecipato a nessun party</p>
            <button className="create-party-btn">Crea il tuo primo party</button>
          </div>
        </div>
      </main>

      <NotificationDemo />

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale</p>
      </footer>
    </div>
  );
};

export default Dashboard;