import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/quran-groups")({
  head: () => ({ meta: [{ title: "Kur’an-ı Kerim Grup Planlama — OkulOS" }] }),
  component: QuranGroupManager,
});

type SchoolClass = { id: string; class_name: string; composite_key: string | null; program_type: string | null; student_count: number | null };
type Teacher = { user_id: string; full_name: string | null };
type Classroom = { id: string; name: string; capacity: number };
type SplitPlan = { id: string; class_id: string; academic_year: string; enabled: boolean; teacher_1_id: string | null; teacher_2_id: string | null };

const days = [
  { id: 1, label: "Pazartesi" }, { id: 2, label: "Salı" }, { id: 3, label: "Çarşamba" },
  { id: 4, label: "Perşembe" }, { id: 5, label: "Cuma" },
];

function academicYearNow() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function QuranGroupManager() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [plans, setPlans] = useState<SplitPlan[]>([]);
  const [classId, setClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(academicYearNow());
  const [teacher1, setTeacher1] = useState("");
  const [teacher2, setTeacher2] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [period, setPeriod] = useState(1);
  const [room1, setRoom1] = useState("");
  const [room2, setRoom2] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, t, r, p] = await Promise.all([
      supabase.from("class_roster_summary").select("id,class_name,composite_key,program_type,student_count").order("composite_key"),
      supabase.from("profiles").select("user_id,full_name").eq("role", "teacher").order("full_name"),
      supabase.from("classrooms").select("id,name,capacity").eq("active", true).order("name"),
      supabase.from("quran_split_plans").select("id,class_id,academic_year,enabled,teacher_1_id,teacher_2_id").eq("enabled", true),
    ]);
    setClasses((c.data ?? []) as SchoolClass[]);
    setTeachers((t.data ?? []) as Teacher[]);
    setRooms((r.data ?? []) as Classroom[]);
    setPlans((p.data ?? []) as SplitPlan[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const eligibleClasses = useMemo(() => classes.filter((c) => (c.student_count ?? 0) > 25), [classes]);
  const selectedClass = classes.find((c) => c.id === classId);
  const existingPlan = plans.find((p) => p.class_id === classId && p.academic_year === academicYear);

  async function prepare() {
    if (!classId || !teacher1 || !teacher2) { setMessage("Sınıf ve iki farklı öğretmen seçilmelidir."); return false; }
    if (teacher1 === teacher2) { setMessage("İki gruptan aynı öğretmen sorumlu olamaz."); return false; }
    if ((selectedClass?.student_count ?? 0) <= 25) { setMessage("Bu sınıf 25 öğrenci eşiğini geçmediği için bu özel grup kuralı uygulanamaz."); return false; }
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc("prepare_quran_split", {
      p_class_id: classId,
      p_academic_year: academicYear,
      p_teacher_1: teacher1,
      p_teacher_2: teacher2,
    });
    setBusy(false);
    if (error) { setMessage(error.message.includes("MUST_DIFFER") ? "Gruplara farklı öğretmenler atanmalıdır." : "Kur’an grup planı oluşturulamadı."); return false; }
    setMessage("İki dengeli öğrenci grubu oluşturuldu ve öğretmen sorumlulukları eğitim-öğretim yılı için kaydedildi.");
    await load();
    return true;
  }

  async function assignParallel() {
    setBusy(true); setMessage(null);
    let ready = Boolean(existingPlan && existingPlan.teacher_1_id === teacher1 && existingPlan.teacher_2_id === teacher2);
    if (!ready) ready = await prepare();
    if (!ready) { setBusy(false); return; }
    if (room1 && room2 && room1 === room2) { setBusy(false); setMessage("Aynı anda iki grup için aynı fiziksel derslik kullanılamaz. İkinci bir mekân seçin."); return; }
    const { data, error } = await supabase.rpc("assign_quran_parallel_lesson", {
      p_class_id: classId,
      p_academic_year: academicYear,
      p_weekday: weekday,
      p_period: period,
      p_subject: "Kur’an-ı Kerim",
      p_classroom_1: room1 || undefined,
      p_classroom_2: room2 || undefined,
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("TEACHER_DOUBLE_BOOKING")) setMessage("Öğretmenlerden biri seçilen saatte başka derste. Paralel atama yapılmadı.");
      else if (error.message.includes("ROOM_DOUBLE_BOOKING")) setMessage("Seçilen dersliklerden biri bu saatte dolu. Paralel atama yapılmadı.");
      else setMessage("Paralel grup dersi oluşturulamadı. Program çakışmalarını kontrol edin.");
      return;
    }
    setMessage(`${data ?? 2} paralel Kur’an-ı Kerim grup dersi aynı zaman dilimine kaydedildi.`);
  }

  return <AppShell title="Kur’an-ı Kerim Grup Planlama" subtitle="25+ öğrenci · isteğe bağlı iki grup · iki farklı alan öğretmeni">
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><div><b>Kural zorunlu bölme değildir.</b> Mevcudu 25’i geçen sınıflar iki gruba <b>ayrılabilir</b>. Gruplar dengeli oluşturulur; her gruptan eğitim-öğretim yılı boyunca farklı bir alan öğretmeni sorumlu olur. Kullanıcı hangi uygun sınıflarda uygulayacağını kendisi belirler.</div></div>
    </div>

    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold"><UsersRound className="size-4" /> Grup Planı</h2>
        <div className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Sınıf / Program (yalnız 25+)</Label><select value={classId} onChange={(e) => { setClassId(e.target.value); const p = plans.find((x) => x.class_id === e.target.value && x.academic_year === academicYear); setTeacher1(p?.teacher_1_id ?? ""); setTeacher2(p?.teacher_2_id ?? ""); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Seçiniz</option>{eligibleClasses.map((c) => <option key={c.id} value={c.id}>{c.composite_key ?? c.class_name} · {c.student_count} öğrenci</option>)}</select></div>
          <div className="space-y-2"><Label>Eğitim-Öğretim Yılı</Label><Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026-2027" /></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Grup 1 Öğretmeni</Label><select value={teacher1} onChange={(e) => setTeacher1(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Seçiniz</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select></div><div className="space-y-2"><Label>Grup 2 Öğretmeni</Label><select value={teacher2} onChange={(e) => setTeacher2(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Seçiniz</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select></div></div>
          <Button variant="secondary" onClick={() => void prepare()} disabled={busy} className="w-full">İki Grubu Oluştur / Güncelle</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold"><BookOpenCheck className="size-4" /> Aynı Saate İki Öğretmen Ata</h2>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Gün</Label><select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{days.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select></div><div className="space-y-2"><Label>Ders Saati</Label><select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{Array.from({ length: 12 }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}. ders</option>)}</select></div></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Grup 1 Dersliği</Label><select value={room1} onChange={(e) => setRoom1(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Mekân seçilmedi</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.capacity}</option>)}</select></div><div className="space-y-2"><Label>Grup 2 Dersliği</Label><select value={room2} onChange={(e) => setRoom2(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Mekân seçilmedi</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.capacity}</option>)}</select></div></div>
          <Button onClick={() => void assignParallel()} disabled={busy || !classId} className="w-full">Paralel Dersi Programa Yaz</Button>
          <p className="text-xs text-muted-foreground">İşlem tek transaction içinde çalışır. Öğretmen, öğrenci grubu veya derslik çakışması varsa iki kaydın hiçbiri oluşturulmaz.</p>
        </div>
      </div>
    </section>
    {message ? <p className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">{message}</p> : null}
  </AppShell>;
}
