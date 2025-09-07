import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostListElement from './PostListElement';
import PostSkeleton from './PostSkeleton';
import LoginRequiredModal from '../components/LoginRequiredModal.jsx';
import { useAppSelector } from '../redux/store.js';
import DeletePostModal from './DeletePostModal.jsx';
import { useDeletePost } from '../hooks/useDeletePost';
import { getBookmarkedPostsPaginated } from '../services/postServices.js';

function BookmarkedPost() {
  const { id } = useParams();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const navigate = useNavigate();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['bookmarked-post', id],
    getNextPageParam: (prevData) => prevData.page.nextPage,
    queryFn: ({ pageParam = 1 }) => getBookmarkedPostsPaginated(id, pageParam, 5)
  });

  let scrollFooterElement = <p>— Nothing More to Load —</p>;
  if (isFetchingNextPage || isLoading) {
    const skeletonPost = [];
    for (let i = 0; i < 5; i += 1) {
      skeletonPost.push(i);
    }
    scrollFooterElement = (
      <div>
        {skeletonPost.map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  useEffect(() => {
    let fetching = false;
    const onScroll = async (event) => {
      if (!event.target) {
        return;
      }
      const target = event.target;
      const scrollElement = target.scrollingElement;
      if (!scrollElement) {
        return;
      }
      const { scrollHeight, scrollTop, clientHeight } = scrollElement;
      const scrollHeightRemaining = scrollHeight - scrollTop;

      if (!fetching && scrollHeightRemaining <= clientHeight * 1.5) {
        fetching = true;
        if (hasNextPage) {
          await fetchNextPage();
        }
        fetching = false;
      }
    };
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [fetchNextPage, hasNextPage]);

  const isEmpty = data?.pages[0].data.length === 0;
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openLoginModal = (url) => {
    setRedirectUrl(url);
    setIsLoginModalOpen(true);
  };

  const {
    isDeleteModalOpen,
    deleteDetails,
    openDeleteModal,
    closeDeleteModal,
    mutate,
    isLoading: isDeleting
  } = useDeletePost(['bookmarked-post', id]);

  return (
    <>
      {isLoginModalOpen && (
        <LoginRequiredModal redirectUrl={redirectUrl} closeModalCallback={closeLoginModal} />
      )}
      {isDeleteModalOpen && (
        <DeletePostModal
          postDetails={deleteDetails}
          onClose={closeDeleteModal}
          mutate={mutate}
          isLoading={isDeleting}
        />
      )}
      <div className="container mx-auto py-4">
        {isEmpty ? <p className="text-center">No Bookmarked Post</p> : null}
        {!isEmpty ? (
          <>
            {data?.pages
              .flatMap((page) => page.data)
              .map((post) => (
                <PostListElement
                  key={post._id}
                  post={post}
                  openModal={openLoginModal}
                  openDeleteModal={openDeleteModal}
                />
              ))}
            <div className="text-center mb-8">{scrollFooterElement}</div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default BookmarkedPost;
