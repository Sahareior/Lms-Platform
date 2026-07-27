import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure(state) {
      state.isLoading = false;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } =
  userSlice.actions;
export default userSlice.reducer;
