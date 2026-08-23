import apiClient from './apiClient.js';
import getTagsFromString from '../utils/getTagsFromString.js';

export function getPost(id) {
  return apiClient.get(`/posts/${id}`).then((res) => res.data.post);
}

export function getMostViewedPosts(limit) {
  return apiClient.get('/posts', { 
    params: { page: 1, limit, sortBy: 'views' }
  }).then((res) => res.data);
}

export function getPostsPaginated(page, limit, filter, signal) {
  const params = { page, limit };
  
  if (filter.search) params.search = filter.search;
  if (filter.sortBy) params.sortBy = filter.sortBy;
  if (filter.articleType) params.articleType = filter.articleType;
  if (filter.jobRole) params.jobRole = filter.jobRole;
  if (filter.company) params.company = filter.company;
  if (filter.rating) params.rating = filter.rating;
  if (filter.datePosted && filter.datePosted !== 'Anytime') params.datePosted = filter.datePosted;

  return apiClient.get('/posts', { params, signal })
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
  const tags = postData.tags ? getTagsFromString(postData.tags) : [];
  const body = { ...postData, tags, status };

  return apiClient.post('/posts', body)
    .then((response) => response.data);
}

export function getBookmarkedPostsPaginated(userId, page, limit) {
  return apiClient.get(`/posts/user/bookmarked/${userId}`, {
    params: { page, limit }
  })
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
  return apiClient.get(`/posts/related/${postId}`, {
    params: { limit }
  })
    .then((res) => res.data)
    .then((data) => data.relatedPosts);
}

export function getRecommendedFeedPaginated(page, limit) {
  return apiClient.get('/recommendations/feed', {
    params: { limit }
  })
    .then((res) => res.data)
    .then((data) => {
      return {
        data: data.data,
        page: { nextPage: undefined }
      };
    });
}

export function getUserPostPaginated(userId, page, limit) {
  return apiClient.get(`/posts/user/all/${userId}`, {
    params: { page, limit }
  })
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
  return apiClient.delete(`/posts/${postId}`)
    .then((response) => response.data);
}

export function toggleBookmark(postId, isBookmarked) {
  const url = `/posts/bookmark/${postId}`;
  if (isBookmarked) {
    return apiClient.delete(url).then((response) => response.data);
  }
  return apiClient.post(url, {}).then((response) => response.data);
}

export function getCompanyAndRoleList() {
  return apiClient.get('/posts/data/company-roles').then((res) => res.data);
}

export function getTopCompanies() {
  return apiClient.get('/posts/data/top-companies').then((res) => res.data);
}

export function editPost(editedPostData, postId, status) {
  const tags = editedPostData.tags ? getTagsFromString(editedPostData.tags) : [];
  const body = {
    ...editedPostData,
    tags,
    status,
    postId
  };

  return apiClient.put('/posts/edit', body)
    .then((response) => response.data);
}

export function upVotePost(postId) {
  return apiClient.post(`/posts/upvote/${postId}`, {})
    .then((response) => response.data);
}

export function downVotePost(postId) {
  return apiClient.post(`/posts/downvote/${postId}`, {})
    .then((response) => response.data);
}

export function getPostComments(postId) {
  return apiClient.get(`/posts/${postId}/comments`).then((res) => res.data.comments);
}

export function addComment(postId, content) {
  return apiClient.post(`/posts/${postId}/comments`, { content }).then((res) => res.data);
}

export function addReply(postId, commentId, content, parentReplyId = null) {
  const body = parentReplyId ? { content, parentReplyId } : { content };
  return apiClient.post(`/posts/${postId}/comments/${commentId}/replies`, body).then((res) => res.data);
}

export function editComment(postId, commentId, content) {
  return apiClient.put(`/posts/${postId}/comments/${commentId}`, { content }).then((res) => res.data);
}

export function deleteComment(postId, commentId) {
  return apiClient.delete(`/posts/${postId}/comments/${commentId}`).then((res) => res.data);
}

export function editReply(postId, commentId, replyId, content) {
  return apiClient.put(`/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content }).then((res) => res.data);
}

export function deleteReply(postId, commentId, replyId) {
  return apiClient.delete(`/posts/${postId}/comments/${commentId}/replies/${replyId}`).then((res) => res.data);
}

export function toggleCommentUpvote(postId, commentId) {
  return apiClient.post(`/posts/${postId}/comments/${commentId}/upvote`, {}).then((res) => res.data);
}

export function toggleReplyUpvote(postId, commentId, replyId) {
  return apiClient.post(`/posts/${postId}/comments/${commentId}/replies/${replyId}/upvote`, {}).then((res) => res.data);
}

export function toggleCommentDownvote(postId, commentId) {
  return apiClient.post(`/posts/${postId}/comments/${commentId}/downvote`, {}).then((res) => res.data);
}

export function toggleReplyDownvote(postId, commentId, replyId) {
  return apiClient.post(`/posts/${postId}/comments/${commentId}/replies/${replyId}/downvote`, {}).then((res) => res.data);
}
