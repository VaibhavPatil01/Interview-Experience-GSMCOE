import {Post as postModel} from '../models/Post.js';  

// Tested working fine
export const createPostService = (post) => {
  return postModel.create(post);
};

export const deletePostService = (postId) => { 
  return postModel.deleteOne({ _id: postId }); 
};

export const upVotePostService = (postId, userId) => {
  const conditions = {
      _id: postId,
      upVotes: { $ne: userId },
    };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = {
      $addToSet: { upVotes: userId },
      $pull: { downVotes: userId },
    };

    return postModel.updateOne(conditions, update);
};

export const downVotePostService = (postId, userId) => {
    const conditions = {
      _id: postId,
      downVotes: { $ne: userId },
    };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = {
      $addToSet: { downVotes: userId },
      $pull: { upVotes: userId },
    };

    return postModel.updateOne(conditions, update);
};

export const nullifyUserVote = (postId, userId) => {
    const condition = { _id: postId };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = { $pull: { upVotes: userId, downVotes: userId } };

    return postModel.updateOne(condition, update);
};

export const editPostService = (postId, userId, editedPostData, isEditorAdmin = false) => {
  let filter = { _id: postId };

  if (!isEditorAdmin) {
    filter = { _id: postId, userId };
  }

  const update = {
    title: editedPostData.title,
    content: editedPostData.content,
    summary: editedPostData.summary,
    company: editedPostData.company,
    role: editedPostData.role,
    postType: editedPostData.postType,
    domain: editedPostData.domain,
    rating: editedPostData.rating,
    status: editedPostData.status,
    tags: editedPostData.tags,
  };

  return postModel.findOneAndUpdate(filter, update);
};

export const getCompanyAndRoleService = () => {
  return postModel.aggregate([
    {
      $group: {
        _id: null,
        company: { $addToSet: '$company' },
        role: { $addToSet: '$role' },
      },
    },
  ]);
};

export const addUserToBookmark = (postId, userId) => {
  const conditions = {
    _id: postId,
    bookmarks: { $ne: userId },
  };

  const update = { $addToSet: { bookmarks: userId } };

  return postModel.updateOne(conditions, update);
};

export const removeUserFromBookmark = (postId, userId) => {
  const conditions = {
    _id: postId,
    bookmarks: userId,
  };

  const update = { $pull: { bookmarks: userId } };

  return postModel.updateOne(conditions, update);
};

export const getAllPostsService = (filter, sort, limit, skip) => {
  return postModel
    .find(filter)
    .sort(sort)
    .select({
      comments: 0,
      status: 0,
      tags: 0,
    })
    .populate('userId', 'username')
    .limit(limit)
    .skip(skip)
    .lean();
};

export const getUserBookmarkedPostService = (userId, limit, skip) => {
  return postModel
    .find({ bookmarks: { $in: [userId] } })
    .select({
      comments: 0,
      tags: 0,
      views: 0,
      status: 0,
    })
    .populate('userId', 'username')
    .limit(limit)
    .skip(skip)
    .lean();
};

export const getRelatedPostsService = async (postId, limit) => {
  const post = await getPostService(postId);
  if (!post) {
    throw 'No Post Found with the Given ID';
  }

  const postList = await postModel
    .find({
      $and: [{ company: post.company }, { _id: { $ne: post._id } }],
    })
    .limit(limit)
    .select({
      _id: 1,
      title: 1,
    });

  if (postList.length === limit) return postList;

  const excludePostIds = [post._id];
  for (let i = 0; i < postList.length; i++) {
    excludePostIds.push(postList[i]._id);
  }

  limit -= postList.length;

  const relatedPostList = await postModel.aggregate([
    {
      $search: {
        index: 'RecommendPost',
        compound: {
          must: [
            {
              moreLikeThis: {
                like: {
                  title: post.title,
                  content: post.content,
                  postType: post.postType,
                },
              },
            },
          ],
          mustNot: [
            {
              in: {
                path: '_id',
                value: excludePostIds,
              },
            },
          ],
        },
      },
    },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
      },
    },
  ]);

  return postList.concat(relatedPostList);
};

export const getUserPostsService = (userId, limit, skip) => {
  return postModel
    .find({ userId })
    .select({ comments: 0, tags: 0 })
    .populate('userId', 'username')
    .limit(limit)
    .skip(skip)
    .lean();
};

export const deletePostUsingAuthorId = (postId, userId) => {
  return postModel.deleteOne({ _id: postId, userId: userId }); 
};

export const getPostService = (postId) => {
  return postModel
    .findByIdAndUpdate({ _id: postId }, { $inc: { views: 1 } }, { new: true })
    .populate('userId', 'username');
};











