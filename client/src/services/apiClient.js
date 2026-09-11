import axios from 'axios';
import { BASE_API_URL } from './serverConfig.js';
import getAuthToken from '../utils/getAuthToken.js';

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true
});

// Request interceptor to attach the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('token', token);
      } else {
        config.headers['token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
