import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import sendEmailVerificationMail from '../services/mail/sendEmailVerificationMail.js';
import sendForgotPasswordEmail from '../services/mail/sendForgotPasswordMail.js';
import decodeToken from '../utils/token/decodeToken.js';
import generateAuthToken from '../utils/token/generateAuthToken.js';
import generateEmailVerificationToken from '../utils/token/generateEmailVerificationToken.js';
import generateForgotPasswordToken from '../utils/token/generateForgotPasswordToken.js';
import { findUser, deleteUserService, createUser, resetPasswordService, verifyUserEmail, editProfile, searchUserService, getUserProfileService } from '../services/userService.js';


export async function loginUser(req, res) { 
  const email = req.body.email;
  const password = req.body.password;

  // if email or password is undefined
  if (!email || !password) {
    return res.status(401).json({success: false, 
      message: 'Incorrect Username or Password',
    });
  }

  try {
    const user = await findUser(email);

    // if no such user found.
    if (!user) {
      return res
        .status(401)
        .json({success: false, message: 'Incorrect Username or Password' });
    }

    // compare the passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({success: false, message: 'Incorrect Username or Password' });
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
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.....' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export async function registerUser(req, res) {
  const {
    username,
    email,
    password,
    branch,
    passingYear,
    designation,
    about,
    github,
    linkedin,
  } = req.body;

  // checking if required fields are undefined
  if (
    !username ||
    !email ||
    !password ||
    !branch ||
    !passingYear ||
    !designation ||
    !about
  ) {
    return res
      .status(401)
      .json({success:false, message: 'Please enter all required fields ' });
  }

  try {
    // check if email is registered
    const oldUser = await findUser(email);

    if (oldUser && oldUser.isEmailVerified) {
      return res.status(404).json({success:false, message: 'Email already exists' });
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
      branch,
      passingYear,
      designation,
      about,
      github: github ? github : null,
      linkedin: linkedin ? linkedin : null,
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

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

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
      branch: user.branch,
      passingYear: user.passingYear,
      designation: user.designation,
      about: user.about,
      github: user.github,
      linkedin: user.linkedin,
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

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

export async function editUserProfile(req, res) {
  const {
    username,
    branch,
    passingYear,
    designation,
    about,
    github,
    linkedin,
  } = req.body;

  if (!username || !branch || !passingYear || !designation || !about) {
    return res.status(401).json({ message: 'Please enter all the fields ' });
  }

  const updatedProfile = {
    username,
    branch,
    passingYear,
    designation,
    about,
    github: github ? github : null,
    linkedin: linkedin ? linkedin : null,
  };

  const userId = req.body.authTokenData.id;
  try {
    const user = await editProfile(userId, updatedProfile);
    return res
      .status(200)
      .json({ message: 'User Profile Edited Successfully', data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong......' });
  }
}

// ----------------------------------------------------------------------------------------------------------- //

export function logoutUser(req, res) {
  return res.status(200).json({ message: 'User Logout successful' });
}

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

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

// ----------------------------------------------------------------------------------------------------------- //

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

    if (userList.length === 0) {
      return res.status(200).json({
        message: 'No posts to display',
        data: [],
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
      page: { nextPage, previousPage },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'something went wrong...' });
  }
}

