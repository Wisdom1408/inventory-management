import React from 'react';
import './common/common.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', overlay = false }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const spinnerContent = (
    <div className={`loading-spinner-container ${overlay ? 'spinner-overlay' : ''}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  return overlay ? (
    <div className="loading-overlay">
      {spinnerContent}
    </div>
  ) : spinnerContent;
};

export default LoadingSpinner;
