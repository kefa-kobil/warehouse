import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - server might be down');
      return Promise.reject(new Error('Server bilan aloqa yo\'q. Iltimos, keyinroq urinib ko\'ring.'));
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(new Error('Avtorizatsiya muddati tugagan. Qaytadan kiring.'));
    }
    
    // Handle other HTTP errors
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   `Server xatoligi: ${error.response?.status}`;
    
    return Promise.reject(new Error(message));
  }
);

export default api;