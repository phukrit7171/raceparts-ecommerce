import axios from 'axios';
import Swal from 'sweetalert2';
import logger from '@/utils/logger';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    logger.debug('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    logger.error('API Request Error:', { error });
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    logger.debug('API Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    logger.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers
      }
    });

    if (error.response?.status === 401) {
      if (!window.location.pathname.startsWith('/auth/login')) {
        logger.info('Redirecting to login page due to 401 error');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Log the API base URL for debugging (remove in production)
console.log('API Base URL:', API_BASE_URL);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data: { first_name: string; last_name: string; phone?: string; address?: string }) =>
    api.put('/api/auth/profile', data),
};

// Products API
export const productsAPI = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string; order?: string; }) => 
    api.get('/api/products', { params }),
  getProductBySlug: (slug: string) => api.get(`/api/products/slug/${slug}`),
  getProductById: (id: number) => api.get(`/api/products/${id}`),
  getCategories: () => api.get('/api/products/categories'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (data: { productId: number; quantity: number }) => api.post('/api/cart', data),
  updateCartItem: (itemId: number, data: { quantity: number }) => api.patch(`/api/cart/${itemId}`, data),
  removeFromCart: (itemId: number) => api.delete(`/api/cart/${itemId}`),
};

// Payment API
export const paymentAPI = {
  createCheckoutSession: (data: { origin: string }) => api.post('/api/payment/create-checkout-session', data),
};

// Helper function for showing alerts
export const showAlert = {
  success: (message: string) => {
    logger.info('Showing success alert:', { message });
    Swal.fire({ icon: 'success', title: 'Success!', text: message, timer: 2000, showConfirmButton: false });
  },
  error: (message: string) => {
    logger.error('Showing error alert:', { message });
    Swal.fire({ icon: 'error', title: 'Error!', text: message });
  },
  confirm: (title: string, text: string) => {
    logger.info('Showing confirmation dialog:', { title, text });
    return Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' });
  },
};

export default api;