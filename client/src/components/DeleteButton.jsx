import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../redux/store.js';
import { deletePost } from '../services/postServices.js';
import PropTypes from 'prop-types';

function DeleteButton({ postId, authorId, postTitle, openDeleteModal }) {
  const user = useAppSelector((state) => state.userState.user);

  if (!user?.isAdmin && user?.userId !== authorId) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={`Delete post titled ${postTitle}`}
      className="w-full mt-3.2 bg-white py-1.5 min-w-[128px] px-8 rounded-lg border border-red-600 text-red-600 md:w-auto md:mr-4 disabled:border-gray-400 disabled:text-gray-400 cursor-pointer"
      onClick={() => openDeleteModal({ postId, postTitle })}
      disabled={false} // Controlled by useDeletePost now
    >
      Delete
    </button>
  );
}

DeleteButton.propTypes = {
  postId: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  postTitle: PropTypes.string.isRequired,
  openDeleteModal: PropTypes.func.isRequired
};

export default DeleteButton;
