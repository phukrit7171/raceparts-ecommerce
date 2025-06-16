// frontend/src/lib/api.js
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor
api.interceptors.response.use(response => {
    return response;
}, error => {
    // Handle common error scenarios
    if (error.response && error.response.status === 401) {
        console.error('Authentication error, redirecting to login');
        // Redirect to login page
        window.location.href = '/auth/login';
    }
    return Promise.reject(error);
});

export default api;
