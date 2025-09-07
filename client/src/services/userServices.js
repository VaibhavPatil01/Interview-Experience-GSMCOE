import axios from 'axios';
import getAuthToken from '../utils/getAuthToken.js';
import { BASE_API_URL } from './serverConfig.js';

export function getUserStatus() {
  const url = `${BASE_API_URL}/user/status`;
  return axios.get(url, { headers: { token: getAuthToken() } }).then((response) => response.data);
}

export function registerUser(user) {
  const url = `${BASE_API_URL}/user/register`;
  const options = {
    headers: { token: getAuthToken() }
  };

  return axios.post(url, user, options).then((response) => response.data);
}

export function loginUser(email, password) {
  const url = `${BASE_API_URL}/user/login`;
  const user = { email, password };

  return axios
    .post(url, user, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function logoutUser() {
  const url = `${BASE_API_URL}/user/logout`;
  return axios.post(url, {}, { headers: { token: getAuthToken() } });
}

export function sendForgotPasswordMail(email) {
  const url = `${BASE_API_URL}/user/forgot-password`;
  const body = { email };
  const options = {
    headers: { token: getAuthToken() }
  };
  return axios.post(url, body, options).then((response) => response.data);
}

export function resetUserPassword(email, password, token) {
  const url = `${BASE_API_URL}/user/reset-password/${token}`;
  const body = { email, password };
  return axios.post(url, body).then((response) => response.data);
}

export function getUserProfileStats(userId) {
  const url = `${BASE_API_URL}/user/profile/${userId}`;
  return axios
    .get(url, { headers: { token: getAuthToken() } })
    .then((response) => response.data.data[0]);
}

export function updateUser(user) {
  const url = `${BASE_API_URL}/user/profile`;
  return axios
    .put(url, user, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function searchUser(user, page, limit, signal) {
  const url = new URL(`${BASE_API_URL}/user/search`);
  url.searchParams.set('searchparam', user);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  return axios
    .get(url.href, { headers: { token: getAuthToken() }, signal })
    .then((res) => res.data);
}
