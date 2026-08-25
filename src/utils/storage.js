/**
 * Centralized token storage utility.
 * Single place for token key and localStorage operations.
 */

const TOKEN_KEY = 'ipms_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
