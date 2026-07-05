import { Alert, Group, Loader } from "@mantine/core";
import type { EventType } from "@scheduling/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { PageShell } from "../../shared/ui/page-shell";
import type { EventTypeFormValues } from "../event-type-form";
import { EventTypeForm } from "../event-type-form";
import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { getSessionToken } from "../../shared/session/session-storage";

const eventTypesQueryKey = ["event-types"] as const;

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

function toFormValues(eventType: EventType): EventTypeFormValues {
  return {
    title: eventType.title,
    slug: eventType.slug,
    description: eventType.description,
    durationMinutes: eventType.durationMinutes,
    isActive: eventType.isActive,
  };
}

export function EventTypeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken() ?? "";
  const eventTypeId = id ?? "";
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
  const updateMutation = useMutation({
    mutationFn: async (values: EventTypeFormValues) => {
      const { data, error, response } = await apiClient.PATCH(
        "/event-types/{id}",
        {
          headers: authorizationHeaders(sessionToken),
          params: {
            path: {
              id: eventTypeId,
            },
          },
          body: values,
        },
      );

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
    onSuccess: async (eventType) => {
      queryClient.setQueryData(eventTypeQueryKey(eventType.id), eventType);
      await queryClient.invalidateQueries({ queryKey: eventTypesQueryKey });
      navigate("/event-types", {
        state: {
          feedback: {
            color: "green",
            title: "Event type updated",
            message: `${eventType.title} update request succeeded.`,
          },
        },
      });
    },
  });

  return (
    <PageShell
      title="Edit Event Type"
      description="Update the booking option guests can choose."
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
        <EventTypeForm
          defaultValues={toFormValues(eventTypeQuery.data)}
          errorMessage={
            updateMutation.isError
              ? getErrorMessage(
                  updateMutation.error,
                  "The event type update request failed.",
                )
              : ""
          }
          isSubmitting={updateMutation.isPending}
          submitLabel="Save event type"
          onSubmit={(values) => updateMutation.mutate(values)}
        />
      ) : null}
    </PageShell>
  );
}
