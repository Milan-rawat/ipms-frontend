import axios from 'axios';
import env from '../config/env';

/**
 * Centralized Axios instance.
 * All API calls go through this client.
 */
const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attach JWT token if available.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: handle 401 globally.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Auth store will handle redirect via state change
    }
    return Promise.reject(error);
  },
);

export default apiClient;
