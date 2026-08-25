import { describe, it, expect, beforeEach, vi } from 'vitest';
import useProjectStore from '../stores/projectStore';
import * as projectService from '../services/project.service';

vi.mock('../services/project.service');

describe('Project Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
    });
  });

  it('should have correct initial state', () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.currentProject).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchProjects should load projects', async () => {
    const mockProjects = [
      { _id: '1', name: 'Project A', members: [] },
      { _id: '2', name: 'Project B', members: [] },
    ];
    projectService.getProjects.mockResolvedValue({ projects: mockProjects });

    await useProjectStore.getState().fetchProjects();

    expect(useProjectStore.getState().projects).toEqual(mockProjects);
    expect(useProjectStore.getState().isLoading).toBe(false);
  });

  it('fetchProjects should set error on failure', async () => {
    projectService.getProjects.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });

    await useProjectStore.getState().fetchProjects();

    expect(useProjectStore.getState().error).toBe('Server error');
    expect(useProjectStore.getState().isLoading).toBe(false);
  });

  it('fetchProject should load a single project', async () => {
    const mockProject = { _id: '1', name: 'Project A', members: [{ user: { _id: 'u1' }, role: 'admin' }] };
    projectService.getProject.mockResolvedValue({ project: mockProject });

    await useProjectStore.getState().fetchProject('1');

    expect(useProjectStore.getState().currentProject).toEqual(mockProject);
  });

  it('createProject should add to list', async () => {
    const newProject = { _id: '3', name: 'New', members: [] };
    projectService.createProject.mockResolvedValue({ project: newProject });

    await useProjectStore.getState().createProject({ name: 'New' });

    expect(useProjectStore.getState().projects[0]).toEqual(newProject);
  });

  it('deleteProject should remove from list', async () => {
    useProjectStore.setState({ projects: [{ _id: '1', name: 'A' }, { _id: '2', name: 'B' }] });
    projectService.deleteProject.mockResolvedValue({});

    await useProjectStore.getState().deleteProject('1');

    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().projects[0]._id).toBe('2');
  });

  it('addMember should update currentProject', async () => {
    const updated = { _id: '1', name: 'P', members: [{ user: { _id: 'u1' }, role: 'admin' }, { user: { _id: 'u2' }, role: 'member' }] };
    useProjectStore.setState({ currentProject: { _id: '1', name: 'P', members: [{ user: { _id: 'u1' }, role: 'admin' }] } });
    projectService.addMember.mockResolvedValue({ project: updated });

    await useProjectStore.getState().addMember('1', 'user@test.com');

    expect(useProjectStore.getState().currentProject.members).toHaveLength(2);
  });

  it('removeMember should update currentProject', async () => {
    const updated = { _id: '1', name: 'P', members: [{ user: { _id: 'u1' }, role: 'admin' }] };
    useProjectStore.setState({ currentProject: { _id: '1', name: 'P', members: [{ user: { _id: 'u1' }, role: 'admin' }, { user: { _id: 'u2' }, role: 'member' }] } });
    projectService.removeMember.mockResolvedValue({ project: updated });

    await useProjectStore.getState().removeMember('1', 'u2');

    expect(useProjectStore.getState().currentProject.members).toHaveLength(1);
  });

  it('reset should clear all state', () => {
    useProjectStore.setState({
      projects: [{ _id: '1' }],
      currentProject: { _id: '1' },
      error: 'oops',
    });

    useProjectStore.getState().reset();

    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useProjectStore.getState().currentProject).toBeNull();
    expect(useProjectStore.getState().error).toBeNull();
  });
});
