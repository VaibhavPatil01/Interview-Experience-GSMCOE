import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { postTypes } from '../../assets/assets.js';
import PostListElement from '../../components/posts/PostListElement';
import PostSkeleton from '../../components/posts/PostSkeleton';
import PostFilters from '../../components/posts/PostFilters';
import { TopCompaniesWidget } from '../../components/common/SidebarWidgets';
import { Sparkles, Info } from 'lucide-react';
import { getCompanyAndRoleList, getPostsPaginated, getBookmarkedPostsPaginated, getRecommendedFeedPaginated } from '../../services/postServices.js';
import LoginRequiredModal from '../../components/users/LoginRequiredModal.jsx';
import { useAppSelector } from '../../redux/store.js';
import DeletePostModal from '../../components/posts/DeletePostModal.jsx';
import { useDeletePost } from '../../hooks/useDeletePost';
import { Helmet } from 'react-helmet';
import { assets } from '../../assets/assets';

function PostList() { 
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user ? 'For You' : 'Recent');

  const filter = {
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || '',
    articleType: searchParams.get('articleType') || '',
    jobRole: searchParams.get('jobRole') || '',
    company: searchParams.get('company') || '',
    rating: searchParams.get('rating') || '',
    datePosted: searchParams.get('datePosted') || 'Anytime'
  };

  const companyAndRoleQuery = useQuery({
    queryKey: ['company-role-list'],
    queryFn: () => getCompanyAndRoleList()
  });

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', filter, activeTab],
    getNextPageParam: (prevData) => prevData.page?.nextPage,
    queryFn: ({ pageParam = 1, signal }) => {
      if (activeTab === 'For You') {
        if (!user) return Promise.resolve({ data: [], page: {} });
        return getRecommendedFeedPaginated(pageParam, 10);
      }
      if (activeTab === 'Bookmarks') {
        if (!user) return Promise.resolve({ data: [], page: {} }); 
        return getBookmarkedPostsPaginated(user.userId, pageParam, 10);
      }
      
      const currentFilter = { ...filter };
      if (activeTab === 'Recent') {
        currentFilter.sortBy = 'new';
      } else if (activeTab === 'Most Upvoted') {
        currentFilter.sortBy = 'top';
      } else if (activeTab === 'Trending') {
        currentFilter.sortBy = 'views';
      }

      return getPostsPaginated(pageParam, 10, currentFilter, signal);
    }
  });

  let scrollFooterElement = <p className="text-lg">— Nothing More to Load —</p>;
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
  } = useDeletePost(['posts', filter]);

  return (
    <>
    <Helmet>
        <title>Posts | Experio</title>
        <meta
          name="description"
          content="Search and filter posts about interview experience, discussion, doubts and many more on Experio"
        />
        <meta name="twitter:card" content={assets.postListPageImage} />
        <meta name="twitter:title" content="Posts | Experio" />
        <meta
          name="twitter:description"
          content="Search and filter posts about interview experience, discussion, doubts and many more on Experio"
        />
        <meta name="twitter:image" content={assets.postListPageImage} />

        <meta property="og:title" content="Posts | Experio" />
        <meta
          property="og:description"
          content="Search and filter posts about interview experience, discussion, doubts and many more on Experio"
        />
        <meta property="og:image" content={assets.postListPageImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/posts`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      {isLoginModalOpen && (
        <LoginRequiredModal redirectUrl={window.location.pathname} closeModalCallback={closeLoginModal} />
      )}
      {isDeleteModalOpen && (
        <DeletePostModal
          postDetails={deleteDetails}
          onClose={closeDeleteModal}
          mutate={mutate}
          isLoading={isDeleting}
        />
      )}
      <div className="min-h-screen py-8">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] xl:grid-cols-[260px_1fr_320px] gap-6">
            
            {/* Left Sidebar (Filters) */}
            <div className="hidden lg:block">
              <PostFilters 
                filter={filter} 
                setSearchParams={setSearchParams} 
                companyAndRoleQuery={companyAndRoleQuery} 
              />
            </div>

            {/* Middle Column (Main Content) */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Interview Experiences
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Personalized for you based on your profile, skills and interests
                </p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['For You', 'Bookmarks', 'Recent', 'Most Upvoted', 'Trending'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => {
                      if ((tab === 'Bookmarks' || tab === 'For You') && !user) {
                        openLoginModal(window.location.pathname);
                        return;
                      }
                      setActiveTab(tab);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-primary text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'For You' && <Sparkles className={`inline w-3.5 h-3.5 mr-1.5 ${activeTab === 'For You' ? 'text-white' : 'text-primary'}`} />}
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
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
              </div>
              <div className="text-center mt-6">{scrollFooterElement}</div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <TopCompaniesWidget />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default PostList;
