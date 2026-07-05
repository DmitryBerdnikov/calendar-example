import { Table, Text } from "@mantine/core";

import { PageShell } from "../shared/ui/page-shell";

export function EventTypesPage() {
  return (
    <PageShell
      title="Event Types"
      description="Manage public booking options and preview their booking pages."
      action={{ label: "New event type", to: "/event-types/new" }}
    >
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Updated</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c="dimmed">Event type data will load here.</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </PageShell>
  );
}
