import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAuthStore from '../stores/authStore';
import * as storage from '../utils/storage';
import * as authService from '../services/auth.service';
import * as socketModule from '../sockets/socket';

// Mock modules
vi.mock('../services/auth.service');
vi.mock('../sockets/socket');
vi.mock('../utils/storage');

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getToken.mockReturnValue(null);
    storage.setToken.mockImplementation(() => {});
    storage.removeToken.mockImplementation(() => {});
    socketModule.connectSocket.mockImplementation(() => {});
    socketModule.disconnectSocket.mockImplementation(() => {});

    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should be unauthenticated by default', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('restoreSession', () => {
    it('should set initialized without token', async () => {
      storage.getToken.mockReturnValue(null);
      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should restore user with valid token', async () => {
      storage.getToken.mockReturnValue('valid-token');
      authService.getMe.mockResolvedValue({ user: { _id: '1', name: 'Test', email: 'test@test.com' } });

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.name).toBe('Test');
      expect(state.isInitialized).toBe(true);
      expect(socketModule.connectSocket).toHaveBeenCalledWith('valid-token');
    });

    it('should clear state with invalid token', async () => {
      storage.getToken.mockReturnValue('expired-token');
      authService.getMe.mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isInitialized).toBe(true);
      expect(storage.removeToken).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate on successful login', async () => {
      authService.login.mockResolvedValue({
        user: { _id: '1', name: 'User', email: 'user@test.com' },
        token: 'jwt-token',
      });

      await useAuthStore.getState().login({ email: 'user@test.com', password: 'pass123' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.email).toBe('user@test.com');
      expect(state.token).toBe('jwt-token');
      expect(storage.setToken).toHaveBeenCalledWith('jwt-token');
      expect(socketModule.connectSocket).toHaveBeenCalledWith('jwt-token');
    });

    it('should set error on failed login', async () => {
      authService.login.mockRejectedValue({
        response: { data: { message: 'Invalid email or password' } },
      });

      await expect(
        useAuthStore.getState().login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toBeDefined();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid email or password');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('should authenticate on successful registration', async () => {
      authService.register.mockResolvedValue({
        user: { _id: '2', name: 'New User', email: 'new@test.com' },
        token: 'new-token',
      });

      await useAuthStore.getState().register({ name: 'New User', email: 'new@test.com', password: 'pass123' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.name).toBe('New User');
      expect(storage.setToken).toHaveBeenCalledWith('new-token');
      expect(socketModule.connectSocket).toHaveBeenCalledWith('new-token');
    });

    it('should set error on duplicate email', async () => {
      authService.register.mockRejectedValue({
        response: { data: { message: 'Email already registered' } },
      });

      await expect(
        useAuthStore.getState().register({ name: 'X', email: 'dup@test.com', password: '123456' }),
      ).rejects.toBeDefined();

      expect(useAuthStore.getState().error).toBe('Email already registered');
    });
  });

  describe('logout', () => {
    it('should clear all auth state', async () => {
      // Set authenticated state first
      useAuthStore.setState({
        user: { _id: '1', name: 'User' },
        token: 'token',
        isAuthenticated: true,
      });
      authService.logout.mockResolvedValue({});

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(storage.removeToken).toHaveBeenCalled();
      expect(socketModule.disconnectSocket).toHaveBeenCalled();
    });

    it('should clear state even if server logout fails', async () => {
      useAuthStore.setState({ user: { _id: '1' }, token: 'tk', isAuthenticated: true });
      authService.logout.mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(storage.removeToken).toHaveBeenCalled();
      expect(socketModule.disconnectSocket).toHaveBeenCalled();
    });
  });
});
