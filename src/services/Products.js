// src/services/products.js
import axios from 'axios';

// API Fake Store per test
const FAKE_STORE_API = 'https://fakestoreapi.com/products';

// Funzione per ottenere tutti i prodotti
export const getAllProducts = async () => {
  try {
    const response = await axios.get(FAKE_STORE_API);
    // Modifichiamo leggermente i dati per adattarli al nostro formato
    return response.data.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      brand: 'FakeStore', // Aggiungiamo un campo brand per simulare diversi brand
      rating: product.rating.rate,
      reviews: product.rating.count
    }));
  } catch (error) {
    console.error('Errore durante il recupero dei prodotti:', error);
    throw error;
  }
};

// Funzione per cercare prodotti in base a una query
export const searchProducts = async (query) => {
  try {
    const allProducts = await getAllProducts();
    // Filtra i prodotti in base alla query di ricerca
    if (!query) return allProducts;
    
    const searchTerm = query.toLowerCase();
    return allProducts.filter(product => 
      product.title.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm) || 
      product.category.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Errore durante la ricerca dei prodotti:', error);
    throw error;
  }
};

// Funzione per ottenere un singolo prodotto per ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${FAKE_STORE_API}/${id}`);
    const product = response.data;
    
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      brand: 'FakeStore',
      rating: product.rating.rate,
      reviews: product.rating.count
    };
  } catch (error) {
    console.error(`Errore durante il recupero del prodotto con ID ${id}:`, error);
    throw error;
  }
};

// Funzione per ottenere prodotti per categoria
export const getProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${FAKE_STORE_API}/category/${category}`);
    
    return response.data.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      brand: 'FakeStore',
      rating: product.rating.rate,
      reviews: product.rating.count
    }));
  } catch (error) {
    console.error(`Errore durante il recupero dei prodotti della categoria ${category}:`, error);
    throw error;
  }
};

// In futuro, qui aggiungeremo più API di e-commerce
// Esempio di come potrebbe essere l'integrazione di altre API:

// Funzione per ottenere prodotti da multiple API
export const getProductsFromMultipleApis = async () => {
  try {
    // 1. FakeStore API
    const fakeStoreProducts = await getAllProducts();
    
    // 2. Qui aggiungeremo altre API in futuro
    // const otherApiProducts = await getOtherApiProducts();
    
    // 3. Combina i risultati
    return [
      ...fakeStoreProducts,
      // ...otherApiProducts
    ];
  } catch (error) {
    console.error('Errore durante il recupero dei prodotti da multiple API:', error);
    throw error;
  }
};