import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import eventsPageImage from '../assets/images/pages/events.png';

function Events() {
  return (
    <>
      <Helmet>
        <title>Events | Interview Experience</title>
        <meta
          name="description"
          content="Upcoming and Past Events of GSMCOE are displayed here, the page is still in construction"
        />
        <meta name="twitter:card" content={eventsPageImage} />
        <meta name="twitter:title" content="Events | Interview Experience" />
        <meta
          name="twitter:description"
          content="Upcoming and Past Events of GSMCOE are displayed here, the page is still in construction"
        />
        <meta name="twitter:image" content={eventsPageImage} />

        <meta property="og:title" content="Events | Interview Experience" />
        <meta
          property="og:description"
          content="Upcoming and Past Events of GSMCOE are displayed here, the page is still in construction"
        />
        <meta property="og:image" content={eventsPageImage} />
        <meta property="og:url" content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}/events`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-primary/10">
        <div className="flex items-center min-h-screen gap-3.75 mx-auto px-5">
          <div className="flex-1 px-10 sm:px-20  max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold text-primary uppercase">
              Event Page is Under Construction
            </h3>
            <p className="text-gray-600 py-1.25 ">
              We're thrilled to let you know that something amazing is on the way! Our team is
              currently putting together a series of fantastic events just for you. We're also
              building a dedicated web page where you’ll find all the details — from schedules and
              highlights to how you can participate. Thank you for your enthusiasm and support — we
              can’t wait to share the experience with you. Stay tuned… and get ready to be inspired!
            </p>

            <Link
              to="/"
              className="inline-block px-12.5 py-2 mt-2.5 text-base bg-primary text-white rounded-lg"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Events;
