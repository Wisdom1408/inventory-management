
import React from 'react';

/**
 * Reusable loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.color - Spinner color
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.text - Optional loading text
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  text = '',
}) => {
  // Determine size class
  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'spinner-sm';
      break;
    case 'lg':
      sizeClass = 'spinner-lg';
      break;
    default:
      sizeClass = 'spinner-md';
  }
  
  // Determine color class
  let colorClass = '';
  switch (color) {
    case 'secondary':
      colorClass = 'spinner-secondary';
      break;
    case 'white':
      colorClass = 'spinner-white';
      break;
    default:
      colorClass = 'spinner-primary';
  }
  
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner ${sizeClass} ${colorClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      </div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
