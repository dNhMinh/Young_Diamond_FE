import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { JSX } from "react";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const token = useAppSelector((state) => state.adminAuth.token);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
