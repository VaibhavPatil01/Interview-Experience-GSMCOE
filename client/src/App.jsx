import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loading from './pages/Loading';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound';
import DefaultLayout from './pages/DefaultLayout';
import useUserStatus from './hooks/useUserStatus.js';
import Error from './pages/Error.jsx';
import GoogleTokenSetter from './pages/GoogleTokenSetter.jsx';
import Events from './pages/Events.jsx';
import AuthRouteLayout from './pages/AuthRouteLayout.jsx';

// Lazily importing pages
const Home = lazy(() => import('./pages/Home'));
const PostEdit = lazy(() => import('./pages/PostEdit'));
const PostForm = lazy(() => import('./pages/PostForm'));
const PostList = lazy(() => import('./pages/PostList'));
const PostPage = lazy(() => import('./pages/PostPage'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserRegister = lazy(() => import('./pages/UserRegister'));
const UserSearch = lazy(() => import('./pages/UserSearch'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const App = () => {
  const { pathname } = useLocation();
  const { isLoading, isError } = useUserStatus();

  // Scroll to top when the url changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/token/google/:token" element={<GoogleTokenSetter />} />
            <Route path="/user/search" element={<UserSearch />} />
            <Route element={<AuthRouteLayout />}>
              <Route path="/post" element={<PostForm />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/post/:id/:slug" element={<PostPage />} />
              <Route path="/post/edit/:id" element={<PostEdit />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" containerStyle={{ top: 80, zIndex: 100000 }} />
    </>
  );
};

export default App;
