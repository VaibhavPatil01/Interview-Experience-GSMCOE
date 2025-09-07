import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { userAction } from '../redux/user/userState.js';
import { logoutUser } from '../services/userServices.js';
import { resetLocalStorageData } from '../utils/localStorage.js';

const LogoutButton = ({ classNames, children, onClickCallback }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: () => logoutUser(),
    onError: () => {
      toast.error('Internal Server Error');
    },
    onSuccess: () => {
      resetLocalStorageData('token');

      queryClient.refetchQueries(['user-status']);
      dispatch(userAction.logout());
      onClickCallback();
      navigate('/');
    }
  });

  return (
    <button type="button" className={`${classNames}`} disabled={isLoading} onClick={() => mutate()}>
      {children}
    </button>
  );
};

export default LogoutButton;
