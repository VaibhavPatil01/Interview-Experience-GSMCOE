import { useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { BiPencil } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import getFormattedDate from '../utils/getFormatedDate.js';
import CommentReply from './CommentReply';
import ReplyInput from './ReplyInput';
import DeleteCommentButton from './DeleteCommentButton';

function CommentCard({ postId, comment }) {
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);

  const toggleComment = () => {
    setIsCommentExpanded(!isCommentExpanded);
  };

  const [isReplyCommentBoxExpanded, setIsReplyCommentBoxExpanded] = useState(false);

  const toggleReplyComment = () => {
    setIsReplyCommentBoxExpanded(!isReplyCommentBoxExpanded);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center pr-2.5">
        {comment.userId ? (
          <Link
            to={`/profile/${comment.userId._id}`}
            className="text-base font-medium text-gray-800 hover:underline"
          >
            {comment.userId.username}
          </Link>
        ) : (
          <p className="text-base font-medium text-gray-800">User Deleted</p>
        )}
        <p className="text-gray-500 text-sm">{getFormattedDate(comment.createdAt)}</p>
      </div>
      <div className="text-md">{comment.content}</div>
      <div className="pt-2.5 pb-2.5">
        <div className="flex items-center overflow-hidden text-xs gap-4">
          <div className="flex items-center text-sm">
            <BiPencil onClick={toggleReplyComment} className="cursor-pointer" />
            <button
              type="button"
              onClick={toggleReplyComment}
              className="ml-2 bg-white border-none cursor-pointer"
            >
              reply
            </button>
          </div>
          <div className="flex items-center text-sm">
            {isCommentExpanded ? (
              <FaAngleUp onClick={toggleComment} className="cursor-pointer" />
            ) : (
              <FaAngleDown onClick={toggleComment} className="cursor-pointer" />
            )}
            <button
              type="button"
              onClick={toggleComment}
              className="ml-2 bg-white border-none cursor-pointer"
            >
              view replies
            </button>
          </div>
          <DeleteCommentButton
            postId={postId}
            commentId={comment._id}
            authorId={comment.userId?._id || 'User Deleted'}
          />
        </div>
        {isReplyCommentBoxExpanded ? <ReplyInput postId={postId} commentId={comment._id} /> : null}
        {isCommentExpanded ? <CommentReply postId={postId} commentId={comment._id} /> : null}
      </div>
    </div>
  );
}

export default CommentCard;
