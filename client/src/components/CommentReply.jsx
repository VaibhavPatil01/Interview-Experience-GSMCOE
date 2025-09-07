import { useInfiniteQuery } from '@tanstack/react-query';
import { getCommentRepliesPaginated } from '../services/commentsServices.js';
import NestedCommentCard from './NestedCommentCard';

function CommentReply({ postId, commentId }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['replies', postId, commentId],
    getNextPageParam: (prevData) => prevData.page.nextPage,
    queryFn: ({ pageParam = 1 }) => getCommentRepliesPaginated(postId, commentId, pageParam, 2)
  });

  let scrollFooterElement = <p>— Nothing More to Load —</p>;
  if (isFetchingNextPage || isLoading) {
    scrollFooterElement = <p>Loading...</p>;
  } else if (hasNextPage) {
    scrollFooterElement = (
      <button
        type="button"
        className="cursor-pointer text-base text-primary font-medium text-center self-end px-5 py-1.2"
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        Load More
      </button>
    );
  }

  const isEmpty = data?.pages[0].data.length === 0;
  return (
    <div className="pt-2.5">
      {isEmpty ? <p className="ml-1.75 mb-4 p-2">No Reply yet</p> : null}
      {!isEmpty ? (
        <>
          <ul>
            {data?.pages
              .flatMap((page) => page.data)
              .map((commentReply) => (
                <NestedCommentCard
                  postId={postId}
                  commentId={commentId}
                  commentReply={commentReply}
                />
              ))}
          </ul>

          <div className="text-center">{scrollFooterElement}</div>
        </>
      ) : null}
    </div>
  );
}

export default CommentReply;
