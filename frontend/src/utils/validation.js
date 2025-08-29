
/**
 * Form validation utility functions
 */

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a required field
 * @param {string} value - The value to validate
 * @returns {boolean} - Whether the value is not empty
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Validates minimum length
 * @param {string} value - The value to validate
 * @param {number} minLength - The minimum length
 * @returns {boolean} - Whether the value meets the minimum length
 */
export const minLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Validates maximum length
 * @param {string} value - The value to validate
 * @param {number} maxLength - The maximum length
 * @returns {boolean} - Whether the value meets the maximum length
 */
export const maxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

/**
 * Validates that a value is a number
 * @param {string} value - The value to validate
 * @returns {boolean} - Whether the value is a number
 */
export const isNumber = (value) => {
  return !isNaN(Number(value));
};

/**
 * Validates that a value is a positive number
 * @param {string} value - The value to validate
 * @returns {boolean} - Whether the value is a positive number
 */
export const isPositiveNumber = (value) => {
  return isNumber(value) && Number(value) > 0;
};

/**
 * Validates that a value matches a pattern
 * @param {string} value - The value to validate
 * @param {RegExp} pattern - The pattern to match
 * @returns {boolean} - Whether the value matches the pattern
 */
export const matchesPattern = (value, pattern) => {
  return pattern.test(value);
};

/**
 * Validates that two values match
 * @param {string} value - The value to validate
 * @param {string} compareValue - The value to compare against
 * @returns {boolean} - Whether the values match
 */
export const valuesMatch = (value, compareValue) => {
  return value === compareValue;
};

/**
 * Validates a form field and returns an error message if invalid
 * @param {string} value - The value to validate
 * @param {Object} validations - The validations to apply
 * @returns {string|null} - The error message or null if valid
 */
export const validateField = (value, validations) => {
  if (validations.required && !isRequired(value)) {
    return validations.requiredMessage || 'This field is required';
  }
  
  if (validations.email && !isValidEmail(value)) {
    return validations.emailMessage || 'Please enter a valid email address';
  }
  
  if (validations.minLength && !minLength(value, validations.minLength)) {
    return validations.minLengthMessage || `Must be at least ${validations.minLength} characters`;
  }
  
  if (validations.maxLength && !maxLength(value, validations.maxLength)) {
    return validations.maxLengthMessage || `Must be no more than ${validations.maxLength} characters`;
  }
  
  if (validations.isNumber && !isNumber(value)) {
    return validations.isNumberMessage || 'Please enter a valid number';
  }
  
  if (validations.isPositiveNumber && !isPositiveNumber(value)) {
    return validations.isPositiveNumberMessage || 'Please enter a positive number';
  }
  
  if (validations.pattern && !matchesPattern(value, validations.pattern)) {
    return validations.patternMessage || 'Please enter a valid value';
  }
  
  if (validations.match && !valuesMatch(value, validations.match)) {
    return validations.matchMessage || 'Values do not match';
  }
  
  return null;
};

/**
 * Validates an entire form and returns errors
 * @param {Object} values - The form values
 * @param {Object} validationRules - The validation rules
 * @returns {Object} - The validation errors
 */
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const error = validateField(values[field], validationRules[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

/**
 * Checks if a form is valid
 * @param {Object} errors - The form errors
 * @returns {boolean} - Whether the form is valid
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};
