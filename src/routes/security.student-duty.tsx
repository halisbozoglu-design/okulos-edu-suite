import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Check, Download, RefreshCw, ShieldAlert, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SecuritySectionNav } from "@/components/okulos/SecuritySectionNav";
import { supabase } from "@/lib/supabase";
import { generateStudentDutyAssignments, genderCapabilityWarning, type DutyCalendarExclusion, type DutyLocation, type DutyStudent, type ExistingDuty } from "@/lib/student-duty-engine";

export const Route = createFileRoute("/security/student-duty")({
  head: () => ({ meta: [{ title: "Öğrenci Nöbeti — OkulOS" }, { name: "description", content: "OkulOS canonical öğrenci nöbeti, fairness, muafiyet ve yoklama ekranı." }] }),
  component: StudentDuty,
});

type Assignment = { id: string; duty_date: string; student_id: string; location_id: string | null; assignment_source: "auto" | "manual"; presence_state: "present" | "absent" | null; manual_change_reason: string | null };
type RawStudent = { id: string; full_name: string; school_number: string | null; class_id: string | null; active: boolean };
type RawLocation = { id: string; name: string; student_duty_enabled: boolean; gender_rule: "any" | "male" | "female"; student_capacity: number };
type RawEvent = { starts_on: string; ends_on: string; blocks_teaching: boolean };
type RawExemption = { student_id: string; starts_on: string; ends_on: string | null; is_active: boolean };
type ActiveYear = { id: string };

type Settings = { included_grade_levels?: number[]; included_class_ids?: string[]; gender_rule_enabled?: boolean; daily_student_per_location?: number };

