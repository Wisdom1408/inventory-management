
import React, { useState, useEffect, useCallback } from 'react';
import Toast from './Toast';

/**
 * Toast container component for managing multiple toast notifications
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  
  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  // Add event listener for custom toast events
  useEffect(() => {
    const handleToastEvent = (event) => {
      const { type, message, duration } = event.detail;
      
      // Create a new toast with unique ID
      const newToast = {
        id: Date.now(),
        type,
        message,
        duration,
      };
      
      setToasts((prevToasts) => [...prevToasts, newToast]);
    };
    
    // Listen for custom toast events
    window.addEventListener('show-toast', handleToastEvent);
    
    return () => {
      window.removeEventListener('show-toast', handleToastEvent);
    };
  }, []);
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

/**
 * Helper function to show a toast notification
 * 
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds before auto-dismiss
 */
export const showToast = (type, message, duration = 5000) => {
  // Dispatch custom event to show toast
  window.dispatchEvent(
    new CustomEvent('show-toast', {
      detail: {
        type,
        message,
        duration,
      },
    })
  );
};

export default ToastContainer;
