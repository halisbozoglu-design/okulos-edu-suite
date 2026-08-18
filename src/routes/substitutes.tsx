import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Sparkles, UserMinus, UserPlus } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/substitutes")({
  head: () => ({
    meta: [
      { title: "Vekalet Yönetimi — OkulOS" },
      {
        name: "description",
        content: "Devamsız öğretmenleri görün ve nöbetçi öğretmen önceliğiyle akıllı vekalet ataması yapın.",
      },
    ],
  }),
  component: SubstituteManager,
});

type Profile = { user_id: string; full_name: string | null };
type Crisis = {
  id: string;
  teacher_id: string;
  has_medical_report: boolean;
  status: string;
};
type Lesson = {
  id: string;
  crisis_report_id: string;
  teacher_id: string;
  period: number;
  class_name: string;
  subject: string;
};
type Assignment = {
  id: string;
  absence_lesson_id: string;
  substitute_user_id: string;
  notified_at: string | null;
};

type EngineAssignment = {
  assignment_id: string;
  absence_lesson_id: string;
  substitute_user_id: string;
  substitute_name: string;
  period: number;
  class_name: string;
  subject: string;
};

function istanbulToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function SubstituteManager() {
  const today = useMemo(istanbulToday, []);
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dutyTeacherIds, setDutyTeacherIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEngineResult, setLastEngineResult] = useState<EngineAssignment[]>([]);
  const [notifiedCount, setNotifiedCount] = useState(0);

  const loadOverview = useCallback(async () => {
    setError(null);
    const [crisisRes, lessonRes, assignmentRes, dutyRes] = await Promise.all([
      supabase.from("crisis_reports").select("id,teacher_id,has_medical_report,status").eq("report_date", today).order("created_at"),
      supabase.from("absence_lessons").select("id,crisis_report_id,teacher_id,period,class_name,subject").eq("lesson_date", today).order("period"),
      supabase
        .from("substitute_assignments")
        .select("id,absence_lesson_id,substitute_user_id,notified_at,absence_lessons!inner(lesson_date)")
        .eq("absence_lessons.lesson_date", today),
      supabase.from("teacher_duty_assignments").select("teacher_id").eq("duty_date", today),
    ]);

    if (crisisRes.error || lessonRes.error || assignmentRes.error || dutyRes.error) {
      setError("Bugünkü vekalet verileri yüklenemedi.");
      return;
    }

    const crisisRows = (crisisRes.data ?? []) as Crisis[];
    const lessonRows = (lessonRes.data ?? []) as Lesson[];
    const assignmentRows = (assignmentRes.data ?? []).map((row) => ({
      id: row.id,
      absence_lesson_id: row.absence_lesson_id,
      substitute_user_id: row.substitute_user_id,
      notified_at: row.notified_at,
    })) as Assignment[];
    const dutyIds = (dutyRes.data ?? []).map((row) => row.teacher_id);

    setCrises(crisisRows);
    setLessons(lessonRows);
    setAssignments(assignmentRows);
    setDutyTeacherIds(dutyIds);

    const profileIds = Array.from(
      new Set([
        ...crisisRows.map((row) => row.teacher_id),
        ...assignmentRows.map((row) => row.substitute_user_id),
        ...dutyIds,
      ]),
    );

    if (profileIds.length) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("user_id,full_name")
        .in("user_id", profileIds);
      if (!profileError) {
        setProfiles(
          Object.fromEntries(((profileRows ?? []) as Profile[]).map((profile) => [profile.user_id, profile])),
        );
      }
    }
  }, [today]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function assignSubstitutes() {
    setBusy(true);
    setError(null);
    setNotifiedCount(0);
    const { data, error: fnError } = await supabase.functions.invoke("assign-substitutes", {
      body: { date: today },
    });
    setBusy(false);

    if (fnError || !data?.ok) {
      if (data?.error === "NO_SUBSTITUTE_AVAILABLE") {
        setError("Tüm dersleri dolduracak uygun personel bulunamadı. Sistem boş sınıf bırakmamak için atamayı iptal etti.");
      } else {
        setError("Vekalet ataması tamamlanamadı.");
      }
      return;
    }

    setLastEngineResult((data.assignments ?? []) as EngineAssignment[]);
    setNotifiedCount(data.notified ?? 0);
    await loadOverview();
  }

  const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
  const assignedLessonIds = new Set(assignments.map((assignment) => assignment.absence_lesson_id));

  return (
    <AppShell
      title="Vekalet Yöneticisi"
      subtitle={`Bugün ${crises.length} devamsızlık kaydı`}
      action={<Badge variant="secondary">İdareci</Badge>}
    >
      <Button size="lg" className="w-full gap-2" onClick={assignSubstitutes} disabled={busy}>
        <Sparkles className="size-4" />
        {busy ? "Atamalar Yapılıyor..." : "Vekilleri Ata (Akıllı Eşleştirme)"}
      </Button>

      <div className="mt-3 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        Öncelik: <strong className="text-foreground">nöbetçi öğretmen → nöbetçi müdür yardımcısı → diğer müdür yardımcıları</strong>. Aynı öncelik grubunda aylık vekalet yükü en düşük personel seçilir.
      </div>

      {notifiedCount > 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm text-primary">
          <BellRing className="size-4" />
          {notifiedCount} yeni vekalet görevi FCM bildirimiyle iletildi.
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Devamsız Öğretmenler</h2>
        <ul className="space-y-3">
          {crises.map((crisis) => {
            const teacherLessons = lessons.filter((lesson) => lesson.crisis_report_id === crisis.id);
            const fullyAssigned = teacherLessons.length > 0 && teacherLessons.every((lesson) => assignedLessonIds.has(lesson.id));
            return (
              <li key={crisis.id} className="rounded-xl border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <UserMinus className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {profiles[crisis.teacher_id]?.full_name ?? "Öğretmen"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {crisis.has_medical_report ? "Raporlu" : "Devamsızlık bildirimi"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={fullyAssigned ? "secondary" : "destructive"}>
                    {fullyAssigned ? "Atandı" : "Bekliyor"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {teacherLessons.map((lesson) => (
                    <span key={lesson.id} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {lesson.period}. ders · {lesson.class_name} · {lesson.subject}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
          {!crises.length ? (
            <li className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Bugün için devamsızlık bildirimi yok.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Bugünkü Vekalet Atamaları</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {assignments.map((assignment) => {
            const lesson = lessonById[assignment.absence_lesson_id];
            return (
              <li key={assignment.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {profiles[assignment.substitute_user_id]?.full_name ?? "Vekil personel"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lesson ? `${lesson.period}. ders · ${lesson.class_name} · ${lesson.subject}` : "Ders bilgisi"}
                  </p>
                </div>
                <Badge variant={assignment.notified_at ? "secondary" : "outline"} className="shrink-0">
                  {assignment.notified_at ? "Bildirildi" : "Atandı"}
                </Badge>
              </li>
            );
          })}
          {!assignments.length ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">Henüz vekalet ataması yapılmadı.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">1. Öncelik · Nöbetçi Öğretmenler</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {dutyTeacherIds.map((teacherId) => (
            <li key={teacherId} className="flex items-center gap-3 px-4 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <UserPlus className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{profiles[teacherId]?.full_name ?? "Nöbetçi öğretmen"}</p>
                <p className="text-xs text-muted-foreground">Uygun boş derslerde ilk sırada değerlendirilir.</p>
              </div>
              <Badge variant="secondary">Öncelikli</Badge>
            </li>
          ))}
          {!dutyTeacherIds.length ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">Bugün için nöbetçi öğretmen kaydı bulunamadı.</li>
          ) : null}
        </ul>
      </section>

      {lastEngineResult.length ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Son motor çalıştırması {lastEngineResult.length} dersin vekalet planını doğruladı.
        </p>
      ) : null}
    </AppShell>
  );
}
