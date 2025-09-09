import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export const Toast = {
  success: (message, duration = 5000) => {
    ToastService.show(message, 'success', duration);
  },
  error: (message, duration = 5000) => {
    ToastService.show(message, 'error', duration);
  },
  warning: (message, duration = 5000) => {
    ToastService.show(message, 'warning', duration);
  },
  info: (message, duration = 5000) => {
    ToastService.show(message, 'info', duration);
  }
};

/**
 * Toast notification component for displaying messages
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {string} props.message - Message to display
 * @param {number} props.duration - Duration in milliseconds before auto-dismiss
 * @param {Function} props.onClose - Function to call when toast is closed
 * @param {boolean} props.showProgress - Whether to show progress indicator
 */
const ToastNotification = ({
  type = 'info',
  message,
  duration = 5000,
  onClose,
  showProgress = true,
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  // Handle auto-dismiss
  useEffect(() => {
    if (!duration) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade-out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Handle progress bar
  useEffect(() => {
    if (!showProgress || !duration) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [duration, showProgress]);
  
  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for fade-out animation
  };
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };
  
  return (
    <div className={`toast toast-${type} ${visible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {showProgress && (
        <div className="toast-progress-container">
          <div 
            className="toast-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Toast service for managing notifications
const ToastService = {
  container: null,
  notifications: [],

  success: (message, duration = 5000) => {
    ToastService.show(message, 'success', duration);
  },

  error: (message, duration = 5000) => {
    ToastService.show(message, 'error', duration);
  },

  warning: (message, duration = 5000) => {
    ToastService.show(message, 'warning', duration);
  },

  info: (message, duration = 5000) => {
    ToastService.show(message, 'info', duration);
  },

  show: (message, type, duration) => {
    if (!ToastService.container) {
      ToastService.createContainer();
    }

    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      duration
    };

    ToastService.notifications.push(notification);
    ToastService.render();
  },

  createContainer: () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    ToastService.container = container;
  },

  render: () => {
    if (!ToastService.container) return;
    
    ReactDOM.render(
      <div>
        {ToastService.notifications.map(notification => (
          <ToastNotification
            key={notification.id}
            {...notification}
            onClose={() => ToastService.remove(notification.id)}
          />
        ))}
      </div>,
      ToastService.container
    );
  },

  remove: (id) => {
    ToastService.notifications = ToastService.notifications.filter(n => n.id !== id);
    ToastService.render();
  }
};

export { ToastNotification };
export default ToastService;
