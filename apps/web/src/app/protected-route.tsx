import { Center, Loader } from "@mantine/core";
import type { Organizer } from "@scheduling/api-client";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { ApiRequestError, getCurrentOrganizer } from "../shared/session/auth-api";
import {
  clearSessionToken,
  getSessionToken,
} from "../shared/session/session-storage";

type ProtectedRouteProps = {
  children: (organizer: Organizer) => ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const sessionToken = getSessionToken();
  const organizerQuery = useQuery({
    enabled: Boolean(sessionToken),
    queryKey: ["session", "organizer", sessionToken],
    queryFn: () => getCurrentOrganizer(sessionToken ?? ""),
    retry: false,
  });

  if (!sessionToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (organizerQuery.isPending) {
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  if (organizerQuery.isError) {
    if (
      organizerQuery.error instanceof ApiRequestError &&
      organizerQuery.error.status === 401
    ) {
      clearSessionToken();
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children(organizerQuery.data);
}
