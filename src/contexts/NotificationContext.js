// src/contexts/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchNotifications, markAsRead } from '../services/Notifications';
import { useAuth } from './AuthContext';

// Creazione del contesto
const NotificationContext = createContext(null);

// Hook personalizzato per utilizzare il contesto
export const useNotifications = () => useContext(NotificationContext);

// Provider del contesto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useAuth();

  // Carica le notifiche quando l'utente è autenticato
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await fetchNotifications(user.id);
        setNotifications(data);
        updateUnreadCount(data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle notifiche');
        setLoading(false);
        console.error('Errore nel caricamento delle notifiche:', err);
      }
    };

    loadNotifications();
  }, [user]);

  // Aggiorna il conteggio delle notifiche non lette
  const updateUnreadCount = (notifs) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  // Aggiunge una nuova notifica
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    updateUnreadCount([notification, ...notifications]);
  };

  // Segna una notifica come letta
  const markNotificationAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      
      // Aggiorna lo stato locale
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (err) {
      console.error('Errore nel marcare la notifica come letta:', err);
    }
  };

  // Gestisce l'apertura/chiusura del pannello delle notifiche
  const toggleNotificationPanel = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Chiude il pannello delle notifiche
  const closeNotificationPanel = () => {
    setIsNotificationOpen(false);
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = async () => {
    try {
      // In un sistema reale, qui ci sarebbe una chiamata API
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  // Valore da fornire al contesto
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    isNotificationOpen,
    addNotification,
    markNotificationAsRead,
    toggleNotificationPanel,
    closeNotificationPanel,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;