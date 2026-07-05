import { Table, Text } from "@mantine/core";

import { PageShell } from "../../shared/ui/page-shell";

export function AvailabilityPage() {
  return (
    <PageShell
      title="Availability"
      description="Configure weekly rules that define when bookings may start."
    >
      <Table.ScrollContainer minWidth={480}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Weekday</Table.Th>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed">Availability rules will load here.</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </PageShell>
  );
}
