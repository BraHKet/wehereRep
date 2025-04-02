// src/components/shared/NotificationPanel.js
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '.././contexts/NotificationContext';
import { NOTIFICATION_TYPES, formatNotificationTime } from '.././services/Notifications';
import './Notifications.css';

const NotificationPanel = () => {
  const { 
    notifications, 
    isNotificationOpen, 
    closeNotificationPanel,
    markNotificationAsRead,
    markAllAsRead,
    loading
  } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Chiudi il pannello se si fa clic all'esterno
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && 
          !event.target.closest('.notification-bell')) {
        closeNotificationPanel();
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, closeNotificationPanel]);

  // Gestisci il clic su una notifica
  const handleNotificationClick = (notification) => {
    // Segna come letta
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Naviga in base al tipo di notifica
    switch (notification.type) {
      case NOTIFICATION_TYPES.PARTY_INVITE:
        // Navigate to party page
        navigate(`/party/${notification.data.partyId}`);
        break;
      case NOTIFICATION_TYPES.PRODUCT_ADDED:
        // Navigate to party page
        navigate(`/party/${notification.data.partyId}`);
        break;
      case NOTIFICATION_TYPES.ORDER_UPDATE:
        // Navigate to order details
        navigate(`/orders/${notification.data.orderId}`);
        break;
      case NOTIFICATION_TYPES.SYSTEM:
        // System notifications typically don't navigate
        break;
      default:
        break;
    }

    // Chiudi il pannello
    closeNotificationPanel();
  };

  // Ottieni l'icona in base al tipo di notifica
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.PARTY_INVITE:
        return <span className="notification-icon party">🎭</span>;
      case NOTIFICATION_TYPES.PRODUCT_ADDED:
        return <span className="notification-icon product">👚</span>;
      case NOTIFICATION_TYPES.ORDER_UPDATE:
        return <span className="notification-icon order">📦</span>;
      case NOTIFICATION_TYPES.SYSTEM:
        return <span className="notification-icon system">ℹ️</span>;
      default:
        return <span className="notification-icon">📣</span>;
    }
  };

  if (!isNotificationOpen) return null;

  return (
    <div 
      className="notification-panel" 
      ref={panelRef}
    >
      <div className="notification-header">
        <h3>Notifiche</h3>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read" 
            onClick={markAllAsRead}
          >
            Segna tutte come lette
          </button>
        )}
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">
            Caricamento notifiche...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-notifications">
            <p>Non hai notifiche</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.type)}
                <div className="notification-text">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;