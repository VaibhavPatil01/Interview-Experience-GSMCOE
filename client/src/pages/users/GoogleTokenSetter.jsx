import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLocalStorageData, setLocalStorage } from '../../utils/localStorage.js';
import Loading from '../common/Loading';

function GoogleTokenSetter() {
  const { token } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams(); 

  useEffect(() => {
    if (!token) {
      return;
    }

    const handleGoogleTokenSetter = async () => {
      setLocalStorage('token', token);

      queryClient.refetchQueries(['user-status']);

      // Reading google login redirect url
      const redirectUrl = getLocalStorageData('google-login-redirect');
      
      let finalRedirect = '/';
      if (redirectUrl && typeof redirectUrl === 'string' && redirectUrl !== 'undefined' && redirectUrl !== 'null') {
        finalRedirect = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
      }
      
      navigate(finalRedirect);
    };

    handleGoogleTokenSetter();
  }, [token, navigate, queryClient, searchParams]);

  return <Loading />;
}

export default GoogleTokenSetter;
