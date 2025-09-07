import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';

function LoginRequiredModal({ redirecUrl, closeModalCallback }) {
  const backdropRef = useRef(null);

  const handleModalClick = (event) => {
    if (event.target !== backdropRef.current) {
      return;
    }
    closeModalCallback();
  };

  return (
    <div
      role="alert"
      onClick={handleModalClick}
      className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50"
      id="modalBackdrop"
      ref={backdropRef}
    >
      <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-8">
        {/* Close icon */}
        <button
          onClick={closeModalCallback}
          className="absolute top-4 text-3xl right-4 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <IoMdClose />
        </button>

        <h2 className="text-left text-2xl font-semibold mb-4 relative">
          Login Required
          <span className="absolute left-0 bottom-0 h-1 w-8 bg-accent rounded-full"></span>
        </h2>

        <p className="text-lg text-gray-600 text-left">
          You must be logged in to access this content. If you don’t have an account, you can
          register to get started.
        </p>

        <div className="mt-6 flex justify-end gap-4 flex-wrap">
          <Link
            to={`/login?redirect=${redirecUrl}`}
            className="text-center cursor-pointer text-white bg-accent hover:bg-accent-dark font-medium text-base rounded-lg py-2.5 px-10 bg-primary"
          >
            Login
          </Link>

          <Link
            to={`/register?redirect=${redirecUrl}`}
            className="text-center cursor-pointer text-primary  border border-primary font-medium text-base rounded-lg py-2.5 px-8"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginRequiredModal;
