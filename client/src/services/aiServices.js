import apiClient from './apiClient.js';

export const fetchResumeHistory = async () => {
  const response = await apiClient.get('/api/resume-analyzer/history');
  return response.data;
};

export const analyzeResume = async (formData) => {
  const response = await apiClient.post('/api/resume-analyzer/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const reanalyzeResume = async (id, data) => {
  const response = await apiClient.post(`/api/resume-analyzer/${id}/reanalyze`, data);
  return response.data;
};

export const deleteResumeHistoryItem = async (id) => {
  const response = await apiClient.delete(`/api/resume-analyzer/${id}`);
  return response.data;
};
