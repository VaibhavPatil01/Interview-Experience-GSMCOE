import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/store.js';

// The component is used to check if the user is logged in or not
function AuthRouteLayout() {
  const isLoggedIn = useAppSelector((state) => state.userState.isLoggedIn);
  const location = useLocation();

  if (isLoggedIn) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10">
      <div className="flex items-center min-h-screen gap-3.75 max-w-7xl mx-auto px-5">
        <div className="flex-1 max-w-prose">
          <h3 className="text-4xl md:text-5xl font-bold text-primary uppercase">
            Login Required!!
          </h3>
          <p className="text-gray-600 py-1.25 max-w-prose text-lg">
            To access this page, please log in using the button below. Please note that access
            requires a valid login. Thank you for using our website!
          </p>

          <Link
            to={`/login?redirect=${location.pathname}`}
            className="inline-block px-12.5 py-2 mt-2.5 text-base bg-primary text-white rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthRouteLayout;
