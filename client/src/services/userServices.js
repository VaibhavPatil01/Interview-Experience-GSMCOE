import apiClient from './apiClient.js';

export function getUserStatus() {
  return apiClient.get('/user/status').then((response) => response.data);
}

export function registerUser(user) {
  return apiClient.post('/user/register', user).then((response) => response.data);
}

export function loginUser(email, password) {
  return apiClient.post('/user/login', { email, password }).then((response) => response.data);
}

export function logoutUser() {
  return apiClient.post('/user/logout', {}).then((response) => response.data);
}

export function sendForgotPasswordMail(email) {
  return apiClient.post('/user/forgot-password', { email }).then((response) => response.data);
}

export function resetUserPassword(email, password, token) {
  return apiClient.post(`/user/reset-password/${token}`, { email, password }).then((response) => response.data);
}

export function getUserProfileStats(userId) {
  return apiClient.get(`/user/profile/${userId}`).then((response) => response.data.data[0]);
}

export function updateUser(user) {
  return apiClient.put('/user/profile', user).then((response) => response.data);
}

export function uploadResumeFile(formData) {
  return apiClient.put('/user/resume', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }).then((response) => response.data);
}

export function uploadProfilePicture(formData) {
  return apiClient.put('/user/profile-picture', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }).then((response) => response.data);
}

export function searchUser(user, page, limit, signal) {
  return apiClient.get('/user/search', {
    params: { searchparam: user, page, limit },
    signal
  }).then((res) => res.data);
}
