import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLocalStorageData, setLocalStorage } from '../../utils/localStorage.js';
import Loading from '../common/Loading';

function GithubTokenSetter() {
  const { token } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams(); 

  useEffect(() => {
    if (!token) {
      return;
    }

    const handleGithubTokenSetter = async () => {
      setLocalStorage('token', token);

      queryClient.refetchQueries(['user-status']);

      // Reading github login redirect url and clearing it from local storage
      const redirectUrl = getLocalStorageData('github-login-redirect');
      localStorage.removeItem('github-login-redirect');
      
      let finalRedirect = '/';
      if (redirectUrl && typeof redirectUrl === 'string' && redirectUrl !== 'undefined' && redirectUrl !== 'null') {
        finalRedirect = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
      }
      
      navigate(finalRedirect);
    };

    handleGithubTokenSetter();
  }, [token, navigate, queryClient, searchParams]);

  return <Loading />;
}

export default GithubTokenSetter;
