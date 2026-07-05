import {
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Organizer } from "@scheduling/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Clock3, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import {
  NavLink as RouterNavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { clearSessionToken } from "../shared/session/session-storage";

const navItems = [
  {
    icon: Layers3,
    label: "Event Types",
    to: "/event-types",
  },
  {
    icon: Clock3,
    label: "Availability",
    to: "/availability",
  },
  {
    icon: CalendarCheck,
    label: "Bookings",
    to: "/bookings",
  },
];

type AdminShellProps = {
  children: ReactNode;
  organizer: Organizer;
};

export function AdminShell({ children, organizer }: AdminShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleSignOut() {
    clearSessionToken();
    queryClient.removeQueries({ queryKey: ["session", "organizer"] });
    navigate("/login", { replace: true });
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 248,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={1} className="app-title">
              Scheduling
            </Title>
          </Group>
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {organizer.name}
            </Text>
            <Button
              variant="subtle"
              size="xs"
              color="dark"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box className="nav-stack">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                component={RouterNavLink}
                to={item.to}
                label={item.label}
                active={active}
                leftSection={<Icon size={18} strokeWidth={1.8} />}
              />
            );
          })}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
