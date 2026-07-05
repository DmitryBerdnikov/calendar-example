import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { loginOrganizer } from "../shared/session/auth-api";
import { setSessionToken } from "../shared/session/session-storage";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type RedirectState = {
  from?: {
    pathname?: string;
    search?: string;
  };
};

function getRedirectPath(state: unknown): string {
  const redirectState = state as RedirectState | null;
  const pathname = redirectState?.from?.pathname;

  if (!pathname || pathname === "/login") {
    return "/event-types";
  }

  return `${pathname}${redirectState?.from?.search ?? ""}`;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginMutation = useMutation({
    mutationFn: loginOrganizer,
    onSuccess: (loginResponse) => {
      setSessionToken(loginResponse.token);
      navigate(getRedirectPath(location.state), { replace: true });
    },
  });

  function handleSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Center mih="100vh" p="lg" className="public-surface">
      <Paper withBorder radius="sm" p="xl" maw={420} w="100%">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={1}>Admin sign in</Title>
              <Text c="dimmed">
                Sign in to manage event types, availability, and bookings.
              </Text>
            </Stack>
            {loginMutation.isError ? (
              <Alert color="red" title="Sign in failed">
                Check the email and password, then try again.
              </Alert>
            ) : null}
            <TextInput
              label="Email"
              placeholder="organizer@example.com"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />
            <Button color="dark" type="submit" loading={loginMutation.isPending}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
