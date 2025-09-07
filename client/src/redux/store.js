import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { UserSlice } from './user/userState.js';

export const store = configureStore({
  reducer: {
    userState: UserSlice.reducer
  }
});

export const useAppDispatch = () => useDispatch();

export const useAppSelector = useSelector;
