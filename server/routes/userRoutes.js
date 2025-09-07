import express from "express";
import passport from 'passport';
import { deleteUser, editUserProfile, forgotPassword, getLoginStatus, getUserProfile, googleLogin, loginUser, logoutUser, registerUser, resetPassword, searchUser, verifyEmail } from '../controllers/userController.js';
import isUserAuth from '../middleware/isUserAuth.js';

const userRouter = express.Router(); 

userRouter.post('/login', loginUser);
userRouter.get('/verify-email/:token', verifyEmail);
userRouter.post('/register', registerUser);
userRouter.get('/status', getLoginStatus);
userRouter.get('/profile/:id', getUserProfile);
userRouter.delete('/', isUserAuth, deleteUser);
userRouter.put('/profile', isUserAuth, editUserProfile); 
userRouter.post('/logout', logoutUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword); 
userRouter.get('/search', searchUser);

// User Routes for Google Auth 
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/user/auth/google/failed', session: false, }), googleLogin);
userRouter.get('/auth/google/failed', (req, res) => { return res.status(401).json({ message: 'Login Failure' }); });

export default userRouter;  