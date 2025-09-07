import PropTypes from 'prop-types';

function DeletePostModal({ postDetails, onClose, mutate, isLoading }) {
  if (!postDetails) {
    return null;
  }

  const handleDelete = () => {
    mutate(postDetails.postId);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-8">
        <h2 className="text-2xl font-semibold">Confirm Post Delete</h2>
        <p className="mt-2 text-gray-700 text-lg">
          Are you sure you want to delete the post with title "
          <span className="font-bold">{postDetails.postTitle}</span>"?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="mt-4 text-lg mr-4 py-2 px-8 rounded-lg bg-primary text-white cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            aria-label={`Confirm delete of ${postDetails.postTitle}`}
            className="mt-4 py-2 text-lg px-8 rounded-lg border border-primary text-primary disabled:bg-gray-400 disabled:text-gray-600 cursor-pointer"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

DeletePostModal.propTypes = {
  postDetails: PropTypes.shape({
    postId: PropTypes.string.isRequired,
    postTitle: PropTypes.string.isRequired
  }),
  onClose: PropTypes.func.isRequired,
  mutate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default DeletePostModal;
