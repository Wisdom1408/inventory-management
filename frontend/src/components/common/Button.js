
import React from 'react';

/**
 * Reusable button component with different variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, outline)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.icon - Optional icon to display in the button
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  icon = null,
  className = '',
}) => {
  // Base button class
  let buttonClass = 'button ';
  
  // Add variant class
  switch (variant) {
    case 'primary':
      buttonClass += 'button-primary ';
      break;
    case 'secondary':
      buttonClass += 'button-secondary ';
      break;
    case 'danger':
      buttonClass += 'button-danger ';
      break;
    case 'outline':
      buttonClass += 'button-outline ';
      break;
    default:
      buttonClass += 'button-primary ';
  }
  
  // Add size class
  switch (size) {
    case 'sm':
      buttonClass += 'button-sm ';
      break;
    case 'lg':
      buttonClass += 'button-lg ';
      break;
    default:
      buttonClass += 'button-md ';
  }
  
  // Add loading class if loading
  if (isLoading) {
    buttonClass += 'button-loading ';
  }
  
  // Add custom class if provided
  if (className) {
    buttonClass += className;
  }
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="button-spinner">
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
        </span>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
