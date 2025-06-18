import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is required to send cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Log the API base URL for debugging (remove in production)
console.log('API Base URL:', API_BASE_URL);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page
      if (!window.location.pathname.startsWith('/auth/login')) {
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
    Swal.fire({ icon: 'success', title: 'Success!', text: message, timer: 2000, showConfirmButton: false });
  },
  error: (message: string) => {
    Swal.fire({ icon: 'error', title: 'Error!', text: message });
  },
  confirm: (title: string, text: string) => {
    return Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' });
  },
};

export default api;