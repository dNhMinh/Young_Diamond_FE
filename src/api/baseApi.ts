//src/api/baseApi.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import { RootState } from "../app/store";
import { Store } from "@reduxjs/toolkit/react";
import { loginSuccess, logout } from "../features/admin/auth/auth.slice";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

let store: Store<RootState>;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const injectStore = (s: Store<RootState>) => {
  store = s;
};

const baseApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

export const refreshClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/admin/auth/refresh")
      .then((res) => {
        store.dispatch(
          loginSuccess({ user: res.data.user, token: res.data.token }),
        );
        console.log("refresh token response:", res.data);
        return res.data.token as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

baseApi.interceptors.request.use(
  (config) => {
    const token = store.getState().adminAuth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

baseApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetryConfig;
    const shouldSkip =
      error.response?.status != 401 ||
      !original ||
      original._retry ||
      original.url === "/admin/auth/refresh";

    if (shouldSkip) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return baseApi(original);
    } catch (refreshError) {
      store.dispatch(logout());
      return Promise.reject(refreshError);
    }
  },
);

export default baseApi;
