import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on 401 - let the auth store handle the redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Don't use window.location.href as it causes page reload
      // The auth store or components should handle the redirect
    }
    return Promise.reject(error);
  }
);

export default api;