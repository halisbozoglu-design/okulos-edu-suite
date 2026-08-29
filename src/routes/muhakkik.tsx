import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { MuhakkikWizard } from "@/components/muhakkik/MuhakkikWizard";

export const Route = createFileRoute("/muhakkik")({
  head: () => ({ meta: [{ title: "Muhakkik Soruşturma — OkulOS" }] }),
  component: MuhakkikPage,
});

function MuhakkikPage() {
  return (
    <AppShell title="Muhakkik Soruşturma" subtitle="Dosya yükle · ifade sırası · ekler · TKB muhakkik raporu" action={<Scale className="size-5" />}>
      <MuhakkikWizard />
    </AppShell>
  );
}
