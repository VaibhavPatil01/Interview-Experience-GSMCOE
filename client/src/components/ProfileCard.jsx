import React from 'react';
import { FaGithubSquare } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { Link, useParams } from 'react-router-dom';
import { dummyUsers as users, posts } from '../assets/assets';

const ProfileCard = () => {
  const { id } = useParams();
  const profileData = users.find((user) => user._id === id);
  const userPosts = posts.filter((post) => post.userId === id);

  const postCount = userPosts.length;
  const viewCount = userPosts.reduce((sum, post) => sum + post.views, 0);
  const likes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);

  if (!profileData) {
    return null;
  }

  return (
    <div className="text-center bg-red-600 ">
      <h2 className="text-xl font-bold text-primary mb-1 py-4">{profileData.username}</h2>
      <p className="text-gray-600 text-sm mb-1">{profileData.designation || 'N/A'}</p>
      <p className="text-gray-500 text-sm mb-3">
        {profileData.branch || 'N/A'} <span className="mx-1">-</span>{' '}
        {profileData.passingYear || 'N/A'}
      </p>
      <div className="flex justify-around mb-3 text-gray-700 text-sm">
        <div>
          <span className="block font-semibold">{postCount}</span>Posts
        </div>
        <div>
          <span className="block font-semibold">{viewCount}</span>Views
        </div>
        <div>
          <span className="block font-semibold">{likes}</span>Likes
        </div>
      </div>
      <p className="text-gray-600 text-sm text-left mb-3">
        {profileData.about || 'No description available.'}
      </p>
      <div className="flex justify-center gap-3 text-2xl mb-3">
        {profileData.linkedin && (
          <a
            href={profileData.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-800"
          >
            <FaLinkedin />
          </a>
        )}
        {profileData.github && (
          <a
            href={profileData.github}
            target="_blank"
            rel="noreferrer"
            className="text-gray-900 hover:text-gray-700"
          >
            <FaGithubSquare />
          </a>
        )}
        {/* {profileData.leetcode && (
          <a href={profileData.leetcode} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-600">
            <SiLeetcode />
          </a>
        )} */}
      </div>

      {/* Only show for the logged in user */}
      <Link
        to="/profile/edit"
        className="inline-block bg-primary text-white py-1 px-4 rounded-full text-sm font-semibold hover:bg-primary-dull transition-all"
      >
        Edit Profile
      </Link>
    </div>
  );
};

export default ProfileCard;
