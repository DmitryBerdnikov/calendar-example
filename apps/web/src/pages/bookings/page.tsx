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
import type { Booking } from "@scheduling/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { useState } from "react";

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

const bookingsQueryKey = ["bookings"] as const;
const bookingTimezone = "Europe/Moscow";

const bookingDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: bookingTimezone,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const bookingTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: bookingTimezone,
  hour: "numeric",
  minute: "2-digit",
});

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

function formatTimeRange(booking: Booking): string {
  const startAt = new Date(booking.startAt);
  const endAt = new Date(booking.endAt);
  const startDate = bookingDateFormatter.format(startAt);
  const endDate = bookingDateFormatter.format(endAt);

  if (startDate === endDate) {
    return `${startDate}, ${bookingTimeFormatter.format(
      startAt,
    )} - ${bookingTimeFormatter.format(endAt)}`;
  }

  return `${startDate}, ${bookingTimeFormatter.format(
    startAt,
  )} - ${endDate}, ${bookingTimeFormatter.format(endAt)}`;
}

function statusColor(status: Booking["status"]): "green" | "gray" {
  return status === "confirmed" ? "green" : "gray";
}

export function BookingsPage() {
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken() ?? "";
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const bookingsQuery = useQuery({
    queryKey: bookingsQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/bookings", {
        headers: authorizationHeaders(sessionToken),
      });

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
  });
  const cancelMutation = useMutation({
    mutationFn: async (booking: Booking) => {
      const { data, error, response } = await apiClient.POST(
        "/bookings/{id}/cancel",
        {
          headers: authorizationHeaders(sessionToken),
          params: {
            path: {
              id: booking.id,
            },
          },
        },
      );

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
    onSuccess: (booking) => {
      queryClient.setQueryData<Booking[]>(bookingsQueryKey, (bookings = []) =>
        bookings.map((existingBooking) =>
          existingBooking.id === booking.id ? booking : existingBooking,
        ),
      );
      setCancelTarget(null);
      setFeedback({
        color: "green",
        title: "Booking cancelled",
        message: `${booking.eventTypeTitle} for ${booking.guestName} was cancelled.`,
      });
    },
    onError: (error) => {
      setFeedback({
        color: "red",
        title: "Booking could not be cancelled",
        message: getErrorMessage(error, "The cancel request failed."),
      });
    },
  });

  function handleCancelConfirm() {
    if (!cancelTarget) {
      return;
    }

    cancelMutation.mutate(cancelTarget);
  }

  return (
    <PageShell
      title="Bookings"
      description="Review confirmed and cancelled bookings."
    >
      <Stack gap="lg">
        {feedback ? (
          <Alert color={feedback.color} title={feedback.title}>
            {feedback.message}
          </Alert>
        ) : null}
        {bookingsQuery.isPending ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : null}
        {bookingsQuery.isError ? (
          <Alert color="red" title="Bookings could not load">
            {getErrorMessage(
              bookingsQuery.error,
              "Refresh the page and try again.",
            )}
          </Alert>
        ) : null}
        {bookingsQuery.isSuccess ? (
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Event Type</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookingsQuery.data.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed">No bookings yet.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  bookingsQuery.data.map((booking) => {
                    const isCancelled = booking.status === "cancelled";

                    return (
                      <Table.Tr key={booking.id}>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={600}>{booking.guestName}</Text>
                            <Text c="dimmed" size="sm">
                              {booking.guestEmail}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>{booking.eventTypeTitle}</Table.Td>
                        <Table.Td>{formatTimeRange(booking)}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={statusColor(booking.status)}
                            variant="light"
                          >
                            {booking.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            type="button"
                            variant="subtle"
                            size="xs"
                            color={isCancelled ? "gray" : "red"}
                            disabled={isCancelled}
                            loading={
                              cancelMutation.isPending &&
                              cancelMutation.variables?.id === booking.id
                            }
                            leftSection={<XCircle size={14} />}
                            onClick={() => setCancelTarget(booking)}
                          >
                            {isCancelled ? "Cancelled" : "Cancel"}
                          </Button>
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
        opened={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title={
          cancelTarget
            ? `Cancel ${cancelTarget.eventTypeTitle}?`
            : "Cancel booking?"
        }
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            This marks the booking as cancelled without deleting its record.
          </Text>
          {cancelTarget ? (
            <Stack gap={2}>
              <Text fw={600}>{cancelTarget.guestName}</Text>
              <Text c="dimmed" size="sm">
                {cancelTarget.guestEmail}
              </Text>
              <Text size="sm">{formatTimeRange(cancelTarget)}</Text>
            </Stack>
          ) : null}
          <Group justify="flex-end">
            <Button
              type="button"
              variant="subtle"
              color="dark"
              onClick={() => setCancelTarget(null)}
            >
              Keep booking
            </Button>
            <Button
              type="button"
              color="red"
              loading={cancelMutation.isPending}
              leftSection={<XCircle size={16} />}
              onClick={handleCancelConfirm}
            >
              Cancel booking
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageShell>
  );
}
