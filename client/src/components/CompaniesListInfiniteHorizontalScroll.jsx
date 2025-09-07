import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCompanyAndRoleList } from '../../services/post.services';

function CompaniesListInfiniteHorizontalScroll() {
  const scroller = useRef(null);

  const companyAndRoleQuery = useQuery({
    queryKey: ['company-role-list'],
    queryFn: () => getCompanyAndRoleList()
  });

  useEffect(() => {
    if (!scroller || !scroller.current) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    scroller.current.setAttribute('data-animated', 'true');
  }, []);

  const companies = companyAndRoleQuery.data?.data.company;

  return (
    <div className="max-w-full overflow-hidden" ref={scroller}>
      <ul className="p-4 flex flex-nowrap gap-4">
        {companies?.map((company) => (
          <Link to={`/posts?company=${company}`} key={company}>
            <li className="px-8 py-4 rounded-lg bg-gray-800 shadow-lg shadow-gray-900 font-medium text-white capitalize">
              {company}
            </li>
          </Link>
        ))}

        {companies?.map((company) => (
          <Link to={`/posts?company=${company}`} key={`${company}-duplicate`} aria-hidden>
            <li className="px-8 py-4 rounded-lg bg-gray-800 shadow-lg shadow-gray-900 font-medium text-white capitalize">
              {company}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default CompaniesListInfiniteHorizontalScroll;

{
  /* <style>
  .scroller[data-animated='true'] {
    --duration: 30s;
    transform: translateX(0);
    transition: 0.25s ease-out;
    -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
    mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
  }

  .scroller[data-animated='true'] ul {
    width: fit-content;
    animation: scroll var(--duration) linear infinite;
  }

  .scroller[data-animated='true']:hover {
    transform: translateX(-3px);
  }

  .scroller[data-animated='true'] ul:hover {
    animation-play-state: paused;
  }

  @keyframes scroll {
    to {
      transform: translate(calc(-50% - 0.5rem));
    }
  }
</style> */
}
