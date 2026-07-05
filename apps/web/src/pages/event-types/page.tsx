import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import type { EventType } from "@scheduling/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Eye, Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { getSessionToken } from "../../shared/session/session-storage";
import { PageShell } from "../../shared/ui/page-shell";

type Feedback = {
  color: "green" | "red";
  title: string;
  message: string;
};

type EventTypeAction = "activate" | "deactivate" | "delete";

type EventTypeActionVariables = {
  action: EventTypeAction;
  eventType: EventType;
};

const eventTypesQueryKey = ["event-types"] as const;

function authorizationHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return "This event type cannot be deleted because it has existing bookings. Deactivate it instead.";
    }

    return error.message;
  }

  return fallback;
}

function formatDuration(durationMinutes: number): string {
  return `${durationMinutes} min`;
}

function actionSuccessMessage(action: EventTypeAction, title: string): string {
  if (action === "delete") {
    return `${title} delete request succeeded.`;
  }

  if (action === "activate") {
    return `${title} activate request succeeded.`;
  }

  return `${title} deactivate request succeeded.`;
}

export function EventTypesPage() {
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken() ?? "";
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null);
  const eventTypesQuery = useQuery({
    queryKey: eventTypesQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/event-types", {
        headers: authorizationHeaders(sessionToken),
      });

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
  });
  const actionMutation = useMutation({
    mutationFn: async ({ action, eventType }: EventTypeActionVariables) => {
      if (action === "delete") {
        const { error, response } = await apiClient.DELETE(
          "/event-types/{id}",
          {
            headers: authorizationHeaders(sessionToken),
            params: {
              path: {
                id: eventType.id,
              },
            },
          },
        );

        if (!response.ok) {
          throwApiRequestError(response.status, error);
        }

        return;
      }

      if (action === "activate") {
        const { data, error, response } = await apiClient.POST(
          "/event-types/{id}/activate",
          {
            headers: authorizationHeaders(sessionToken),
            params: {
              path: {
                id: eventType.id,
              },
            },
          },
        );

        if (!data) {
          throwApiRequestError(response.status, error);
        }

        return;
      }

      const { data, error, response } = await apiClient.POST(
        "/event-types/{id}/deactivate",
        {
          headers: authorizationHeaders(sessionToken),
          params: {
            path: {
              id: eventType.id,
            },
          },
        },
      );

      if (!data) {
        throwApiRequestError(response.status, error);
      }
    },
    onSuccess: async (_result, variables) => {
      setDeleteTarget(null);
      setFeedback({
        color: "green",
        title: "Action succeeded",
        message: actionSuccessMessage(
          variables.action,
          variables.eventType.title,
        ),
      });
      await queryClient.invalidateQueries({ queryKey: eventTypesQueryKey });
    },
    onError: (error) => {
      setFeedback({
        color: "red",
        title: "Action failed",
        message: getErrorMessage(error, "The event type action failed."),
      });
    },
  });

  const pendingEventTypeId = actionMutation.variables?.eventType.id;

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    actionMutation.mutate({
      action: "delete",
      eventType: deleteTarget,
    });
  }

  return (
    <PageShell
      title="Event Types"
      description="Manage public booking options and preview their booking pages."
      action={{ label: "New event type", to: "/event-types/new" }}
    >
      <Stack gap="md">
        {feedback ? (
          <Alert color={feedback.color} title={feedback.title}>
            {feedback.message}
          </Alert>
        ) : null}
        {eventTypesQuery.isPending ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : null}
        {eventTypesQuery.isError ? (
          <Alert color="red" title="Event types could not load">
            {getErrorMessage(
              eventTypesQuery.error,
              "Refresh the page and try again.",
            )}
          </Alert>
        ) : null}
        {eventTypesQuery.isSuccess ? (
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Slug</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {eventTypesQuery.data.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed">No event types yet.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  eventTypesQuery.data.map((eventType) => {
                    const rowIsPending =
                      actionMutation.isPending &&
                      pendingEventTypeId === eventType.id;

                    return (
                      <Table.Tr key={eventType.id}>
                        <Table.Td>
                          <Text fw={600}>{eventType.title}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text c="dimmed">{eventType.slug}</Text>
                        </Table.Td>
                        <Table.Td>
                          {formatDuration(eventType.durationMinutes)}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={eventType.isActive ? "green" : "gray"}
                            variant="light"
                          >
                            {eventType.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Button
                              component={Link}
                              to={`/event-types/${eventType.id}/preview`}
                              variant="subtle"
                              size="xs"
                              color="dark"
                              leftSection={<Eye size={14} />}
                            >
                              Preview
                            </Button>
                            <Button
                              component={Link}
                              to={`/event-types/${eventType.id}/edit`}
                              variant="subtle"
                              size="xs"
                              color="dark"
                              leftSection={<Edit3 size={14} />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="subtle"
                              size="xs"
                              color="dark"
                              leftSection={
                                eventType.isActive ? (
                                  <PowerOff size={14} />
                                ) : (
                                  <Power size={14} />
                                )
                              }
                              loading={rowIsPending}
                              disabled={actionMutation.isPending}
                              onClick={() =>
                                actionMutation.mutate({
                                  action: eventType.isActive
                                    ? "deactivate"
                                    : "activate",
                                  eventType,
                                })
                              }
                            >
                              {eventType.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="subtle"
                              size="xs"
                              color="red"
                              leftSection={<Trash2 size={14} />}
                              disabled={actionMutation.isPending}
                              onClick={() => setDeleteTarget(eventType)}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : null}
      </Stack>
      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete event type"
        centered
      >
        <Stack gap="md">
          <Text>
            Delete {deleteTarget?.title}? If it has existing bookings, the API
            will reject this request.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="dark"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<Trash2 size={16} />}
              loading={actionMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              Delete event type
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageShell>
  );
}
