// src/services/notifications.js

// Tipi di notifiche supportati
export const NOTIFICATION_TYPES = {
    PARTY_INVITE: 'PARTY_INVITE',
    PRODUCT_ADDED: 'PRODUCT_ADDED',
    ORDER_UPDATE: 'ORDER_UPDATE',
    SYSTEM: 'SYSTEM'
  };
  
  // Dati di notifica fittizi per demo
  const MOCK_NOTIFICATIONS = [
    {
      id: 1,
      userId: 'user-1',
      type: NOTIFICATION_TYPES.PARTY_INVITE,
      title: 'Nuovo invito a un party',
      message: 'Marco ti ha invitato al suo party "Serata Estiva"',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minuti fa
      data: {
        partyId: 101,
        inviterId: 'user-2',
        inviterName: 'Marco'
      }
    },
    {
      id: 2,
      userId: 'user-1',
      type: NOTIFICATION_TYPES.PRODUCT_ADDED,
      title: 'Nuovo prodotto nel party',
      message: 'Lucia ha aggiunto una camicia al party "Serata Elegante"',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 ore fa
      data: {
        partyId: 102,
        productId: 201,
        productName: 'Camicia elegante',
        addedBy: 'Lucia'
      }
    },
    {
      id: 3,
      userId: 'user-1',
      type: NOTIFICATION_TYPES.ORDER_UPDATE,
      title: 'Ordine confermato',
      message: 'Il tuo ordine #1234 è stato confermato',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 giorno fa
      data: {
        orderId: 1234,
        status: 'confermato'
      }
    },
    {
      id: 4,
      userId: 'user-1',
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'Benvenuto in We Here!',
      message: 'Grazie per esserti iscritto! Inizia a creare il tuo primo party.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 giorni fa
      data: {}
    }
  ];
  
  // Simula il recupero delle notifiche dal server
  export const fetchNotifications = async (userId) => {
    // Simula una chiamata API con un ritardo
    return new Promise((resolve) => {
      setTimeout(() => {
        // In un'implementazione reale, qui ci sarebbe una chiamata fetch/axios
        const userNotifications = MOCK_NOTIFICATIONS.filter(n => n.userId === userId || n.userId === 'user-1');
        resolve(userNotifications);
      }, 500);
    });
  };
  
  // Simula l'aggiunta di una nuova notifica
  export const createNotification = async (userId, type, title, message, data = {}) => {
    // In un'implementazione reale, qui ci sarebbe una chiamata API per creare la notifica
    const newNotification = {
      id: Date.now(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      data
    };
  
    // Simula il ritorno del server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newNotification);
      }, 300);
    });
  };
  
  // Simula il marcare una notifica come letta
  export const markAsRead = async (notificationId) => {
    // In un'implementazione reale, qui ci sarebbe una chiamata API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };
  
  // Simula la cancellazione di una notifica
  export const deleteNotification = async (notificationId) => {
    // In un'implementazione reale, qui ci sarebbe una chiamata API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };
  
  // Formatta la data della notifica in un formato leggibile
  export const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    // Converte in minuti
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Ora';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minuti'} fa`;
    } else if (diffMinutes < 60 * 24) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
    } else if (diffMinutes < 60 * 24 * 7) {
      const days = Math.floor(diffMinutes / (60 * 24));
      return `${days} ${days === 1 ? 'giorno' : 'giorni'} fa`;
    } else {
      // Formatta come data
      return date.toLocaleDateString();
    }
  };