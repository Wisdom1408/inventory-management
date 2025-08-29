
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useForm from '../hooks/useForm';
import FormField from './common/FormField';
import Button from './common/Button';
import { showToast } from './common/ToastContainer';
import { isAuthenticated, setAuthenticated, getRememberedUsername } from '../authUtils';
import { authAPI } from '../services/api';
import '../styles.css';
import './common/common.css';

const Login = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Define validation rules
  const validationRules = {
    username: {
      required: true,
      minLength: 3,
      requiredMessage: 'Username is required'
    },
    password: {
      required: true,
      minLength: 6,
      requiredMessage: 'Password is required',
      minLengthMessage: 'Password must be at least 6 characters'
    }
  };

  // Initialize form with empty values
  const initialValues = {
    username: '',
    password: ''
  };

  // Check for remembered username on component mount
  useEffect(() => {
    const rememberedUsername = getRememberedUsername();
    if (rememberedUsername) {
      setFormData({ ...formData, username: rememberedUsername });
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    
    try {
      // Call backend login
      const data = await authAPI.login({
        username: values.username,
        password: values.password
      });

      // Store token and user for axios interceptor and app state
      if (data?.token) localStorage.setItem('authToken', data.token);
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));

      // Remember username if opted in
      setAuthenticated(rememberMe, values.username);

      showToast('success', 'Login successful!');
      navigate('/dashboard', { replace: true });
      // Ensure the app re-hydrates auth state and renders the dashboard
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.replace('/dashboard');
        } else {
          // In some cases, a lightweight reload ensures protected routes re-evaluate
          window.location.reload();
        }
      }, 50);
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.error || err?.message;

      if (status === 401) {
        const isDisabled = typeof backendMsg === 'string' && backendMsg.toLowerCase().includes('disabled');
        if (isDisabled) {
          // Account disabled path
          setError('Your account is disabled. Please contact an administrator.');
          setFieldTouched('username', true);
          setFieldError('username', 'Account is disabled');
          // Clear password-specific error to avoid confusion
          setFieldTouched('password', true);
          setFieldError('password', '');
          showToast('error', 'Account is disabled', 10000);
        } else {
          // Invalid credentials path
          setError('Login failed. Invalid username or password.');
          setFieldTouched('username', true);
          setFieldTouched('password', true);
          setFieldError('username', 'Invalid username');
          setFieldError('password', 'Invalid password');
          showToast('error', 'Login failed', 10000);
        }
      } else if (status === 400) {
        setError('Please enter both username and password');
        showToast('error', 'Validation error', 8000);
      } else {
        setError(backendMsg || 'An unexpected error occurred');
        showToast('error', 'An unexpected error occurred', 8000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form hook
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFormData,
    handleSubmit: submitForm,
    setFieldValue,
    setFieldError,
    setFieldTouched
  } = useForm(initialValues, validationRules, handleSubmit);


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Inventory Management</h1>
            <h2>Sign In</h2>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={submitForm} className="login-form">
            <FormField
              id="username"
              name="username"
              type="text"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
              placeholder="Enter your username"
              required
            />
            
            <FormField
              id="password"
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
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
            
            <div className="form-footer">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="login-footer">
            <p>&copy; {new Date().getFullYear()} Coronation Inventory System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
