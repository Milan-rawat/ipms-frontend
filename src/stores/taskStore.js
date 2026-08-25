import { create } from 'zustand';
import * as taskService from '../services/task.service';

/**
 * Task store.
 * Manages: tasks for current project, loading/error states.
 * Provides real-time event handlers for Phase 3E.
 */
const useTaskStore = create((set) => ({
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
    // Use the same duplicate-safe logic as socket events
    set((state) => {
      if (state.tasks.some((t) => t._id === task._id)) return state;
      return { tasks: [task, ...state.tasks] };
    });
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

  // --- Real-time event handlers (called by socket listeners in Phase 3E) ---

  /**
   * Add a task to state. Prevents duplicates by ID.
   */
  applyTaskCreated: (task) => {
    set((state) => {
      if (state.tasks.some((t) => t._id === task._id)) return state;
      return { tasks: [task, ...state.tasks] };
    });
  },

  /**
   * Replace an existing task with updated version.
   */
  applyTaskUpdated: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    }));
  },

  /**
   * Remove a task by ID.
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
