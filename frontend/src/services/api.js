/**
 * Axios instance configured for the API Gateway.
 * 
 * All API calls go through the Spring Cloud API Gateway at :8080.
 * JWT token is automatically attached via interceptors.
 */

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token expired or invalid — clear auth state
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Build user-friendly error message
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        (typeof error.response.data === 'string' ? error.response.data : null) ||
        getDefaultMessage(status);

      error.userMessage = message;
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timed out. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Unable to connect to the server. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

function getDefaultMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    422: 'Invalid data provided.',
    500: 'An internal server error occurred. Please try again later.',
    502: 'Service is temporarily unavailable.',
    503: 'Service is temporarily unavailable. Please try again later.',
  };
  return messages[status] || 'An unexpected error occurred.';
}

export default api;
