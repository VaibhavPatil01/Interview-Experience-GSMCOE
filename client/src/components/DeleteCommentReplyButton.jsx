import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../redux/store.js';
import { deleteCommentReply } from '../services/commentsServices.js';

function DeleteCommentReplyButton({ postId, commentId, replyId, authorId }) {
  const queryClient = useQueryClient();

  const user = useAppSelector((state) => state.userState.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: () => deleteCommentReply(postId, commentId, replyId),
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
    onSuccess: () => {
      queryClient.refetchQueries(['replies', postId, commentId]);
      toast.success('Reply Deleted Successfully');
    }
  });

  if (!user?.isAdmin && user?.userId !== authorId) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="text-red-600 bg-[#f8f9fe] mx-auto md:w-auto md:mr-4 disabled:text-gray-400 cursor-pointer disabled:border-gray-400 text-lg mt-1"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        <MdDeleteOutline />
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-8">
            <h2 className="text-2xl font-semibold">Confirm Comment Delete</h2>
            <p className="mt-2 text-gray-700 text-lg">
              Are you sure you want to delete this comment
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                type="button"
                className="mt-4 text-lg mr-4 py-2 px-8 rounded-lg bg-primary text-white cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="mt-4 py-2 text-lg px-8 rounded-lg border border-primary text-primary disabled:bg-gray-400 disabled:text-gray-600 cursor-pointer"
                onClick={() => mutate()}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DeleteCommentReplyButton;
