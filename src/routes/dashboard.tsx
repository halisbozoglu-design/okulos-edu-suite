import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, ClipboardList, FileText, Shield, Wallet } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { StatWidget } from "@/components/okulos/StatWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documents, payslip, scheduleRows } from "@/data/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Öğretmen Paneli — OkulOS" },
      {
        name: "description",
        content: "Günlük özet, nöbet durumu, haftalık ders programı, ek ders ve belgeleriniz.",
      },
      { property: "og:title", content: "Öğretmen Paneli — OkulOS" },
      {
        property: "og:description",
        content: "Günlük özet, nöbet durumu, haftalık program ve ek ders bilgileriniz tek ekranda.",
      },
    ],
  }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const total = payslip.reduce((sum, r) => sum + r.hours * r.rate, 0);

  return (
    <AppShell
      title="Merhaba, Ayşe Hanım"
      subtitle="18 Ağustos 2026, Salı"
      action={<Badge variant="secondary">Öğretmen</Badge>}
    >
      <Button variant="destructive" size="lg" className="h-14 w-full gap-2 text-base font-semibold">
        <AlertTriangle className="size-5" />
        KRİZ / DEVAMSIZLIK BİLDİR
      </Button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatWidget
          icon={ClipboardList}
          label="Bugünün Özeti"
          value="5 Ders"
          hint="2 boş saat · 1 nöbet"
        />
        <StatWidget icon={Shield} label="Nöbet Durumu" value="Aktif" hint="A Blok · 2. Kat" />
      </div>

      <Tabs defaultValue="schedule" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="schedule" className="flex-1">
            Program
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex-1">
            Ek Ders
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex-1">
            Belgeler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["Saat", "Pzt", "Sal", "Çar", "Per", "Cum"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((r) => (
                  <tr key={r.hour} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{r.hour}</td>
                    {[r.mon, r.tue, r.wed, r.thu, r.fri].map((c, i) => (
                      <td key={i} className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              <span className="text-xs font-medium">Ağustos 2026 Tahmini</span>
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {total.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
            </p>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {payslip.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.hours} saat × {row.rate} ₺
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {(row.hours * row.rate).toLocaleString("tr-TR")} ₺
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} · {doc.date}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  İndir
                </Button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-primary-soft px-4 py-3 text-xs text-accent-foreground">
        <CalendarDays className="size-4 shrink-0" />
        Yarınki nöbet yeriniz: Bahçe / Kantin bölgesi.
      </div>
    </AppShell>
  );
}