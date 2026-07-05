import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { getSessionToken } from "../../shared/session/session-storage";
import { PageShell } from "../../shared/ui/page-shell";
import type { EventTypeFormValues } from "../event-type-form";
import { EventTypeForm } from "../event-type-form";

const defaultEventTypeFormValues: EventTypeFormValues = {
  title: "",
  slug: "",
  description: "",
  durationMinutes: 30,
  isActive: true,
};

const eventTypesQueryKey = ["event-types"] as const;

function authorizationHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "The event type create request failed.";
}

export function EventTypeNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken() ?? "";
  const createMutation = useMutation({
    mutationFn: async (values: EventTypeFormValues) => {
      const { data, error, response } = await apiClient.POST("/event-types", {
        headers: authorizationHeaders(sessionToken),
        body: values,
      });

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
    onSuccess: async (eventType) => {
      await queryClient.invalidateQueries({ queryKey: eventTypesQueryKey });
      navigate("/event-types", {
        state: {
          feedback: {
            color: "green",
            title: "Event type created",
            message: `${eventType.title} create request succeeded.`,
          },
        },
      });
    },
  });

  return (
    <PageShell
      title="New Event Type"
      description="Create a public booking option for guests."
    >
      <EventTypeForm
        defaultValues={defaultEventTypeFormValues}
        errorMessage={
          createMutation.isError ? getErrorMessage(createMutation.error) : ""
        }
        isSubmitting={createMutation.isPending}
        submitLabel="Create event type"
        onSubmit={(values) => createMutation.mutate(values)}
      />
    </PageShell>
  );
}
