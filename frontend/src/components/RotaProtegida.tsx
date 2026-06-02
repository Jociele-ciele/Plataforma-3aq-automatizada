import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/auth";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, accessToken } = useAuthStore();
  if (!user || !accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return <Outlet />;
}
