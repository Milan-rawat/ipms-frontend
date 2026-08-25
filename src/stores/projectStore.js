import { create } from 'zustand';
import * as projectService from '../services/project.service';

/**
 * Project store.
 * Manages: projects list, current project, loading/error states.
 */
const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  /**
   * Fetch all projects for the authenticated user.
   */
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const { projects } = await projectService.getProjects();
      set({ projects, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load projects', isLoading: false });
    }
  },

  /**
   * Fetch a single project by ID.
   */
  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { project } = await projectService.getProject(id);
      set({ currentProject: project, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load project', isLoading: false });
    }
  },

  /**
   * Create a new project.
   */
  createProject: async (data) => {
    const { project } = await projectService.createProject(data);
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  /**
   * Update a project.
   */
  updateProject: async (id, data) => {
    const { project } = await projectService.updateProject(id, data);
    set((state) => ({
      projects: state.projects.map((p) => (p._id === id ? project : p)),
      currentProject: state.currentProject?._id === id ? project : state.currentProject,
    }));
    return project;
  },

  /**
   * Delete a project.
   */
  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== id),
      currentProject: state.currentProject?._id === id ? null : state.currentProject,
    }));
  },

  /**
   * Add a member to the current project.
   */
  addMember: async (projectId, email) => {
    const { project } = await projectService.addMember(projectId, email);
    set((state) => ({
      currentProject: state.currentProject?._id === projectId ? project : state.currentProject,
    }));
  },

  /**
   * Remove a member from the current project.
   */
  removeMember: async (projectId, userId) => {
    const { project } = await projectService.removeMember(projectId, userId);
    set((state) => ({
      currentProject: state.currentProject?._id === projectId ? project : state.currentProject,
    }));
  },

  /**
   * Clear current project.
   */
  clearCurrentProject: () => set({ currentProject: null }),

  /**
   * Reset store on logout.
   */
  reset: () => set({ projects: [], currentProject: null, isLoading: false, error: null }),
}));

export default useProjectStore;
