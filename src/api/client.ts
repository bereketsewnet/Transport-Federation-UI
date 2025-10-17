import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          toast.error('Resource not found.');
          break;

        case 422:
        case 400:
          // Validation errors
          const message =
            (response.data as { message?: string })?.message || 'Validation error occurred.';
          toast.error(message);
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error('An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('jwt_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

export const setUser = (user: unknown) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): unknown | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

