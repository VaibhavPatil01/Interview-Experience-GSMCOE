import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import sendEmailVerificationMail from '../../../core/mail/sendEmailVerificationMail.js';
import sendForgotPasswordEmail from '../../../core/mail/sendForgotPasswordMail.js';
import decodeToken from '../../../utils/token/decodeToken.js';
import generateAuthToken from '../utils/token/generateAuthToken.js';
import generateEmailVerificationToken from '../utils/token/generateEmailVerificationToken.js';
import generateForgotPasswordToken from '../utils/token/generateForgotPasswordToken.js';
import { findUser, deleteUserService, createUser, resetPasswordService, verifyUserEmail, editProfile, searchUserService, countUsersService, getUserProfileService, updateUserService } from '../services/userService.js';
import { eventBus, EVENTS } from '../../posts/events/index.js';

// Authenticates a user and returns a JWT token
export async function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // if email or password is undefined
  if (!email || !password) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect Username or Password',
    });
  }

  try {
    const user = await findUser(email);

    // if no such user found.
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect Username or Password' });
    }

    // compare the passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect Username or Password' });
    }

    // Check if email is verified or not
    if (!user.isEmailVerified) {
      return res.status(401).json({ message: 'Email is not verified' });
    }

    // generate JWT token
    const token = generateAuthToken(user._id, email, user.isAdmin);

    // Remove the password
    return res.status(200).json({
      message: 'Login Successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        branch: user.branch,
        passingYear: user.passingYear,
        designation: user.designation,
        about: user.about,
        github: user.github,
        linkedin: user.linkedin,
        phone: user.phone,
        skills: user.skills,
        socialLinks: user.socialLinks,
        workExperiences: user.workExperiences,
        coursesAndCertifications: user.coursesAndCertifications,
        projects: user.projects,
        awards: user.awards,
        languages: user.languages,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}
// Registers a new user and sends an email verification link
export async function registerUser(req, res) {
  const {
    username,
    email,
    password,
  } = req.body;

  // checking if required fields are undefined
  if (
    !username ||
    !email ||
    !password
  ) {
    return res
      .status(401)
      .json({ success: false, message: 'Please enter all required fields ' });
  }

  try {
    // check if email is registered
    const oldUser = await findUser(email);

    if (oldUser && oldUser.isEmailVerified) {
      return res.status(404).json({ success: false, message: 'Email already exists' });
    }

    if (oldUser && !oldUser.isEmailVerified) {
      await deleteUserService(oldUser._id);
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // creating the user object
    const userData = {
      username,
      email,
      password: hashPassword,
      isAdmin: false,
      isEmailVerified: false,
    };

    // create user account
    const user = await createUser(userData);

    // Generate token
    const token = generateEmailVerificationToken(
      user._id,
      email,
      user.isAdmin,
    );

    // send email to the user for verification
    await sendEmailVerificationMail(email, token, user.username);

    return res.status(200).json({
      success: true,
      message: 'Account created successfully, please verify your email....',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}
// Verifies the user's email using the token sent to their inbox
export async function verifyEmail(req, res) {
  const emailVerificationToken = req.params['token'];

  try {
    const { email } = decodeToken(emailVerificationToken);

    const user = await findUser(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: 'User Not Found with the Email' });
    }

    // Update the user email field
    await verifyUserEmail(email);

    const CLIENT_BASE_URL = process.env['CLIENT_BASE_URL'];

    if (!CLIENT_BASE_URL) return res.redirect('/');
    return res.redirect(`${CLIENT_BASE_URL}/login`);
  } catch (error) {
    // Send a simple html to user if error
    res.setHeader('Content-type', 'text/html');
    return res.send('<h1>Error Authenticating</h1>');
  }
}
// Checks current login status and returns decoded user data if valid
export async function getLoginStatus(req, res) {
  let token = req.headers['token'];

  if (Array.isArray(token)) {
    token = token[0];
  }

  // We are using 200 because the request was successful and we return isLoggedIn false
  if (!token) {
    return res
      .status(200)
      .json({ isLoggedIn: false, isAdmin: false, admin: null, user: null });
  }

  try {
    // Verify the token
    const authTokenData = decodeToken(token);

    // Check if the user
    const user = await findUser(authTokenData.email);

    if (!user) {
      return res.status(200).json({
        isLoggedIn: false,
        isAdmin: false,
        admin: null,
        user: null,
      });
    }

    const userResponseData = {
      userId: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      about: user.about,
      phone: user.phone,
      skills: user.skills,
      socialLinks: user.socialLinks,
      workExperiences: user.workExperiences,
      coursesAndCertifications: user.coursesAndCertifications,
      projects: user.projects,
      awards: user.awards,
      languages: user.languages,
    };

    return res.status(200).json({
      isLoggedIn: true,
      isAdmin: user.isAdmin,
      admin: null,
      user: userResponseData,
    });
  } catch (err) {
    // We return 400 because the request failed for unknown reason
    return res
      .status(400)
      .json({ isLoggedIn: false, isAdmin: false, admin: null, user: null });
  }
}
// Fetches the public profile data and post statistics for a specific user ID
export async function getUserProfile(req, res) {
  const paramId = req.params['id'];

  // if not a valid user id
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    return res.status(404).json({ message: 'No such user found' });
  }

  const userId = new mongoose.Types.ObjectId(paramId);
  try {
    const userProfile = await getUserProfileService(userId);

    if (userProfile.length === 0) {
      return res.status(404).json({ message: 'No such User found' });
    }

    // if no post
    if (userProfile[0].postData.length === 0) {
      userProfile[0].postData.push({
        viewCount: 0,
        postCount: 0,
        upVoteCount: 0,
        downVoteCount: 0,
      });
    }
    return res.status(200).json({ message: 'ok', data: userProfile });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong...' });
  }
}
// Deletes the currently authenticated user's account
export async function deleteUser(req, res) {
  const userData = req.body.authTokenData;

  if (!userData) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  console.log(userData)

  try {
    // Delete the user Account
    await deleteUserService(userData.id);
    return res.status(200).json({ message: 'User Account deleted' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: 'Error during Deletion, Please try again later' });
  }
}

// Logs out the user by sending a successful logout response
export function logoutUser(req, res) {
  return res.status(200).json({ message: 'User Logout successful' });
}

// Generates a password reset token and sends an email to the user
export async function forgotPassword(req, res) {
  const email = req.body?.email;

  // if email is undefined
  if (!email) {
    return res
      .status(401)
      .json({ message: 'Please enter all required fields ' });
  }

  try {
    // check if email is not-registered
    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({ message: 'No such email found' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Please Verify your Email' });
    }

    // Creating a jwt token and sending it to the user
    const token = generateForgotPasswordToken(user._id, email, user.isAdmin);

    console.log("Generated Token", token);

    // send email to the user
    sendForgotPasswordEmail(email, token, user.username);

    return res
      .status(200)
      .json({ message: `A password reset link is sent to ${email}` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error, Please try again later' });
  }
}

// Resets the user's password using the provided valid token
export async function resetPassword(req, res) {
  const email = req.body.email;
  const newPassword = req.body.password;
  const resetPasswordToken = req.params['token'];

  console.log("Request Came", email, newPassword)

  if (!email) {
    return res.status(401).json({ message: 'Please enter Email' });
  }

  if (!newPassword) {
    return res.status(401).json({ message: 'Please enter new Password ' });
  }

  try {
    const tokenData = decodeToken(resetPasswordToken);



    if (email !== tokenData.email) {
      return res.status(403).json({ message: 'Reset Link is not valid' });
    }

    const user = await findUser(tokenData.email);



    if (!user) {
      return res
        .status(401)
        .json({ message: 'Please create a new Reset Password Link' });
    }

    console.log("Before Hashing The Password")

    // Hash the password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Resetting the password
    await resetPasswordService(tokenData.email, hashedNewPassword);

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: 'Error, generate new password link' });
  }
}

// Handles successful Google OAuth login and redirects with JWT token
export async function googleLogin(req, res) {
  if (!req.user) {
    return res.send('ERROR with Google Login');
  }

  const userData = req.user;
  const email = userData.email;
  const user = await findUser(email);

  if (!user) {
    return res.send('ERROR with Google Login');
  }

  // generate JWT token
  const token = generateAuthToken(user._id, email, user.isAdmin);

  // Successful authentication, redirect home.
  const clientURL = process.env['CLIENT_BASE_URL'] || 'http://localhost:3000';
  return res.redirect(`${clientURL}/token/google/${token}`);
}

// Handles successful GitHub OAuth login and redirects with JWT token
export async function githubLogin(req, res) {
  if (!req.user) {
    return res.send('ERROR with GitHub Login');
  }

  const userData = req.user;
  const email = userData.email;
  const user = await findUser(email);

  if (!user) {
    return res.send('ERROR with GitHub Login');
  }

  // generate JWT token
  const token = generateAuthToken(user._id, email, user.isAdmin);

  // Successful authentication, redirect home.
  const clientURL = process.env['CLIENT_BASE_URL'] || 'http://localhost:3000';
  return res.redirect(`${clientURL}/token/github/${token}`);
}

// Searches for users by username with pagination support
export async function searchUser(req, res) {
  let search = req.query['searchparam'];
  let page = parseInt(req.query['page']) - 1;
  let limit = parseInt(req.query['limit']);

  if (!search) search = '';
  if (!page || page < 0) page = 0;
  if (!limit || limit <= 0) limit = 10;

  if (limit > 100) {
    return res.status(500).json({ message: 'Limit cannot exceed 100' });
  }

  const skip = limit * page;
  try {
    const userList = await searchUserService(search, limit, skip);
    const totalUsers = await countUsersService();

    if (userList.length === 0) {
      return res.status(200).json({
        message: 'No posts to display',
        data: [],
        totalUsers,
        page: { previousPage: page === 0 ? undefined : page },
      });
    }

    // as frontend is 1 based page index
    const nextPage = page + 2;
    // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
    const previousPage = page === 0 ? undefined : page;

    return res.status(200).json({
      message: 'Users fetched successfully',
      data: userList,
      totalUsers,
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong...' });
  }
}

// Updates the authenticated user's profile details
export async function updateUserProfile(req, res) {
  let token = req.headers['token'];

  if (Array.isArray(token)) {
    token = token[0];
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const authTokenData = decodeToken(token);
    const user = await findUser(authTokenData.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await updateUserService(user._id, req.body);

    // AI Layer Sync
    eventBus.emit(EVENTS.USER_UPDATED, { userId: user._id });

    return res.status(200).json({ message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong while updating profile' });
  }
}

// Handles uploading and updating the user's profile picture via Cloudinary
export async function updateProfilePicture(req, res) {
  try {
    const authTokenData = req.authTokenData;
    const user = await findUser(authTokenData.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // The Cloudinary URL is available in req.file.path
    const profilePictureUrl = req.file.path;

    const updatedUser = await updateUserService(user._id, { profilePicture: profilePictureUrl });

    return res.status(200).json({
      message: 'Profile picture updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error("Error in updateProfilePicture:", error);
    return res.status(500).json({
      message: 'Something went wrong while updating profile picture',
      error: error.message || error.toString(),
      stack: error.stack
    });
  }
}

// Handles uploading and updating the user's resume via Cloudinary
export async function uploadUserResume(req, res) {
  try {
    const authTokenData = req.authTokenData;
    const user = await findUser(authTokenData.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let resumeUrl = req.file.path;
    const originalFilename = req.file.originalname || req.file.filename || 'resume.pdf';

    // Add extension if missing so browser knows the file type
    const extMatch = originalFilename.match(/\.[0-9a-z]+$/i);
    const ext = extMatch ? extMatch[0] : '.pdf';
    if (!resumeUrl.endsWith(ext)) {
      resumeUrl += ext;
    }

    const resumeData = {
      url: resumeUrl,
      filename: originalFilename
    };

    const updatedUser = await updateUserService(user._id, { resume: resumeData });

    return res.status(200).json({
      message: 'Resume updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error("Error in uploadUserResume:", error);
    return res.status(500).json({
      message: 'Something went wrong while uploading resume',
      error: error.message || error.toString(),
      stack: error.stack
    });
  }
}
