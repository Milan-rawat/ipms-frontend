import { io } from 'socket.io-client';
import env from '../config/env';
import useTaskStore from '../stores/taskStore';
import useProjectStore from '../stores/projectStore';
import useAuthStore from '../stores/authStore';

let socket = null;
let currentRoom = null;

/**
 * Initialize Socket.IO connection with JWT authentication.
 * Registers all event listeners once.
 * @param {string} token - JWT access token
 * @returns {import('socket.io-client').Socket}
 */
export function connectSocket(token) {
  if (socket?.connected) return socket;

  // Disconnect stale socket if exists
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(env.socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    // Rejoin current room after reconnect
    if (currentRoom) {
      socket.emit('project:join', { projectId: currentRoom });
    }
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

  // --- Member event listeners ---
  socket.on('member:added', (data) => {
    useProjectStore.getState().applyMemberAdded(data.user);
  });

  socket.on('member:removed', (data) => {
    const authUser = useAuthStore.getState().user;
    if (authUser && data.userId === authUser._id) {
      // Current user was removed — clear state and leave
      handleSelfRemoved(data.projectId);
    } else {
      useProjectStore.getState().applyMemberRemoved(data.userId);
    }
  });

  return socket;
}

/**
 * Disconnect Socket.IO and reset room state.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentRoom = null;
}

/**
 * Join a project room. Leaves previous room first.
 * @param {string} projectId
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export function joinProjectRoom(projectId) {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false, message: 'Not connected' });
      return;
    }

    // Leave previous room if different
    if (currentRoom && currentRoom !== projectId) {
      socket.emit('project:leave', { projectId: currentRoom });
    }

    socket.emit('project:join', { projectId }, (response) => {
      if (response?.success) {
        currentRoom = projectId;
      }
      resolve(response || { success: false, message: 'No response' });
    });
  });
}

/**
 * Leave a project room.
 * @param {string} projectId
 */
export function leaveProjectRoom(projectId) {
  if (!socket?.connected) return;
  if (currentRoom === projectId) {
    socket.emit('project:leave', { projectId });
    currentRoom = null;
  }
}

/**
 * Get the current joined room project ID.
 * @returns {string|null}
 */
export function getCurrentRoom() {
  return currentRoom;
}

/**
 * Check if socket is connected.
 * @returns {boolean}
 */
export function isSocketConnected() {
  return socket?.connected ?? false;
}

/**
 * Get the raw socket instance (for event listeners in components).
 * @returns {import('socket.io-client').Socket|null}
 */
export function getSocket() {
  return socket;
}

/**
 * Handle the scenario where the current user is removed from the project.
 * Clears project/task state and signals navigation.
 */
function handleSelfRemoved(projectId) {
  currentRoom = null;
  useProjectStore.getState().handleRemovedFromProject(projectId);
  useTaskStore.getState().reset();
}
