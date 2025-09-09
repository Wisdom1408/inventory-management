/**
 * Form validation utility functions
 */

// --- Core validators ---
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isRequired = (value) =>
  value !== undefined && value !== null && value.trim() !== "";

export const minLength = (value, minLength) =>
  value && value.length >= minLength;

export const maxLength = (value, maxLength) =>
  value && value.length <= maxLength;

export const isNumber = (value) => !isNaN(Number(value));

export const isPositiveNumber = (value) => isNumber(value) && Number(value) > 0;

export const matchesPattern = (value, pattern) => pattern.test(value);

export const valuesMatch = (value, compareValue) => value === compareValue;

// --- Field & form validators ---
export const validateField = (value, validations) => {
  if (validations.required && !isRequired(value)) {
    return validations.requiredMessage || "This field is required";
  }

  if (validations.email && !isValidEmail(value)) {
    return validations.emailMessage || "Please enter a valid email address";
  }

  if (validations.minLength && !minLength(value, validations.minLength)) {
    return (
      validations.minLengthMessage ||
      `Must be at least ${validations.minLength} characters`
    );
  }

  if (validations.maxLength && !maxLength(value, validations.maxLength)) {
    return (
      validations.maxLengthMessage ||
      `Must be no more than ${validations.maxLength} characters`
    );
  }

  if (validations.isNumber && !isNumber(value)) {
    return validations.isNumberMessage || "Please enter a valid number";
  }

  if (validations.isPositiveNumber && !isPositiveNumber(value)) {
    return (
      validations.isPositiveNumberMessage || "Please enter a positive number"
    );
  }

  if (validations.pattern && !matchesPattern(value, validations.pattern)) {
    return validations.patternMessage || "Please enter a valid value";
  }

  if (validations.match && !valuesMatch(value, validations.match)) {
    return validations.matchMessage || "Values do not match";
  }

  return null;
};

export const validateForm = (values, validationRules) => {
  const errors = {};
  Object.keys(validationRules).forEach((field) => {
    const error = validateField(values[field], validationRules[field]);
    if (error) errors[field] = error;
  });
  return errors;
};

export const isFormValid = (errors) => Object.keys(errors).length === 0;

// --- Composite validators ---
export const validateStaffData = (data) => {
  const errors = [];
  if (!data.firstName?.trim()) errors.push("First name is required");
  if (!data.lastName?.trim()) errors.push("Last name is required");
  if (!data.email?.trim()) errors.push("Email is required");
  else if (!isValidEmail(data.email)) errors.push("Invalid email format");
  if (!data.department?.trim()) errors.push("Department is required");
  return errors;
};

export const validateAssignment = (data) => {
  const errors = [];
  if (!data.staffId) errors.push("Staff member must be selected");
  if (!data.itemId) errors.push("Item must be selected");
  if (!data.dueDate) errors.push("Due date is required");
  else {
    const dueDate = new Date(data.dueDate);
    if (dueDate < new Date()) errors.push("Due date cannot be in the past");
  }
  return errors;
};

export const validateAssignmentForm = validateAssignment;

// --- Regex constants ---
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^[0-9]{10,}$/;
export const NAME_REGEX = /^[a-zA-Z\s-]{2,}$/;

// --- Specific field validators ---
export const validateSerialNumber = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z0-9]+$/.test(value))
    return "Serial number must contain only letters and numbers";
  if (value.length < 3 || value.length > 50)
    return "Serial number must be between 3 and 50 characters";
  return null;
};

export const validateTagNumber = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z0-9-]+$/.test(value))
    return "Tag number must contain only letters, numbers, and hyphens";
  if (value.length < 2 || value.length > 20)
    return "Tag number must be between 2 and 20 characters";
  return null;
};

export const validateEmail = (email) => EMAIL_REGEX.test(email);

export const validatePhone = (phone) => PHONE_REGEX.test(phone);

