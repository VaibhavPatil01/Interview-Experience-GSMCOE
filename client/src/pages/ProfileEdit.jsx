import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { updateUser } from '../services/userServices.js';
import { useAppSelector } from '../redux/store.js';
import { branches } from '../assets/assets.js';

function ProfileEdit() {
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.userState.user);

  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries(['user-status']);
  }, [queryClient]);

  const formRef = useRef();

  const { mutate, isLoading } = useMutation({
    mutationFn: (user) => updateUser(user),
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate(`/profile/${userData?.userId}`);
    }
  });

  const initialValues = {
    username: userData?.username || '',
    designation: userData?.designation || '',
    branch: userData?.branch || '',
    about: userData?.about || '',
    passingYear: userData?.passingYear || new Date().getFullYear(),
    github: userData?.github || '',
    linkedin: userData?.linkedin || ''
  };

  return (
    <div className="min-h-screen p-8 bg-primary/10">
      <div className="mt-2 relative max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg mx-auto">
        <header className="text-xl text-gray-700 font-medium text-center mb-4">
          Update Profile
        </header>

        <Formik
          innerRef={formRef}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Yup.object({
            username: Yup.string()
              .max(20, 'User Name must be 20 characters or less')
              .required('Username is required'),
            designation: Yup.string().required('Designation is required'),
            branch: Yup.string().required('Branch is required'),
            passingYear: Yup.number().required('Passing Year is required'),
            about: Yup.string().required('About is required'),
            github: Yup.string().url('Invalid github url'),
            linkedin: Yup.string().url('Invalid linkedin url')
          })}
          onSubmit={(values, { setSubmitting, setErrors }) => {
            mutate(values);
          }}
          validateOnBlur={true}
          validateOnChange={true}
        >
          {(formik) => {
            const handleScrollToError = () => {
              const firstErrorField = Object.keys(formik.errors)[0];
              if (firstErrorField) {
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement && typeof errorElement.scrollIntoView === 'function') {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  errorElement.focus();
                }
              }
            };

            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formik.handleSubmit();
                  if (!formik.isValid) {
                    handleScrollToError();
                  }
                }}
                className="space-y-5"
              >
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-gray-700">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="username"
                    {...formik.getFieldProps('username')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  />
                  {formik.touched.username && formik.errors.username && (
                    <span className="text-red-600 text-sm">{formik.errors.username}</span>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-gray-700">
                    Designation <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="SDE 1"
                    {...formik.getFieldProps('designation')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  />
                  {formik.touched.designation && formik.errors.designation && (
                    <span className="text-red-600 text-sm">{formik.errors.designation}</span>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-gray-700">
                    Branch <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="branch"
                    {...formik.getFieldProps('branch')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {formik.touched.branch && formik.errors.branch && (
                    <span className="text-red-600 text-sm">{formik.errors.branch}</span>
                  )}
                </div>

                {/* Passing Year */}
                <div>
                  <label htmlFor="passingYear" className="block text-gray-700">
                    Passing Year <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="passingYear"
                    placeholder="2024"
                    {...formik.getFieldProps('passingYear')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  />
                  {formik.touched.passingYear && formik.errors.passingYear && (
                    <span className="text-red-600 text-sm">{formik.errors.passingYear}</span>
                  )}
                </div>

                {/* About */}
                <div>
                  <label htmlFor="about" className="block text-gray-700">
                    About <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="about"
                    rows="4"
                    placeholder="Introduce yourself..."
                    {...formik.getFieldProps('about')}
                    className="w-full mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600 resize-y"
                  />
                  {formik.touched.about && formik.errors.about && (
                    <span className="text-red-600 text-sm">{formik.errors.about}</span>
                  )}
                </div>

                {/* Github */}
                <div>
                  <label htmlFor="github" className="block text-gray-700">
                    Github
                  </label>
                  <input
                    type="url"
                    name="github"
                    placeholder="https://github.com/user"
                    {...formik.getFieldProps('github')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  />
                  {formik.touched.github && formik.errors.github && (
                    <span className="text-red-600 text-sm">{formik.errors.github}</span>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-gray-700">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    {...formik.getFieldProps('linkedin')}
                    className="w-full h-12 mt-2 p-3.75 border border-gray-300 rounded-lg text-base text-gray-600"
                  />
                  {formik.touched.linkedin && formik.errors.linkedin && (
                    <span className="text-red-600 text-sm">{formik.errors.linkedin}</span>
                  )}
                </div>

                {/* Submit */}
                <input
                  type="submit"
                  value="Update Profile"
                  disabled={isLoading}
                  className="h-14 w-full text-white bg-primary text-base font-medium mt-7.5 rounded-lg hover:bg-primary/95 disabled:bg-gray-400 cursor-pointer"
                />
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default ProfileEdit;
