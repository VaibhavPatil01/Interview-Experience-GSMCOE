import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet';
import registrationPageImage from '../assets/images/pages/registration.png';
import { branches } from '../assets/assets.js';
import RegisterSuccessModal from '../components/RegisterSuccessModal';
import SignInWithGoogle from '../components/SignInWithGoogle';
import { registerUser } from '../services/userServices.js'; 

console.log('branches:', branches);

function UserRegister() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: (user) => {
      console.log('Mutating with user:', user);
      return registerUser(user);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.log('Error:', error);
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      console.log('Success:', data);
      toast.success(data.message);
      setIsSuccessModalOpen(true);
    }
  });

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    branch: '',
    about: '',
    passingYear: new Date().getFullYear(),
    github: '',
    linkedin: '',
    leetcode: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      username: Yup.string()
        .max(20, 'User Name must be 20 characters or less')
        .required('Username is required'),
      email: Yup.string().email('Invalid Email Address').required('Email is required'),
      password: Yup.string().required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Confirm Password does not match')
        .required('Confirm Password is required'),
      designation: Yup.string().required('Designation is required'),
      branch: Yup.string().required('Branch is required'),
      passingYear: Yup.number().required('Passing Year is required'),
      about: Yup.string().required('About is required'),
      github: Yup.string().url('Invalid github url'),
      linkedin: Yup.string().url('Invalid linkedin url'),
      leetcode: Yup.string().url('Invalid leetcode url')
    }),
    onSubmit: (values) => {
      console.log('Form submitted', values, formik.errors);
      mutate({ ...values, isAdmin: false });
    }
  });

  useEffect(() => {
    console.log('Form valid:', formik.isValid, 'Errors:', formik.errors, 'Loading:', isLoading);
  }, [formik.values, formik.errors, isLoading]);

  return (
    <>
    <Helmet>
        <title>User registration | Interview Experience</title>
        <meta
          name="description"
          content="User Registration Page for Interview Experience GSMCOE Website"
        />
        <meta name="twitter:card" content={registrationPageImage} />
        <meta
          name="twitter:title"
          content="User registration | Interview Experience"
        />
        <meta
          name="twitter:description"
          content="User registration Page for Interview Experience GSMCOE Website"
        />
        <meta name="twitter:image" content={registrationPageImage} />

        <meta
          property="og:title"
          content="User registration | Interview Experience"
        />
        <meta
          property="og:description"
          content="User registration Page for Interview Experience GSMCOE Website"
        />
        <meta property="og:image" content={registrationPageImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/register`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-primary/10 py-10 px-3">
        <div className="relative max-w-2xl w-full bg-white p-6 rounded-lg shadow-2xl mx-auto">
          <header className="text-xl text-primary font-medium text-center mb-4">
            Registration Form
          </header>
          <SignInWithGoogle redirectURLOnLogin="/" />
          <div className="text-center text-gray-500 font-medium my-4">OR</div>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div
              className={`w-full mt-5 ${
                formik.touched.username && formik.errors.username ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="username" className="block text-gray-700">
                {formik.touched.username && formik.errors.username
                  ? formik.errors.username
                  : 'Username'}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.email && formik.errors.email ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="email" className="block text-gray-700">
                {formik.touched.email && formik.errors.email ? formik.errors.email : 'Email'}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="abc@test.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <div className="flex gap-3.75">
              <div
                className={`w-full mt-5 ${
                  formik.touched.password && formik.errors.password ? 'border-red-600' : ''
                }`}
              >
                <label htmlFor="password" className="block text-gray-700">
                  {formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : 'Password'}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="*****"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
                />
              </div>

              <div
                className={`w-full mt-5 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-600'
                    : ''
                }`}
              >
                <label htmlFor="confirmPassword" className="block text-gray-700">
                  {formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? formik.errors.confirmPassword
                    : 'Confirm Password'}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="*****"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
                />
              </div>
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.designation && formik.errors.designation ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="designation" className="block text-gray-700">
                {formik.touched.designation && formik.errors.designation
                  ? formik.errors.designation
                  : 'Designation'}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="designation"
                placeholder="SDE 1 or Student"
                value={formik.values.designation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.branch && formik.errors.branch ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="branch" className="block text-gray-700">
                {formik.touched.branch && formik.errors.branch ? formik.errors.branch : 'Branch'}
                <span className="text-red-600">*</span>
              </label>
              <select
                name="branch"
                value={formik.values.branch}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              >
                <option value="">Branch</option>
                {branches.map((branch) => (
                  <option value={branch} key={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.passingYear && formik.errors.passingYear ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="passingYear" className="block text-gray-700">
                {formik.touched.passingYear && formik.errors.passingYear
                  ? formik.errors.passingYear
                  : 'Passing Year'}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="passingYear"
                placeholder="2024"
                value={formik.values.passingYear}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.about && formik.errors.about ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="about" className="block text-gray-700">
                {formik.touched.about && formik.errors.about ? formik.errors.about : 'About'}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                name="about"
                id="about"
                placeholder="Introduce yourself..."
                value={formik.values.about}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-40 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600 resize-y"
              />
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.github && formik.errors.github ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="github" className="block text-gray-700">
                Github
              </label>
              <input
                type="url"
                name="github"
                placeholder="https://github.com/user"
                value={formik.values.github ? formik.values.github : ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <div
              className={`w-full mt-5 ${
                formik.touched.linkedin && formik.errors.linkedin ? 'border-red-600' : ''
              }`}
            >
              <label htmlFor="linkedin" className="block text-gray-700">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin"
                placeholder="https://linkedin.com/user"
                value={formik.values.linkedin ? formik.values.linkedin : ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none  text-base text-gray-600"
              />
            </div>

            <input
              type="submit"
              value="Register"
              disabled={isLoading}
              className="h-14 w-full cursor-pointer text-white bg-primary text-base font-medium mt-7.5 rounded-lg hover:bg-primary/95 disabled:bg-gray-400"
            />
          </form>

          <div className="mt-7.5 text-center">
            <span className="text-gray-700 text-sm">
              <span>Already have an Account ?</span>
              <Link to="/login" className="ml-1 text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </span>
          </div>

          {isSuccessModalOpen && (
            <RegisterSuccessModal
              onClose={() => {
                setIsSuccessModalOpen(false);
                navigate('/login');
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default UserRegister;
