import express from "express";
import passport from 'passport';
import { deleteUser, updateUserProfile, updateProfilePicture, uploadUserResume, forgotPassword, getLoginStatus, getUserProfile, googleLogin, githubLogin, loginUser, logoutUser, registerUser, resetPassword, searchUser, verifyEmail } from '../controllers/userController.js';
import isUserAuth from '../../../middlewares/isUserAuth.js';
import { handleImageUpload, handleResumeUpload } from '../../../middlewares/upload.js';

// Express router for user authentication, profile management, and OAuth integrations

const userRouter = express.Router();

// Authentication & Onboarding
userRouter.post('/register', registerUser);
userRouter.get('/verify-email/:token', verifyEmail);
userRouter.post('/login', loginUser);
userRouter.get('/status', getLoginStatus);
userRouter.post('/logout', logoutUser);

// Password Management
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);

// Profile Management
userRouter.get('/profile/:id', getUserProfile);
userRouter.put('/profile', isUserAuth, updateUserProfile);
userRouter.put('/profile-picture', isUserAuth, handleImageUpload, updateProfilePicture);
userRouter.put('/resume', isUserAuth, handleResumeUpload, uploadUserResume);
userRouter.delete('/', isUserAuth, deleteUser);

// User Search
userRouter.get('/search', searchUser);

// User Routes for Google Auth 
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/user/auth/google/failed', session: false, }), googleLogin);
userRouter.get('/auth/google/failed', (req, res) => { return res.status(401).json({ message: 'Login Failure' }); });

// User Routes for GitHub Auth
userRouter.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
userRouter.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/user/auth/github/failed', session: false, }), githubLogin);
userRouter.get('/auth/github/failed', (req, res) => { return res.status(401).json({ message: 'GitHub Login Failure' }); });

export default userRouter;  