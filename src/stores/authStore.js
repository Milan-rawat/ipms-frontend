import { create } from 'zustand';
import * as authService from '../services/auth.service';
import { getToken, setToken, removeToken } from '../utils/storage';
import { connectSocket, disconnectSocket } from '../sockets/socket';
import useProjectStore from './projectStore';
import useTaskStore from './taskStore';

/**
 * Authentication store.
 * Manages: user, token, loading, initialized, error states.
 * Controls Socket.IO lifecycle based on auth state.
 */
const useAuthStore = create((set, _get) => ({
  user: null,
  token: getToken(),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Restore session on app start.
   * Checks stored token and fetches current user.
   */
  restoreSession: async () => {
    const token = getToken();
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false });
      return;
    }
    try {
      const { user } = await authService.getMe();
      set({ user, token, isAuthenticated: true, isInitialized: true, error: null });
      connectSocket(token);
    } catch {
      removeToken();
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
    }
  },

  /**
   * Register a new user.
   */
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(data);
      setToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      connectSocket(token);
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
      setToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      connectSocket(token);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Logout: clear token, state, disconnect socket, reset other stores.
   */
  logout: async () => {
    // Attempt server logout (non-blocking)
    try {
      await authService.logout();
    } catch {
      // Ignore — local cleanup proceeds regardless
    }

    // Local cleanup always happens
    removeToken();
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, error: null });

    // Reset other stores to prevent stale data
    useProjectStore.getState().reset();
    useTaskStore.getState().reset();
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
