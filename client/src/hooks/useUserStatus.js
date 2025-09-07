import { useQuery } from '@tanstack/react-query';
import { useAppDispatch } from '../redux/store.js';
import { userAction } from '../redux/user/userState.js';
import { getUserStatus } from '../services/userServices.js';

const useUserStatus = () => {
  const dispatch = useAppDispatch();

  const { isLoading, isError } = useQuery({
    queryKey: ['user-status'],
    queryFn: async () => {
      const data = await getUserStatus();

      if (data.isLoggedIn && data.user) {
        dispatch(userAction.loginUser({ user: data.user }));
      } else {
        dispatch(userAction.logout());
      }

      return data;
    }
  });

  return { isLoading, isError };
};

export default useUserStatus;
