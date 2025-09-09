import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Toast container component for managing multiple toast notifications
 */
const ToastContainer = () => {
  const { notifications, addNotification, removeNotification } = useNotifications();

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type } = event.detail;
      addNotification({ message, type });
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, [addNotification]);

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`toast toast-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

// Toast utility function
export const showToast = (message, type = 'info') => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};

export default ToastContainer;
