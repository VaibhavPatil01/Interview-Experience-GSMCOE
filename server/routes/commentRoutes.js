import { Router } from 'express';
import isUserAuth from '../middleware/isUserAuth.js'; 
import { createComment, createCommentReply, deleteComment, deleteCommentReply, getComment, getCommentReplies } from '../controllers/commentController.js';

const commentRouter = Router();

commentRouter.post('/:postid', isUserAuth, createComment);
commentRouter.delete('/:postid/:commentid', isUserAuth, deleteComment);
commentRouter.post('/replies/:postid/:commentid', isUserAuth, createCommentReply);
commentRouter.delete('/replies/:postid/:commentid/:replyid', isUserAuth, deleteCommentReply);
commentRouter.get('/:postid', isUserAuth, getComment); 
commentRouter.get('/replies/:postid/:commentid', isUserAuth, getCommentReplies);




export default commentRouter; 