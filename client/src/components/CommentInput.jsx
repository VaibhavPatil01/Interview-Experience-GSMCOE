import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createComment } from '../services/commentsServices.js';

function CommentInput({ postId }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => createComment(data.postId, data.content),
    onError: (error) => {
      toast.error(error.response.data.message);
    },
    onSuccess: () => {
      setContent('');
      toast.success('Comment Created');
      queryClient.refetchQueries(['comments']);
    }
  });

  return (
    <form className="relative flex flex-col gap-4 mb-16   ">
      <textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-20  shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-lg  p-1.75  resize-none focus:outline-none"
      />

      <button
        type="button"
        disabled={isLoading}
        onClick={() => mutate({ postId, content })}
        className="absolute right-0 bottom-[-2.5rem] cursor-pointer text-base text-white bg-primary font-medium border border-primary rounded-lg text-center self-end px-4 py-1"
      >
        Comment
      </button>
    </form>
  );
}

export default CommentInput;
