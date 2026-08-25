import { create } from 'zustand';
import * as taskService from '../services/task.service';

/**
 * Task store.
 * Manages: tasks for current project, loading/error states.
 * Supports real-time updates via socket events.
 */
const useTaskStore = create((set, _get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  /**
   * Fetch all tasks for a project.
   */
  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const { tasks } = await taskService.getTasks(projectId);
      set({ tasks, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load tasks', isLoading: false });
    }
  },

  /**
   * Create a task.
   */
  createTask: async (projectId, data) => {
    const { task } = await taskService.createTask(projectId, data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  /**
   * Update a task.
   */
  updateTask: async (projectId, taskId, data) => {
    const { task } = await taskService.updateTask(projectId, taskId, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === taskId ? task : t)),
    }));
    return task;
  },

  /**
   * Delete a task.
   */
  deleteTask: async (projectId, taskId) => {
    await taskService.deleteTask(projectId, taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
    }));
  },

  // --- Real-time event handlers (called by socket listeners) ---

  /**
   * Handle task:created socket event.
   * Prevents duplicates by checking task ID.
   */
  applyTaskCreated: (task) => {
    set((state) => {
      const exists = state.tasks.some((t) => t._id === task._id);
      if (exists) return state;
      return { tasks: [task, ...state.tasks] };
    });
  },

  /**
   * Handle task:updated socket event.
   * Replaces existing task with updated version.
   */
  applyTaskUpdated: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    }));
  },

  /**
   * Handle task:deleted socket event.
   * Removes task by ID.
   */
  applyTaskDeleted: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
    }));
  },

  /**
   * Reset store (on project change or logout).
   */
  reset: () => set({ tasks: [], isLoading: false, error: null }),
}));

export default useTaskStore;
