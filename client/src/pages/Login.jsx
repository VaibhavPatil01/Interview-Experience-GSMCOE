import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BiEnvelope, BiLockAlt } from 'react-icons/bi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet';
import ForgetPasswordModal from '../components/ForgetPasswordModal';
import SignInWithGoogle from '../components/SignInWithGoogle';
import { loginUser } from '../services/userServices.js';
import { setLocalStorage } from '../utils/localStorage.js';
import loginPageImage from '../assets/images/pages/login.png';

function Login() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onError: (error) => toast.error(error.response?.data?.message),
    onSuccess: (data) => {
      setLocalStorage('token', data.token);
      queryClient.refetchQueries(['user-status']);
      navigate(searchParams.get('redirect') || '/');
    }
  });

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid Email Address').required('Required'),
      password: Yup.string().max(20, 'Must be 20 characters or less').required('Required')
    }),
    onSubmit: mutate
  });

  const inputClasses =
    'absolute h-full w-full pl-9 border-b-2 border-gray-300 focus:border-primary outline-none text-base peer transition-all duration-200';

  return (
    <>
      <Helmet>
        <title>User Login | Interview Experience</title>
        <meta name="description" content="User Login Page for Interview Experience GSMCOE Website" />
        <meta name="twitter:card" content={loginPageImage} />
        <meta name="twitter:title" content="User Login | Interview Experience" />
        <meta
          name="twitter:description"
          content="User Login Page for Interview Experience GSMCOE Website"
        />
        <meta name="twitter:image" content={loginPageImage} />

        <meta property="og:title" content="User Login | Interview Experience" />
        <meta
          property="og:description"
          content="User Login Page for Interview Experience GSMCOE Website"
        />
        <meta property="og:image" content={loginPageImage} />
        <meta property="og:url" content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/login`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="pt-10 pb-32 flex items-center justify-center px-4 bg-primary/10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
          <h2 className="text-3xl font-semibold text-center mb-6 text-primary">Login</h2>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative h-12">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${inputClasses} ${
                  formik.touched.email && formik.errors.email ? 'border-b-red-600' : ''
                }`}
                aria-label="Email"
                autoComplete="email"
              />
              <BiEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-xl text-gray-400 peer-focus:text-primary" />
            </div>

            {/* Password Input */}
            <div className="relative h-12">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${inputClasses} ${
                  formik.touched.password && formik.errors.password ? 'border-b-red-600' : ''
                }`}
                aria-label="Password"
                autoComplete="current-password"
              />
              <BiLockAlt className="absolute left-0 top-1/2 -translate-y-1/2 text-xl text-gray-400 peer-focus:text-primary" />
              {showPassword ? (
                <AiOutlineEye
                  onClick={() => setShowPassword(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl text-gray-500 cursor-pointer hover:text-primary"
                  aria-label="Hide password"
                />
              ) : (
                <AiOutlineEyeInvisible
                  onClick={() => setShowPassword(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl text-gray-500 cursor-pointer hover:text-primary"
                  aria-label="Show password"
                />
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end text-sm">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary/95 disabled:bg-gray-400 transition cursor-pointer"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Forgot Password Modal */}
          {modalOpen && <ForgetPasswordModal closeModalCallback={() => setModalOpen(false)} />}

          <div className="my-4 text-center text-gray-500 font-medium">OR</div>

          <SignInWithGoogle redirectURLOnLogin={searchParams.get('redirect') || '/'} />

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-700">
            Not a member?
            <Link to="/register" className="ml-1 text-blue-600 hover:underline font-medium">
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
