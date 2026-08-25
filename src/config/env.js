/**
 * Frontend environment configuration.
 * Vite exposes env vars prefixed with VITE_ on import.meta.env.
 */
const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
};

export default env;
