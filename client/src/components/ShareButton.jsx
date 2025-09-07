import { toast } from 'react-hot-toast';
import generateSlug from '../utils/generateSlug.js';

function ShareButton({ title, author, postId }) {
  const handlePostShare = () => {
    const url = `${import.meta.env.REACT_APP_BASE_CLIENT_URL}/post/${postId}/${generateSlug(title)}`;

    if (navigator.share) {
      const text = `Checkout the post "${title}" by ${author} on Interview Experience`;
      navigator.share({ title, text, url }).catch(() => {
        toast.error('Something went wrong');
      });
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success('Link Copied to Clipboard!!');
        })
        .catch(() => {
          toast.error('Unable to Copy to Clipboard!!');
        });
    }
  };

  return (
    <button
      type="button"
      className="w-full mt-3.2 min-w-[128px] bg-white py-1.5 px-8 rounded-lg border border-primary text-primary md:w-auto md:mr-4 cursor-pointer"
      onClick={handlePostShare}
    >
      Share
    </button>
  );
}

export default ShareButton;
