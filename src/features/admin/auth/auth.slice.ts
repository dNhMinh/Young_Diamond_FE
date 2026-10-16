import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AdminUser } from "./auth.types";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("admin_token"),
  isInitialized: false,
};

const authSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ user: AdminUser; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    refreshToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    initializeApp(state) {
      state.isInitialized = true;
    },
  },
});

export const { loginSuccess, refreshToken, logout, initializeApp } =
  authSlice.actions;
export default authSlice.reducer;
