import apiClient from './apiClient.js';

export const fetchSessions = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/api/chat/sessions/?page=${page}&limit=${limit}&t=${Date.now()}`);
  return response.data;
};

export const searchSessions = async (query) => {
  const response = await apiClient.get(`/api/chat/sessions/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const createSession = async (initialPrompt = '') => {
  const response = await apiClient.post(`/api/chat/sessions/`, { initialPrompt });
  return response.data;
};

export const renameSession = async (sessionId, title) => {
  const response = await apiClient.put(`/api/chat/sessions/${sessionId}/rename`, { title });
  return response.data;
};

export const pinSession = async (sessionId, isPinned) => {
  const response = await apiClient.put(`/api/chat/sessions/${sessionId}/pin`, { isPinned });
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
  return response.data;
};

export const fetchSessionMessages = async (sessionId, limit = 50, beforeCursor = null) => {
  const url = beforeCursor 
    ? `/api/chat/sessions/${sessionId}/messages?limit=${limit}&beforeCursor=${beforeCursor}&t=${Date.now()}`
    : `/api/chat/sessions/${sessionId}/messages?limit=${limit}&t=${Date.now()}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const submitFeedback = async (sessionId, messageId, feedback) => {
  const response = await apiClient.post(`/api/chat/sessions/${sessionId}/messages/${messageId}/feedback`, { feedback });
  return response.data;
};

export const syncGuestSession = async (messages) => {
  const response = await apiClient.post(`/api/chat/sessions/guest/sync`, { messages });
  return response.data;
};
