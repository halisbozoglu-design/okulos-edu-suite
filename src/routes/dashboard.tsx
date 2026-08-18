import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CalendarDays, ClipboardList, FileText, Phone, Shield, Wallet } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { StatWidget } from "@/components/okulos/StatWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documents, payslip, scheduleRows } from "@/data/mock";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Öğretmen Paneli — OkulOS" },
      {
        name: "description",
        content: "Günlük özet, nöbet durumu, haftalık ders programı, ek ders ve belgeleriniz.",
      },
    ],
  }),
  component: TeacherDashboard,
});

type CrisisResult = {
  dutyVicePrincipal: { full_name: string | null; phone: string | null } | null;
  instruction: string;
  lessonCount: number;
};

function TeacherDashboard() {
  const total = payslip.reduce((sum, r) => sum + r.hours * r.rate, 0);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [hasMedicalReport, setHasMedicalReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [crisisError, setCrisisError] = useState<string | null>(null);
  const [crisisResult, setCrisisResult] = useState<CrisisResult | null>(null);

  async function reportAbsence() {
    setSubmitting(true);
    setCrisisError(null);
    const { data, error } = await supabase.functions.invoke("report-absence", {
      body: { hasMedicalReport },
    });
    setSubmitting(false);

    if (error || !data?.ok) {
      setCrisisError("Devamsızlık bildirimi kaydedilemedi. Lütfen tekrar deneyiniz.");
      return;
    }

    setCrisisResult({
      dutyVicePrincipal: data.dutyVicePrincipal ?? null,
      instruction: data.instruction,
      lessonCount: data.lessonCount ?? 0,
    });
  }

  return (
    <AppShell
      title="Merhaba, Ayşe Hanım"
      subtitle="18 Ağustos 2026, Salı"
      action={<Badge variant="secondary">Öğretmen</Badge>}
    >
      <Dialog
        open={crisisOpen}
        onOpenChange={(open) => {
          setCrisisOpen(open);
          if (!open) {
            setCrisisError(null);
            setCrisisResult(null);
            setHasMedicalReport(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" size="lg" className="h-14 w-full gap-2 text-base font-semibold">
            <AlertTriangle className="size-5" />
            KRİZ / DEVAMSIZLIK BİLDİR
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Devamsızlık Bildirimi</DialogTitle>
            <DialogDescription>
              Bugünkü dersleriniz vekalet planına alınacaktır.
            </DialogDescription>
          </DialogHeader>

          {!crisisResult ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <Checkbox
                  id="medical-report"
                  checked={hasMedicalReport}
                  onCheckedChange={(checked) => setHasMedicalReport(checked === true)}
                />
                <Label htmlFor="medical-report" className="cursor-pointer text-sm font-medium">
                  Raporum var
                </Label>
              </div>

              {crisisError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {crisisError}
                </div>
              ) : null}

              <DialogFooter>
                <Button variant="outline" onClick={() => setCrisisOpen(false)}>
                  Vazgeç
                </Button>
                <Button variant="destructive" onClick={reportAbsence} disabled={submitting}>
                  {submitting ? "Kaydediliyor..." : "Bildirimi Gönder"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
                <p className="text-xs font-medium text-muted-foreground">Bugünkü nöbetçi müdür yardımcısı</p>
                <p className="mt-1 text-base font-semibold">
                  {crisisResult.dutyVicePrincipal?.full_name ?? "Nöbetçi idareci tanımlanmamış"}
                </p>
                {crisisResult.dutyVicePrincipal?.phone ? (
                  <a
                    href={`tel:${crisisResult.dutyVicePrincipal.phone}`}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    <Phone className="size-4" />
                    {crisisResult.dutyVicePrincipal.phone}
                  </a>
                ) : null}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <strong>MEBBİS hatırlatması:</strong> {crisisResult.instruction}
              </div>
              <p className="text-xs text-muted-foreground">
                {crisisResult.lessonCount} ders vekalet planına aktarıldı.
              </p>
              <Button className="w-full" onClick={() => setCrisisOpen(false)}>
                Tamam
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatWidget icon={ClipboardList} label="Bugünün Özeti" value="5 Ders" hint="2 boş saat · 1 nöbet" />
        <StatWidget icon={Shield} label="Nöbet Durumu" value="Aktif" hint="A Blok · 2. Kat" />
      </div>

      <Tabs defaultValue="schedule" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="schedule" className="flex-1">Program</TabsTrigger>
          <TabsTrigger value="payroll" className="flex-1">Ek Ders</TabsTrigger>
          <TabsTrigger value="docs" className="flex-1">Belgeler</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["Saat", "Pzt", "Sal", "Çar", "Per", "Cum"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((r) => (
                  <tr key={r.hour} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{r.hour}</td>
                    {[r.mon, r.tue, r.wed, r.thu, r.fri].map((c, i) => (
                      <td key={i} className="whitespace-nowrap px-3 py-2 text-muted-foreground">{c}</td>
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
                  <p className="text-xs text-muted-foreground">{row.hours} saat × {row.rate} ₺</p>
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
                  <p className="text-xs text-muted-foreground">{doc.type} · {doc.date}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">İndir</Button>
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