export const validateDepartmentName = (value) => {
  if (!value) return null;
  if (!/^[A-Za-z\s\-\']+$/.test(value))
    return "Department name can only contain letters, spaces, hyphens, and apostrophes";
  if (value.length < 2 || value.length > 100)
    return "Department name must be between 2 and 100 characters";
  return null;
};

export const validateName = (name) => NAME_REGEX.test(name);

export const validateUsername = (value) => {
  if (!value) return "Username is required";
  if (!/^[A-Za-z0-9_]+$/.test(value))
    return "Username can only contain letters, numbers, and underscores";
  if (value.length < 3 || value.length > 150)
    return "Username must be between 3 and 150 characters";
  return null;
};

export const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters long";
  if (!/(?=.*[a-z])/.test(value))
    return "Password must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(value))
    return "Password must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(value))
    return "Password must contain at least one number";
  return null;
};

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && value.trim() === ""))
    return `${fieldName} is required`;
  return null;
};

export const validateNumeric = (value, fieldName = "This field", min = null, max = null) => {
  if (!value) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return `${fieldName} must be a valid number`;
  if (min !== null && numValue < min) return `${fieldName} must be at least ${min}`;
  if (max !== null && numValue > max) return `${fieldName} must be at most ${max}`;
  return null;
};

export const validateDate = (value, fieldName = "Date") => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
  return null;
};

export const validateFutureDate = (value, fieldName = "Date") => {
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date <= today) return `${fieldName} must be in the future`;
  return null;
};

export const validatePastDate = (value, fieldName = "Date") => {
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return `${fieldName} cannot be in the future`;
  return null;
};

export const validateUrl = (value) => {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return `URL must be a valid URL`;
  }
};

// --- Composite validators ---
export const validateItem = (item) => {
  const errors = {};
  const nameError = validateRequired(item.name, "Item name");
  if (nameError) errors.name = nameError;
  const categoryError = validateRequired(item.category, "Category");
  if (categoryError) errors.category = categoryError;
  const serialError = validateSerialNumber(item.serial_number);
  if (serialError) errors.serial_number = serialError;
  const tagError = validateTagNumber(item.tag_number);
  if (tagError) errors.tag_number = tagError;
  const purchaseDateError = validatePastDate(item.date_of_purchase, "Purchase date");
  if (purchaseDateError) errors.date_of_purchase = purchaseDateError;
  const priceError = validateNumeric(item.price, "Price", 0);
  if (priceError) errors.price = priceError;
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateStaff = (staff) => {
  const errors = {};
  const firstNameError = validateName(staff.first_name, "First name");
  if (firstNameError) errors.first_name = firstNameError;
  const lastNameError = validateName(staff.last_name, "Last name");
  if (lastNameError) errors.last_name = lastNameError;
  const emailError = validateEmail(staff.email);
  if (emailError) errors.email = emailError;
  const departmentError = validateDepartmentName(staff.department);
  if (departmentError) errors.department = departmentError;
  const phoneError = validatePhone(staff.phone_number);
  if (phoneError) errors.phone_number = phoneError;
  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateUserRegistration = (user) => {
  const errors = {};
  const usernameError = validateUsername(user.username);
  if (usernameError) errors.username = usernameError;
  const emailError = validateEmail(user.email);
  if (emailError) errors.email = emailError;
  const firstNameError = validateName(user.first_name, "First name");
  if (firstNameError) errors.first_name = firstNameError;
  const lastNameError = validateName(user.last_name, "Last name");
  if (lastNameError) errors.last_name = lastNameError;
  const passwordError = validatePassword(user.password);
  if (passwordError) errors.password = passwordError;
  return Object.keys(errors).length > 0 ? errors : null;
};

// --- Default export with everything bundled ---
const validators = {
  isValidEmail,
  isRequired,
  minLength,
  maxLength,
  isNumber,
  isPositiveNumber,
  matchesPattern,
  valuesMatch,
  validateField,
  validateForm,
  isFormValid,
  validateStaffData,
  validateAssignment,
  validateAssignmentForm,
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_REGEX,
  validateSerialNumber,
  validateTagNumber,
  validateEmail,
  validatePhone,
  validateDepartmentName,
  validateName,
  validateUsername,
  validatePassword,
  validateRequired,
  validateNumeric,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateUrl,
  validateItem,
  validateStaff,
  validateUserRegistration,
};

export default validators;
