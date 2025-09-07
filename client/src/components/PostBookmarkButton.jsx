import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { toggleBookmark } from '../services/postServices.js';

function PostBookmarkButton({ postId, isBookmarked }) {
  const [isBookmarkedPost, setIsBookmarkedPost] = useState(isBookmarked);
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => toggleBookmark(data.postId, data.isBookmarkedPost),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    },
    onSuccess: () => {
      setIsBookmarkedPost((prev) => !prev);

      const postData = queryClient.getQueryData(['post', postId]);
      if (postData) {
        queryClient.setQueryData(['post', postId], {
          ...postData,
          isBookmarked: !postData.isBookmarked
        });
      }

      queryClient.refetchQueries(['posts']);
      queryClient.refetchQueries(['user-post']);
      queryClient.refetchQueries(['bookmarked-post']);
    }
  });

  return isBookmarkedPost ? (
    <BsBookmarkFill
      className={`
        cursor-pointer text-2xl
        text-primary
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
      onClick={() => mutate({ postId, isBookmarkedPost })}
    />
  ) : (
    <BsBookmark
      className={`
        cursor-pointer text-2xl
        text-gray-500 hover:text-primary
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
      onClick={() => mutate({ postId, isBookmarkedPost })}
    />
  );
}

export default PostBookmarkButton;
