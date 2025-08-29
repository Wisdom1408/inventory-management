// Frontend validation utilities that match backend validation rules

// Serial number validation (alphanumeric, 3-50 chars)
export const validateSerialNumber = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    return 'Serial number must contain only letters and numbers';
  }
  if (value.length < 3 || value.length > 50) {
    return 'Serial number must be between 3 and 50 characters';
  }
  return null;
};

// Tag number validation (alphanumeric with hyphens, 2-20 chars)
export const validateTagNumber = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z0-9-]+$/.test(value)) {
    return 'Tag number must contain only letters, numbers, and hyphens';
  }
  if (value.length < 2 || value.length > 20) {
    return 'Tag number must be between 2 and 20 characters';
  }
  return null;
};

// Email validation
export const validateEmail = (value) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Phone number validation (digits, spaces, hyphens, parentheses, plus)
export const validatePhoneNumber = (value) => {
  if (!value) return null;
  if (!/^[\d\s\-\(\)\+]+$/.test(value)) {
    return 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus signs';
  }
  if (value.length < 10 || value.length > 20) {
    return 'Phone number must be between 10 and 20 characters';
  }
  return null;
};

// Department name validation (letters, spaces, hyphens, apostrophes)
export const validateDepartmentName = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z\s\-\']+$/.test(value)) {
    return 'Department name can only contain letters, spaces, hyphens, and apostrophes';
  }
  if (value.length < 2 || value.length > 100) {
    return 'Department name must be between 2 and 100 characters';
  }
  return null;
};

// Name validation (letters, spaces, hyphens, apostrophes)
export const validateName = (value, fieldName = 'Name') => {
  if (!value) return `${fieldName} is required`;
  if (!/^[A-Za-z\s\-\']+$/.test(value)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  if (value.length < 2 || value.length > 100) {
    return `${fieldName} must be between 2 and 100 characters`;
  }
  return null;
};

// Username validation
export const validateUsername = (value) => {
  if (!value) return 'Username is required';
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  if (value.length < 3 || value.length > 150) {
    return 'Username must be between 3 and 150 characters';
  }
  return null;
};

// Password validation
export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(value)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Numeric validation
export const validateNumeric = (value, fieldName = 'This field', min = null, max = null) => {
  if (!value) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== null && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== null && numValue > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return null;
};

// Date validation
export const validateDate = (value, fieldName = 'Date') => {
  if (!value) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

// Future date validation
export const validateFutureDate = (value, fieldName = 'Date') => {
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  
  if (!value) return null;
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date <= today) {
    return `${fieldName} must be in the future`;
  }
  
  return null;
};

// Past date validation
export const validatePastDate = (value, fieldName = 'Date') => {
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  
  if (!value) return null;
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (date > today) {
    return `${fieldName} cannot be in the future`;
  }
  
  return null;
};

// URL validation
export const validateUrl = (value, fieldName = 'URL') => {
  if (!value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return `${fieldName} must be a valid URL`;
  }
};

// Composite validation for items
export const validateItem = (item) => {
  const errors = {};
  
  // Required fields
  const nameError = validateRequired(item.name, 'Item name');
  if (nameError) errors.name = nameError;
  
  const categoryError = validateRequired(item.category, 'Category');
  if (categoryError) errors.category = categoryError;
  
  // Optional but validated fields
  const serialError = validateSerialNumber(item.serial_number);
  if (serialError) errors.serial_number = serialError;
  
  const tagError = validateTagNumber(item.tag_number);
  if (tagError) errors.tag_number = tagError;
  
  const purchaseDateError = validatePastDate(item.date_of_purchase, 'Purchase date');
  if (purchaseDateError) errors.date_of_purchase = purchaseDateError;
  
  const priceError = validateNumeric(item.price, 'Price', 0);
  if (priceError) errors.price = priceError;
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Composite validation for staff
export const validateStaff = (staff) => {
  const errors = {};
  
  // Required fields
  const firstNameError = validateName(staff.first_name, 'First name');
  if (firstNameError) errors.first_name = firstNameError;
  
  const lastNameError = validateName(staff.last_name, 'Last name');
  if (lastNameError) errors.last_name = lastNameError;
  
  const emailError = validateEmail(staff.email);
  if (emailError) errors.email = emailError;
  
  const departmentError = validateDepartmentName(staff.department);
  if (departmentError) errors.department = departmentError;
  
  // Optional fields
  const phoneError = validatePhoneNumber(staff.phone_number);
  if (phoneError) errors.phone_number = phoneError;
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Composite validation for user registration
export const validateUserRegistration = (user) => {
  const errors = {};
  
  const usernameError = validateUsername(user.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(user.email);
  if (emailError) errors.email = emailError;
  
  const firstNameError = validateName(user.first_name, 'First name');
  if (firstNameError) errors.first_name = firstNameError;
  
  const lastNameError = validateName(user.last_name, 'Last name');
  if (lastNameError) errors.last_name = lastNameError;
  
  const passwordError = validatePassword(user.password);
  if (passwordError) errors.password = passwordError;
  
  return Object.keys(errors).length > 0 ? errors : null;
};
