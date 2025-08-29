import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../authUtils';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // For now, skip admin-only checks since we don't have user roles in simple auth
  // You can enhance this later when you integrate with backend user management
  if (adminOnly) {
    // For demo purposes, allow access to admin routes
    // In production, check actual user roles from backend
  }

  return children;
};

export default ProtectedRoute;
