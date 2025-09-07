import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getRelatedPosts } from '../services/postServices.js';
import generateSlug from '../utils/generateSlug.js';

function RelatedPosts({ postId }) {
  const relatedPostQuery = useQuery({
    queryKey: ['related-post', postId],
    queryFn: () => getRelatedPosts(postId, 6),
    staleTime: 30 * 60 * 1000 // Stale time for 30min
  });

  if (relatedPostQuery.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <ul className="w-20ch">
      {relatedPostQuery.data?.map((relatedPost) => (
        <li key={relatedPost._id} className="mb-1">
          <Link
            to={`/post/${relatedPost._id}/${generateSlug(relatedPost.title)}`}
            className="text-gray-800 no-underline hover:underline focus:underline visited:text-gray-500"
          >
            {relatedPost.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default RelatedPosts;
