import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Access Token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ccmms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 & Centralized Toast Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Auto logout on 401 Unauthorized
    if (status === 401) {
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthRoute && localStorage.getItem('ccmms_token')) {
        localStorage.removeItem('ccmms_token');
        localStorage.removeItem('ccmms_user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access denied: You do not have permission for this action.');
    } else if (status === 500) {
      toast.error('Internal server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