function StudentDuty() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<RawStudent[]>([]);
  const [locations, setLocations] = useState<RawLocation[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exemptions, setExemptions] = useState<RawExemption[]>([]);
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [activeYearId, setActiveYearId] = useState<string | null>(null);
  const [gradeLevels, setGradeLevels] = useState<number[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [capacity, setCapacity] = useState("1");
  const [genderRuleEnabled, setGenderRuleEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const yearResponse = await supabase.from("academic_years").select("id").eq("active", true).maybeSingle();
    const yearId = (yearResponse.data as ActiveYear | null)?.id ?? null;
    setActiveYearId(yearId);
    const [studentRes, locationRes, assignmentRes, exemptionRes, eventRes, settingsRes] = await Promise.all([
      supabase.from("students").select("id,full_name,school_number,class_id,active").eq("active", true).order("full_name").limit(1000),
      supabase.from("duty_locations").select("id,name,student_duty_enabled,gender_rule,student_capacity").eq("student_duty_enabled", true).eq("active", true).order("sort_order"),
      supabase.from("student_duty_assignments").select("id,duty_date,student_id,location_id,assignment_source,presence_state,manual_change_reason").eq("duty_date", date).eq("active", true).order("created_at"),
      supabase.from("student_duty_exemptions").select("student_id,starts_on,ends_on,is_active").eq("is_active", true),
      yearId ? supabase.from("school_calendar_events").select("starts_on,ends_on,blocks_teaching").eq("academic_year_id", yearId).eq("blocks_teaching", true) : Promise.resolve({ data: [], error: null }),
      yearId ? supabase.from("student_duty_settings").select("included_grade_levels,included_class_ids,gender_rule_enabled,daily_student_per_location").eq("academic_year_id", yearId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (!studentRes.error) setStudents((studentRes.data ?? []) as RawStudent[]);
    if (!locationRes.error) setLocations((locationRes.data ?? []) as RawLocation[]);
    if (!assignmentRes.error) setAssignments((assignmentRes.data ?? []) as Assignment[]);
    if (!exemptionRes.error) setExemptions((exemptionRes.data ?? []) as RawExemption[]);
    if (!eventRes.error) setEvents((eventRes.data ?? []) as RawEvent[]);
    const settings = settingsRes.data as Settings | null;
    if (settings) {
      setGradeLevels(settings.included_grade_levels ?? []);
      setClassIds(settings.included_class_ids ?? []);
      setGenderRuleEnabled(Boolean(settings.gender_rule_enabled));
      setCapacity(String(settings.daily_student_per_location ?? 1));
    }
  }, [date]);

  useEffect(() => { void load(); }, [load]);

  const engineStudents = useMemo<DutyStudent[]>(() => students.map((student) => ({ id: student.id, fullName: student.full_name, classId: student.class_id, active: student.active, gender: null, gradeLevel: null })), [students]);
  const engineLocations = useMemo<DutyLocation[]>(() => locations.map((location) => ({ id: location.id, name: location.name, studentDutyEnabled: location.student_duty_enabled, genderRule: location.gender_rule, capacity: location.student_capacity })), [locations]);
  const calendarEvents = useMemo<DutyCalendarExclusion[]>(() => events.map((event) => ({ startsOn: event.starts_on, endsOn: event.ends_on, blocksTeaching: event.blocks_teaching })), [events]);
  const studentMap = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const locationMap = useMemo(() => new Map(locations.map((location) => [location.id, location])), [locations]);
  const warning = genderCapabilityWarning(engineStudents, engineLocations, genderRuleEnabled);
  const existing: ExistingDuty[] = assignments.map((item) => ({ studentId: item.student_id, dutyDate: item.duty_date, locationId: item.location_id }));

  async function saveSettings() {
    if (!activeYearId) { setMessage("Aktif eğitim-öğretim yılı bulunamadı."); return; }
    const { error } = await supabase.from("student_duty_settings").upsert({ academic_year_id: activeYearId, included_grade_levels: gradeLevels, included_class_ids: classIds, gender_rule_enabled: genderRuleEnabled, daily_student_per_location: Math.max(1, Number(capacity) || 1) }, { onConflict: "institution_code,academic_year_id" });
    setMessage(error ? "Ayarlar kaydedilemedi." : "Ayarlar kaydedildi.");
  }

  async function generate() {
    setBusy(true);
    setMessage(null);
    const result = generateStudentDutyAssignments({ date, students: engineStudents, locations: engineLocations, exemptions: exemptions.map((item) => ({ studentId: item.student_id, startsOn: item.starts_on, endsOn: item.ends_on, isActive: item.is_active })), calendarEvents, existing, includedGradeLevels: gradeLevels, includedClassIds: classIds, genderRuleEnabled });
    if (result.skippedReason) { setBusy(false); setMessage(result.skippedReason); return; }
    if (!result.assignments.length) { setBusy(false); setMessage("Uygun öğrenci veya kapasite bulunamadı."); return; }
    const payload = result.assignments.map((item) => ({ duty_date: date, student_id: item.studentId, location_id: item.locationId, assignment_source: item.assignmentSource, manual_changed_by: null, manual_change_reason: item.warning ?? null, active: true }));
    const { error } = await supabase.from("student_duty_assignments").upsert(payload, { onConflict: "institution_code,duty_date,student_id" });
    setBusy(false);
    setMessage(error ? "Nöbet planı kaydedilemedi." : `${payload.length} öğrenci için nöbet planı oluşturuldu.`);
    if (!error) await load();
  }

  async function setPresence(id: string, state: "present" | "absent") {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("student_duty_assignments").update({ presence_state: state, checked_at: new Date().toISOString(), checked_by: userData.user?.id ?? null }).eq("id", id);
    if (!error) await load();
  }

  function exportCsv() {
    const lines = ["Tarih;Öğrenci;Nokta;Kaynak;Durum", ...assignments.map((item) => [date, studentMap.get(item.student_id)?.full_name ?? "", locationMap.get(item.location_id ?? "")?.name ?? "", item.assignment_source, item.presence_state ?? ""].join(";"))];
    const blob = new Blob([`\ufeff${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `okulos-ogrenci-nobeti-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <AppShell title="Öğrenci Nöbeti" subtitle="Fairness · muafiyet · takvim dışı · devam kontrolü">
    <SecuritySectionNav active="/security/student-duty" />
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4"><div className="flex items-center gap-2"><CalendarCheck2 className="size-5 text-primary" /><h1 className="font-semibold">Gün ve kurallar</h1></div><Input className="mt-4" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={genderRuleEnabled} onChange={(event) => setGenderRuleEnabled(event.target.checked)} />Cinsiyet kurallarını etkinleştir</label><div className="mt-4 flex items-center gap-2 text-sm"><span>Günlük nokta kapasitesi</span><Input className="w-20" type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></div><div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => void saveSettings()}>Ayarları kaydet</Button><Button disabled={busy} onClick={() => void generate()}><RefreshCw className={busy ? "animate-spin" : ""} /> Üret / yeniden üret</Button></div></div>
        {warning ? <div role="alert" className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"><ShieldAlert className="mt-0.5 size-5 shrink-0" />{warning}</div> : null}
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground"><p className="font-medium text-foreground">Motor kuralları</p><ul className="mt-2 space-y-1"><li>• Öğretimi bloke eden takvim günlerinde üretim yapılmaz.</li><li>• Muaf öğrenciler ve aynı gün atanmış öğrenciler dışarıda kalır.</li><li>• Önce daha az görev almış öğrenciler seçilir; her öğrenci için günlük tek kayıt korunur.</li><li>• Elle değişiklik ve yoklama alanları veritabanında izlenir.</li></ul></div>
        {message ? <p className="rounded-lg border bg-muted p-3 text-sm">{message}</p> : null}
      </section>
      <section className="rounded-xl border bg-card"><div className="flex items-center gap-2 border-b p-4"><UserRoundCheck className="size-5 text-primary" /><h2 className="font-semibold">Günlük çıktı</h2><span className="ml-auto flex gap-2"><Button size="sm" variant="outline" onClick={exportCsv}><Download className="size-4" /> Dışa aktar</Button><Button size="sm" variant="ghost" onClick={() => void load()} aria-label="Yenile"><RefreshCw className="size-4" /></Button></span></div><div className="divide-y">{assignments.map((item) => <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-medium">{studentMap.get(item.student_id)?.full_name ?? "Öğrenci"}</p><p className="text-xs text-muted-foreground">{locationMap.get(item.location_id ?? "")?.name ?? "Nokta atanmadı"} · {item.assignment_source === "auto" ? "Otomatik" : "Manuel"}</p>{item.manual_change_reason ? <p className="text-xs text-warning-foreground">{item.manual_change_reason}</p> : null}</div><span className="rounded-full bg-muted px-2 py-1 text-xs">{item.presence_state === "present" ? "Geldi" : item.presence_state === "absent" ? "Yok" : "Bekliyor"}</span><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => void setPresence(item.id, "present")}><Check className="size-4" /> Geldi</Button><Button size="sm" variant="ghost" onClick={() => void setPresence(item.id, "absent")}>Yok</Button></div></div>)}{!assignments.length ? <p className="p-8 text-center text-sm text-muted-foreground">Bu gün için henüz plan yok.</p> : null}</div></section>
    </div>
  </AppShell>;
}
