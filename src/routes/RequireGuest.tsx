import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { JSX } from "react";

export default function RequireGuest({ children }: { children: JSX.Element }) {
  const { token } = useAppSelector((state) => state.adminAuth);

  // Nếu đã login → đá về dashboard
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
