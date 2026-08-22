import mongoose from 'mongoose';
import UserModel from '../models/User.js'


// Finds a user in the database by their email address
export const findUserByEmail = (email) => {
  return UserModel.findOne({ email });
};

// Deletes a user document from the database using their ID
export const deleteUser = (id) => { 
  return UserModel.deleteOne({ _id: id }); 
};

// Updates a user document and returns the newly updated document
export const updateUser = (id, data) => {
  return UserModel.findByIdAndUpdate(id, data, { new: true });
};

// Creates a new user record in the database
export const createUser = (user) => { 
  return UserModel.create(user);
};

// Marks a user's email as verified in the database
export const verifyUserEmail = (email) => {
  return UserModel.findOneAndUpdate({ email }, { isEmailVerified: true });
};

// Performs an aggregation query to fetch user profile along with their post statistics
export async function getUserProfile(userId) {
  return await UserModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId), // make sure to convert userId if passed as string
      },
    },
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'userId',
        as: 'postData',
        pipeline: [
          {
            $addFields: {
              upVoteCount: { $size: '$upVotes' },
              downVoteCount: { $size: '$downVotes' },
            },
          },
          {
            $group: {
              _id: null,
              viewCount: { $sum: '$views' },
              postCount: { $sum: 1 },
              upVoteCount: { $sum: '$upVoteCount' },
              downVoteCount: { $sum: '$downVoteCount' },
            },
          },
        ],
      },
    },
    {
      $project: {
        password: 0,
        isAdmin: 0,
        isEmailVerified: 0,
        'postData._id': 0,
        _id: 0,
      },
    },
  ]);
}



// Updates the user's hashed password in the database
export const updatePassword = (email, newPassword) => {
  return UserModel.findOneAndUpdate({ email }, { password: newPassword });
}; 

// Finds a user in the database by their unique object ID
export const findUserById = (id) => {
  return UserModel.findOne({ _id: id });
};

// Searches for verified users by username using regex and pagination limits
export const searchUsers = (
  search,
  limit,
  skip,
) => {
  return UserModel.aggregate([ 
    {
      $match: {
        username: {
          $regex: new RegExp(search, 'i'),
        },
        isEmailVerified: true,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        username: 1,
        designation: 1,
        passingYear: 1,
        branch: 1,
        profilePicture: 1,
        createdAt: 1,
        email: 1,
        workExperiences: 1,
      },
    },
  ]);
};

// Counts the total number of verified users in the database
export const countUsers = () => {
  return UserModel.countDocuments({ isEmailVerified: true });
};