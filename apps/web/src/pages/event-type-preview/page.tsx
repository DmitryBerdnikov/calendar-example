import { Text } from "@mantine/core";
import { useParams } from "react-router-dom";

import { PageShell } from "../../shared/ui/page-shell";

export function EventTypePreviewPage() {
  const { id } = useParams();

  return (
    <PageShell
      title="Event Type Preview"
      description="Preview will render the public booking flow for this event type."
    >
      <Text c="dimmed">Route parameter: {id}</Text>
    </PageShell>
  );
}
