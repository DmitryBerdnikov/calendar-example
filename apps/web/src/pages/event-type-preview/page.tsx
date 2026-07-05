import { Alert, Group, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { getSessionToken } from "../../shared/session/session-storage";
import { PageShell } from "../../shared/ui/page-shell";
import { PublicBookingFlow } from "../public-booking/public-booking-flow";

function eventTypeQueryKey(id: string) {
  return ["event-types", id] as const;
}

function authorizationHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return fallback;
}

export function EventTypePreviewPage() {
  const { id } = useParams();
  const eventTypeId = id ?? "";
  const sessionToken = getSessionToken() ?? "";
  const eventTypeQuery = useQuery({
    queryKey: eventTypeQueryKey(eventTypeId),
    enabled: Boolean(eventTypeId),
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        "/event-types/{id}",
        {
          headers: authorizationHeaders(sessionToken),
          params: {
            path: {
              id: eventTypeId,
            },
          },
        },
      );

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
  });

  return (
    <PageShell
      title="Event Type Preview"
      description="Preview will render the public booking flow for this event type."
    >
      {eventTypeQuery.isPending ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : null}
      {eventTypeQuery.isError ? (
        <Alert color="red" title="Event type could not load">
          {getErrorMessage(
            eventTypeQuery.error,
            "Refresh the page and try again.",
          )}
        </Alert>
      ) : null}
      {eventTypeQuery.isSuccess ? (
        <PublicBookingFlow eventType={eventTypeQuery.data} mode="preview" />
      ) : null}
    </PageShell>
  );
}
