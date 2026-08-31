import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, Copy, Plus, RefreshCw, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/curriculum")({
  head: () => ({ meta: [{ title: "Müfredat & Ders Dağıtımı — OkulOS" }] }),
  component: CurriculumManager,
});

type SchoolClass = {
  id: string;
  class_name: string;
  composite_key: string | null;
  program_type: string | null;
  expected_weekly_hours: number | null;
  curriculum_status: "draft" | "complete" | "overflow";
};

type Course = { id: string; name: string; short_name: string | null; category: string };
type Teacher = { user_id: string; full_name: string | null };
type Requirement = {
  id: string;
  class_id: string;
  course_id: string;
  weekly_hours: number;
  category: string;
  locked: boolean;
  note: string | null;
};
type Assignment = {
  id: string;
  class_course_requirement_id: string;
  teacher_id: string;
  assigned_hours: number;
  assignment_group: string;
  is_justified_exception: boolean;
  exception_reason: string | null;
};
type Summary = {
  class_id: string;
  expected_weekly_hours: number | null;
  planned_weekly_hours: number;
  assigned_teacher_hours: number;
  curriculum_status: string;
};

function CurriculumManager() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [classId, setClassId] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseHours, setCourseHours] = useState("1");
  const [courseCategory, setCourseCategory] = useState("zorunlu");
  const [assignRequirement, setAssignRequirement] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");
  const [assignmentPermission, setAssignmentPermission] = useState<string | null>(null);
  const [forceException, setForceException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState("");
  const [cloneTarget, setCloneTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, co, t, r, a, s] = await Promise.all([
      supabase.from("school_classes").select("id,class_name,composite_key,program_type,expected_weekly_hours,curriculum_status").eq("active", true).order("composite_key"),
      supabase.from("course_catalog").select("id,name,short_name,category").eq("active", true).order("name"),
      supabase.from("profiles").select("user_id,full_name").eq("role", "teacher").order("full_name"),
      supabase.from("class_course_requirements").select("id,class_id,course_id,weekly_hours,category,locked,note"),
      supabase.from("teacher_course_assignments").select("id,class_course_requirement_id,teacher_id,assigned_hours,assignment_group,is_justified_exception,exception_reason"),
      supabase.from("class_curriculum_summary").select("class_id,expected_weekly_hours,planned_weekly_hours,assigned_teacher_hours,curriculum_status"),
    ]);
    if (c.error || co.error || t.error || r.error || a.error || s.error) {
      setMessage("Müfredat ve ders dağıtımı verileri yüklenemedi.");
      return;
    }
    setClasses((c.data ?? []) as SchoolClass[]);
    setCourses((co.data ?? []) as Course[]);
    setTeachers((t.data ?? []) as Teacher[]);
    setRequirements((r.data ?? []) as Requirement[]);
    setAssignments((a.data ?? []) as Assignment[]);
    setSummaries((s.data ?? []) as Summary[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const requirement = requirements.find((item) => item.id === assignRequirement);
    if (!requirement || !assignTeacher) { setAssignmentPermission(null); setForceException(false); return; }
    let alive = true;
    void supabase.rpc("teacher_course_permission_status", { p_teacher_id: assignTeacher, p_course_id: requirement.course_id }).then(({ data, error }) => {
      if (!alive) return;
      setAssignmentPermission(error ? null : data ?? null);
      if (data !== "NOT_ALLOWED") setForceException(false);
    });
    return () => { alive = false; };
  }, [assignRequirement, assignTeacher, requirements]);

  const selectedClass = classes.find((c) => c.id === classId);
  const selectedSummary = summaries.find((s) => s.class_id === classId);
  const classRequirements = useMemo(() => requirements.filter((r) => r.class_id === classId), [requirements, classId]);
  const courseMap = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);
  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t) => [t.user_id, t.full_name ?? "Öğretmen"])), [teachers]);
  const assignmentMap = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    for (const a of assignments) (map[a.class_course_requirement_id] ??= []).push(a);
    return map;
  }, [assignments]);

  async function saveTargetHours() {
    if (!classId) return;
    const value = Number(targetHours);
    if (!Number.isInteger(value) || value <= 0 || value > 80) { setMessage("Hedef haftalık saat geçerli bir tam sayı olmalıdır."); return; }
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("school_classes").update({ expected_weekly_hours: value }).eq("id", classId);
    if (!error) await supabase.rpc("refresh_class_curriculum_status", { p_class_id: classId });
    setBusy(false);
    if (error) { setMessage("Hedef haftalık saat kaydedilemedi."); return; }
    setMessage("Sınıfın haftalık ders saati hedefi güncellendi.");
    await load();
  }

  async function addCourse() {
    if (!classId || !courseName.trim()) return;
    const hours = Number(courseHours);
    if (!Number.isInteger(hours) || hours <= 0 || hours > 20) { setMessage("Haftalık ders saati 1-20 arasında olmalıdır."); return; }
    setBusy(true); setMessage(null);
    let course = courses.find((c) => c.name.toLocaleLowerCase("tr-TR") === courseName.trim().toLocaleLowerCase("tr-TR"));
    if (!course) {
      const { data, error } = await supabase.from("course_catalog").insert({ name: courseName.trim(), category: courseCategory }).select("id,name,short_name,category").single();
      if (error || !data) { setBusy(false); setMessage("Ders kataloğa eklenemedi."); return; }
      course = data as Course;
    }
    const { error } = await supabase.from("class_course_requirements").upsert({ class_id: classId, course_id: course.id, weekly_hours: hours, category: courseCategory }, { onConflict: "class_id,course_id" });
    if (!error) await supabase.rpc("refresh_class_curriculum_status", { p_class_id: classId });
    setBusy(false);
    if (error) { setMessage("Ders sınıf müfredatına eklenemedi."); return; }
    setCourseName(""); setCourseHours("1");
    setMessage("Ders sınıf müfredatına eklendi.");
    await load();
  }

  async function removeRequirement(id: string) {
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("class_course_requirements").delete().eq("id", id);
    if (!error && classId) await supabase.rpc("refresh_class_curriculum_status", { p_class_id: classId });
    setBusy(false);
    if (error) { setMessage("Ders silinemedi."); return; }
    setMessage("Ders sınıf müfredatından kaldırıldı.");
    await load();
  }

  async function submitTeacherAssignment() {
    if (!assignRequirement || !assignTeacher) return;
    if (assignmentPermission === "NOT_ALLOWED" && !forceException) { setMessage("Bu öğretmenin ders için TTKB uygunluğu yok. Atama yalnız gerekçeli istisna olarak yapılabilir."); return; }
    if (forceException && exceptionReason.trim().length < 10) { setMessage("İstisnai atama gerekçesi en az 10 karakter olmalıdır."); return; }
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc("assign_teacher_to_class_course_v2", {
      p_requirement_id: assignRequirement,
      p_teacher_id: assignTeacher,
      p_group: "main",
      p_force_exception: forceException,
      p_exception_reason: forceException ? exceptionReason.trim() : null,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message.includes("EXCEED") ? "Atanan öğretmen saatleri dersin haftalık saatini aşamaz." : error.message.includes("TTKB") ? "TTKB uygunluğu bulunmuyor; istisna için gerekçe zorunludur." : "Öğretmen derse atanamadı.");
      return;
    }
    setExceptionReason(""); setForceException(false);
    setMessage(forceException ? "Gerekçeli istisnai atama kaydedildi; yayın öncesi uyarı listesinde görünür." : "Öğretmen ders yüküne atandı. Bu işlem henüz haftalık timetable hücresi oluşturmaz.");
    await load();
  }

  async function cloneCurriculum(copyTeachers: boolean) {
    if (!classId || !cloneTarget) return;
    setBusy(true); setMessage(null);
    const { data, error } = await supabase.rpc("clone_class_curriculum", {
      p_source_class_id: classId,
      p_target_class_id: cloneTarget,
      p_copy_teachers: copyTeachers,
    });
    setBusy(false);
    if (error) { setMessage("Müfredat hedef sınıfa kopyalanamadı."); return; }
    setMessage(`${data ?? 0} ders hedef sınıfa ${copyTeachers ? "öğretmen atamalarıyla birlikte" : "yalnız dersler olarak"} kopyalandı.`);
    await load();
  }

  const expected = selectedSummary?.expected_weekly_hours ?? selectedClass?.expected_weekly_hours ?? 0;
  const planned = selectedSummary?.planned_weekly_hours ?? 0;
  const assigned = selectedSummary?.assigned_teacher_hours ?? 0;
  const status = planned > expected && expected > 0 ? "overflow" : expected > 0 && planned === expected ? "complete" : "draft";
  const percent = expected > 0 ? Math.min(100, Math.round((planned / expected) * 100)) : 0;

  return <AppShell title="Müfredat & Ders Dağıtımı" subtitle="Ne okutulacak → kim okutacak → sonra haftalık program">
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
      <b>Bu ekran timetable değildir.</b> Önce sınıfın ders yükü tamamlanır, sonra öğretmenler atanır. Gün/saat/derslik yerleşimi haftalık program motorunda yapılır.
    </div>

    <section className="mt-5 rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <div className="space-y-2"><Label>Sınıf / Program</Label><select value={classId} onChange={(e) => { setClassId(e.target.value); const c = classes.find((x) => x.id === e.target.value); setTargetHours(c?.expected_weekly_hours ? String(c.expected_weekly_hours) : ""); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Seçiniz</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.composite_key ?? c.class_name}</option>)}</select></div>
        <div className="space-y-2"><Label>Hedef Haftalık Saat</Label><Input inputMode="numeric" value={targetHours} onChange={(e) => setTargetHours(e.target.value.replace(/\D/g, ""))} placeholder="35 / 40" /></div>
        <div className="flex items-end"><Button onClick={() => void saveTargetHours()} disabled={busy || !classId}>Kaydet</Button></div>
      </div>

      {classId ? <div className="mt-4 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Ders Yükü</p><p className="text-xs text-muted-foreground">Planlanan {planned} saat · Öğretmene atanan {assigned} saat</p></div><Badge variant={status === "complete" ? "default" : status === "overflow" ? "destructive" : "secondary"}>{expected ? `${planned}/${expected}` : `${planned}/?`}</Badge></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${status === "overflow" ? "bg-destructive" : status === "complete" ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${percent}%` }} /></div>
        {status === "overflow" ? <p className="mt-2 text-xs font-medium text-destructive">Hedef haftalık ders saati aşıldı. Timetable üretimine geçilmemelidir.</p> : null}
      </div> : null}
    </section>

    {classId ? <>
      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 font-semibold"><Plus className="size-4" /> Sınıfa Ders Ekle</h2>
          <div className="mt-3 space-y-3"><div className="space-y-2"><Label>Ders Adı</Label><Input value={courseName} onChange={(e) => setCourseName(e.target.value)} list="course-catalog" placeholder="Örn. Matematik" /><datalist id="course-catalog">{courses.map((c) => <option key={c.id} value={c.name} />)}</datalist></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Haftalık Saat</Label><Input inputMode="numeric" value={courseHours} onChange={(e) => setCourseHours(e.target.value.replace(/\D/g, ""))} /></div><div className="space-y-2"><Label>Tür</Label><select value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="zorunlu">Zorunlu</option><option value="secmeli">Seçmeli</option><option value="rehberlik">Rehberlik</option><option value="uygulama">Uygulama</option><option value="diger">Diğer</option></select></div></div><Button className="w-full" onClick={() => void addCourse()} disabled={busy}>Müfredata Ekle</Button></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 font-semibold"><UserRoundCheck className="size-4" /> Öğretmen Ata</h2>
          <div className="mt-3 space-y-3"><select value={assignRequirement} onChange={(e) => setAssignRequirement(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Ders seçiniz</option>{classRequirements.map((r) => <option key={r.id} value={r.id}>{courseMap[r.course_id]?.name ?? "Ders"} · {r.weekly_hours} saat</option>)}</select><select value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Öğretmen seçiniz</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select>{assignmentPermission ? <p className={`rounded-lg border p-2 text-xs ${assignmentPermission === "ALLOWED" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : assignmentPermission === "NOT_ALLOWED" ? "border-amber-300 bg-amber-50 text-amber-950" : "border-muted bg-muted/40 text-muted-foreground"}`}>{assignmentPermission === "ALLOWED" ? "TTKB alan–ders uygunluğu doğrulandı." : assignmentPermission === "NOT_ALLOWED" ? "TTKB alan–ders uygunluğu yok. Yalnız gerekçeli istisna kaydıyla atanabilir." : "Alan veya yetki kuralı henüz tanımlı değil; atama kayda alınır ve kontrol listesinde izlenir."}</p> : null}{assignmentPermission === "NOT_ALLOWED" ? <div className="rounded-lg border border-amber-300 bg-amber-50 p-3"><label className="flex items-start gap-2 text-sm font-medium text-amber-950"><input type="checkbox" checked={forceException} onChange={(e) => setForceException(e.target.checked)} className="mt-1" /> Gerekçeli istisnai atama yap</label>{forceException ? <div className="mt-2 space-y-1"><Label htmlFor="exception-reason">Gerekçe</Label><Input id="exception-reason" value={exceptionReason} onChange={(e) => setExceptionReason(e.target.value)} placeholder="Örn. norm açığı nedeniyle geçici görevlendirme" /><p className="text-xs text-amber-900">Bu kayıt denetim iziyle saklanır; programdaki zaman, yük ve çakışma kurallarını gevşetmez.</p></div> : null}</div> : null}<Button className="w-full" onClick={() => void submitTeacherAssignment()} disabled={busy || !assignRequirement || !assignTeacher}>Derse Ata</Button><p className="text-xs text-muted-foreground">Normal atamada TTKB alan–ders eşleşmesi zorunludur. İstisna, yalnız açık gerekçe ve yetkili işlem kaydıyla açılır.</p></div>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold"><Copy className="size-4" /> Şubeye Kopyala</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={cloneTarget} onChange={(e) => setCloneTarget(e.target.value)} className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"><option value="">Hedef sınıf/şube seçiniz</option>{classes.filter((c) => c.id !== classId).map((c) => <option key={c.id} value={c.id}>{c.composite_key ?? c.class_name}</option>)}</select><Button variant="outline" onClick={() => void cloneCurriculum(false)} disabled={!cloneTarget || busy}>Sadece Dersleri Kopyala</Button><Button variant="secondary" onClick={() => void cloneCurriculum(true)} disabled={!cloneTarget || busy}>Ders + Öğretmeni Kopyala</Button></div>
      </section>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><BookOpenCheck className="size-4" /> {selectedClass?.composite_key ?? selectedClass?.class_name} Dersleri</h2><Button variant="outline" size="sm" onClick={() => void load()} className="gap-2"><RefreshCw className="size-4" /> Yenile</Button></div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-3 text-left">Ders</th><th className="p-3 text-left">Tür</th><th className="p-3 text-left">HDS</th><th className="p-3 text-left">Öğretmen</th><th className="p-3 text-left">Atanan Saat</th><th className="p-3 text-right">İşlem</th></tr></thead><tbody>{classRequirements.length ? classRequirements.map((r) => { const list = assignmentMap[r.id] ?? []; return <tr key={r.id} className="border-b last:border-0"><td className="p-3 font-medium">{courseMap[r.course_id]?.name ?? "Ders"}</td><td className="p-3">{r.category}</td><td className="p-3">{r.weekly_hours}</td><td className="p-3">{list.length ? <div className="space-y-1">{list.map((a) => <div key={a.id} className="flex items-center gap-1.5">{a.is_justified_exception ? <AlertTriangle className="size-3.5 text-amber-600" aria-label="Gerekçeli istisna" /> : null}<span>{teacherMap[a.teacher_id]}</span>{a.is_justified_exception ? <span className="text-xs text-amber-700" title={a.exception_reason ?? undefined}>İstisna</span> : null}</div>)}</div> : <span className="text-amber-600">Atanmadı</span>}</td><td className="p-3">{list.reduce((sum, a) => sum + a.assigned_hours, 0)}/{r.weekly_hours}</td><td className="p-3 text-right"><Button variant="ghost" size="sm" onClick={() => void removeRequirement(r.id)} disabled={r.locked || busy}>Kaldır</Button></td></tr>; }) : <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Bu sınıfa henüz ders yükü tanımlanmadı.</td></tr>}</tbody></table></div>
      </section>
    </> : null}

    {message ? <p className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">{message}</p> : null}
  </AppShell>;
}
