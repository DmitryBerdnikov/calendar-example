import { Table, Text } from "@mantine/core";

import { PageShell } from "../shared/ui/page-shell";

export function BookingsPage() {
  return (
    <PageShell
      title="Bookings"
      description="Review confirmed and cancelled bookings."
    >
      <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Guest</Table.Th>
              <Table.Th>Event Type</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c="dimmed">Bookings will load here.</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </PageShell>
  );
}
