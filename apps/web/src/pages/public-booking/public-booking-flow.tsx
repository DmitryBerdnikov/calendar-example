import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import type {
  PublicBookingConfirmation,
  PublicEventType,
  PublicSlot,
} from "@scheduling/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarCheck, Clock3, Mail, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";

const bookingTimezone = "Europe/Moscow";

const guestFormSchema = z.object({
  guestName: z.string().trim().min(1, "Enter your name"),
  guestEmail: z.string().trim().email("Enter a valid email address"),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

type PublicBookingFlowMode = "public" | "preview";

type PublicBookingFlowProps = {
  eventType: PublicEventType;
  mode: PublicBookingFlowMode;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: bookingTimezone,
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: bookingTimezone,
  weekday: "long",
  month: "long",
  day: "numeric",
});

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: bookingTimezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function monthStart(date: string): string {
  return dayjs(date).startOf("month").format("YYYY-MM-DD");
}

function monthEnd(date: string): string {
  return dayjs(date).endOf("month").format("YYYY-MM-DD");
}

function getToday(): string {
  return dayjs().format("YYYY-MM-DD");
}

function getSlotDateKey(slot: PublicSlot): string {
  const parts = datePartsFormatter.formatToParts(new Date(slot.startAt));
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return fallback;
}

function formatTimeRange(slot: PublicSlot): string {
  return `${timeFormatter.format(new Date(slot.startAt))} - ${timeFormatter.format(
    new Date(slot.endAt),
  )}`;
}

function formatDateTime(startAt: string): string {
  return `${dateFormatter.format(new Date(startAt))}, ${timeFormatter.format(
    new Date(startAt),
  )}`;
}

function normalizeGuestValues(values: GuestFormValues): GuestFormValues {
  return {
    guestName: values.guestName.trim(),
    guestEmail: values.guestEmail.trim(),
  };
}

export function PublicBookingFlow({ eventType, mode }: PublicBookingFlowProps) {
  const isPreview = mode === "preview";
  const isPublicInactive = mode === "public" && !eventType.isActive;
  const [visibleMonth, setVisibleMonth] = useState(monthStart(getToday()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [confirmation, setConfirmation] =
    useState<PublicBookingConfirmation | null>(null);
  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
    },
  });

  const slotsQuery = useQuery({
    queryKey: [
      "public-event-types",
      eventType.slug,
      "slots",
      monthStart(visibleMonth),
      monthEnd(visibleMonth),
    ],
    enabled: !isPublicInactive,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET(
        "/public/event-types/{slug}/slots",
        {
          params: {
            path: {
              slug: eventType.slug,
            },
            query: {
              from: monthStart(visibleMonth),
              to: monthEnd(visibleMonth),
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

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, PublicSlot[]>();

    for (const slot of slotsQuery.data ?? []) {
      const dateKey = getSlotDateKey(slot);
      const dateSlots = grouped.get(dateKey) ?? [];
      dateSlots.push(slot);
      grouped.set(dateKey, dateSlots);
    }

    for (const dateSlots of grouped.values()) {
      dateSlots.sort(
        (first, second) =>
          new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
      );
    }

    return grouped;
  }, [slotsQuery.data]);

  const selectedDateSlots = selectedDate
    ? (slotsByDate.get(selectedDate) ?? [])
    : [];

  useEffect(() => {
    if (!slotsQuery.isSuccess || selectedDate) {
      return;
    }

    const firstDateWithSlots = Array.from(slotsByDate.keys()).sort()[0];

    if (firstDateWithSlots) {
      setSelectedDate(firstDateWithSlots);
    }
  }, [selectedDate, slotsByDate, slotsQuery.isSuccess]);

  const bookingMutation = useMutation({
    mutationFn: async (values: GuestFormValues) => {
      if (!selectedSlot) {
        throw new Error("Select a time before booking.");
      }

      const { data, error, response } = await apiClient.POST(
        "/public/event-types/{slug}/bookings",
        {
          params: {
            path: {
              slug: eventType.slug,
            },
          },
          body: {
            startAt: selectedSlot.startAt,
            ...normalizeGuestValues(values),
          },
        },
      );

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
    onSuccess: (data) => {
      setConfirmation(data);
    },
  });

  function handleDateChange(date: string | null) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleMonthChange(date: string) {
    setVisibleMonth(monthStart(date));
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function handleSubmit(values: GuestFormValues) {
    if (!isPreview) {
      bookingMutation.mutate(values);
    }
  }

  if (confirmation) {
    return (
      <Paper withBorder radius="sm" p="xl">
        <Stack gap="md">
          <Group gap="sm">
            <CalendarCheck size={20} />
            <Title order={2}>Booking confirmed</Title>
          </Group>
          <Text c="dimmed">
            {confirmation.eventTypeTitle} is booked for{" "}
            {formatDateTime(confirmation.startAt)}.
          </Text>
          <Stack gap={4}>
            <Text fw={600}>{confirmation.guestName}</Text>
            <Text c="dimmed">{confirmation.guestEmail}</Text>
            <Badge color="green" variant="light" w="fit-content">
              {confirmation.status}
            </Badge>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Paper withBorder radius="sm" p="xl">
        <Stack gap="lg">
          <Stack gap={6}>
            <Group gap="xs">
              <Title order={1}>{eventType.title}</Title>
              {!eventType.isActive ? (
                <Badge color="gray" variant="light">
                  Inactive
                </Badge>
              ) : null}
            </Group>
            <Text c="dimmed">{eventType.description}</Text>
          </Stack>
          <Group gap="xs">
            <Clock3 size={16} />
            <Text>{eventType.durationMinutes} min</Text>
          </Group>
          {isPreview ? (
            <Alert color="gray" title="Preview mode">
              This preview shows the public booking flow without creating a
              booking.
            </Alert>
          ) : null}
          {isPublicInactive ? (
            <Alert color="gray" title="This event type is unavailable">
              This booking page is not accepting new bookings.
            </Alert>
          ) : null}
        </Stack>
      </Paper>
      <Paper withBorder radius="sm" p="xl">
        <Stack gap="md">
          <Title order={2}>Select a date</Title>
          <DatePicker
            value={selectedDate}
            date={visibleMonth}
            hideOutsideDates
            minDate={getToday()}
            onChange={handleDateChange}
            onDateChange={handleMonthChange}
            getDayProps={(date) => ({
              disabled:
                isPublicInactive ||
                !slotsByDate.has(date) ||
                slotsQuery.isPending,
            })}
          />
          {slotsQuery.isPending ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
            </Group>
          ) : null}
          {slotsQuery.isError ? (
            <Alert color="red" title="Slots could not load">
              {getErrorMessage(
                slotsQuery.error,
                "Refresh the page and try again.",
              )}
            </Alert>
          ) : null}
          {slotsQuery.isSuccess && !isPublicInactive ? (
            <Stack gap="sm">
              <Text fw={600}>
                {selectedDate
                  ? dateFormatter.format(new Date(`${selectedDate}T12:00:00Z`))
                  : "Available times"}
              </Text>
              {selectedDateSlots.length > 0 ? (
                <Group gap="xs">
                  {selectedDateSlots.map((slot) => {
                    const isSelected = selectedSlot?.startAt === slot.startAt;

                    return (
                      <Button
                        key={slot.startAt}
                        variant={isSelected ? "filled" : "outline"}
                        color="dark"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTimeRange(slot)}
                      </Button>
                    );
                  })}
                </Group>
              ) : (
                <Text c="dimmed">No slots are available for this date.</Text>
              )}
            </Stack>
          ) : null}
          <form onSubmit={guestForm.handleSubmit(handleSubmit)}>
            <Stack gap="sm">
              {bookingMutation.isError ? (
                <Alert color="red" title="Booking could not be created">
                  {getErrorMessage(
                    bookingMutation.error,
                    "Select another time and try again.",
                  )}
                </Alert>
              ) : null}
              <TextInput
                label="Name"
                placeholder="Maria Guest"
                leftSection={<User size={16} />}
                disabled={isPublicInactive}
                error={guestForm.formState.errors.guestName?.message}
                {...guestForm.register("guestName")}
              />
              <TextInput
                label="Email"
                placeholder="maria@example.com"
                leftSection={<Mail size={16} />}
                disabled={isPublicInactive}
                error={guestForm.formState.errors.guestEmail?.message}
                {...guestForm.register("guestEmail")}
              />
              <Button
                type="submit"
                color="dark"
                disabled={
                  isPreview ||
                  isPublicInactive ||
                  !selectedSlot ||
                  slotsQuery.isPending
                }
                loading={bookingMutation.isPending}
              >
                {isPreview ? "Preview only" : "Confirm booking"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}
