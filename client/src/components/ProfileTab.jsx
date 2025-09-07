import { useState } from 'react';

import BookmarkedPost from './BookmarkedPost';
import UserPost from './UserPost';

const UserPosts = () => {
  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index) => {
    setToggleState(index);
  };

  return (
    <div className="lg:px-[1rem]">
      <div className="flex mb-[1rem] sticky top-[4rem]  bg-white z-40 lg:top-[4.5rem] ">
        <button
          onClick={() => toggleTab(1)}
          className={`w-1/2 relative p-[0.8rem] inline-block cursor-pointer  py-2 text-center ${
            toggleState === 1 ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => toggleTab(2)}
          className={`w-1/2 py-2 cursor-pointer text-center ${
            toggleState === 2 ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-grow ">
        <div className={toggleState === 1 ? ' block w-full' : 'bg-white hidden'}>
          <UserPost />
        </div>
        <div className={toggleState === 2 ? 'w-full block ' : 'bg-white hidden'}>
          <BookmarkedPost />
        </div>
      </div>
    </div>
  );
};

export default UserPosts;
