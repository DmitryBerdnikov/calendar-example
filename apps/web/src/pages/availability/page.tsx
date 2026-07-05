import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AvailabilityRule } from "@scheduling/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { apiClient } from "../../shared/api/client";
import {
  ApiRequestError,
  throwApiRequestError,
} from "../../shared/api/request-error";
import { getSessionToken } from "../../shared/session/session-storage";
import { PageShell } from "../../shared/ui/page-shell";

type Weekday = AvailabilityRule["weekday"];

type Feedback = {
  color: "green" | "red";
  title: string;
  message: string;
};

type AvailabilityFormValues = {
  weekday: Weekday;
  startTime: string;
  endTime: string;
};

type SaveRuleVariables = {
  mode: "create" | "update";
  id?: string;
  values: AvailabilityFormValues;
};

const availabilityQueryKey = ["availability"] as const;
const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const weekdayOptions: Array<{ value: Weekday; label: string }> = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];
const defaultAvailabilityFormValues: AvailabilityFormValues = {
  weekday: "monday",
  startTime: "09:00",
  endTime: "17:00",
};

const availabilityFormSchema = z
  .object({
    weekday: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    startTime: z.string().trim().regex(timePattern, "Use HH:mm format"),
    endTime: z.string().trim().regex(timePattern, "Use HH:mm format"),
  })
  .refine((values) => values.startTime < values.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
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

function formatWeekday(weekday: Weekday): string {
  return (
    weekdayOptions.find((option) => option.value === weekday)?.label ?? weekday
  );
}

function toFormValues(rule: AvailabilityRule): AvailabilityFormValues {
  return {
    weekday: rule.weekday,
    startTime: rule.startTime,
    endTime: rule.endTime,
  };
}

function normalizeValues(values: AvailabilityFormValues): AvailabilityFormValues {
  return {
    weekday: values.weekday,
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
  };
}

export function AvailabilityPage() {
  const queryClient = useQueryClient();
  const sessionToken = getSessionToken() ?? "";
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AvailabilityRule | null>(null);
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: defaultAvailabilityFormValues,
  });
  const availabilityQuery = useQuery({
    queryKey: availabilityQueryKey,
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET("/availability", {
        headers: authorizationHeaders(sessionToken),
      });

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return data;
    },
  });
  const saveMutation = useMutation({
    mutationFn: async ({ mode, id, values }: SaveRuleVariables) => {
      if (mode === "update") {
        const { data, error, response } = await apiClient.PATCH(
          "/availability/{id}",
          {
            headers: authorizationHeaders(sessionToken),
            params: {
              path: {
                id: id ?? "",
              },
            },
            body: values,
          },
        );

        if (!data) {
          throwApiRequestError(response.status, error);
        }

        return { mode, rule: data };
      }

      const { data, error, response } = await apiClient.POST("/availability", {
        headers: authorizationHeaders(sessionToken),
        body: values,
      });

      if (!data) {
        throwApiRequestError(response.status, error);
      }

      return { mode, rule: data };
    },
    onSuccess: ({ mode, rule }) => {
      queryClient.setQueryData<AvailabilityRule[]>(
        availabilityQueryKey,
        (rules = []) => {
          if (mode === "update") {
            return rules.map((existingRule) =>
              existingRule.id === rule.id ? rule : existingRule,
            );
          }

          return [...rules, rule];
        },
      );
      setEditingRule(null);
      form.reset(defaultAvailabilityFormValues);
      setFeedback({
        color: "green",
        title:
          mode === "update"
            ? "Availability rule updated"
            : "Availability rule created",
        message: `${formatWeekday(rule.weekday)} ${rule.startTime}-${rule.endTime} saved.`,
      });
    },
    onError: (error) => {
      setFeedback({
        color: "red",
        title: "Availability rule could not be saved",
        message: getErrorMessage(error, "The availability save request failed."),
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (rule: AvailabilityRule) => {
      const { error, response } = await apiClient.DELETE("/availability/{id}", {
        headers: authorizationHeaders(sessionToken),
        params: {
          path: {
            id: rule.id,
          },
        },
      });

      if (!response.ok) {
        throwApiRequestError(response.status, error);
      }

      return rule;
    },
    onSuccess: (rule) => {
      queryClient.setQueryData<AvailabilityRule[]>(
        availabilityQueryKey,
        (rules = []) =>
          rules.filter((existingRule) => existingRule.id !== rule.id),
      );
      setDeleteTarget(null);
      if (editingRule?.id === rule.id) {
        setEditingRule(null);
        form.reset(defaultAvailabilityFormValues);
      }
      setFeedback({
        color: "green",
        title: "Availability rule deleted",
        message: `${formatWeekday(rule.weekday)} ${rule.startTime}-${rule.endTime} deleted.`,
      });
    },
    onError: (error) => {
      setFeedback({
        color: "red",
        title: "Availability rule could not be deleted",
        message: getErrorMessage(
          error,
          "The availability delete request failed.",
        ),
      });
    },
  });
  const formMode = editingRule ? "update" : "create";

  function handleSubmit(values: AvailabilityFormValues) {
    saveMutation.mutate({
      mode: formMode,
      id: editingRule?.id,
      values: normalizeValues(values),
    });
  }

  function handleEdit(rule: AvailabilityRule) {
    setFeedback(null);
    setEditingRule(rule);
    form.reset(toFormValues(rule));
  }

  function handleCancelEdit() {
    setEditingRule(null);
    form.reset(defaultAvailabilityFormValues);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget);
  }

  return (
    <PageShell
      title="Availability"
      description="Configure weekly rules that define when bookings may start."
    >
      <Stack gap="lg">
        {feedback ? (
          <Alert color={feedback.color} title={feedback.title}>
            {feedback.message}
          </Alert>
        ) : null}
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack gap="md">
            <Group align="flex-start" grow>
              <Controller
                name="weekday"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Weekday"
                    data={weekdayOptions}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(value) =>
                      field.onChange((value ?? "monday") as Weekday)
                    }
                    error={fieldState.error?.message}
                    allowDeselect={false}
                  />
                )}
              />
              <TextInput
                label="Start time"
                placeholder="09:00"
                error={form.formState.errors.startTime?.message}
                {...form.register("startTime")}
              />
              <TextInput
                label="End time"
                placeholder="17:00"
                error={form.formState.errors.endTime?.message}
                {...form.register("endTime")}
              />
            </Group>
            <Group justify="flex-end">
              {editingRule ? (
                <Button
                  type="button"
                  variant="subtle"
                  color="dark"
                  leftSection={<X size={16} />}
                  onClick={handleCancelEdit}
                >
                  Cancel edit
                </Button>
              ) : null}
              <Button
                type="submit"
                color="dark"
                loading={saveMutation.isPending}
                leftSection={
                  formMode === "update" ? <Save size={16} /> : <Plus size={16} />
                }
              >
                {formMode === "update" ? "Save rule" : "Create rule"}
              </Button>
            </Group>
          </Stack>
        </form>

        {availabilityQuery.isPending ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : null}
        {availabilityQuery.isError ? (
          <Alert color="red" title="Availability rules could not load">
            {getErrorMessage(
              availabilityQuery.error,
              "Refresh the page and try again.",
            )}
          </Alert>
        ) : null}
        {availabilityQuery.isSuccess ? (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Weekday</Table.Th>
                  <Table.Th>Start</Table.Th>
                  <Table.Th>End</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {availabilityQuery.data.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed">No availability rules yet.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  availabilityQuery.data.map((rule) => (
                    <Table.Tr key={rule.id}>
                      <Table.Td>
                        <Text fw={600}>{formatWeekday(rule.weekday)}</Text>
                      </Table.Td>
                      <Table.Td>{rule.startTime}</Table.Td>
                      <Table.Td>{rule.endTime}</Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <Button
                            type="button"
                            variant="subtle"
                            size="xs"
                            color="dark"
                            leftSection={<Edit3 size={14} />}
                            onClick={() => handleEdit(rule)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="subtle"
                            size="xs"
                            color="red"
                            leftSection={<Trash2 size={14} />}
                            loading={
                              deleteMutation.isPending &&
                              deleteMutation.variables?.id === rule.id
                            }
                            onClick={() => setDeleteTarget(rule)}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : null}
      </Stack>
      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={
          deleteTarget
            ? `Delete ${formatWeekday(deleteTarget.weekday)} ${deleteTarget.startTime}-${deleteTarget.endTime}?`
            : "Delete availability rule?"
        }
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            This removes the rule from future slot generation.
          </Text>
          <Group justify="flex-end">
            <Button
              type="button"
              variant="subtle"
              color="dark"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="red"
              loading={deleteMutation.isPending}
              leftSection={<Trash2 size={16} />}
              onClick={handleDeleteConfirm}
            >
              Delete rule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </PageShell>
  );
}
