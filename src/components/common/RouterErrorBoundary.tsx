import ErrorBoundaryWrapper from "#/components/common/ErrorBoundaryWrapper";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface RouterErrorBoundaryProps {
  children: ReactNode;
}

export function RouterErrorBoundary({ children }: RouterErrorBoundaryProps) {
  const location = useLocation();

  return (
    <ErrorBoundaryWrapper resetKeys={[location.pathname]}>
      {children}
    </ErrorBoundaryWrapper>
  );
}
