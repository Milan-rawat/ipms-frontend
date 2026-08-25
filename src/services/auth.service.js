import apiClient from './apiClient';

/**
 * Authentication API service.
 * Maps to backend: POST /api/auth/*
 */

export async function register(data) {
  const res = await apiClient.post('/auth/register', data);
  return res.data.data;
}

export async function login(data) {
  const res = await apiClient.post('/auth/login', data);
  return res.data.data;
}

export async function logout() {
  const res = await apiClient.post('/auth/logout');
  return res.data.data;
}

export async function getMe() {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
}
