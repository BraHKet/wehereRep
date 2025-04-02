// src/components/PartyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPartyById } from '../services/Database';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import LeavePartyButton from './LeavePartyButton';
import './PartyDetail.css';

const PartyDetail = () => {
  const { partyId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartyDetails = async () => {
      try {
        setLoading(true);
        const partyData = await getPartyById(partyId);
        
        if (!partyData) {
          setError('Party non trovato');
          setLoading(false);
          return;
        }
        
        setParty(partyData);
        setLoading(false);
      } catch (err) {
        console.error('Errore nel recupero del party:', err);
        setError('Si è verificato un errore nel caricamento del party');
        setLoading(false);
      }
    };

    fetchPartyDetails();
  }, [partyId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToMyParties = () => {
    navigate('/my-parties');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data non impostata';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data non valida';
    }
    
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isUserCreator = () => {
    return party && user && party.creatorId === user.id;
  };

  if (loading) {
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
        <div className="party-detail-container">
          <div className="loading-message">Caricamento dettagli party...</div>
        </div>
      </div>
    );
  }

  if (error || !party) {
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
        <div className="party-detail-container">
          <button className="back-arrow-button" onClick={handleBackToMyParties}>
            <span className="back-arrow">←</span> Torna ai miei party
          </button>
          <div className="error-message">{error || 'Party non trovato'}</div>
        </div>
      </div>
    );
  }

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

      <div className="party-detail-container">
        <button className="back-arrow-button" onClick={handleBackToMyParties}>
          <span className="back-arrow">←</span> Torna ai miei party
        </button>

        <div className="party-detail-content">
          <div className="party-header">
            <div className="party-header-info">
              <h1 className="party-title">{party.name}</h1>
              <p className="party-date">Data: {formatDate(party.date)}</p>
              {isUserCreator() && <span className="creator-badge">Sei il creatore</span>}
            </div>
            {party.imageUrl && (
              <div className="party-image">
                <img src={party.imageUrl} alt={party.name} />
              </div>
            )}
          </div>

          {party.description && (
            <div className="party-description">
              <h3>Descrizione</h3>
              <p>{party.description}</p>
            </div>
          )}

          <div className="party-members">
            <h3>Partecipanti ({party.members.length})</h3>
            <div className="members-list">
              {party.members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    <img 
                      src={member.user.profilePictureUrl || "https://via.placeholder.com/40"} 
                      alt={member.user.displayName} 
                    />
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.user.displayName}</div>
                    <div className="member-role">
                      {member.role === 'creator' ? 'Creatore' : 'Membro'}
                      {member.status === 'invited' && ' (Invitato)'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="party-products">
            <h3>Prodotti ({party.products.length})</h3>
            {party.products.length === 0 ? (
              <div className="empty-products">
                <p>Nessun prodotto aggiunto a questo party</p>
                <button 
                  className="add-product-btn"
                  onClick={() => navigate('/products')}
                >
                  Aggiungi un prodotto
                </button>
              </div>
            ) : (
              <div className="products-list">
                {party.products.map(productItem => (
                  <div 
                    key={productItem.id} 
                    className="product-item"
                    onClick={() => navigate(`/product/${productItem.product.id}`)}
                  >
                    <div className="product-image">
                      <img 
                        src={productItem.product.image || productItem.product.imageUrls?.[0]} 
                        alt={productItem.product.title} 
                      />
                    </div>
                    <div className="product-info">
                      <div className="product-title">{productItem.product.title}</div>
                      <div className="product-price">€{productItem.product.price.toFixed(2)}</div>
                      {productItem.selectedSize && (
                        <div className="product-size">Taglia: {productItem.selectedSize}</div>
                      )}
                      <div className="product-added-by">
                        Aggiunto da: {productItem.addedByUser?.displayName || 'Utente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pulsante per abbandonare il party */}
          <LeavePartyButton 
            partyId={party.id}
            partyName={party.name}
            isCreator={isUserCreator()}
          />
        </div>
      </div>

      <footer className="party-detail-footer">
        <p>&copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale</p>
      </footer>
    </div>
  );
};

export default PartyDetail;