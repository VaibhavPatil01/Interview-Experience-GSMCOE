import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: true,
  isLoggedIn: false,
  user: null
};

export const UserSlice = createSlice({
  name: 'userState',
  initialState,

  reducers: {
    loginUser: (state, action) => {
      state.isLoading = false;

      state.isLoggedIn = true;
      state.user = action.payload.user;
    },

    logout: (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.user = null;
    },

    setIsLoading: (state) => {
      state.isLoading = true;
    }
  }
});

export default UserSlice.reducer;
export const userAction = UserSlice.actions;
