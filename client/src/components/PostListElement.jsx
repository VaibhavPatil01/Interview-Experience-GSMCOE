import { Link } from 'react-router-dom';
import generateSlug from '../utils/generateSlug.js';
import getFormattedDate from '../utils/getFormatedDate.js';
import DeleteButton from './DeleteButton';
import LoginRequiredLink from './LoginRequiredLink';
import PostBookmarkButton from './PostBookmarkButton';
import PostUpVoteButton from './PostUpVoteButton';
import PostDownVoteButton from './PostDownVoteButton';
import ShareButton from './ShareButton';

function PostListElement({ post, openModal, openDeleteModal }) {
  return (
    <div className="mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md hover:-translate-y-2 hover:shadow-lg transition-transform duration-200">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-2 py-1 rounded-lg bg-primary/10 text-primary">
            {post.postType}
          </span>
          <PostBookmarkButton postId={post._id} isBookmarked={post.isBookmarked} />
        </div>
        <h3 className="mt-2 text-xl font-medium">
          <LoginRequiredLink
            textContent={post.title}
            to={`/post/${post._id}/${generateSlug(post.title)}`}
            className="text-gray-800 hover:underline hover:decoration-2"
            openModal={openModal}
          />
        </h3>
        <p className="text-sm text-gray-600 pt-2.5 mb-4">{post.summary}</p>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex flex-col items-center gap-0 rounded-lg">
            <PostUpVoteButton
              postId={post._id}
              isUpVoted={post.isUpVoted}
              isDownVoted={post.isDownVoted}
            />
            <span className="text-base text-center px-2">{post.votes}</span>
            <PostDownVoteButton
              postId={post._id}
              isUpVoted={post.isUpVoted}
              isDownVoted={post.isDownVoted}
            />
          </div>
          <div className="flex-1 text-sm">
            {post.userId ? (
              <Link
                to={`/profile/${post.userId._id}`}
                className="font-medium text-gray-800 hover:underline"
              >
                {post.userId.username}
              </Link>
            ) : (
              <p className="font-medium text-gray-800">User Deleted</p>
            )}
            <span className="block text-gray-400 ml-2 font-light">
              {getFormattedDate(post.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <LoginRequiredLink
            textContent="Read"
            to={`/post/${post._id}/${generateSlug(post.title)}`}
            className="w-full md:w-auto min-w-[128px] px-8 py-1.5 text-center rounded-lg border border-primary bg-primary text-white hover:bg-primary/95"
            openModal={openModal}
          />
          <ShareButton
            title={post.title}
            author={post.userId?.username || 'User Deleted'}
            postId={post._id}
          />
          <DeleteButton
            postId={post._id}
            authorId={post.userId?._id || 'User Deleted'}
            postTitle={post.title}
            openDeleteModal={openDeleteModal}
          />
        </div>
      </div>
    </div>
  );
}

export default PostListElement;
