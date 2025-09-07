import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUser } from '../services/userServices.js';
import { Helmet } from 'react-helmet';
import userListImage from '../assets/images/pages/user-list.png';

function UserSearch() {
  const [search, setSearch] = useState(''); 

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['users', search],
    getNextPageParam: (prevData) => prevData.page.nextPage,
    queryFn: ({ pageParam = 1, signal }) => searchUser(search, pageParam, 15, signal)
  });

  useEffect(() => {
    let fetching = false;

    const onScroll = async () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
        fetching = true;
        if (hasNextPage) {
          await fetchNextPage();
        }
        fetching = false;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchNextPage, hasNextPage]);

  function handleSearchInputChange(e) {
    setSearch(e.target.value);
  }

  const isEmpty = data?.pages[0]?.data.length === 0;

  return (
    <>
    <Helmet>
        <title>User List | Interview Experience</title>
        <meta
          name="description"
          content="Search seniors and alumni and connect with them on Interview Experience GSMCOE"
        />
        <meta name="twitter:card" content={userListImage} />
        <meta name="twitter:title" content="User List | Interview Experience" />
        <meta
          name="twitter:description"
          content="Search seniors and alumni and connect with them on Interview Experience GSMCOE"
        />
        <meta name="twitter:image" content={userListImage} />

        <meta property="og:title" content="User List | Interview Experience" />
        <meta
          property="og:description"
          content="Search seniors and alumni and connect with them on Interview Experience GSMCOE"
        />
        <meta property="og:image" content={userListImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/user/search`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
    <div className="min-h-screen bg-primary/10 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Search</h2>

        <div className="mb-6">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-3 pl-5 text-gray-700 placeholder-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Search users by name, branch, etc..."
            onChange={handleSearchInputChange}
          />
        </div>

        {isEmpty && !isLoading && (
          <div className="mb-8 pt-6 text-center text-gray-600">
            <p>-- No User found --</p>
          </div>
        )}

        {!isEmpty && !isLoading && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-md text-left bg-white shadow-md rounded-lg overflow-hidden ">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-4 pl-7">Username</th>
                    <th className="p-4 hidden md:table-cell">Designation</th>
                    <th className="p-4 hidden md:table-cell">Branch</th>
                    <th className="p-4 hidden md:table-cell">Passing Year</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pages
                    .flatMap((page) => page.data)
                    .map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-blue-50 transition duration-150 even:bg-gray-50"
                      >
                        <td className="p-4 pl-7">
                          <Link
                            to={`/profile/${user._id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {user.username}
                          </Link>
                        </td>
                        <td className="p-4 hidden md:table-cell">{user.designation}</td>
                        <td className="p-4 hidden md:table-cell">{user.branch}</td>
                        <td className="p-4 hidden md:table-cell">{user.passingYear}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-6 text-gray-600">
              {isFetchingNextPage || isLoading ? (
                <p>Loading more users...</p>
              ) : (
                <p>— Nothing More to Load —</p>
              )}
            </div>
          </>
        )}
      </div>
    </div></>
  );
}

export default UserSearch;
