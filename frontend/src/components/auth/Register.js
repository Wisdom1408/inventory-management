import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import Button from '../common/Button';
import { showToast } from '../common/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';
import '../common/common.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated, clearError } = useAuth();

  // Define validation rules using backend-matching validators
  const validationRules = {
    username: {
      type: 'username',
      required: true
    },
    email: {
      type: 'email',
      required: true
    },
    first_name: {
      type: 'name',
      fieldName: 'First name',
      required: true
    },
    last_name: {
      type: 'name',
      fieldName: 'Last name',
      required: true
    },
    password: {
      type: 'password',
      required: true
    },
    confirmPassword: {
      required: true,
      custom: (value, values) => {
        if (value !== values.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  };

  // Initialize form with empty values
  const initialValues = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    clearError();
    
    // Check if passwords match
    if (values.password !== values.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    try {
      const { confirmPassword, ...registerData } = values;
      const result = await register(registerData);
      
      if (result.success) {
        showToast('success', 'Registration successful!');
        navigate('/dashboard');
      } else {
        showToast('error', result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showToast('error', 'An unexpected error occurred');
    }
  };

  // Initialize form hook
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit: submitForm
  } = useForm(initialValues, validationRules, handleSubmit);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card register-card">
          <div className="login-header">
            <h1>Inventory Management</h1>
            <h2>Create Account</h2>
          </div>
          
          {error && (
            <div className="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className="login-form register-form" onSubmit={submitForm}>
            <div className="form-row">
              <FormField
                id="first_name"
                label="First Name"
                type="text"
                name="first_name"
                value={values.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your first name"
                required
                error={errors.first_name}
                touched={touched.first_name}
              />
              
              <FormField
                id="last_name"
                label="Last Name"
                type="text"
                name="last_name"
                value={values.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your last name"
                required
                error={errors.last_name}
                touched={touched.last_name}
              />
            </div>
            
            <FormField
              id="username"
              label="Username"
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Choose a username"
              required
              error={errors.username}
              touched={touched.username}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
            />
            
            <FormField
              id="email"
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              error={errors.email}
              touched={touched.email}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              }
            />
            
            <FormField
              id="password"
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a password"
              required
              error={errors.password}
              touched={touched.password}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              }
            />
            
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              }
            />
            
            <Button 
              type="submit" 
              variant="primary"
              isLoading={loading}
              disabled={loading}
              className="login-button"
            >
              Create Account
            </Button>
          </form>
          
          <div className="login-footer">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
            <p>&copy; {new Date().getFullYear()} Coronation Inventory System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
