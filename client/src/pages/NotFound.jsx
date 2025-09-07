import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-sm max-md:px-4 py-20  min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-primary">404 Not Found</h1>
      <div className="h-px w-80 rounded bg-white my-5 md:my-7"></div>
      <p className="md:text-xl text-primary/80 max-w-lg text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="group flex items-center gap-3 text-lg bg-primary px-8 py-3 text-white rounded-full mt-10 font-medium active:scale-95 transition-all"
      >
        Back to Home
        <FaArrowRight />
      </Link>
    </div>
  );
};

export default NotFound;
