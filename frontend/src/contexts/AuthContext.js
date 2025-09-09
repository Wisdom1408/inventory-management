import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, authAPI } from '../services/api';
import { Toast } from '../components/common/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token) {
        // Configure axios header for DRF TokenAuthentication
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        try {
          // Prefer stored user; if absent we could fetch /auth/profile/
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            try {
              const profile = await authAPI.verify(); // optional; may not exist
              const userData = profile.data?.user || profile.user || null;
              if (userData) setUser(userData);
            } catch (_) {
              // Ignore if verify is not available; user will be set on next login
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await authAPI.login(credentials);
      // Support both wrapped and unwrapped responses
      const data = resp?.data || resp;
      const token = data.token;
      const userData = data.user;

      if (!token || !userData) {
        throw new Error('Invalid login response');
      }

      // Configure axios header for DRF TokenAuthentication
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      Toast.success('Login successful');
      navigate('/dashboard', { replace: true });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      setError(message);
      Toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // Ignore server errors on logout
    } finally {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      Toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      error,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
