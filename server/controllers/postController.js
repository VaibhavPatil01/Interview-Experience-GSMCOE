import mongoose from 'mongoose';
import generateSummaryFromHTMLContent from '../utils/generateSummaryFromHTMLContent.js';
import { getAllPostsService, getPostService, getUserBookmarkedPostService, getRelatedPostsService, getUserPostsService,  deletePostUsingAuthorId, upVotePostService, nullifyUserVote, downVotePostService, addUserToBookmark, removeUserFromBookmark, getCompanyAndRoleService, editPostService, deletePostService, createPostService } from '../services/postService.js';
import { findUserById } from '../services/userService.js';


export async function getPost(req, res) {
  const postId = req.params['id'];

  // check if the id is a valid mongodb id;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: 'No such Post found' });
  }
  try {
    // increment the value of views by 1 and return the post with populated user data
    const post = await getPostService(postId);
    if (!post) {
      return res.status(404).json({ message: 'No such Post found' });
    }
    const postAuthor = post.userId.username;
    const postAuthorId = post.userId._id;

    // get the userId
    const userId = req.body.authTokenData.id;

    //check if the user has bookmarked the current post or not?
    const isBookmarked = post.bookmarks.includes(userId);

    // calculate vote count
    const voteCount = post.upVotes.length - post.downVotes.length;
    const bookmarkCount = post.bookmarks.length;

    // check whether user has upVoted or downVoted the post
    const isUpVoted = post.upVotes.includes(userId);
    const isDownVoted = post.downVotes.includes(userId);
    const commentCount = post.comments.length;

    return res.status(200).json({
      message: 'post fetched successfully',
      post: {
        title: post.title,
        content: post.content,
        summary: post.summary,
        company: post.company,
        role: post.role,
        postType: post.postType,
        domain: post.domain,
        rating: post.rating,
        createdAt: post.createdAt,
        voteCount,
        bookmarkCount,
        views: post.views,
        tags: post.tags,
        postAuthorId,
        commentCount,
        isBookmarked,
        postAuthor,
        isUpVoted,
        isDownVoted,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function createPost(req, res) {
  // Destructure
  const {
    title,
    content,
    company,
    role,
    postType,
    domain,
    rating,
    status,
    tags,
    authTokenData,
  } = req.body;

  // Check if user has passed all values 
  if (
    !title ||
    !content ||
    !company ||
    !role ||
    !postType ||
    !domain ||
    !rating ||
    !status ||
    !tags
  ) {
    return res
      .status(401)
      .json({ message: 'Please enter all required fields' });
  }

  // Generating summary
  const summary = await generateSummaryFromHTMLContent(content);

  const postData = {
    title,
    content,
    summary,
    company,
    role,
    postType,
    domain,
    rating,
    status,
    tags,
    userId: authTokenData.id,
  };

  // Create post using the post services
  try {
    const post = await createPostService(postData);
    return res
      .status(200)
      .json({ message: 'Post Created Successfully', postId: post._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function deletePost(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post to Delete' });
  }

  let postDeleteResponse = null;
  try {
    // If user is admin then direct delete the post
    // Else delete the post when both post and userId matches
    if (authTokenData.isAdmin) {
      postDeleteResponse = await deletePostService(postId);
    } else {
      postDeleteResponse = await deletePostUsingAuthorId(
        postId,
        userId,
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }

  // Check the condition if the post is successfully deleted or not
  if (!postDeleteResponse.acknowledged) {
    return res.status(400).json({ message: 'Something went wrong...' });
  }

  if (postDeleteResponse.deletedCount === 0) {
    return res.status(404).json({ message: 'Post Could not be Delete' });
  }

  return res.status(200).json({ message: 'Post Deleted Successfully' });
}

// ----------------------------------------------------------------------------------------------------------- //

export async function upVotePost(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post to Up-Vote' });
  }

  try {
    const updateDetail = await upVotePostService(postId, userId);

    // Check if user was already bookmarked
    if (updateDetail.matchedCount === 0) {
      await nullifyUserVote(postId, userId);
      return res
        .status(200)
        .json({ message: 'Removed Up Vote Successfully' });
    }

    return res.status(200).json({ message: 'Post Up Voted Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function downVotePost(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post to Down-Vote' });
  }

  try {
    const updateDetail = await downVotePostService(postId, userId);

    // Check if user was already bookmarked
    if (updateDetail.matchedCount === 0) {
      await nullifyUserVote(postId, userId);
      return res
        .status(200)
        .json({ message: 'Removed Down Vote Successfully' });
    }

    return res.status(200).json({ message: 'Post Down Voted Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function editPost(req, res) {
  //destructuring
  const {
    postId,
    title,
    content,
    summary,
    company,
    role,
    postType,
    domain,
    rating,
    status,
    tags,
    authTokenData,
  } = req.body;

  // Check if user has passed all values
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(401).json({ message: 'NO such post found....' });
  }

  if (
    !title ||
    !content ||
    !summary ||
    !company ||
    !role ||
    !postType ||
    !domain ||
    !rating ||
    !status ||
    !tags
  ) {
    return res
      .status(401)
      .json({ message: 'Please enter all required fields ' });
  }

  const userId = authTokenData.id;
  const editedPostData = {
    title,
    content,
    summary,
    company,
    role,
    postType,
    domain,
    rating,
    status,
    tags,
    userId: authTokenData.id,
  };

  try {
    const user = await findUserById(userId);
    const post = await editPostService(
      postId,
      userId,
      editedPostData,
      user?.isAdmin,
    );

    if (!post) {
      console.log('Not acknowledged while editing the post'); 
      return res.status(400).json({
        message:
          'NO such post Found OR You do not have permission to edit this post.... ',
      });
    }

    return res
      .status(200)
      .json({ message: 'Post edited succesfully', data: post });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function getCompanyAndRole(req, res) {
  try {
    const data = await getCompanyAndRoleService();
    if (!data || data.length === 0) {
      return res.status(200).json({
        message: 'Company and role fetched successfully',
        data: {
          company: [],
          role: [],
        },
      });
    }

    return res.status(200).json({
      message: 'Company and role fetched successfully',
      data: {
        company: data[0].company ? data[0].company : [],
        role: data[0].role ? data[0].role : [],
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function addUserBookmark(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post to Bookmark' });
  }

  try {
    const updateDetail = await addUserToBookmark(postId, userId);

    // Check if user was already bookmarked
    if (updateDetail.matchedCount === 0) {
      return res.status(500).json({ message: 'Post is already Bookmarked' });
    }

    return res.status(200).json({ message: 'Post Bookmarked Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function removeUserBookmark(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post to Remove Bookmark' });
  }

  try {
    const updateDetail = await removeUserFromBookmark(
      postId,
      userId,
    );

    // Check if user was already bookmarked
    if (updateDetail.matchedCount === 0) {
      return res.status(500).json({ message: 'Post is not Bookmarked' });
    }

    return res.status(200).json({ message: 'Post Removed From Bookmark' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ----------------------------------------------------------------------------------------------- //

export async function getAllPost(req, res) {
  const { sortBy, articleType, jobRole, company, rating } = req.query;

  // Getting search from query and making sure it is string
  // If not then assigning it to empty string
  let search = req.query['search'];
  if (!search || typeof search !== 'string') {
    search = '';
  }

  let page = parseInt(req.query['page']) - 1;
  let limit = parseInt(req.query['limit']);

  // default limit
  if (!limit || limit <= 0) limit = 10;

  if (limit > 100) {
    return res.status(500).json({ message: 'Limit cannot exceed 100' });
  }

  // default page
  if (!page || page < 0) {
    page = 0;
  }

  const skip = limit * page;
  const filters = { $and: [{}, {}] };

  //default sorting is by newest post first
  let sort = '-createdAt';

  if (sortBy) {
    if (sortBy === 'new') sort = '-createdAt';
    else if (sortBy === 'old') sort = 'createdAt';
    else if (sortBy === 'views') sort = '-views';
    // else if (sortBy === 'top') sort.voteCount = 'desc';
  }

  // Adding search filter
  filters['$and'][0] = {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ],
  };

  // check and find all the filter parameters
  // if articleType is in query
  if (articleType) {
    filters['$and'][1].postType = articleType;
  }
  if (jobRole) {
    filters['$and'][1].role = jobRole;
  }
  if (company) {
    filters['$and'][1].company = company;
  }
  const convertedRating = parseInt(rating);
  if (convertedRating) filters['$and'][1].rating = convertedRating;

  try {
    const userId = req.body.userId;
    const posts = await getAllPostsService(filters, sort, limit, skip);

    if (posts.length === 0) {
      return res.status(200).json({
        message: 'No posts to display',
        data: [],
        page: { previousPage: page === 0 ? undefined : page },
      });
    }

    // Resolving the list of posts
    const response = posts.map((post) => {
      const { upVotes, downVotes, bookmarks } = post;

      const isUpVoted = upVotes.some((id) => userId && id.equals(userId));
      const isDownVoted =
        !isUpVoted && downVotes.some((id) => userId && id.equals(userId));
      const isBookmarked = bookmarks.some((id) => userId && id.equals(userId));

      return {
        ...post,
        isUpVoted,
        isDownVoted,
        isBookmarked,
        votes: upVotes.length - downVotes.length,
        upVotes: undefined,
        downVotes: undefined,
        bookmarks: undefined,
      };
    });

    // as frontend is 1 based page index
    const nextPage = page + 2;
    // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
    const previousPage = page === 0 ? undefined : page;
    return res.status(200).json({
      message: 'post fetched successfully',
      data: response,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function getUserBookmarkedPost(req, res) {
  // It denotes the user which has made the request
  const reqUserId = req.body.userId;

  const paramUserId = req.params['userId'];

  if (!mongoose.Types.ObjectId.isValid(paramUserId)) {
    return res.status(404).json({ message: 'No such User found' });
  }

  const userId = new mongoose.Types.ObjectId(paramUserId);

  // queryPage should start from 1
  let page = parseInt(req.query['page']) - 1;
  let limit = parseInt(req.query['limit']);

  // default limit
  if (!limit || limit <= 0) limit = 10;

  if (limit > 100) {
    return res.status(500).json({ message: 'Limit cannot exceed 100' });
  }

  // default page
  if (!page || page < 0) {
    page = 0;
  }

  const skip = limit * page;
  try {
    const posts = await getUserBookmarkedPostService(userId, limit, skip);
    if (posts.length === 0) {
      return res.status(200).json({
        message: 'No posts to display',
        data: [],
        page: { previousPage: page === 0 ? undefined : page },
      });
    }

    const response = posts.map((post) => {
      const { upVotes, downVotes, bookmarks } = post;
      const isUpVoted = upVotes.some((id) => reqUserId && id.equals(reqUserId));
      const isDownVoted =
        !isUpVoted &&
        downVotes.some((id) => reqUserId && id.equals(reqUserId));

      const isBookmarked = bookmarks.some((id) => reqUserId && id.equals(reqUserId));

      return {
        ...post,
        isUpVoted,
        isDownVoted,
        isBookmarked,
        votes: upVotes.length - downVotes.length,
        upVotes: undefined,
        downVotes: undefined,
      };
    });

    // as frontend is 1 based page index
    const nextPage = page + 2;
    // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
    const previousPage = page === 0 ? undefined : page;
    return res.status(200).json({
      message: 'bookmarked posts fetched successfully',
      data: response,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function getRelatedPosts(req, res) {
  const postId = req.params['id'];
  const limit = parseInt(req.query['limit']);

  // check if the id is a valid mongodb id;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: 'No such Post found' });
  }

  if (!limit || limit <= 0) {
    return res.status(400).json({ message: 'Please provide a valid limit' });
  }

  try {
    // Get posts related to the given post
    const relatedPosts = await getRelatedPostsService(postId, limit);

    return res.status(200).json({
      message: 'post fetched successfully',
      relatedPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function getUserPost(req, res) {
  // It denotes the user which has made the request
  const reqUserId = req.body.userId;

  const paramUserId = req.params['userId'];
  if (!mongoose.Types.ObjectId.isValid(paramUserId)) {
    return res.status(404).json({ message: 'No such User found' });
  }
  // query page will start from 1;
  let page = parseInt(req.query['page']) - 1;
  let limit = parseInt(req.query['limit']);

  // default limit
  if (!limit || limit <= 0) limit = 10;

  if (limit > 100) {
    return res.status(500).json({ message: 'limit cannot exceed 100' });
  }

  if (!page || page < 0) {
    page = 0;
  }

  const skip = limit * page;
  const userId = new mongoose.Types.ObjectId(paramUserId);
  try {
    const posts = await getUserPostsService(userId, limit, skip);

    if (posts.length === 0) {
      return res.status(200).json({
        message: 'No posts to display',
        data: [],
        page: { previousPage: page === 0 ? undefined : page },
      });
    }

    const response = posts.map((post) => {
      const { upVotes, downVotes, bookmarks } = post;
      const isUpVoted = upVotes.some((id) => id == reqUserId);
      const isDownVoted = !isUpVoted && downVotes.some((id) => id == reqUserId);
      const isBookmarked = bookmarks.some((id) => id == reqUserId);

      return {
        ...post,
        isUpVoted,
        isDownVoted,
        isBookmarked,
        votes: upVotes.length - downVotes.length,
        upVotes: undefined,
        downVotes: undefined,
        bookmarks: undefined,
      };
    });

    // as frontend is 1 based page index
    const nextPage = page + 2;

    // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
    const previousPage = page === 0 ? undefined : page;
    return res.status(200).json({
      message: 'user posts',
      data: response,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong....' });
  }
}



 

















