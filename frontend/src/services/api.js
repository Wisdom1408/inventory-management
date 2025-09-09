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
      // Django REST Framework TokenAuthentication expects 'Token <key>'
      config.headers.Authorization = `Token ${token}`;
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

// Helper to unwrap axios response consistently
const unwrap = (p) => p.then((res) => res.data);

// Inventory API endpoints (include categories and suppliers)
export const inventoryAPI = {
  // Items
  getItems: (page = 1) => unwrap(api.get(`/items/?page=${page}`)),
  getItem: (id) => unwrap(api.get(`/items/${id}/`)),
  createItem: (data) => unwrap(api.post('/items/', data)),
  updateItem: (id, data) => unwrap(api.put(`/items/${id}/`, data)),
  deleteItem: (id) => unwrap(api.delete(`/items/${id}/`)),

  // Categories
  getCategories: () => unwrap(api.get('/categories/')),
  createCategory: (data) => unwrap(api.post('/categories/', data)),
  updateCategory: (id, data) => unwrap(api.put(`/categories/${id}/`, data)),
  deleteCategory: (id) => unwrap(api.delete(`/categories/${id}/`)),

  // Suppliers
  getSuppliers: () => unwrap(api.get('/suppliers/')),
  createSupplier: (data) => unwrap(api.post('/suppliers/', data)),
  updateSupplier: (id, data) => unwrap(api.put(`/suppliers/${id}/`, data)),
  deleteSupplier: (id) => unwrap(api.delete(`/suppliers/${id}/`)),

  // Staff
  getStaff: (page = 1) => unwrap(api.get(`/staff/?page=${page}`)),
  getStaffMember: (id) => unwrap(api.get(`/staff/${id}/`)),
  createStaff: (data) => unwrap(api.post('/staff/', data)),
  updateStaff: (id, data) => unwrap(api.put(`/staff/${id}/`, data)),
  deleteStaff: (id) => unwrap(api.delete(`/staff/${id}/`)),

  // Assignments
  getAssignments: (page = 1) => unwrap(api.get(`/assignments/?page=${page}`)),
  createAssignment: (data) => unwrap(api.post('/assignments/', data)),
  updateAssignment: (id, data) => unwrap(api.put(`/assignments/${id}/`, data)),
  deleteAssignment: (id) => unwrap(api.delete(`/assignments/${id}/`)),
};

// User API endpoints (admin)
export const userAPI = {
  getUsers: (page = 1) => unwrap(api.get(`/users/?page=${page}`)),
  getUser: (id) => unwrap(api.get(`/users/${id}/`)),
  createUser: (data) => unwrap(api.post('/users/', data)),
  updateUser: (id, data) => unwrap(api.put(`/users/${id}/`, data)),
  deleteUser: (id) => unwrap(api.delete(`/users/${id}/`)),
  // profile endpoints if needed
  getProfile: () => unwrap(api.get('/auth/profile/')),
  updateProfile: (data) => unwrap(api.put('/auth/profile/', data)),
};

export default api;