import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { BiDownArrow } from 'react-icons/bi';
import { downVotePost } from '../services/postServices.js';

function PostDownVoteButton({ postId, isUpVoted, isDownVoted }) {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => downVotePost(data.postId),
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
    onSuccess: () => {
      const postData = queryClient.getQueryData(['post', postId]);
      if (postData) {
        let updatedVoteCount = postData.voteCount;

        if (!isUpVoted && !isDownVoted) {
          updatedVoteCount -= 1;
        } else if (isUpVoted) {
          updatedVoteCount -= 2;
        } else if (isDownVoted) {
          updatedVoteCount += 1;
        }

        queryClient.setQueryData(['post', postId], {
          ...postData,
          isDownVoted: !isDownVoted,
          isUpVoted: false,
          voteCount: updatedVoteCount
        });
      }

      queryClient.refetchQueries(['posts']);
      queryClient.refetchQueries(['user-post']);
      queryClient.refetchQueries(['bookmarked-post']);
    }
  });

  const handleDownVote = () => {
    if (!postId || isLoading) {
      return;
    }
    mutate({ postId });
  };

  return (
    <BiDownArrow
      className={`cursor-pointer text-2xl text-gray-600 ${isDownVoted ? 'text-accent' : ''}`}
      onClick={handleDownVote}
    />
  );
}

export default PostDownVoteButton;
