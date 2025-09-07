import express from 'express';
import tokenDataParser from '../middleware/tokenDataParser.js';
import isUserAuth from '../middleware/isUserAuth.js';
import { addUserBookmark, createPost, deletePost, downVotePost, editPost, getAllPost, getCompanyAndRole, getPost, getRelatedPosts, getUserBookmarkedPost, getUserPost, removeUserBookmark, upVotePost } from '../controllers/postController.js';

const postRouter = express.Router(); 

// Working Routes
postRouter.get('/:id', isUserAuth, getPost); 
postRouter.post('', isUserAuth, createPost);
postRouter.delete('/:id', isUserAuth, deletePost); 
postRouter.post('/upvote/:id', isUserAuth, upVotePost);
postRouter.post('/downvote/:id', isUserAuth, downVotePost);
postRouter.put('/edit', isUserAuth, editPost);
postRouter.get('/data/company-roles', getCompanyAndRole);
postRouter.post('/bookmark/:id', isUserAuth, addUserBookmark);
postRouter.delete('/bookmark/:id', isUserAuth, removeUserBookmark); 
postRouter.get('', tokenDataParser, getAllPost);
postRouter.get('/user/bookmarked/:userId', tokenDataParser, getUserBookmarkedPost);
postRouter.get('/related/:id', isUserAuth, getRelatedPosts);
postRouter.get('/user/all/:userId', tokenDataParser, getUserPost); 



export default postRouter;