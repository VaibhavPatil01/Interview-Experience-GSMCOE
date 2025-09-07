import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { deletePost } from '../services/postServices.js';
import { useAppSelector } from '../redux/store.js';
import { useState } from 'react';

export const useDeletePost = (refetchKey) => {
  const user = useAppSelector((state) => state.userState.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDetails, setDeleteDetails] = useState(null);

  const { mutate, isLoading } = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(refetchKey);
      toast.success('Post Deleted Successfully');
      navigate('/posts');
      closeDeleteModal();
    }
  });

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteDetails(null);
  };

  const openDeleteModal = (details) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setDeleteDetails(details);
    setIsDeleteModalOpen(true);
  };

  return { isDeleteModalOpen, deleteDetails, openDeleteModal, closeDeleteModal, mutate, isLoading };
};
