import apiClient from './apiClient';

/**
 * Project API service.
 * Maps to backend: /api/projects/*
 */

export async function getProjects() {
  const res = await apiClient.get('/projects');
  return res.data.data;
}

export async function getProject(id) {
  const res = await apiClient.get(`/projects/${id}`);
  return res.data.data;
}

export async function createProject(data) {
  const res = await apiClient.post('/projects', data);
  return res.data.data;
}

export async function updateProject(id, data) {
  const res = await apiClient.put(`/projects/${id}`, data);
  return res.data.data;
}

export async function deleteProject(id) {
  const res = await apiClient.delete(`/projects/${id}`);
  return res.data.data;
}

export async function addMember(projectId, email) {
  const res = await apiClient.post(`/projects/${projectId}/members`, { email });
  return res.data.data;
}

export async function removeMember(projectId, userId) {
  const res = await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  return res.data.data;
}
