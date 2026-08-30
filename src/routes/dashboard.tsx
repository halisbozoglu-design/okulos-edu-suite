import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ClipboardList, Clock3, FileLock2, FileText, Phone, Shield, Sparkles, Wallet } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Öğretmen Paneli — OkulOS" },
      { name: "description", content: "Yayınlanmış ders programı, nöbet, ek ders ve belgeleriniz." },
    ],
  }),
  component: TeacherDashboard,
});

type CrisisResult = {
  dutyVicePrincipal: { full_name: string | null; phone: string | null } | null;
  instruction: string;
  lessonCount: number;
};

type PublishedScheduleRow = {
  publication_id: string;
  effective_from: string;
  academic_year: string | null;
  title: string;
  schedule_hash: string;
  weekday: number;
  period: number;
  class_id: string | null;
  class_name: string;
  subject: string;
  classroom: string | null;
  subgroup_id: string | null;
  subgroup_key: string | null;
  is_group_split: boolean;
};

type ProfileSummary = {
  full_name: string | null;
  role: "admin" | "manager" | "teacher";
};

const dayColumns = [
  { id: 1, short: "Pzt" },
  { id: 2, short: "Sal" },
  { id: 3, short: "Çar" },
  { id: 4, short: "Per" },
  { id: 5, short: "Cum" },
] as const;

