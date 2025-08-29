// authUtils.js - Utility functions for authentication

/**
 * Check if the user is logged in
 * @returns {boolean} True if the user is logged in
 */
export const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

/**
 * Set the user as logged in
 * @param {boolean} remember - Whether to remember the user's login
 * @param {string} username - The username to remember (if remember is true)
 */
export const setAuthenticated = (remember = false, username = "") => {
  localStorage.setItem("isLoggedIn", "true");

  if (remember && username) {
    localStorage.setItem("rememberedUsername", username);
  }
};

/**
 * Get the remembered username, if any
 * @returns {string|null} The remembered username
 */
export const getRememberedUsername = () => {
  return localStorage.getItem("rememberedUsername") || null;
};

/**
 * Log the user out
 */
export const logout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("rememberedUsername");
};
