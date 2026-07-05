import { Button, Center, Paper, Stack, Text, TextInput, Title } from "@mantine/core";

export function LoginPage() {
  return (
    <Center mih="100vh" p="lg" className="public-surface">
      <Paper withBorder radius="sm" p="xl" maw={420} w="100%">
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={1}>Admin sign in</Title>
            <Text c="dimmed">
              Authentication wiring will be added in the login slice.
            </Text>
          </Stack>
          <TextInput label="Email" placeholder="organizer@example.com" disabled />
          <TextInput label="Password" placeholder="Password" disabled />
          <Button color="dark" disabled>
            Sign in
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
