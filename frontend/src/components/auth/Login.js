import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import FormField from '../common/FormField';
import Button from '../common/Button';
import '../../styles/auth.css';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
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
      try {
        await login(formValues);
      } catch (error) {
        console.error('Login failed:', error);
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
