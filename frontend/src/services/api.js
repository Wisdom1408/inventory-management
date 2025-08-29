import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset/', { email });
    return response.data;
  },
  
  confirmPasswordReset: async (data) => {
    const response = await api.post('/auth/password-reset-confirm/', data);
    return response.data;
  }
};

// Inventory API calls
export const inventoryAPI = {
  // Items
  getItems: async (page = 1) => {
    const response = await api.get(`/items/?page=${page}`);
    return response.data;
  },
  
  getItem: async (id) => {
    const response = await api.get(`/items/${id}/`);
    return response.data;
  },
  
  createItem: async (itemData) => {
    const response = await api.post('/items/', itemData);
    return response.data;
  },
  
  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}/`, itemData);
    return response.data;
  },
  
  deleteItem: async (id) => {
    await api.delete(`/items/${id}/`);
  },
  
  // Categories
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}/`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}/`);
  },
  
  // Suppliers
  getSuppliers: async () => {
    const response = await api.get('/suppliers/');
    return response.data;
  },
  
  createSupplier: async (supplierData) => {
    const response = await api.post('/suppliers/', supplierData);
    return response.data;
  },
  
  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}/`, supplierData);
    return response.data;
  },
  
  deleteSupplier: async (id) => {
    await api.delete(`/suppliers/${id}/`);
  },
  
  // Staff
  getStaff: async (page = 1) => {
    const response = await api.get(`/staff/?page=${page}`);
    return response.data;
  },
  
  getStaffMember: async (id) => {
    const response = await api.get(`/staff/${id}/`);
    return response.data;
  },
  
  createStaff: async (staffData) => {
    const response = await api.post('/staff/', staffData);
    return response.data;
  },
  
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}/`, staffData);
    return response.data;
  },
  
  deleteStaff: async (id) => {
    await api.delete(`/staff/${id}/`);
  },
  
  // Assignments
  getAssignments: async (page = 1) => {
    const response = await api.get(`/assignments/?page=${page}`);
    return response.data;
  },
  
  createAssignment: async (assignmentData) => {
    const response = await api.post('/assignments/', assignmentData);
    return response.data;
  },
  
  updateAssignment: async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}/`, assignmentData);
    return response.data;
  },
  
  deleteAssignment: async (id) => {
    await api.delete(`/assignments/${id}/`);
  }
};

// Users API calls
export const userAPI = {
  getUsers: async (page = 1) => {
    const response = await api.get(`/users/?page=${page}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}/`);
  }
};

export default api;
