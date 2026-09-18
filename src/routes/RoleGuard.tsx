import type { UserRole } from "#/types/common.ts";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;
