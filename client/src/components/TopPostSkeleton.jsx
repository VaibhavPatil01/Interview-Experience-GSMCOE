import getFormattedDate from '../utils/getFormatedDate.js';
import LoginRequiredLink from './LoginRequiredLink.jsx';
import { dummyUsers } from '../assets/assets.js';
import generateSlug from '../utils/generateSlug.js';
import { Link } from 'react-router-dom';

const TopPostSkeleton = ({ post, openModal }) => {
  console.log(post.createdAt);

  return (
    <div className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-2">
        <span className="px-5 py-2 rounded-lg bg-primary/10 text-xs font-medium text-primary uppercase w-fit">
          {post.postType}
        </span>

        <LoginRequiredLink
          to={`/post/${post._id}/${generateSlug(post.title)}`}
          textContent={post.title}
          className="text-xl font-semibold text-gray-800 hover:text-primary transition hover:underline"
          openModal={openModal}
        />

        {post.summary && <p className="text-md text-gray-600 mt-1 line-clamp-3">{post.summary}</p>}

        {post.userId ? (
          <Link
            to={`/profile/${post.userId._id}`}
            className="font-medium text-gray-600 hover:underline"
          >
            {post.userId.username}
          </Link>
        ) : (
          <p className="font-medium text-gray-600">User Deleted</p>
        )}

        <div className="flex justify-start gap-5 items-center text-sm text-gray-500 ">
          <span>{getFormattedDate(post.createdAt)}</span>
          <span>{post.views} Views</span>
          <span>{post.votes} Likes</span>
        </div>
      </div>
    </div>
  );
};

export default TopPostSkeleton;
