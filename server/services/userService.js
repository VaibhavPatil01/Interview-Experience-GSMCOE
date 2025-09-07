import mongoose from 'mongoose';
import UserModel from '../models/User.js'


export const findUser = (email) => {
  return UserModel.findOne({ email });
};

export const deleteUserService = (id) => { 
  return UserModel.deleteOne({ _id: id }); 
};

export const createUser = (user) => { 
  return UserModel.create(user);
};

export const verifyUserEmail = (email) => {
  return UserModel.findOneAndUpdate({ email }, { isEmailVerified: true });
};

export async function getUserProfileService(userId) {
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

export const editProfile = (
  userId,
  updatedProfile,
) => {
  return UserModel.findByIdAndUpdate(userId, updatedProfile);
};

export const resetPasswordService = (email, newPassword) => {
  return UserModel.findOneAndUpdate({ email }, { password: newPassword });
}; 

export const findUserById = (id) => {
  return UserModel.findOne({ _id: id });
};

export const searchUserService = (
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
      },
    },
  ]);
};