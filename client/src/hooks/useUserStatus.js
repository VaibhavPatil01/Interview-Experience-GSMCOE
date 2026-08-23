import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppDispatch } from '../redux/store.js';
import { userAction } from '../redux/user/userState.js';
import { getUserStatus } from '../services/userServices.js';

const useUserStatus = () => {
  const dispatch = useAppDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-status'],
    queryFn: async () => {
      return await getUserStatus();
    }
  });

  useEffect(() => {
    if (data) {
      if (data.isLoggedIn && data.user) {
        dispatch(userAction.loginUser({ user: data.user }));
      } else {
        dispatch(userAction.logout());
      }
    }
  }, [data, dispatch]);

  return { isLoading, isError };
};

export default useUserStatus;
