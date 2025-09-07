import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { industries, postTypes } from '../assets/assets.js';
import Editor from '../components/Editor';
import StarRating from '../components/StarRating';
import { editPost, getCompanyAndRoleList, getPost } from '../services/postServices.js';
import getStringFromTags from '../utils/getStringFromTags.js';

function PostEdit() {
  const navigate = useNavigate();

  const { id } = useParams();
  const postQuery = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    staleTime: 30 * 60 * 1000 // Stale time for 30min
  });

  // Invalidating the status and refetching the post data
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries(['post', id]);
  }, [queryClient, id]);

  // Fetching in Position and Companies
  const companyAndRoleQuery = useQuery({
    queryKey: ['company-role-list'],
    queryFn: () => getCompanyAndRoleList()
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: (postData) => editPost(postData, id, 'published'),
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
    onSuccess: (data) => {
      queryClient.refetchQueries(['post', id]);
      toast.success(data.message);
      navigate(`/post/${id}`);
    }
  });

  const initialValues = {
    title: postQuery.data?.title || '',
    role: postQuery.data?.role || '',
    company: postQuery.data?.company || '',
    domain: postQuery.data?.domain || '',
    postType: postQuery.data?.postType || '',
    content: postQuery.data?.content || '',
    summary: postQuery.data?.summary || '',
    tags: getStringFromTags(postQuery.data?.tags || []),
    rating: postQuery.data?.rating || 0
  };

  const formRef = useRef();

  const handleSubmit = (values, { setSubmitting }) => {
    mutate(values, {
      onSettled: () => setSubmitting(false)
    });
  };

  return (
    <div className="min-h-screen bg-primary/10 p-3 py-10">
      <div className="relative max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg mx-auto">
        <Formik
          innerRef={formRef}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Yup.object({
            title: Yup.string()
              .max(200, 'Title must be less than 200 characters')
              .required('Title is required'),
            role: Yup.string().required('Role is required'),
            company: Yup.string().required('Company is required'),
            domain: Yup.string().required('Domain is required'),
            postType: Yup.string().required('Post Type is required'),
            tags: Yup.string().required('Tags is required'),
            rating: Yup.number().required('Rating is required'),
            summary: Yup.string().required('Summary is required')
          })}
          onSubmit={handleSubmit}
          validateOnBlur={true}
          validateOnChange={true}
        >
          {(formik) => {
            const handleScrollToError = () => {
              const firstErrorField = Object.keys(formik.errors)[0];
              if (firstErrorField) {
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement && typeof errorElement.scrollIntoView === 'function') {
                  console.log('Scrolling to:', firstErrorField, errorElement);
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  errorElement.focus();
                } else {
                  console.log('Element not found for:', firstErrorField);
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
                action=""
              >
                <header className="text-xl text-primary font-medium text-center mb-4">
                  Write your post
                </header>

                <div
                  className={`w-full mt-5 ${
                    formik.touched.title && formik.errors.title ? 'border-red-600' : ''
                  }`}
                >
                  <label htmlFor="title" className="block text-gray-700">
                    Title
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Interview Experience at XYZ company"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <span className="text-red-600 text-sm">{formik.errors.title}</span>
                  )}
                </div>

                <div className="flex gap-3.75">
                  <div
                    className={`flex-1 mt-5 ${
                      formik.touched.role && formik.errors.role ? 'border-red-600' : ''
                    }`}
                  >
                    <label htmlFor="role" className="block text-gray-700">
                      Position Applied for
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      list="roles"
                      placeholder="SDE 1 or Web development Intern"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600"
                    />
                    <datalist id="roles">
                      {companyAndRoleQuery.data?.data.role.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </datalist>
                    {formik.touched.role && formik.errors.role && (
                      <span className="text-red-600 text-sm">{formik.errors.role}</span>
                    )}
                  </div>
                  <div
                    className={`flex-1 mt-5 ${
                      formik.touched.company && formik.errors.company ? 'border-red-600' : ''
                    }`}
                  >
                    <label htmlFor="company" className="block text-gray-700">
                      Company
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Company"
                      name="company"
                      list="companies"
                      value={formik.values.company}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600"
                    />
                    <datalist id="companies">
                      {companyAndRoleQuery.data?.data.company.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </datalist>
                    {formik.touched.company && formik.errors.company && (
                      <span className="text-red-600 text-sm">{formik.errors.company}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3.75">
                  <div
                    className={`flex-1 mt-5 ${
                      formik.touched.domain && formik.errors.domain ? 'border-red-600' : ''
                    }`}
                  >
                    <label htmlFor="domain" className="block text-gray-700">
                      Industry
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="domain"
                      value={formik.values.domain}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600 appearance-none"
                    >
                      <option value="">Industry</option>
                      {industries.map((industry) => (
                        <option value={industry} key={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {formik.touched.domain && formik.errors.domain && (
                      <span className="text-red-600 text-sm">{formik.errors.domain}</span>
                    )}
                  </div>
                  <div
                    className={`flex-1 mt-5 ${
                      formik.touched.postType && formik.errors.postType ? 'border-red-600' : ''
                    }`}
                  >
                    <label htmlFor="article" className="block text-gray-700">
                      Post Type
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="postType"
                      value={formik.values.postType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600 appearance-none"
                    >
                      <option value="">Post Type</option>
                      {postTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {formik.touched.postType && formik.errors.postType && (
                      <span className="text-red-600 text-sm">{formik.errors.postType}</span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-full mt-5 ${
                    formik.touched.content && formik.errors.content ? 'border-red-600' : ''
                  }`}
                >
                  <label htmlFor="content" className="block text-gray-700">
                    Content
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="w-full mt-2 min-h-[300px]">
                    <Editor
                      name="content"
                      value={formik.values.content}
                      onChange={(value) => formik.setFieldValue('content', value)}
                    />
                  </div>
                  {formik.touched.content && formik.errors.content && (
                    <span className="text-red-600 text-sm">{formik.errors.content}</span>
                  )}
                  <style>
                    {`
                      .ql-container {
                        font-size: 1rem;
                        line-height: 1.6;
                        color: #333;
                        border: ${
                          formik.touched.content && formik.errors.content
                            ? '1px solid #dc2626'
                            : '1px solid #e5e7eb'
                        };
                        border-bottom-left-radius: 0.5rem;
                        border-bottom-right-radius: 0.5rem;
                      }
                      .ql-editor {
                        min-height: 250px !important;
                        padding: 0.5rem;
                        font-family: 'Arial', sans-serif;
                      }
                      .ql-toolbar {
                        border-top-left-radius: 0.5rem;
                        border-top-right-radius: 0.5rem;
                        border-bottom: none;
                      }
                    `}
                  </style>
                </div>

                <div
                  className={`w-full mt-5 ${
                    formik.touched.tags && formik.errors.tags ? 'border-red-600' : ''
                  }`}
                >
                  <label htmlFor="tags" className="block text-gray-700">
                    Tags
                    <input
                      type="text"
                      name="tags"
                      placeholder="#interview #experience #community"
                      value={formik.values.tags}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="font-medium w-full h-13 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600"
                    />
                  </label>
                  {formik.touched.tags && formik.errors.tags && (
                    <span className="text-red-600 text-sm">{formik.errors.tags}</span>
                  )}
                </div>

                <div
                  className={`w-full mt-5 ${
                    formik.touched.summary && formik.errors.summary ? 'border-red-600' : ''
                  }`}
                >
                  <label htmlFor="summary" className="block text-gray-700">
                    Summary
                    <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="summary"
                    placeholder="Write Summary of your Post..."
                    value={formik.values.summary}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full h-50 mt-2 p-3.75 border border-gray-300 rounded-lg focus:outline-none text-base text-gray-600 resize-y"
                  />
                  {formik.touched.summary && formik.errors.summary && (
                    <span className="text-red-600 text-sm">{formik.errors.summary}</span>
                  )}
                </div>

                <div
                  className={`w-full mt-5 ${
                    formik.touched.rating && formik.errors.rating ? 'border-red-600' : ''
                  }`}
                >
                  <label className="block text-gray-700">
                    Rate your Interview Experience
                    <span className="text-red-600">*</span>
                  </label>
                  <div>
                    <StarRating name="rating" />
                  </div>
                  {formik.touched.rating && formik.errors.rating && (
                    <span className="text-red-600 text-sm">{formik.errors.rating}</span>
                  )}
                </div>

                <div className="flex gap-3.75">
                  <input
                    type="submit"
                    value="Post"
                    disabled={isLoading}
                    className="flex-1 h-14 text-white bg-primary text-base font-medium mt-4 rounded-lg hover:bg-primary/95 disabled:bg-gray-400 cursor-pointer"
                  />
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default PostEdit;
