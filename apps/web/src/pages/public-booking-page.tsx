import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { useParams } from "react-router-dom";

export function PublicBookingPage() {
  const { slug } = useParams();

  return (
    <Center mih="100vh" p="lg" className="public-surface">
      <Paper withBorder radius="sm" p="xl" maw={560} w="100%">
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={1}>Book a time</Title>
            <Text c="dimmed">
              Public booking flow for `{slug}` will be added in a later slice.
            </Text>
          </Stack>
          <Button color="dark" disabled>
            Select a time
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
