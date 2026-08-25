import axios from 'axios';
import env from '../config/env';
import { getToken, removeToken } from '../utils/storage';

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
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: handle 401 globally.
 * Clears token on auth failure. The auth store reacts to missing token.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
