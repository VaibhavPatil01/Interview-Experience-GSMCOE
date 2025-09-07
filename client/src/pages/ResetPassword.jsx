import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BiEnvelope, BiLockAlt } from 'react-icons/bi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { resetUserPassword } from '../services/userServices.js';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Separate state for password and confirm password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: (user) => resetUserPassword(user.email, user.password, token || ''),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/login');
    }
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid Email Address').required('Email is Required'),
      password: Yup.string()
        .max(20, 'Password must be 20 characters or less')
        .required('Password is Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Confirm Password does not match')
        .required('Confirm Password is required')
    }),
    onSubmit: (values) => {
      console.log('Submitting Reset:', values, token);
      mutate(values);
    }
  });

  return (
    <div className="pt-10 pb-32 flex items-center justify-center px-4 bg-primary/10">
      <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-7.5">
        <div className="flex flex-col transition-[height] duration-200 p-7.5 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-2 text-primary">Reset Password</h2>
          <form onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div
              className={`relative h-12 w-full mt-7.5 ${
                formik.touched.email && formik.errors.email ? 'border-b-red-600' : ''
              }`}
            >
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="absolute h-full w-full pl-9 border-b-2 border-gray-300 focus:border-b-blue-600 outline-none text-base transition-all duration-200 peer"
              />
              <BiEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
            )}

            {/* Password */}
            <div
              className={`relative h-12 w-full mt-7.5 ${
                formik.touched.password && formik.errors.password ? 'border-b-red-600' : ''
              }`}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter New Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="absolute h-full w-full pl-9 border-b-2 border-gray-300 focus:border-b-blue-600 outline-none text-base transition-all duration-200 peer"
              />
              <BiLockAlt className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              {showPassword ? (
                <AiOutlineEye
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl cursor-pointer p-2.5"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl cursor-pointer p-2.5"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.password}</p>
            )}

            {/* Confirm Password */}
            <div
              className={`relative h-12 w-full mt-7.5 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-b-red-600'
                  : ''
              }`}
            >
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="absolute h-full w-full pl-9 border-b-2 border-gray-300 focus:border-b-blue-600 outline-none text-base transition-all duration-200 peer"
              />
              <BiLockAlt className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              {showConfirmPassword ? (
                <AiOutlineEye
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl cursor-pointer p-2.5"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl cursor-pointer p-2.5"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.confirmPassword}</p>
            )}

            {/* Submit */}
            <div className="mt-8.75">
              <input
                type="submit"
                value="Reset Password"
                disabled={isLoading}
                className="w-full text-white cursor-pointer bg-blue-600 text-base font-medium tracking-[0.025em] rounded-lg py-2.5 hover:bg-blue-700 disabled:bg-gray-400"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="mt-7.5 text-center">
            <span className="text-gray-700 text-sm">
              Want to login?
              <Link to="/login" className="ml-0.5 text-blue-600 underline hover:no-underline">
                LogIn
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
