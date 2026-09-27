import { useAuth } from "#/contexts/AuthContext.ts";
import type { UserRole } from "#/types/common.ts";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  children: ReactNode;
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
