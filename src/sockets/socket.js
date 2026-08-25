import { io } from 'socket.io-client';
import env from '../config/env';
import useTaskStore from '../stores/taskStore';

let socket = null;

/**
 * Initialize Socket.IO connection with JWT authentication.
 * @param {string} token - JWT access token
 * @returns {import('socket.io-client').Socket}
 */
export function connectSocket(token) {
  if (socket?.connected) return socket;

  socket = io(env.socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  // --- Task event listeners ---
  socket.on('task:created', (data) => {
    useTaskStore.getState().applyTaskCreated(data.task);
  });

  socket.on('task:updated', (data) => {
    useTaskStore.getState().applyTaskUpdated(data.task);
  });

  socket.on('task:deleted', (data) => {
    useTaskStore.getState().applyTaskDeleted(data.taskId);
  });

  return socket;
}

/**
 * Disconnect Socket.IO.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join a project room.
 * @param {string} projectId
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export function joinProjectRoom(projectId) {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false, message: 'Not connected' });
      return;
    }
    socket.emit('project:join', { projectId }, (response) => {
      resolve(response);
    });
  });
}

/**
 * Leave a project room.
 * @param {string} projectId
 */
export function leaveProjectRoom(projectId) {
  if (!socket?.connected) return;
  socket.emit('project:leave', { projectId });
}

/**
 * Get current socket instance.
 * @returns {import('socket.io-client').Socket|null}
 */
export function getSocket() {
  return socket;
}

/**
 * Check if socket is connected.
 * @returns {boolean}
 */
export function isSocketConnected() {
  return socket?.connected ?? false;
}
