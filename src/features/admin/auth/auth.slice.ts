import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AdminUser } from "./auth.types";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("admin_token"),
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
      localStorage.setItem("admin_token", action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("admin_token");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
