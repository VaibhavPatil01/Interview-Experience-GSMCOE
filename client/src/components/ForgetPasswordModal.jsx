import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { BiEnvelope } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { sendForgotPasswordMail } from '../services/userServices.js';

function ForgetPasswordModal({ closeModalCallback }) {
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: (email) => sendForgotPasswordMail(email),
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/');
    }
  });

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid Email Address').required('Email is Required')
    }),
    onSubmit: (values) => mutate(values.email)
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-8">
        <div className="form login">
          <div className="title relative">
            <h2 className="text-left text-2xl font-semibold mb-4 relative">
              Forget your Password ???
            </h2>
          </div>

          <div className="body">
            <p className="text-lg text-gray-600 text-left">
              That's okay, Enter your registered Email ID and click on the Reset to get a mail to
              reset password !!!
            </p>
          </div>
          <form onSubmit={formik.handleSubmit}>
            <div className="relative h-12 w-full mt-7.5">
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={formik.handleFocus} // optional if you want custom behavior
                className={`peer absolute h-full w-full pl-9 outline-none text-base transition-all duration-200 border-b-2
      ${
        formik.touched.email && formik.errors.email
          ? 'border-b-red-600'
          : 'border-b-gray-300 focus:border-b-primary'
      }
    `}
              />
              <BiEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xl transition-all duration-200 peer-focus:text-primary peer-valid:text-primary" />
            </div>

            <div className="buttons flex justify-between flex-wrap mt-8">
              <input
                className="cursor-pointer text-white bg-red-600 text-base font-medium tracking-[0.025em] rounded-lg py-2.5 px-5 disabled:bg-gray-400 hover:bg-red-700"
                onClick={closeModalCallback}
                type="button"
                value="Cancel"
                disabled={isLoading}
              />
              <input
                className="cursor-pointer text-white bg-primary text-base font-medium tracking-[0.025em] rounded-lg py-2.5 px-6 hover:bg-primary/95 disabled:bg-gray-400"
                type="submit"
                value="Reset"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgetPasswordModal;
