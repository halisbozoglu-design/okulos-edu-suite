import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Plus, Wand2 } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vicePrincipals, weekDays } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "İdareci Nöbet Rotasyonu — OkulOS" },
      {
        name: "description",
        content:
          "Müdür yardımcılarını tanımlayın, nöbet günlerini atayın ve aylık rotasyonu otomatik oluşturun.",
      },
      { property: "og:title", content: "İdareci Nöbet Rotasyonu — OkulOS" },
      {
        property: "og:description",
        content: "Müdür yardımcısı nöbet günleri ve aylık otomatik rotasyon takvimi.",
      },
    ],
  }),
  component: DutyRotationSettings,
});

const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);

function DutyRotationSettings() {
  return (
    <AppShell title="Ayarlar & Nöbet Rotasyonu" subtitle="Ağustos 2026">
      <Button size="lg" className="w-full gap-2">
        <Wand2 className="size-4" />
        Aylık Otomatik Doldur
      </Button>

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Müdür Yardımcısı Tanımla</h2>
        <form className="mt-3 space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="vp-name">Ad Soyad</Label>
            <Input id="vp-name" placeholder="Örn. Hakan Toprak" />
          </div>
          <div className="space-y-2">
            <Label>Nöbet Günleri</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" variant="secondary" className="w-full gap-2">
            <Plus className="size-4" />
            Ekle
          </Button>
        </form>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Tanımlı İdareciler</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {vicePrincipals.map((vp) => (
            <li key={vp.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <p className="truncate text-sm font-medium">{vp.name}</p>
              <div className="flex shrink-0 gap-1">
                {weekDays.map((d) => (
                  <span
                    key={d}
                    className={cn(
                      "grid size-7 place-items-center rounded-md text-[11px] font-medium",
                      vp.days.includes(d)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {d[0]}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <CalendarRange className="size-4" />
          Aylık Rotasyon Döngüsü
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
          <div className="grid min-w-[560px] grid-cols-10 gap-2">
            {monthDays.map((d) => {
              const vp = vicePrincipals[(d - 1) % vicePrincipals.length]!;
              return (
                <div key={d} className="rounded-lg border border-border bg-background p-2">
                  <p className="text-[11px] text-muted-foreground">{d}</p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-primary">
                    {vp.name.split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}