import axios from 'axios';

// Create base API instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  verify: () => api.get('/auth/verify/')
};

// Add request interceptor to handle token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // If not on login page, clear token and redirect to login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Inventory API endpoints
export const inventoryAPI = {
  getItems: () => api.get('/items/'),
  createItem: (data) => api.post('/items/', data),
  updateItem: (id, data) => api.put(`/items/${id}/`, data),
  deleteItem: (id) => api.delete(`/items/${id}/`)
};

// User API endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.put('/users/profile/', data)
};

export default api;