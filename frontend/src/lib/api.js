// frontend/src/lib/api.js
import axios from 'axios';
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Response interceptor
api.interceptors.response.use(response => {
    return response;
}, error => {
    // Handle common error scenarios
    if (error.response && error.response.status === 401) {
        // Only attempt client-side redirect when in browser environment
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/auth/login') && !currentPath.startsWith('/auth/register')) {
                console.log('Authentication required, redirecting to login');
                window.location.href = '/auth/login';
            }
        }
    }
    return Promise.reject(error);
});

export default api;
