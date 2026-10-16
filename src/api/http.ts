//src/api/http.ts
import axios from "axios";
// import type { Store } from "@reduxjs/toolkit";
// import type { RootState } from "../app/store";

// let store: Store<RootState>;

// export const injectStore = (s: Store<RootState>) => {
//   store = s;
// };

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

// Public client (không token)
export const httpPublic = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// // Admin (có token)
// export const httpAdmin = axios.create({
//   baseURL,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// httpAdmin.interceptors.request.use((config) => {
//   const token = store.getState().adminAuth.token;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
