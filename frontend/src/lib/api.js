// frontend/src/lib/api.js
import axios from 'axios';

// Get the API URL from environment variables.
// SvelteKit uses the VITE_ prefix for public env variables.
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true // This is crucial for sending the JWT cookie back and forth
});

export default api;