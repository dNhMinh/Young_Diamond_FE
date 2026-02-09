import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { JSX } from "react";
import { useEffect } from "react";
import { isTokenExpired } from "../utils/token";
import { logout } from "../features/admin/auth/auth.slice";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.adminAuth.token);
  const expired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (expired) {
      dispatch(logout());
    }
  }, [dispatch, expired]);

  if (expired) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
