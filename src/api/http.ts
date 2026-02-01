//src/api/http.ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

// Public client (không token)
export const httpPublic = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Admin (có token)
export const httpAdmin = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

httpAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
