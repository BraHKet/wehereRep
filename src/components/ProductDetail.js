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

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [userParties, setUserParties] = useState([]);
  const { user } = useAuth();
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
    const fetchUserParties = () => {
      // Simula il caricamento dei party dell'utente
      setUserParties([
        { id: 1, name: 'Festa di Compleanno', date: '15/05/2025' },
        { id: 2, name: 'Uscita Serale', date: '20/04/2025' }
      ]);
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
  const addToExistingParty = (partyId) => {
    // Qui implementeremo la logica per aggiungere il prodotto a un party esistente
    alert(`Prodotto aggiunto al party ${partyId}`);
    closeModal();
  };

  // Crea un nuovo party con questo prodotto
  const createNewParty = () => {
    // Qui implementeremo la logica per creare un nuovo party
    alert('Nuovo party creato con questo prodotto!');
    closeModal();
    // navigate('/my-parties');
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
  );
};

export default ProductDetail;