function TeacherDashboard() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [schedule, setSchedule] = useState<PublishedScheduleRow[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [hasMedicalReport, setHasMedicalReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [crisisError, setCrisisError] = useState<string | null>(null);
  const [crisisResult, setCrisisResult] = useState<CrisisResult | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !active) return;

      const [profileRes, scheduleRes] = await Promise.all([
        supabase.from("profiles").select("full_name,role").eq("user_id", userData.user.id).maybeSingle(),
        supabase.rpc("get_my_published_schedule"),
      ]);

      if (!active) return;
      if (profileRes.data) setProfile(profileRes.data as ProfileSummary);
      if (scheduleRes.error) {
        setScheduleError("Yayınlanmış ders programınız yüklenemedi.");
      } else {
        setSchedule((scheduleRes.data ?? []) as PublishedScheduleRow[]);
      }
      setScheduleLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const maxPeriod = useMemo(() => Math.max(8, ...schedule.map((row) => row.period)), [schedule]);
  const periods = useMemo(() => Array.from({ length: maxPeriod }, (_, i) => i + 1), [maxPeriod]);
  const todayWeekday = (() => {
    const nativeDay = new Date().getDay();
    return nativeDay >= 1 && nativeDay <= 5 ? nativeDay : null;
  })();
  const todayLessons = useMemo(
    () => todayWeekday ? schedule.filter((row) => row.weekday === todayWeekday).length : 0,
    [schedule, todayWeekday],
  );
  const publication = schedule[0] ?? null;

  function cellRows(day: number, period: number) {
    return schedule.filter((row) => row.weekday === day && row.period === period);
  }

  async function reportAbsence() {
    setSubmitting(true);
    setCrisisError(null);
    const { data, error } = await supabase.functions.invoke("report-absence", { body: { hasMedicalReport } });
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

  const displayName = profile?.full_name?.trim() || "Öğretmen";
  const roleLabel = profile?.role === "admin" ? "Yönetici" : profile?.role === "manager" ? "Müdür Yardımcısı" : "Öğretmen";

  return (
    <AppShell
      title={`Merhaba, ${displayName}`}
      subtitle={new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })}
      action={<Badge variant="secondary">{roleLabel}</Badge>}
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
        <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--color-primary-strong),var(--color-primary))] p-5 text-primary-foreground shadow-lg shadow-primary/20 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80"><Sparkles className="size-4" /> Günlük görünüm</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Bugünün okul akışı hazır.</h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-primary-foreground/80">Yayınlanmış programınızı, bildirimlerinizi ve hızlı işlemleri tek yerden takip edin.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-primary-foreground/75">Bugün</p>
              <p className="mt-1 flex items-center gap-2 text-xl font-semibold"><Clock3 className="size-4" /> {scheduleLoading ? "…" : `${todayLessons} ders`}</p>
            </div>
          </div>
          <DialogTrigger asChild>
            <Button variant="secondary" size="lg" className="mt-6 h-12 w-full gap-2 border border-white/15 bg-white/15 font-semibold text-primary-foreground shadow-none hover:bg-white/25 sm:w-auto">
              <AlertTriangle className="size-5" /> KRİZ / DEVAMSIZLIK BİLDİR
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Devamsızlık Bildirimi</DialogTitle>
            <DialogDescription>Bugünkü dersleriniz vekalet planına alınacaktır.</DialogDescription>
          </DialogHeader>
          {!crisisResult ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <Checkbox id="medical-report" checked={hasMedicalReport} onCheckedChange={(checked) => setHasMedicalReport(checked === true)} />
                <Label htmlFor="medical-report" className="cursor-pointer text-sm font-medium">Raporum var</Label>
              </div>
              {crisisError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{crisisError}</div> : null}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCrisisOpen(false)}>Vazgeç</Button>
                <Button variant="destructive" onClick={reportAbsence} disabled={submitting}>{submitting ? "Kaydediliyor..." : "Bildirimi Gönder"}</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
                <p className="text-xs font-medium text-muted-foreground">Bugünkü nöbetçi müdür yardımcısı</p>
                <p className="mt-1 text-base font-semibold">{crisisResult.dutyVicePrincipal?.full_name ?? "Nöbetçi idareci tanımlanmamış"}</p>
                {crisisResult.dutyVicePrincipal?.phone ? (
                  <a href={`tel:${crisisResult.dutyVicePrincipal.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Phone className="size-4" /> {crisisResult.dutyVicePrincipal.phone}
                  </a>
                ) : null}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>MEBBİS hatırlatması:</strong> {crisisResult.instruction}</div>
              <p className="text-xs text-muted-foreground">{crisisResult.lessonCount} ders vekalet planına aktarıldı.</p>
              <Button className="w-full" onClick={() => setCrisisOpen(false)}>Tamam</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatWidget icon={ClipboardList} label="Bugünün Programı" value={scheduleLoading ? "…" : `${todayLessons} Ders`} hint={todayWeekday ? "Yayınlanmış program" : "Hafta sonu"} />
        <StatWidget icon={Shield} label="Program Kaynağı" value={publication ? "Yayınlanmış" : "Bekliyor"} hint={publication ? `Başlangıç: ${new Date(`${publication.effective_from}T00:00:00`).toLocaleDateString("tr-TR")}` : "İdare henüz program yayınlamadı"} />
      </div>

      <Tabs defaultValue="schedule" className="mt-6">
        <TabsList className="h-11 w-full rounded-2xl bg-muted/75 p-1">
          <TabsTrigger value="schedule" className="flex-1">Program</TabsTrigger>
          <TabsTrigger value="payroll" className="flex-1">Ek Ders</TabsTrigger>
          <TabsTrigger value="docs" className="flex-1">Belgeler</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4 space-y-3">
          {scheduleError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{scheduleError}</div> : null}
          {!scheduleLoading && !scheduleError && !publication ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2"><FileLock2 className="mt-0.5 size-4 shrink-0" /><div><b>Yürürlükte yayınlanmış ders programı bulunmuyor.</b> Taslak programlar öğretmen ekranında gösterilmez. İdare programı “Yayınla / Kullanıma Al” işleminden sonra burada görebilirsiniz.</div></div>
            </div>
          ) : null}
          {publication ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-950">
              <b>{publication.title}</b> · {publication.academic_year ?? "Eğitim yılı belirtilmemiş"} · İçerik özeti: <span className="font-mono">{publication.schedule_hash.slice(0, 12)}…</span>
            </div>
          ) : null}
          {schedule.length ? (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-slate-950/[0.02]">
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
                <div><p className="text-sm font-semibold">Haftalık program</p><p className="text-xs text-muted-foreground">Yayınlanmış dersler</p></div>
                <CalendarDays className="size-4 text-primary" />
              </div>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left font-medium">Saat</th>{dayColumns.map((day) => <th key={day.id} className="px-3 py-2 text-left font-medium">{day.short}</th>)}</tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period} className="border-t border-border align-top">
                      <td className="whitespace-nowrap px-3 py-3 font-semibold">{period}. Ders</td>
                      {dayColumns.map((day) => {
                        const rows = cellRows(day.id, period);
                        return <td key={day.id} className="min-w-32 px-3 py-3">{rows.length ? rows.map((row) => (
                          <div key={`${row.publication_id}-${day.id}-${period}-${row.class_id}-${row.subgroup_key ?? "main"}`} className="mb-1 rounded-lg bg-primary-soft p-2 last:mb-0">
                            <p className="font-semibold text-foreground">{row.subject}</p>
                            <p className="text-xs text-muted-foreground">{row.class_name}{row.subgroup_key ? ` · ${row.subgroup_key}` : ""}</p>
                            {row.classroom ? <p className="text-[11px] text-muted-foreground">{row.classroom}</p> : null}
                          </div>
                        )) : <span className="text-xs text-muted-foreground">—</span>}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground"><Wallet className="size-4 text-primary" /> Ek Ders</div>
            <p className="mt-2">Öğretmen kişisel puantajı, onaylanmış ek ders verileri öğretmen görünümüne bağlandığında burada gösterilecektir. Tahmini veya mock ücret gösterilmez.</p>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground"><FileText className="size-4 text-primary" /> Belgelerim</div>
            <p className="mt-2">Yayınlanmış tebliğ belgeleri ve kullanıcıya atanmış gerçek evraklar bağlandığında burada listelenecektir. Örnek belge gösterilmez.</p>
          </div>
        </TabsContent>
      </Tabs>

      {publication ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-primary-soft px-4 py-3 text-xs text-accent-foreground">
          <CalendarDays className="size-4 shrink-0" /> Bu ekran yalnız değiştirilemez, yürürlükteki yayınlanmış ders programını gösterir.
        </div>
      ) : null}
    </AppShell>
  );
}
