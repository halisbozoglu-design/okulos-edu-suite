import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, UserMinus, UserPlus } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absentTeachers, dutyTeachers } from "@/data/mock";

export const Route = createFileRoute("/substitutes")({
  head: () => ({
    meta: [
      { title: "Vekalet Yönetimi — OkulOS" },
      {
        name: "description",
        content:
          "Devamsız öğretmenleri görün ve boştaki nöbetçi öğretmenlere akıllı vekalet ataması yapın.",
      },
      { property: "og:title", content: "Vekalet Yönetimi — OkulOS" },
      {
        property: "og:description",
        content: "Devamsız öğretmen listesi ve uygun nöbetçi öğretmenlerle hızlı vekalet atama.",
      },
    ],
  }),
  component: SubstituteManager,
});

function SubstituteManager() {
  return (
    <AppShell
      title="Vekalet Yöneticisi"
      subtitle="Bugün 3 devamsızlık kaydı"
      action={<Badge variant="secondary">İdareci</Badge>}
    >
      <Button size="lg" className="w-full gap-2">
        <Sparkles className="size-4" />
        Vekilleri Ata (Akıllı Eşleştirme)
      </Button>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Devamsız Öğretmenler</h2>
        <ul className="space-y-3">
          {absentTeachers.map((t) => (
            <li key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                    <UserMinus className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.branch} · {t.reason}
                    </p>
                  </div>
                </div>
                <Badge variant={t.status === "assigned" ? "secondary" : "destructive"}>
                  {t.status === "assigned" ? "Atandı" : "Bekliyor"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.lessons.map((l) => (
                  <span
                    key={l}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Uygun Nöbetçi Öğretmenler
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {dutyTeachers.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <UserPlus className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.branch} · {d.freeHours} boş saat
                </p>
              </div>
              <Badge
                variant={d.load === "Uygun" ? "secondary" : "outline"}
                className="shrink-0 gap-1"
              >
                {d.load === "Uygun" ? <CheckCircle2 className="size-3" /> : null}
                {d.load}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}