import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../redux/store.js';
import LoginRequiredModal from '../components/LoginRequiredModal.jsx';
import LoginRequiredLink from '../components/LoginRequiredLink';

const Hero = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const userState = useAppSelector((state) => state.userState);

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openLoginModal = (url) => {
    setRedirectUrl(url);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="mx-8 sm:mx-16 xl:mx-24 relative">
      <div className="text-center mt-20 mb-8">
        <div className="inline-flex items-center justify-center gap-4 px-6 py-1.5 mb-4 border border-primary/40 bg-primary/10 rounded-full text-sm text-primary">
          <p>New: Event Page is Coming Soon!!!</p>
          <img src={assets.star_icon} className="w-2.5" alt="Star Icon" />
        </div>

        <h1 className="text-3xl sm:text-6xl font-semibold sm:leading-16 text-gray-700">
          Share your <span className="text-primary">interview</span> <br /> success story.
        </h1>

        <p className="my-6 sm:my-8 max-w-2xl m-auto max-sm:text-xs text-gray-500">
          Behind every placement is a story worth sharing. Inspire others, learn together, and build
          a stronger community with every word you write.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <LoginRequiredLink
            textContent="Create Post"
            to="/post"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-primary/90 transition duration-300 shadow-sm cursor-pointer"
            openModal={openLoginModal}
          />
          <Link
            to="/posts"
            className="border border-primary text-primary px-6 py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-primary hover:text-white transition duration-300 shadow-sm cursor-pointer"
          >
            View Posts
          </Link>
        </div>
      </div>
      {isLoginModalOpen && (
        <LoginRequiredModal redirectUrl={redirectUrl} closeModalCallback={closeLoginModal} />
      )}
      <img
        src={assets.gradientBackground}
        alt="Decorative Gradient Background"
        className="absolute -top-10 sm:-top-50 -z-1 opacity-50"
      />{' '}
      {/* Gradient Background */}
    </div>
  );
};

export default Hero;
