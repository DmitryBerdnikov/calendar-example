import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getSessionToken } from "../shared/session/session-storage";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const sessionToken = getSessionToken();

  if (!sessionToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
