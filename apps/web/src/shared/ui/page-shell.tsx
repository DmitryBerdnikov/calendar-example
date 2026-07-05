import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type PageShellProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    to: string;
  };
  children?: ReactNode;
};

export function PageShell({
  title,
  description,
  action,
  children,
}: PageShellProps) {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" gap="md">
        <Stack gap={4}>
          <Title order={2}>{title}</Title>
          <Text c="dimmed" maw={720}>
            {description}
          </Text>
        </Stack>
        {action ? (
          <Button component={Link} to={action.to} color="dark">
            {action.label}
          </Button>
        ) : null}
      </Group>
      <Paper withBorder radius="sm" p="lg">
        {children ?? (
          <Text c="dimmed">This screen is ready for the next feature slice.</Text>
        )}
      </Paper>
    </Stack>
  );
}
