import axios from 'axios';
import { BASE_API_URL } from './serverConfig.js';
import getAuthToken from '../utils/getAuthToken.js';

export function getCommentsPaginated(postId, page, limit) {
  const url = new URL(`${BASE_API_URL}/comments/${postId}`);

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  return axios.get(url.href, { headers: { token: getAuthToken() } }).then((res) => res.data);
}

export function createComment(postId, content) {
  const url = `${BASE_API_URL}/comments/${postId}`;

  const body = { content };

  return axios
    .post(url, body, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function createReplyComment(postId, commentId, content) {
  const url = `${BASE_API_URL}/comments/replies/${postId}/${commentId}`;

  const body = { content };

  return axios
    .post(url, body, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function getCommentRepliesPaginated(postId, commentId, page, limit) {
  const url = new URL(`${BASE_API_URL}/comments/replies/${postId}/${commentId}`);

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  return axios.get(url.href, { headers: { token: getAuthToken() } }).then((res) => res.data);
}

export function deleteComment(postId, commentId) {
  const url = `${BASE_API_URL}/comments/${postId}/${commentId}`;

  return axios
    .delete(url, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function deleteCommentReply(postId, commentId, relpyId) {
  const url = `${BASE_API_URL}/comments/replies/${postId}/${commentId}/${relpyId}`;

  return axios
    .delete(url, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}
