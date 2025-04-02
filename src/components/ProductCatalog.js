// src/components/ProductCatalog.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/Products';
import './ProductCatalog.css';
import NotificationIcon from '../shared/NotificationIcon';
import NotificationPanel from '../shared/NotificationPanel';
import { useAuth } from '../contexts/AuthContext';

const ProductCatalog = () => {

const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Carica i prodotti all'avvio
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await searchProducts('');
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento dei prodotti. Riprova più tardi.');
        setLoading(false);
        console.error('Errore nel caricamento dei prodotti:', err);
      }
    };


    
    fetchProducts();
  }, []);

  // Filtra i prodotti in base alla query di ricerca e alla categoria
  useEffect(() => {
    if (!products.length) return;

    let result = [...products];

    // Filtra per query di ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }

    // Filtra per categoria
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  // Ottieni le categorie uniche per i filtri
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Gestisci la ricerca
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Gestisci il cambio di categoria
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Vai alla pagina di dettaglio del prodotto
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  
    

  return (
    
    <div className="product-catalog-container">
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

      <div className="search-and-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cerca prodotti..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-button">
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'all' ? 'Tutte le categorie' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="products-section">
        {loading ? (
          <div className="loading-message">Caricamento prodotti in corso...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products-message">
            Nessun prodotto trovato per la tua ricerca.
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image-container">
                  <img src={product.image} alt={product.title} className="product-image" />
                </div>
                <div className="product-brand">{product.brand}</div>
                <div className="product-title">{product.title}</div>
                <div className="product-price">€{product.price.toFixed(2)}</div>
                <div className="product-rating">
                  {'★'.repeat(Math.round(product.rating))}
                  {'☆'.repeat(5 - Math.round(product.rating))}
                  <span className="product-reviews">({product.reviews})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;