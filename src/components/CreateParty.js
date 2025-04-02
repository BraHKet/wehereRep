// src/components/CreateParty.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { createNotification, NOTIFICATION_TYPES } from '../services/Notifications';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import './CreateParty.css';
import ImageUploader from '../shared/ImageUploader';
import { createParty } from '../services/Database';
import { addProductToParty } from '../services/Database';

const CreateParty = () => {

  const [pendingProduct, setPendingProduct] = useState(null);

  useEffect(() => {
    // Controlla se c'è un prodotto in attesa di essere aggiunto
    const pendingProduct = sessionStorage.getItem('pendingProductToAdd');
    if (pendingProduct) {
      // Memorizza l'informazione per usarla dopo la creazione del party
      setPendingProduct(JSON.parse(pendingProduct));
    }
  }, []);
  
  const [partyImageUrl, setPartyImageUrl] = useState('');

  const handleImageUploaded = (url) => {
    setPartyImageUrl(url);
  };

  const [partyName, setPartyName] = useState('');
  const [partyDate, setPartyDate] = useState('');
  const [partyDescription, setPartyDescription] = useState('');
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // Validazione dei campi
  const validateForm = () => {
    const newErrors = {};
    
    if (!partyName.trim()) {
      newErrors.partyName = 'Il nome del party è obbligatorio';
    }
    
    if (!partyDate) {
      newErrors.partyDate = 'La data è obbligatoria';
    } else {
      const selectedDate = new Date(partyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.partyDate = 'La data non può essere nel passato';
      }
    }
    
    if (friends.length === 0) {
      newErrors.friends = 'Invita almeno un amico';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestisce l'aggiunta di un nuovo amico alla lista
  const handleAddFriend = () => {
    if (newFriend.trim() && !friends.includes(newFriend.trim())) {
      setFriends([...friends, newFriend.trim()]);
      setNewFriend('');
    }
  };

  // Gestisce la rimozione di un amico dalla lista
  const handleRemoveFriend = (friendToRemove) => {
    setFriends(friends.filter(friend => friend !== friendToRemove));
  };

  // Gestisce il submit del form
  // Gestisce il submit del form (versione corretta)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Prepara i dati del party assicurandoci che la data sia in formato corretto
    const partyData = {
      partyName,
      partyDate: partyDate, // Assicurati che questo sia nel formato YYYY-MM-DD come da input date
      partyDescription,
      partyImageUrl,
      friends
    };

    console.log("Data inviata al server:", partyData.partyDate);
    
    // Chiama la funzione createParty dal servizio Database
    const result = await createParty(partyData);
    
    if (result.success) {
      // Se c'è un prodotto in attesa, aggiungilo al party appena creato
      if (pendingProduct) {
        const { productId, selectedSize, selectedColor, quantity } = pendingProduct;
        
        // Aggiungi il prodotto al party
        await addProductToParty(result.partyId, productId, {
          selectedSize,
          selectedColor,
          quantity,
          notes: ''
        });
        
        // Rimuovi il prodotto in attesa
        sessionStorage.removeItem('pendingProductToAdd');
      }
      
      // Notifica di successo
      const notification = await createNotification(
        user.id,
        NOTIFICATION_TYPES.PARTY_INVITE,
        'Nuovo party creato',
        `Hai creato il party "${partyName}"${pendingProduct ? ' con un prodotto' : ''}`,
        {
          partyId: result.partyId,
          partyName,
          partyDate,
          friends
        }
      );
      
      // Aggiungi la notifica al context
      addNotification(notification);
      
      // Reindirizza alla pagina dei miei party
      navigate('/my-parties');
    } else {
      setErrors({ submit: result.error || 'Si è verificato un errore. Riprova più tardi.' });
    }
  } catch (error) {
    console.error('Errore durante la creazione del party:', error);
    setErrors({ submit: 'Si è verificato un errore. Riprova più tardi.' });
  } finally {
    setIsSubmitting(false);
  }
};

  // Torna alla dashboard
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="create-party-page">
      <header className="create-party-header">
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
          <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </header>
      
      <NotificationPanel />

      <div className="create-party-container">
        <button className="back-button" onClick={handleCancel}>
          ← Torna alla dashboard
        </button>

        <div className="create-party-content">
          <h1 className="create-party-title">Crea un Nuovo Party</h1>
          <p className="create-party-subtitle">Organizza un party di shopping con i tuoi amici</p>

          <form className="create-party-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="partyName">Nome del Party</label>
              <input
                type="text"
                id="partyName"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="es. Shopping Weekend, Festa di Compleanno..."
                className={errors.partyName ? 'error' : ''}
              />
              {errors.partyName && <div className="error-message">{errors.partyName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="partyDate">Data del Party</label>
              <input
                type="date"
                id="partyDate"
                value={partyDate}
                onChange={(e) => setPartyDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.partyDate ? 'error' : ''}
              />
              {errors.partyDate && <div className="error-message">{errors.partyDate}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="partyDescription">Descrizione (opzionale)</label>
              <textarea
                id="partyDescription"
                value={partyDescription}
                onChange={(e) => setPartyDescription(e.target.value)}
                placeholder="Aggiungi una descrizione per il party..."
                rows="3"
              />
            </div>

            <div className="form-group">
                <label>Immagine di copertina (opzionale)</label>
                <div className="party-image-container">
                    {partyImageUrl && (
                    <img 
                        src={partyImageUrl} 
                        alt="Party cover" 
                        className="party-image-preview" 
                    />
                    )}
                    <ImageUploader onImageUploaded={handleImageUploaded} />
                </div>
            </div>

            <div className="form-group">
              <label>Invita Amici</label>
              <div className="friend-input-container">
                <input
                  type="email"
                  value={newFriend}
                  onChange={(e) => setNewFriend(e.target.value)}
                  placeholder="Inserisci l'email di un amico"
                  className={errors.friends ? 'error' : ''}
                />
                <button 
                  type="button" 
                  className="add-friend-btn"
                  onClick={handleAddFriend}
                >
                  Aggiungi
                </button>
              </div>
              {errors.friends && <div className="error-message">{errors.friends}</div>}
              
              {friends.length > 0 && (
                <div className="friends-list">
                  <h3>Amici Invitati:</h3>
                  <ul>
                    {friends.map((friend, index) => (
                      <li key={index}>
                        <span>{friend}</span>
                        <button 
                          type="button" 
                          className="remove-friend-btn"
                          onClick={() => handleRemoveFriend(friend)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="create-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creazione in corso...' : 'Crea Party'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="create-party-footer">
        <p>&copy; {new Date().getFullYear()} We Here - La nuova esperienza di shopping sociale</p>
      </footer>
    </div>
  );
};

export default CreateParty;