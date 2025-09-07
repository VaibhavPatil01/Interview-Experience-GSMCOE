import { FaGithubSquare } from 'react-icons/fa'; 
import { FaLinkedin } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProfileTab from '../components/ProfileTab';
import { useAppSelector } from '../redux/store.js';
import { getUserProfileStats } from '../services/userServices.js';
import { Helmet } from 'react-helmet';
import profilePageImage from '../assets/images/pages/profile-page.png';

const ProfilePage = () => {
  const { id } = useParams();

  // Get the data related to the profile
  const profileQuery = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getUserProfileStats(id)
  });
  const streakQuery = useQuery({ queryKey: ['streak', id], queryFn: () => getStreak(id) });

  // Used to check if the profile belongs to the user
  const user = useAppSelector((state) => state.userState.user);
  const isEditable = user && id === user?.userId;

  // TODO: Add good loading and error elements
  if (profileQuery.isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {' '}
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h1>Error</h1>
      </div>
    );
  }

  // Extracting query data
  const profileData = profileQuery.data;
  const profilePostStats = profileData.postData[0];
  const votes = profilePostStats.upVoteCount - profilePostStats.downVoteCount;

  return (
    <>
    <Helmet>
        <title>
          {`${profileData.username}'s Profile | Interview Experience`}
        </title>
        <meta
          name="description"
          content={`${profileData.username}'s Profile at Interview Experience. Check their posts and also view their bookmarked posts`}
        />
        <meta name="twitter:card" content={profilePageImage} />
        <meta
          name="twitter:title"
          content={`${profileData.username}'s Profile | Interview Experience`}
        />
        <meta
          name="twitter:description"
          content={`${profileData.username}'s Profile at Interview Experience. Check their posts and also view their bookmarked posts`}
        />
        <meta name="twitter:image" content={profilePageImage} />

        <meta
          property="og:title"
          content={`${profileData.username}'s Profile | Interview Experience`}
        />
        <meta
          property="og:description"
          content={`${profileData.username}'s Profile at Interview Experience. Check their posts and also view their bookmarked posts`}
        />
        <meta property="og:image" content={profilePageImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/profile/${id}`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
    <div className="pt-0 pb-4 lg:pt-0 lg:pb-0 bg-primary/10">
      <div className="lg:grid" style={{ gridTemplateColumns: '30% 70%' }}>
        <div className="max-w-[30rem] mx-auto relative  py-1 px-6 lg:sticky lg:top-20 h-fit">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-1 py-4">{profileData.username}</h2>
            <p className="text-gray-600 text-md mb-1">{profileData.designation || 'N/A'}</p>
            <p className="text-gray-500 text-md mb-6">
              {profileData.branch || 'N/A'} <span className="mx-1">-</span>{' '}
              {profileData.passingYear || 'N/A'}
            </p>
            <div className="flex justify-around mb-6 text-gray-700 text-lg">
              <div>
                <span className="block font-semibold">{profilePostStats.postCount}</span>Posts
              </div>
              <div>
                <span className="block font-semibold">{profilePostStats.viewCount}</span>Views
              </div>
              <div>
                <span className="block font-semibold">{votes}</span>Likes
              </div>
            </div>
            <p className="text-gray-600 text-md text-center mb-6">
              {profileData.about || 'No description available.'}
            </p>
            <div className="flex justify-center gap-6 text-3xl mb-6">
              {profileData?.linkedin && (
                <a
                  href={profileData?.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-primary/95"
                >
                  <FaLinkedin />
                </a>
              )}
              {profileData?.github && (
                <a
                  href={profileData?.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-primary/95"
                >
                  <FaGithubSquare />
                </a>
              )}
            </div>

            {/* Only show for the logged in user */}
            {isEditable ? (
              <Link
                to="/profile/edit"
                className="inline-block  mb-5    text-sm font-semibold  transition-all px-8 py-2  text-center rounded-lg border border-primary bg-primary text-white hover:bg-primary/95"
              >
                Edit Profile
              </Link>
            ) : null}
          </div>
        </div>
        <ProfileTab />
      </div>
    </div></>
  );
};

export default ProfilePage;
