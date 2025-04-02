// src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/Products';
import { useAuth } from '../contexts/AuthContext';
import './ProductDetail.css';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import { useNotifications } from '../contexts/NotificationContext';
import { createNotification, NOTIFICATION_TYPES } from '../services/Notifications';
import { getUserParties, addProductToParty } from '../services/Database';



const ProductDetail = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
    const handleLogout = () => {
      logout();
      navigate('/');
    };

  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [userParties, setUserParties] = useState([]);
  const navigate = useNavigate();

  // Carica i dettagli del prodotto
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductById(parseInt(productId));
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento del prodotto. Riprova più tardi.');
        setLoading(false);
        console.error('Errore nel caricamento del prodotto:', err);
      }
    };

    // Carica le informazioni sulle feste dell'utente
    // Questa è una simulazione, in un'app reale verrebbero dal backend
    const fetchUserParties = async () => {
      try {
        const userPartiesData = await getUserParties();
        setUserParties(userPartiesData);
      } catch (error) {
        console.error('Errore nel recupero dei party dell\'utente:', error);
      }
    };

    fetchProductDetails();
  fetchUserParties();
}, [productId]);

  // Gestisci la selezione della taglia
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Apri il modal per aggiungere al party
  const handleAddToParty = () => {
    if (!selectedSize) {
      alert('Per favore, seleziona una taglia prima di aggiungere al party.');
      return;
    }
    setShowPartyModal(true);
  };

  // Chiudi il modal
  const closeModal = () => {
    setShowPartyModal(false);
  };

  // Aggiungi il prodotto a un party esistente
  const addToExistingParty = async (partyId) => {
    try {
      // Prepara le opzioni del prodotto
      const options = {
        selectedSize,
        selectedColor: '', // Se hai implementato la selezione del colore
        quantity: 1,       // Puoi implementare la selezione della quantità
        notes: ''          // Note opzionali
      };

      // Chiamata alla funzione di database
    const result = await addProductToParty(partyId, product.id, options);
    
    if (result.success) {
      // Crea una notifica per l'utente
      const notification = await createNotification(
        user.id,
        NOTIFICATION_TYPES.PRODUCT_ADDED,
        'Prodotto aggiunto al party',
        `Hai aggiunto ${product.title} al tuo party`,
        {
          partyId,
          productId: product.id,
          partyProductId: result.partyProductId
        }
      );
      
      // Aggiungi la notifica
      addNotification(notification);
      
      alert('Prodotto aggiunto con successo al party!');
    } else {
      alert('Si è verificato un errore: ' + (result.error || 'Errore sconosciuto'));
    }
    
    closeModal();
  } catch (error) {
    console.error('Errore nell\'aggiunta del prodotto al party:', error);
    alert('Si è verificato un errore. Riprova più tardi.');
    closeModal();
  }
};
      
  // Crea un nuovo party con questo prodotto
  const createNewParty = () => {
    // Salva il prodotto ID in sessionStorage per recuperarlo dopo la creazione del party
    sessionStorage.setItem('pendingProductToAdd', JSON.stringify({
      productId: product.id,
      selectedSize,
      selectedColor: '',
      quantity: 1
    }));
    
    // Naviga alla pagina di creazione party
    navigate('/create-party');
  };
  // Torna al catalogo
  const handleBackToCatalog = () => {
    navigate('/products');
  };

  // Array di taglie di esempio (in un'app reale sarebbero dinamiche)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL'];

  if (loading) {
    return <div className="loading-container">Caricamento dettagli prodotto...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!product) {
    return <div className="error-container">Prodotto non trovato.</div>;
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
    <div className="product-detail-container">
      <button className="back-button" onClick={handleBackToCatalog}>
        ← Torna al catalogo
      </button>

      <div className="product-detail-content">
        <div className="product-image-gallery">
          <img src={product.image} alt={product.title} className="main-product-image" />
        </div>

        <div className="product-info">
          <div className="product-brand">{product.brand}</div>
          <h1 className="product-title">{product.title}</h1>
          <div className="product-price">€{product.price.toFixed(2)}</div>
          
          <div className="product-rating">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
            <span className="product-reviews">({product.reviews} recensioni)</span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-sizes">
            <h3>Taglie Disponibili</h3>
            <div className="size-options">
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="add-to-party-button" onClick={handleAddToParty}>
            Aggiungi al Party
          </button>
        </div>
      </div>

      {/* Modal per selezionare il party */}
      {showPartyModal && (
        <div className="party-modal-overlay">
          <div className="party-modal">
            <h2>Aggiungi al Party</h2>
            
            {userParties.length > 0 ? (
              <>
                <p>Seleziona un party esistente:</p>
                <div className="party-list">
                  {userParties.map(party => (
                    <div 
                      key={party.id} 
                      className="party-item"
                      onClick={() => addToExistingParty(party.id)}
                    >
                      <div className="party-name">{party.name}</div>
                      <div className="party-date">{party.date}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Non hai ancora creato nessun party.</p>
            )}
            
            <button className="create-party-button" onClick={createNewParty}>
              Crea Nuovo Party
            </button>
            
            <button className="close-modal-button" onClick={closeModal}>
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ProductDetail;