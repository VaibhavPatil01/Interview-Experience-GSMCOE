import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { postTypes } from '../assets/assets.js';
import PostListElement from '../components/PostListElement';
import PostSkeleton from '../components/PostSkeleton';
import { getCompanyAndRoleList, getPostsPaginated } from '../services/postServices.js';
import LoginRequiredModal from '../components/LoginRequiredModal.jsx';
import { useAppSelector } from '../redux/store.js';
import DeletePostModal from '../components/DeletePostModal.jsx';
import { useDeletePost } from '../hooks/useDeletePost';
import { Helmet } from 'react-helmet';
import postListPageImage from '../assets/images/pages/post-list.png';

function PostList() { 
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const navigate = useNavigate();

  const filter = {
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || '',
    articleType: searchParams.get('articleType') || '',
    jobRole: searchParams.get('jobRole') || '',
    company: searchParams.get('company') || '',
    rating: searchParams.get('rating') || ''
  };

  const companyAndRoleQuery = useQuery({
    queryKey: ['company-role-list'],
    queryFn: () => getCompanyAndRoleList()
  });

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', filter],
    getNextPageParam: (prevData) => prevData.page?.nextPage,
    queryFn: ({ pageParam = 1, signal }) => getPostsPaginated(pageParam, 10, filter, signal)
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
        <title>Posts | Interview Experience</title>
        <meta
          name="description"
          content="Search and filter posts about interview experience, discussion, doubts and many more about GSMCOE"
        />
        <meta name="twitter:card" content={postListPageImage} />
        <meta name="twitter:title" content="Posts | Interview Experience" />
        <meta
          name="twitter:description"
          content="Search and filter posts about interview experience, discussion, doubts and many more about GSMCOE"
        />
        <meta name="twitter:image" content={postListPageImage} />

        <meta property="og:title" content="Posts | Interview Experience" />
        <meta
          property="og:description"
          content="Search and filter posts about interview experience, discussion, doubts and many more about GSMCOE"
        />
        <meta property="og:image" content={postListPageImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/posts`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
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
      <div className="min-h-screen scroll-mt-12 px-5 py-8 bg-primary/10">
        <section className="posts">
          <div className="container mx-auto">
            <h2 className="text-xl mb-2">
              <span>Recent Experiences</span>
            </h2>
            <div className="filter">
              <div className="searchBar mb-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filter.search}
                  onChange={(e) =>
                    setSearchParams({
                      ...Object.fromEntries(
                        Object.entries(filter).filter(
                          ([key, value]) => key && value && value.length > 0
                        )
                      ),
                      search: e.target.value
                    })
                  }
                  className="w-full outline-none text-base text-gray-600 border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6 md:grid-cols-5 md:max-w-2xl md:mb-8">
                <div className="filterInput">
                  <label htmlFor="domain">
                    <select
                      name="domain"
                      className="cursor-pointer w-full outline-none text-base text-gray-600 border border-gray-300 bg-white rounded-md p-2"
                      value={filter.sortBy}
                      onChange={(e) =>
                        setSearchParams({
                          ...Object.fromEntries(
                            Object.entries(filter).filter(
                              ([key, value]) => key && value && value.length > 0
                            )
                          ),
                          sortBy: e.target.value
                        })
                      }
                    >
                      <option value="">Sort By</option>
                      <option value="new">Newest</option>
                      <option value="old">Oldest</option>
                      <option value="views">Most Viewed</option>
                    </select>
                  </label>
                </div>
                <div className="filterInput">
                  <label htmlFor="type">
                    <select
                      name="type"
                      className="cursor-pointer w-full outline-none text-base text-gray-600 border border-gray-300 bg-white rounded-md p-2"
                      value={filter.articleType}
                      onChange={(e) =>
                        setSearchParams({
                          ...Object.fromEntries(
                            Object.entries(filter).filter(
                              ([key, value]) => key && value && value.length > 0
                            )
                          ),
                          articleType: e.target.value
                        })
                      }
                    >
                      <option value="">Post Type</option>
                      <option value="">All</option>
                      {postTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="filterInput">
                  <label htmlFor="role">
                    <select
                      name="role"
                      className="cursor-pointer w-full outline-none text-base text-gray-600 border border-gray-300 bg-white rounded-md p-2"
                      value={filter.jobRole}
                      onChange={(e) =>
                        setSearchParams({
                          ...Object.fromEntries(
                            Object.entries(filter).filter(
                              ([key, value]) => key && value && value.length > 0
                            )
                          ),
                          jobRole: e.target.value
                        })
                      }
                    >
                      <option value="">Job Role</option>
                      <option value="">All</option>
                      {companyAndRoleQuery.data?.data?.role.map((role) => (
                        <option value={role} key={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="filterInput">
                  <label htmlFor="company">
                    <select
                      name="company"
                      className="cursor-pointer w-full outline-none text-base text-gray-600 border border-gray-300 bg-white rounded-md p-2"
                      value={filter.company}
                      onChange={(e) =>
                        setSearchParams({
                          ...Object.fromEntries(
                            Object.entries(filter).filter(
                              ([key, value]) => key && value && value.length > 0
                            )
                          ),
                          company: e.target.value
                        })
                      }
                    >
                      <option value="">Company</option>
                      <option value="">All</option>
                      {companyAndRoleQuery.data?.data?.company.map((company) => (
                        <option value={company} key={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="filterInput">
                  <label htmlFor="rating">
                    <select
                      name="rating"
                      className="cursor-pointer w-full outline-none text-base text-gray-600 border border-gray-300 bg-white rounded-md p-2"
                      value={filter.rating}
                      onChange={(e) =>
                        setSearchParams({
                          ...Object.fromEntries(
                            Object.entries(filter).filter(
                              ([key, value]) => key && value && value.length > 0
                            )
                          ),
                          rating: e.target.value
                        })
                      }
                    >
                      <option value="">Rating</option>
                      <option value="">Any</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Star</option>
                      <option value="3">3 Star</option>
                      <option value="4">4 Star</option>
                      <option value="5">5 Star</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="postList">
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
            <div className="text-center">{scrollFooterElement}</div>
          </div>
        </section>
      </div>
    </>
  );
}

export default PostList;
