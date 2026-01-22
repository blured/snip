import axios from 'axios';

// Use relative URL for client-side requests to go through Next.js rewrites
// In browser, this will use the current origin (same as frontend)
// In server-side, we need to use the backend URL directly
const API_URL = typeof window === 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  : ''; // Empty string uses relative URLs in browser

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
