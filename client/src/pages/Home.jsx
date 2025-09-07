import { Helmet } from 'react-helmet';
import Hero from '../components/Hero';
import GithubSection from '../components/GithubSection';
import UserReviews from '../components/UserReviews';
import TopPosts from '../components/TopPosts';
import Footer from '../components/Footer';
import OurTeam from '../components/OurTeam';
import homePageImage from '../assets/images/pages/home-page.png'; 

const Home = () => {
  return (
    <>
    <Helmet>
        <title>Interview Experience | GSMCOE</title>
        <meta
          name="description"
          content="Share and discover interview experiences at GSMCOE to inspire and learn from the community."
        />
        <meta name="twitter:card" content={homePageImage} />
        <meta name="twitter:title" content="Interview Experience | GSMCOE" />
        <meta
          name="twitter:description"
          content="Share and discover interview experiences at GSMCOE to inspire and learn from the community."
        />
        <meta name="twitter:image" content={homePageImage} />

        <meta property="og:title" content="Interview Experience | GSMCOE" />
        <meta
          property="og:description"
          content="Share and discover interview experiences at GSMCOE to inspire and learn from the community."
        />
        <meta property="og:image" content={homePageImage} />
        <meta
          property="og:url"
          content={`${import.meta.env.REACT_APP_BASE_CLIENT_URL}`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <Hero />
      <TopPosts />
      <GithubSection /> 
      {/* <OurTeam /> */}
      <UserReviews />
      <Footer />
    </>
  );
};

export default Home;
