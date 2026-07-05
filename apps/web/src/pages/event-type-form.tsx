import {
  Alert,
  Button,
  Group,
  NumberInput,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

export const eventTypeFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a title"),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
  description: z.string().trim().min(1, "Enter a description"),
  durationMinutes: z
    .number({ error: "Enter a duration" })
    .int("Enter a whole number")
    .positive("Enter a positive duration"),
  isActive: z.boolean(),
});

export type EventTypeFormValues = z.infer<typeof eventTypeFormSchema>;

type EventTypeFormProps = {
  defaultValues: EventTypeFormValues;
  errorMessage?: string;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: EventTypeFormValues) => void;
};

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeValues(values: EventTypeFormValues): EventTypeFormValues {
  return {
    ...values,
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
  };
}

export function EventTypeForm({
  defaultValues,
  errorMessage,
  isSubmitting,
  submitLabel,
  onSubmit,
}: EventTypeFormProps) {
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const form = useForm<EventTypeFormValues>({
    resolver: zodResolver(eventTypeFormSchema),
    defaultValues,
  });
  const titleInput = form.register("title");
  const slugInput = form.register("slug");

  function handleSubmit(values: EventTypeFormValues) {
    onSubmit(normalizeValues(values));
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        {errorMessage ? (
          <Alert color="red" title="Event type could not be saved">
            {errorMessage}
          </Alert>
        ) : null}
        <TextInput
          label="Title"
          placeholder="Discovery Call"
          error={form.formState.errors.title?.message}
          {...titleInput}
          onChange={(event) => {
            titleInput.onChange(event);

            if (!slugWasEdited) {
              form.setValue("slug", slugifyTitle(event.currentTarget.value), {
                shouldDirty: true,
                shouldValidate: form.formState.isSubmitted,
              });
            }
          }}
        />
        <TextInput
          label="Slug"
          placeholder="discovery-call"
          error={form.formState.errors.slug?.message}
          {...slugInput}
          onChange={(event) => {
            setSlugWasEdited(true);
            slugInput.onChange(event);
          }}
        />
        <Textarea
          label="Description"
          placeholder="A focused discovery session."
          minRows={4}
          error={form.formState.errors.description?.message}
          {...form.register("description")}
        />
        <Controller
          name="durationMinutes"
          control={form.control}
          render={({ field, fieldState }) => (
            <NumberInput
              label="Duration minutes"
              min={1}
              step={5}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(value) => {
                field.onChange(typeof value === "number" ? value : 0);
              }}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Switch
              label="Active"
              checked={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.currentTarget.checked)}
            />
          )}
        />
        <Group justify="space-between">
          <Button
            component={Link}
            to="/event-types"
            variant="subtle"
            color="dark"
            leftSection={<ArrowLeft size={16} />}
          >
            Back
          </Button>
          <Button
            type="submit"
            color="dark"
            loading={isSubmitting}
            leftSection={<Save size={16} />}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
