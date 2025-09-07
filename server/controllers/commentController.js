import mongoose from 'mongoose';
import { getCommentService, createCommentService, deleteCommentService, deleteCommentUsingAuthorId, getAllReplies, createReply, deleteReply, deleteReplyUsingAuthorId } from '../services/commentService.js'; 

export async function createComment(req, res) {
  const { content, authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['postid'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid post to create comment' });
  }

  if (!content) {
    return res
      .status(401)
      .json({ message: 'Comment is Empty, please provide content' });
  }

  try {
    const commentId = await createCommentService(userId, postId, content);

    if (!commentId) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Post to Comment' });
    }

    return res.status(200).json({
      message: 'Comment Created Successfully',
      commentId: commentId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ---------------------------------------------------------------------------------//

export async function deleteComment(req, res) {
  const { authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['postid'];
  const commentId = req.params['commentid'];
  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Comment to Delete' });
  }

  try {
    let commentDeleteResponse = null;

    // Check if the user is admin or not
    if (authTokenData.isAdmin) {
      commentDeleteResponse = await deleteCommentService(postId, commentId);
    } else {
      commentDeleteResponse = await deleteCommentUsingAuthorId(
        postId,
        commentId,
        userId,
      );
    }

    // Check the condition if the given comment was successfully deleted or not
    if (!commentDeleteResponse.acknowledged) {
      return res.status(400).json({ message: 'Something went wrong...' });
    }

    if (commentDeleteResponse.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: 'Comment Could not be Deleted' });
    }

    return res.status(200).json({ message: 'Comment Deleted Successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ---------------------------------------------------------------------------------//

export async function createCommentReply(req, res) {
  const { content, authTokenData } = req.body;
  const userId = authTokenData.id.toString();

  const postId = req.params['postid'];
  const commentId = req.params['commentid'];
  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post with Comment to reply' });
  }

  if (!content) {
    return res
      .status(401)
      .json({ message: 'Reply is Empty, please provide content' });
  }

  try {
    const replyId = await createReply(userId, postId, commentId, content);

    if (!replyId) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Comment to Reply' });
    }

    return res.status(200).json({
      message: 'Replied to the Comment Successfully',
      replyId: replyId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
} 

// ---------------------------------------------------------------------------------//

export async function deleteCommentReply(req, res) {
  const userId = req.body.authTokenData.id;
  const postId = req.params['postid'];
  const commentId = req.params['commentid'];
  const replyId = req.params['replyid'];

  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId) ||
    !mongoose.Types.ObjectId.isValid(replyId)
  ) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Reply to be deleted....' });
  }

  try {
    // if admin is trying to delete
    let response = null;
    if (req.body.authTokenData.isAdmin) {
      response = await deleteReply(postId, commentId, replyId);
    } else {
      response = await deleteReplyUsingAuthorId(
        postId,
        commentId,
        replyId,
        userId,
      );
    }

    if (!response.acknowledged) {
      return res.status(500).json({ message: 'something went wrong.....' });
    }

    if (!response.modifiedCount) {
      return res.status(404).json({ message: 'no such reply found' });
    }

    return res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong...' });
  }
}

// ---------------------------------------------------------------------------------//

export async function getComment(req, res) {
  const postId = req.params['postid'];
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: 'No such post found...' });
  }

  // query page = 0 for the backend that's why (-1)
  // query page = 1 for the frontend
  let page = parseInt(req.query['page']) - 1;
  let limit = parseInt(req.query['limit']);

  if (!limit || limit <= 0) limit = 10;
  if (limit > 100) {
    return res.status(500).json({ message: 'Limit cannot exceed 100' });
  }

  if (!page || page < 0) {
    page = 0;
  }

  const skip = limit * page;

  try {
    const comments = await getCommentService(postId, skip, limit);

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        message: 'No comments',
        data: [],
        page: {
          previousPage: page === 0 ? undefined : page,
          nextPage: undefined,
        },
      });
    }

    const previousPage = page === 0 ? undefined : page;
    const nextPage = page + 2;
    return res.status(200).json({
      message: 'comments fetched successfully',
      data: comments,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong....' });
  }
}

// ---------------------------------------------------------------------------------//

export async function getCommentReplies(req, res) {
  const postId = req.params['postid'];
  const commentId = req.params['commentid'];

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res
      .status(404)
      .json({ message: 'Please provide a valid Post with Comment to reply' });
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

  try {
    // Calculate the total number of pages to skip
    const skip = limit * page;

    const replies = await getAllReplies(postId, commentId, limit, skip);

    if (!replies || replies.length === 0) {
      return res.status(200).json({
        message: 'No replies to display',
        data: [],
        page: {
          previousPage: page === 0 ? undefined : page,
          nextPage: undefined,
        },
      });
    }

    // as frontend is 1 based page index
    const nextPage = page + 2;

    // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
    const previousPage = page === 0 ? undefined : page;

    return res.status(200).json({
      message: 'Replies fetched successfully',
      data: replies,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

















