import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { JSX } from "react";
import { useEffect } from "react";
import { isTokenExpired } from "../utils/token";
import { logout } from "../features/admin/auth/auth.slice";

export default function RequireGuest({ children }: { children: JSX.Element }) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.adminAuth);
  const expired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (expired) {
      dispatch(logout());
    }
  }, [dispatch, expired]);

  // Nếu đã login → đá về dashboard
  if (token && !expired) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
