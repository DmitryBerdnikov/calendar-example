import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Center mih="100vh" p="lg">
      <Paper withBorder radius="sm" p="xl" maw={420} w="100%">
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={1}>Page not found</Title>
            <Text c="dimmed">The requested route does not exist.</Text>
          </Stack>
          <Button component={Link} to="/event-types" color="dark">
            Go to Event Types
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
