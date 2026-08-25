import { create } from 'zustand';
import * as authService from '../services/auth.service';

/**
 * Authentication store.
 * Manages: user, token, loading, error states.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true, // true until initial auth check completes
  error: null,

  /**
   * Restore session on app start.
   * Checks stored token and fetches current user.
   */
  restoreSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { user } = await authService.getMe();
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Register a new user.
   */
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(data);
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Login with credentials.
   */
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(data);
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Logout: clear token and state.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors — we're logging out regardless
    }
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Get current token (for socket auth).
   */
  getToken: () => get().token,
}));

export default useAuthStore;
