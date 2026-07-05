import { Text } from "@mantine/core";
import { useParams } from "react-router-dom";

import { PageShell } from "../shared/ui/page-shell";

export function EventTypeEditPage() {
  const { id } = useParams();

  return (
    <PageShell
      title="Edit Event Type"
      description="Edit form wiring will be added in the event type slice."
    >
      <Text c="dimmed">Route parameter: {id}</Text>
    </PageShell>
  );
}
