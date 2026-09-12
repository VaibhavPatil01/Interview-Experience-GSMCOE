import mongoose from 'mongoose';
import generateSummaryFromHTMLContent from '../utils/generateSummaryFromHTMLContent.js';
import { getAllPostsService, getPostService, getUserBookmarkedPostService, getRelatedPostsService, getUserPostsService,  deletePostUsingAuthorId, upVotePostService, nullifyUserVote, downVotePostService, addUserToBookmark, removeUserFromBookmark, getCompanyAndRoleService, getTopCompaniesService, editPostService, deletePostService, createPostService, getPostCommentsService, addCommentService, addReplyService, editCommentService, deleteCommentService, editReplyService, deleteReplyService, toggleCommentUpvoteService, toggleReplyUpvoteService, toggleCommentDownvoteService, toggleReplyDownvoteService, getPostCountByUserIdService } from '../services/postService.js';
import { findUserById } from '../../users/services/userService.js';
import { eventBus, EVENTS } from '../events/index.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});


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
    const postAuthor = post.userId?.username;
    const postAuthorId = post.userId?._id?.toString();
    const postAuthorProfilePicture = post.userId?.profilePicture;
    const authorWorkExperiences = post.userId?.workExperiences || [];
    const authorJoinedDate = post.userId?.createdAt;
    
    // fetch author contributions (total posts)
    let authorContributions = 0;
    if (post.userId?._id) {
      authorContributions = await getPostCountByUserIdService(post.userId._id);
    }

    // get the userId
    const userId = req.body.authTokenData?.id;

    //check if the user has bookmarked the current post or not?
    const isBookmarked = post.bookmarks.includes(userId);

    // calculate vote count
    const voteCount = post.upVotes.length - post.downVotes.length;
    const bookmarkCount = post.bookmarks.length;

    // check whether user has upVoted or downVoted the post
    const isUpVoted = post.upVotes.includes(userId);
    const isDownVoted = post.downVotes.includes(userId);
    const commentCount = post.comments.length;

    const isOwner = userId === postAuthorId;
    const shouldMask = post.isAnonymous && !isOwner;

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
        postAuthorId: shouldMask ? null : postAuthorId,
        commentCount,
        isBookmarked,
        postAuthor: shouldMask ? "Anonymous User" : postAuthor,
        postAuthorProfilePicture: shouldMask ? "" : postAuthorProfilePicture,
        authorWorkExperiences: shouldMask ? [] : authorWorkExperiences,
        authorJoinedDate: shouldMask ? null : authorJoinedDate,
        authorContributions: shouldMask ? 0 : authorContributions,
        isOwner,
        _id: post._id,
        isUpVoted,
        isDownVoted,
        upVoteCount: post.upVotes.length,
        downVoteCount: post.downVotes.length,
        hiringType: post.hiringType,
        interviewMode: post.interviewMode,
        interviewDate: post.interviewDate,
        result: post.result,
        rounds: post.rounds,
        technologies: post.technologies,
        dsaTopics: post.dsaTopics,
        coreSubjects: post.coreSubjects,
        preparationDuration: post.preparationDuration,
        preparationResources: post.preparationResources,
        overallTips: post.overallTips,
        salary: post.salary,
        difficulty: post.difficulty,
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
    company,
    role,
    status,
    authTokenData,
    
    // Legacy fields
    title,
    content,
    postType,
    domain,
    rating,
    tags,
    
    // New Fields
    hiringType,
    interviewMode,
    interviewDate,
    result,
    difficulty,
    rounds,
    technologies,
    dsaTopics,
    coreSubjects,
    preparationDuration,
    preparationResources,
    overallTips,
    salary,
    isAnonymous
  } = req.body;

  // Check if user has passed all required values 
  if (!company || !role || !status) {
    return res
      .status(401)
      .json({ message: 'Please enter all required fields' });
  }

  const postTitle = title || `${company} - ${role} Interview Experience`;

  // Generating summary if content exists
  let summary = '';
  if (content) {
    summary = await generateSummaryFromHTMLContent(content);
  }

  const postData = {
    title: postTitle,
    content: content || '',
    summary,
    company,
    role,
    postType: postType || '',
    domain: domain || '',
    rating: rating || 0,
    status,
    tags: tags || [],
    userId: authTokenData.id,
    
    // New Fields
    hiringType,
    interviewMode,
    interviewDate,
    result,
    difficulty,
    rounds: rounds || [],
    technologies: technologies || [],
    dsaTopics: dsaTopics || [],
    coreSubjects: coreSubjects || [],
    preparationDuration,
    preparationResources,
    overallTips,
    salary,
    isAnonymous: isAnonymous || false,
  };

  // Create post using the post services
  try {
    const post = await createPostService(postData);
    
    // AI Layer Sync
    eventBus.emit(EVENTS.POST_CREATED, { postId: post._id.toString() });

    logger.info(`[PostController] Post Created`, {
      event: 'POST_CREATED_EVENT',
      postId: post._id,
      userId: authTokenData.id,
      company,
      role
    });

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

  // AI Layer Sync
  eventBus.emit(EVENTS.POST_DELETED, { postId: postId });

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
      
      // Dispatch domain event to remove notification
      eventBus.emit(EVENTS.POST_UNLIKED, {
        eventId: `like_${userId}_${postId}`
      });
      
      return res
        .status(200)
        .json({ message: 'Removed Up Vote Successfully' });
    }

    // Dispatch domain event for notification
    eventBus.emit(EVENTS.POST_LIKED, {
      eventId: `like_${userId}_${postId}`,
      actorUserId: userId,
      targetEntityId: postId,
      postId: postId,
      timestamp: new Date()
    });

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
      
      // Dispatch domain event to remove notification
      eventBus.emit(EVENTS.POST_UNDISLIKED, {
        eventId: `dislike_${userId}_${postId}`
      });
      
      return res
        .status(200)
        .json({ message: 'Removed Down Vote Successfully' });
    }

    // Dispatch domain event for notification
    eventBus.emit(EVENTS.POST_DISLIKED, {
      eventId: `dislike_${userId}_${postId}`,
      actorUserId: userId,
      targetEntityId: postId,
      postId: postId,
      timestamp: new Date()
    });

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
    company,
    role,
    status,
    authTokenData,
    
    // Legacy fields
    title,
    content,
    summary,
    postType,
    domain,
    rating,
    tags,
    
    // New Fields
    hiringType,
    interviewMode,
    interviewDate,
    result,
    difficulty,
    rounds,
    technologies,
    dsaTopics,
    coreSubjects,
    preparationDuration,
    preparationResources,
    overallTips,
    salary,
    isAnonymous
  } = req.body;

  // Check if user has passed all values
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(401).json({ message: 'NO such post found....' });
  }

  if (!company || !role || !status) {
    return res
      .status(401)
      .json({ message: 'Please enter all required fields ' });
  }

  const userId = authTokenData.id;
  const editedPostData = {
    title: title || `${company} - ${role} Interview Experience`,
    content: content || '',
    summary: summary || '',
    company,
    role,
    postType: postType || '',
    domain: domain || '',
    rating: rating || 0,
    status,
    tags: tags || [],
    userId,

    // New Fields
    hiringType,
    interviewMode,
    interviewDate,
    result,
    difficulty,
    rounds: rounds || [],
    technologies: technologies || [],
    dsaTopics: dsaTopics || [],
    coreSubjects: coreSubjects || [],
    preparationDuration,
    preparationResources,
    overallTips,
    salary,
    isAnonymous: isAnonymous || false,
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

    // AI Layer Sync
    eventBus.emit(EVENTS.POST_UPDATED, { postId: postId });

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

export async function getTopCompanies(req, res) {
  try {
    const data = await getTopCompaniesService();
    return res.status(200).json({
      message: 'Top companies fetched successfully',
      data,
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
  const { sortBy, articleType, jobRole, company, rating, datePosted } = req.query;

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
    else if (sortBy === 'top') sort = 'top';
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

  if (datePosted) {
    const now = new Date();
    if (datePosted === 'Past 24 hours') {
      filters['$and'][1].createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    } else if (datePosted === 'Past week') {
      filters['$and'][1].createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (datePosted === 'Past month') {
      filters['$and'][1].createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
  }

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
        userId: post.isAnonymous ? { ...(post.userId || {}), username: "Anonymous User", profilePicture: "", _id: null } : post.userId,
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
        userId: post.isAnonymous ? { ...(post.userId || {}), username: "Anonymous User", profilePicture: "", _id: null } : post.userId,
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
        userId: post.isAnonymous ? { ...(post.userId || {}), username: "Anonymous User", profilePicture: "", _id: null } : post.userId,
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



 

















export async function getPostComments(req, res) {
  const postId = req.params['id'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: 'No such Post found' });
  }
  try {
    const post = await getPostCommentsService(postId);
    if (!post) return res.status(404).json({ message: 'No such Post found' });
    
    let comments = post.comments;
    if (post.isAnonymous && post.userId) {
      const authorIdStr = post.userId.toString();
      
      comments = post.comments.map(c => {
        if (c.userId && c.userId._id && c.userId._id.toString() === authorIdStr) {
          c.userId = { ...c.userId._doc, username: 'Anonymous User', profilePicture: null };
        }
        if (c.replies) {
          c.replies = c.replies.map(r => {
            if (r.userId && r.userId._id && r.userId._id.toString() === authorIdStr) {
              r.userId = { ...r.userId._doc, username: 'Anonymous User', profilePicture: null };
            }
            return r;
          });
        }
        return c;
      });
    }

    return res.status(200).json({ message: 'Comments fetched successfully', comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function addComment(req, res) {
  const postId = req.params['id'];
  const { authTokenData, content } = req.body;
  const userId = authTokenData.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: 'Invalid Post ID' });
  }
  if (!content) return res.status(400).json({ message: 'Content is required' });

  try {
    const updatedPost = await addCommentService(postId, userId, content);
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    // The added comment is the last one in the array
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];
    
    eventBus.emit(EVENTS.POST_COMMENTED, {
      eventId: `comment_${newComment._id}`,
      actorUserId: userId,
      targetEntityId: postId, 
      recipientId: updatedPost.userId, // Avoids extra DB lookup in worker
      postId: postId,
      commentId: newComment._id,
      timestamp: new Date()
    });

    return res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function addReply(req, res) {
  const { id: postId, commentId } = req.params;
  const { authTokenData, content } = req.body;
  const userId = authTokenData.id;

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).json({ message: 'Invalid Post or Comment ID' });
  }
  if (!content) return res.status(400).json({ message: 'Content is required' });

  try {
    // If frontend sends parentReplyId, extract it to find the actual user being replied to
    const { parentReplyId } = req.body;
    
    const updatedPost = await addReplyService(postId, commentId, userId, content);
    if (!updatedPost) return res.status(404).json({ message: 'Post or comment not found' });

    // Find the comment and the newly added reply (the last one)
    const comment = updatedPost.comments.id(commentId);
    const newReply = comment.replies[comment.replies.length - 1];
    let actualReplyToUserId = null;
    let actualTargetEntityId = commentId;

    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (parentReply) {
        actualReplyToUserId = parentReply.userId;
        actualTargetEntityId = parentReplyId;
      }
    }
    
    if (actualReplyToUserId) {
      // This is a reply to another reply
      eventBus.emit(EVENTS.REPLY_REPLIED, {
        eventId: `reply_${newReply._id}`,
        actorUserId: userId,
        targetEntityId: actualTargetEntityId, 
        recipientId: actualReplyToUserId, // Securely derived from DB
        replyToUserId: actualReplyToUserId, 
        postId: postId,
        commentId: commentId,
        replyId: newReply._id,
        timestamp: new Date()
      });
    } else {
      // Standard reply to a comment
      eventBus.emit(EVENTS.COMMENT_REPLIED, {
        eventId: `reply_${newReply._id}`,
        actorUserId: userId,
        targetEntityId: commentId,
        recipientId: comment.userId, // Avoids extra DB lookup in worker
        postId: postId,
        commentId: commentId,
        replyId: newReply._id,
        timestamp: new Date()
      });
    }

    return res.status(200).json({ message: 'Reply added successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function toggleCommentUpvote(req, res) {
  const { id: postId, commentId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;

  try {
    await toggleCommentUpvoteService(postId, commentId, userId);
    return res.status(200).json({ message: 'Upvote toggled' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function toggleReplyUpvote(req, res) {
  const { id: postId, commentId, replyId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;

  try {
    await toggleReplyUpvoteService(postId, commentId, replyId, userId);
    return res.status(200).json({ message: 'Upvote toggled' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function toggleCommentDownvote(req, res) {
  const { id: postId, commentId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;

  try {
    await toggleCommentDownvoteService(postId, commentId, userId);
    return res.status(200).json({ message: 'Downvote toggled' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function toggleReplyDownvote(req, res) {
  const { id: postId, commentId, replyId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;

  try {
    await toggleReplyDownvoteService(postId, commentId, replyId, userId);
    return res.status(200).json({ message: 'Downvote toggled' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function editComment(req, res) {
  const { id: postId, commentId } = req.params;
  const { authTokenData, content } = req.body;
  const userId = authTokenData.id;
  if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });
  try {
    await editCommentService(postId, commentId, userId, content);
    return res.status(200).json({ message: 'Comment updated' });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function deleteComment(req, res) {
  const { id: postId, commentId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;
  const isAdmin = authTokenData.isAdmin || false;
  try {
    await deleteCommentService(postId, commentId, userId, isAdmin);
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function editReply(req, res) {
  const { id: postId, commentId, replyId } = req.params;
  const { authTokenData, content } = req.body;
  const userId = authTokenData.id;
  if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });
  try {
    await editReplyService(postId, commentId, replyId, userId, content);
    return res.status(200).json({ message: 'Reply updated' });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

export async function deleteReply(req, res) {
  const { id: postId, commentId, replyId } = req.params;
  const { authTokenData } = req.body;
  const userId = authTokenData.id;
  const isAdmin = authTokenData.isAdmin || false;
  try {
    await deleteReplyService(postId, commentId, replyId, userId, isAdmin);
    return res.status(200).json({ message: 'Reply deleted' });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(403).json({ message: 'Unauthorized' });
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}
