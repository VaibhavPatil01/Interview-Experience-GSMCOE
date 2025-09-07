import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createReplyComment } from '../services/commentsServices.js';

function ReplyInput({ postId, commentId }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => createReplyComment(data.postId, data.commentId, data.content),
    onError: (error) => {
      toast.error(error.response.data.message);
    },
    onSuccess: () => {
      setContent('');
      toast.success('Comment Created');
      queryClient.refetchQueries(['replies', postId, commentId]);
    }
  });

  return (
    <form className="relative flex flex-col gap-4 mb-12 mt-5">
      <textarea
        placeholder="Add a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-20 border-none shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-lg p-1.75 resize-none"
      />

      <button
        type="button"
        disabled={isLoading}
        onClick={() => mutate({ postId, commentId, content })}
        className="absolute right-0 bottom-[-2.5rem] cursor-pointer text-base text-white bg-primary border border-primary rounded-lg font-medium text-center self-end px-4 py-1"
      >
        Reply
      </button>
    </form>
  );
}

export default ReplyInput;
