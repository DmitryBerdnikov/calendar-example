import { Alert, Center, Group, Loader, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { PublicBookingFlow } from "./public-booking-flow";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return fallback;
}

export function PublicBookingPage() {
  const { slug } = useParams();
  const eventTypeSlug = slug ?? "";
  const eventTypeQuery = useQuery({
    queryKey: ["public-event-types", eventTypeSlug],
    enabled: Boolean(eventTypeSlug),
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        "/public/event-types/{slug}",
        {
          params: {
            path: {
              slug: eventTypeSlug,
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
    <Center mih="100vh" p="lg" className="public-surface">
      <Stack gap="md" maw={960} w="100%">
        {eventTypeQuery.isPending ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : null}
        {eventTypeQuery.isError ? (
          <Alert color="red" title="Booking page could not load">
            {getErrorMessage(
              eventTypeQuery.error,
              "Refresh the page and try again.",
            )}
          </Alert>
        ) : null}
        {eventTypeQuery.isSuccess ? (
          <PublicBookingFlow eventType={eventTypeQuery.data} mode="public" />
        ) : null}
      </Stack>
    </Center>
  );
}
