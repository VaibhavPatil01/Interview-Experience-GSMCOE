import axios from 'axios';
import getAuthToken from '../utils/getAuthToken.js';
import getTagsFromString from '../utils/getTagsFromString.js';
import { BASE_API_URL } from './serverConfig.js';

export function getPost(id) {
  const url = `${BASE_API_URL}/posts/${id}`;
  const options = {
    headers: { token: getAuthToken() }
  };
  return axios.get(url, options).then((res) => res.data.post);
}

export function getMostViewedPosts(limit) {
  const page = 1;
  const url = new URL(`${BASE_API_URL}/posts`);

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('sortBy', 'views');

  return axios.get(url.href, { headers: { token: getAuthToken() } }).then((res) => res.data);
}

export function getPostsPaginated(page, limit, filter, signal) {
  const url = new URL(`${BASE_API_URL}/posts`);

  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  if (filter.search.length !== 0) {
    url.searchParams.set('search', filter.search);
  }

  if (filter.sortBy.length !== 0) {
    url.searchParams.set('sortBy', filter.sortBy);
  }

  if (filter.articleType.length !== 0) {
    url.searchParams.set('articleType', filter.articleType);
  }

  if (filter.jobRole.length !== 0) {
    url.searchParams.set('jobRole', filter.jobRole);
  }

  if (filter.company.length !== 0) {
    url.searchParams.set('company', filter.company);
  }

  if (filter.rating.length !== 0) {
    url.searchParams.set('rating', filter.rating);
  }

  const options = {
    headers: { token: getAuthToken() },
    signal
  };

  return axios
    .get(url.href, options)
    .then((res) => res.data)
    .then((data) => {
      const postQueryData = structuredClone(data);
      if (postQueryData.data.length < limit) {
        postQueryData.page.nextPage = undefined;
      }
      return postQueryData;
    });
}

export function createPost(postData, status) {
  const url = `${BASE_API_URL}/posts`;
  const tags = getTagsFromString(postData.tags);
  const body = { ...postData, tags, status };

  return axios
    .post(url, body, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function getBookmarkedPostsPaginated(userId, page, limit) {
  const url = new URL(`${BASE_API_URL}/posts/user/bookmarked/${userId}`);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  return axios
    .get(url.href, { headers: { token: getAuthToken() } })
    .then((res) => res.data)
    .then((data) => {
      const postQueryData = structuredClone(data);
      if (postQueryData.data.length < limit) {
        postQueryData.page.nextPage = undefined;
      }
      return postQueryData;
    });
}

export function getRelatedPosts(postId, limit) {
  const url = new URL(`${BASE_API_URL}/posts/related/${postId}`);
  url.searchParams.set('limit', limit.toString());

  return axios
    .get(url.href, { headers: { token: getAuthToken() } })
    .then((res) => res.data)
    .then((data) => data.relatedPosts);
}

export function getUserPostPaginated(userId, page, limit) {
  const url = new URL(`${BASE_API_URL}/posts/user/all/${userId}`);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  return axios
    .get(url.href, { headers: { token: getAuthToken() } })
    .then((res) => res.data)
    .then((data) => {
      const postQueryData = structuredClone(data);
      if (postQueryData.data.length < limit) {
        postQueryData.page.nextPage = undefined;
      }
      return postQueryData;
    });
}

export function deletePost(postId) {
  const url = `${BASE_API_URL}/posts/${postId}`;

  return axios
    .delete(url, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function toggleBookmark(postId, isBookmarked) {
  const url = `${BASE_API_URL}/posts/bookmark/${postId}`;

  // Remove the bookmark if already bookmarked
  if (isBookmarked) {
    return axios
      .delete(url, { headers: { token: getAuthToken() } })
      .then((response) => response.data);
  }

  // If not bookmarked then bookmark the post
  return axios
    .post(url, {}, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function getCompanyAndRoleList() {
  const url = new URL(`${BASE_API_URL}/posts/data/company-roles`);

  return axios.get(url.href).then((res) => res.data);
}

export function editPost(editedPostData, postId, status) {
  const url = `${BASE_API_URL}/posts/edit`;
  const tags = getTagsFromString(editedPostData.tags);
  const body = {
    ...editedPostData,
    tags,
    status,
    postId
  };

  return axios
    .put(url, body, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function upVotePost(postId) {
  const url = `${BASE_API_URL}/posts/upvote/${postId}`;

  return axios
    .post(url, {}, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}

export function downVotePost(postId) {
  const url = `${BASE_API_URL}/posts/downvote/${postId}`;

  return axios
    .post(url, {}, { headers: { token: getAuthToken() } })
    .then((response) => response.data);
}
