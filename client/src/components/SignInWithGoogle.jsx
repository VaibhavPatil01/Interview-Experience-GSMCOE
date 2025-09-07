import { BASE_API_URL } from '../services/serverConfig.js';
import { setLocalStorage } from '../utils/localStorage.js';

function SignInWithGoogle({ redirectURLOnLogin }) {
  const handleGoogleSignIn = () => {
    setLocalStorage('google-login-redirect', redirectURLOnLogin);
    const googleAuthUrl = `${BASE_API_URL}/user/auth/google/callback`;
    window.open(googleAuthUrl, '_self');
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="flex items-center gap-2 bg-white mx-auto px-4 py-2 rounded-lg border border-gray-300 hover:shadow-md hover:shadow-gray-200 transition-all duration-150 cursor-pointer"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
        className="w-6 h-6"
      />
      <span>Continue with Google</span>
    </button>
  );
}

export default SignInWithGoogle;
