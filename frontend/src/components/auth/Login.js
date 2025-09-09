import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import Button from '../common/Button';
import '../../styles/auth.css';

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setIsSubmitting
  } = useForm({
    initialValues: {
      username: '',
      password: ''
    },
    validationRules: {
      username: { required: true },
      password: { required: true }
    },
    onSubmit: async (formValues) => {
      setLoginError(null);
      try {
        await login(formValues);
      } catch (error) {
        console.error('Login failed:', error);
        setLoginError(error.response?.data?.error || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        
        {(loginError || authError) && (
          <div className="error-message alert">
            {loginError || authError}
          </div>
        )}
        
        <FormField
          type="text"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username && errors.username}
        />
        <FormField
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default Login;