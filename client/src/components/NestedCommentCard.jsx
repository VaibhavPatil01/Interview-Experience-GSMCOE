import { Link } from 'react-router-dom';
import getFormattedDate from '../utils/getFormatedDate.js';
import DeleteCommentReplyButton from './DeleteCommentReplyButton';

function NestedCommentCard({ postId, commentId, commentReply }) {
  return (
    <div className="bg-gray-100 ml-1.75 mb-4 p-2">
      <div className="flex justify-between items-center pr-2.5">
        {commentReply.userId ? (
          <Link
            to={`/profile/${commentReply.userId._id}`}
            className="text-sm font-extralight text-gray-800 hover:underline"
          >
            {commentReply.userId.username}
          </Link>
        ) : (
          <p className="text-xs font-extralight text-gray-800">User Deleted</p>
        )}
        <p className="text-sm font-extralight text-gray-800">
          {getFormattedDate(commentReply.createdAt)}
        </p>
      </div>

      <p className="text-sm text-gray-800">{commentReply.content}</p>
      <DeleteCommentReplyButton
        postId={postId}
        commentId={commentId}
        replyId={commentReply._id}
        authorId={commentReply.userId?._id}
      />
    </div>
  );
}

export default NestedCommentCard;
