// src/components/shared/NotificationDemo.js
// Questo componente è solo per testare il sistema di notifiche
import React from 'react';
import { useNotifications } from '.././contexts/NotificationContext';
import { createNotification, NOTIFICATION_TYPES } from '.././services/Notifications';
import { useAuth } from '.././contexts/AuthContext';
import './NotificationDemo.css';

const NotificationDemo = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const createTestNotification = async (type) => {
    let title, message, data;
    
    switch (type) {
      case NOTIFICATION_TYPES.PARTY_INVITE:
        title = 'Nuovo invito a un party';
        message = 'Carlo ti ha invitato al suo party "Serata Casual"';
        data = {
          partyId: 103,
          inviterId: 'user-3',
          inviterName: 'Carlo'
        };
        break;
      
      case NOTIFICATION_TYPES.PRODUCT_ADDED:
        title = 'Nuovo prodotto nel party';
        message = 'Sofia ha aggiunto pantaloni al party "Shopping Weekend"';
        data = {
          partyId: 104,
          productId: 202,
          productName: 'Pantaloni casual',
          addedBy: 'Sofia'
        };
        break;
      
      case NOTIFICATION_TYPES.ORDER_UPDATE:
        title = 'Ordine in transito';
        message = 'Il tuo ordine #5678 è in transito';
        data = {
          orderId: 5678,
          status: 'in transito'
        };
        break;
      
      case NOTIFICATION_TYPES.SYSTEM:
        title = 'Promo speciale';
        message = 'Ottieni il 10% di sconto sul tuo prossimo party!';
        data = {
          promoCode: 'PARTY10'
        };
        break;
      
      default:
        title = 'Notifica test';
        message = 'Questa è una notifica di test';
        data = {};
    }
    
    try {
      const notification = await createNotification(
        user?.id || 'user-1',
        type,
        title,
        message,
        data
      );
      
      addNotification(notification);
      alert('Notifica creata con successo!');
    } catch (error) {
      console.error('Errore nella creazione della notifica:', error);
      alert('Errore nella creazione della notifica');
    }
  };

  return (
    <div className="notification-demo">
      <h3>Test Notifiche</h3>
      <p>Usa questi pulsanti per testare il sistema di notifiche</p>
      
      <div className="demo-buttons">
        <button 
          className="demo-button party" 
          onClick={() => createTestNotification(NOTIFICATION_TYPES.PARTY_INVITE)}
        >
          Invito Party
        </button>
        
        <button 
          className="demo-button product" 
          onClick={() => createTestNotification(NOTIFICATION_TYPES.PRODUCT_ADDED)}
        >
          Prodotto Aggiunto
        </button>
        
        <button 
          className="demo-button order" 
          onClick={() => createTestNotification(NOTIFICATION_TYPES.ORDER_UPDATE)}
        >
          Aggiornamento Ordine
        </button>
        
        <button 
          className="demo-button system" 
          onClick={() => createTestNotification(NOTIFICATION_TYPES.SYSTEM)}
        >
          Notifica Sistema
        </button>
      </div>
    </div>
  );
};

export default NotificationDemo;