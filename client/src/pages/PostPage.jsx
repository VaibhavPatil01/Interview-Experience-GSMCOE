import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DeleteButton from '../components/DeleteButton';
import DisplayQuill from '../components/DisplayQuill';
import PostBookmarkButton from '../components/PostBookmarkButton';
import PostComments from '../components/PostComments';
import RelatedPosts from '../components/RelatedPosts';
import ShareButton from '../components/ShareButton';
import { useAppSelector } from '../redux/store.js';
import { getPost } from '../services/postServices.js';
import Loading from './Loading.jsx';
import DeletePostModal from '../components/DeletePostModal.jsx';
import { useDeletePost } from '../hooks/useDeletePost.js';
import { Helmet } from 'react-helmet';
import postImage from '../assets/images/pages/home-page.png';
import generateTextFromHTML from '../utils/generateTextFromHTML.js';
import generateSlug from '../utils/generateSlug.js';

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.userState.user);

  const {
    isDeleteModalOpen,
    deleteDetails,
    openDeleteModal,
    closeDeleteModal,
    mutate,
    isLoading: isDeleting
  } = useDeletePost(['post', id]);

  const postQuery = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    staleTime: 30 * 60 * 1000
  });

  if (postQuery.isLoading) {
    return <Loading />;
  }
  if (postQuery.isError) {
    return <h3>Error occurred</h3>;
  }

  const authorId = postQuery.data?.postAuthorId;
  const isEditable = user?.userId === authorId || user?.isAdmin;

  if (!id) {
    navigate('/');
    return <h1>Post Id not found!!</h1>;
  }

  if (!postQuery.data) {
    return <h3>No data available</h3>;
  }

  return (
    <>
      <Helmet>
        <title>{`${postQuery.data.title} | Interview Experience`}</title>
        <meta
          name="description"
          content={`${postQuery.data.postType} titled "${
            postQuery.data.title
          }" specially for GSMCOE on Interview Experience. ${generateTextFromHTML(
            postQuery.data.content
          )}`}
        />
        <meta name="twitter:card" content={postImage} />
        <meta name="twitter:title" content={`${postQuery.data.title} | Interview Experience`} />
        <meta
          name="twitter:description"
          content={`${postQuery.data.postType} titled "${
            postQuery.data.title
          }" specially for GSMCOE on Interview Experience. ${generateTextFromHTML(
            postQuery.data.content
          )}`}
        />
        <meta name="twitter:image" content={postImage} />

        <meta property="og:title" content={`${postQuery.data.title} | Interview Experience`} />
        <meta
          property="og:description"
          content={`${postQuery.data.postType} titled "${
            postQuery.data.title
          }" specially for GSMCOE on Interview Experience. ${generateTextFromHTML(
            postQuery.data.content
          )}`}
        />
        <meta property="og:image" content={postImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/post/${id}/${generateSlug(postQuery.data.title)}`}
        />
        <meta property="og:type" content="article" />
      </Helmet>
      {isDeleteModalOpen && (
        <DeletePostModal
          postDetails={deleteDetails}
          onClose={closeDeleteModal}
          mutate={mutate}
          isLoading={isDeleting}
        />
      )}
      <div className="pt-5 pb-12 bg-primary/10 min-h-screen px-3">
        <div className="container mx-auto">
          <div className="lg:flex lg:gap-8">
            <div className="w-full lg:w-[75%] shadow-md rounded-lg p-5 bg-white mb-8 lg:mb-0">
              <div className="flex justify-between gap-3">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
                  {postQuery.data?.title}
                </h1>
                <PostBookmarkButton postId={id || ''} isBookmarked={postQuery.data?.isBookmarked} />
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-8 pb-3 w-full text-gray-500 text-md">
                  <div>{postQuery.data?.postAuthor || 'Unknown Author'}</div>
                  <div>{postQuery.data?.voteCount || 0}</div>
                </div>
                <DisplayQuill content={postQuery.data?.content} />
                <div className="px-3 sm:px-0 flex flex-col gap-2 sm:gap-1 sm:flex-row">
                  <ShareButton
                    postId={id || ''}
                    author={postQuery.data?.postAuthor}
                    title={postQuery.data?.title}
                  />
                  {isEditable && (
                    <Link
                      to={`/post/edit/${id}`}
                      className="w-full mt-3.2 md:w-auto md:mr-4 text-center px-8 py-1.5 rounded-lg border border-primary text-primary bg-white hover:bg-purple-50"
                    >
                      Edit Post
                    </Link>
                  )}
                  {isEditable && (
                    <DeleteButton
                      postId={id || ''}
                      authorId={postQuery.data?.postAuthorId}
                      postTitle={postQuery.data?.title}
                      openDeleteModal={openDeleteModal}
                    />
                  )}
                </div>
                <div className="flex items-center gap-8 mt-5 mb-5 w-full text-gray-500 text-md">
                  <div>{`Comments ${postQuery.data?.commentCount || 0}`}</div>
                </div>
                <PostComments postId={id || ''} />
              </div>
            </div>
            <div className="hidden lg:w-[25%] lg:flex lg:flex-col lg:gap-8 lg:sticky lg:top-23 lg:h-fit">
              <div className="shadow-md rounded-lg p-5 bg-white mb-8 lg:mb-0">
                <ul>
                  <li>
                    <div className="flex justify-between gap-8">
                      Comments <span>{postQuery.data?.commentCount || 0}</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between gap-8">
                      Bookmarks <span>{postQuery.data?.bookmarkCount || 0}</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between gap-8">
                      Views <span>{postQuery.data?.views || 0}</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="shadow-md rounded-lg p-5 bg-white sticky">
                <p className="text-xl mb-2">Related Posts</p>
                <RelatedPosts postId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostPage;
