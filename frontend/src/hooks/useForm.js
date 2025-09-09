import { useState, useCallback, useEffect } from 'react';
import * as validators from '../utils/validation';

/**
 * Custom hook for form handling with validation
 * Supports two calling styles:
 * 1) useForm(initialValues, validationRules, onSubmit)
 * 2) useForm({ initialValues, validationRules, onSubmit })
 */
const useForm = (arg1, arg2, arg3) => {
  // Normalize arguments to support both signatures
  let opts;
  if (
    arg1 && typeof arg1 === 'object' && (
      Object.prototype.hasOwnProperty.call(arg1, 'initialValues') ||
      Object.prototype.hasOwnProperty.call(arg1, 'validationRules') ||
      Object.prototype.hasOwnProperty.call(arg1, 'onSubmit')
    )
  ) {
    opts = {
      initialValues: arg1.initialValues || {},
      validationRules: arg1.validationRules || {},
      onSubmit: arg1.onSubmit || (async () => {}),
    };
  } else {
    opts = {
      initialValues: arg1 || {},
      validationRules: arg2 || {},
      onSubmit: arg3 || (async () => {}),
    };
  }

  const { initialValues: initialVals, validationRules: rulesConfig, onSubmit: submitFn } = opts;

  const [values, setValues] = useState(initialVals);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Enhanced validation function
  const validateField = useCallback((name, value) => {
    const rules = rulesConfig?.[name];
    if (!rules) return '';

    // Use backend-matching validators
    if (rules.validator && typeof rules.validator === 'function') {
      const error = rules.validator(value, name);
      if (error) return error;
    }

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.requiredMessage || `${name} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return '';
    }

    // Built-in validator shortcuts
    if (rules.type === 'email') {
      const error = validators.validateEmail(value);
      if (error) return error;
    }

    if (rules.type === 'username') {
      const error = validators.validateUsername(value);
      if (error) return error;
    }

    if (rules.type === 'password') {
      const error = validators.validatePassword(value);
      if (error) return error;
    }

    if (rules.type === 'name') {
      const error = validators.validateName(value, rules.fieldName || name);
      if (error) return error;
    }

    if (rules.type === 'serialNumber') {
      const error = validators.validateSerialNumber(value);
      if (error) return error;
    }

    if (rules.type === 'tagNumber') {
      const error = validators.validateTagNumber(value);
      if (error) return error;
    }

    if (rules.type === 'phoneNumber') {
      // Change validatePhoneNumber to validatePhone
      const error = validators.validatePhone(value);
      if (error) return error;
    }

    if (rules.type === 'department') {
      const error = validators.validateDepartmentName(value);
      if (error) return error;
    }

    // Min length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return rules.minLengthMessage || `${name} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return rules.maxLengthMessage || `${name} must be no more than ${rules.maxLength} characters`;
    }

    // Email validation (legacy flag)
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return rules.emailMessage || 'Please enter a valid email address';
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || `${name} format is invalid`;
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, values);
      if (customError) return customError;
    }

    return '';
  }, [rulesConfig, values]);

  // Validate form when values change
  useEffect(() => {
    const validationErrors = {};
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) validationErrors[name] = error;
    });
    setIsValid(Object.keys(validationErrors).length === 0);

    // Only update errors for touched fields
    const touchedErrors = {};
    Object.keys(validationErrors).forEach(field => {
      if (touched[field]) {
        touchedErrors[field] = validationErrors[field];
      }
    });
    setErrors(touchedErrors);
  }, [values, touched, validateField]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue
    }));
  }, []);

  // Handle field blur (for validation)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;

    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));

    // Validate the field
    const error = validateField(name, values[name]);
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  }, [values, validateField]);

  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);

  // Set a specific field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  }, []);

  // Set a field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: isTouched
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e && e.preventDefault();
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = {};
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) validationErrors[name] = error;
    });
    setErrors(validationErrors);

    // If form is valid, call onSubmit
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await submitFn(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, submitFn, validateField]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialVals);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialVals]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm
  };
};

export default useForm;
