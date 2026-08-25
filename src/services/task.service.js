import apiClient from './apiClient';

/**
 * Task API service.
 * Maps to backend: /api/projects/:projectId/tasks/*
 */

export async function getTasks(projectId) {
  const res = await apiClient.get(`/projects/${projectId}/tasks`);
  return res.data.data;
}

export async function getTask(projectId, taskId) {
  const res = await apiClient.get(`/projects/${projectId}/tasks/${taskId}`);
  return res.data.data;
}

export async function createTask(projectId, data) {
  const res = await apiClient.post(`/projects/${projectId}/tasks`, data);
  return res.data.data;
}

export async function updateTask(projectId, taskId, data) {
  const res = await apiClient.put(`/projects/${projectId}/tasks/${taskId}`, data);
  return res.data.data;
}

export async function deleteTask(projectId, taskId) {
  const res = await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
  return res.data.data;
}
