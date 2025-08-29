
import React from 'react';

/**
 * Reusable form field component with validation support
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Field label text
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onBlur - Blur handler function for validation
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.touched - Whether the field has been touched (for validation)
 * @param {React.ReactNode} props.icon - Optional icon to display in the input
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const FormField = ({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  required = false,
  placeholder = '',
  error = '',
  touched = false,
  icon = null,
  disabled = false,
}) => {
  const hasError = touched && error;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className={`input-with-icon ${hasError ? 'has-error' : ''}`}>
        {icon && icon}
        
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={hasError ? 'error-input' : ''}
        />
        
        {hasError && (
          <div className="input-error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <div className="form-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
