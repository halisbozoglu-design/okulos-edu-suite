import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarRange, MapPin, Plus, Printer, RefreshCw, Wand2 } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Aylık Nöbet Rotasyonu — OkulOS" }] }),
  component: DutyRotationSettings,
});

type Profile = { user_id: string; full_name: string | null; role: string };
type Rotation = { duty_date: string; vice_principal_id: string };
type DutyAssignment = { duty_date: string; teacher_id: string; duty_location: string | null };
type Location = { id: string; name: string; critical: boolean; sort_order: number };
type CycleMember = { teacher_id: string; weekday: number; rotation_offset: number; active: boolean };
type DutyBook = {
  date: string;
  manager: { user_id: string; full_name: string | null; phone?: string | null } | null;
  duty_teachers: { user_id: string; full_name: string | null; location: string | null }[];
  absent_teachers: { teacher_id: string; full_name: string | null; medical_report: boolean; note: string | null; lessons: { period: number; class_name: string; subject: string }[] }[];
  substitutions: { period: number; class_name: string; subject: string; substitute: string | null }[];
  notes: { start_time?: string; end_time?: string; teaching_mode?: string; general_note?: string; empty_lesson_resolution?: string } | null;
};

const weekdays = [
  { id: 1, label: "Pazartesi" }, { id: 2, label: "Salı" }, { id: 3, label: "Çarşamba" },
  { id: 4, label: "Perşembe" }, { id: 5, label: "Cuma" },
];

function monthRange(month: string) {
  const start = `${month}-01`;
  const d = new Date(`${start}T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  const next = d.toISOString().slice(0, 10);
  return { start, next };
}

function DutyRotationSettings() {
  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [activeVpIds, setActiveVpIds] = useState<string[]>([]);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [cycleMembers, setCycleMembers] = useState<CycleMember[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [criticalLocation, setCriticalLocation] = useState(false);
  const [memberTeacher, setMemberTeacher] = useState("");
  const [memberDay, setMemberDay] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dutyBook, setDutyBook] = useState<DutyBook | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const profileMap = useMemo(() => Object.fromEntries([...managers, ...teachers].map((p) => [p.user_id, p.full_name ?? "Personel"])), [managers, teachers]);

  const loadData = useCallback(async () => {
    const { start, next } = monthRange(month);
    const [managerRes, teacherRes, vpRes, rotationRes, assignmentRes, locationRes, memberRes] = await Promise.all([
      supabase.from("profiles").select("user_id,full_name,role").in("role", ["manager", "admin"]).order("full_name"),
      supabase.from("profiles").select("user_id,full_name,role").eq("role", "teacher").order("full_name"),
      supabase.from("vice_principals").select("user_id").eq("active", true),
      supabase.from("duty_rotation").select("duty_date,vice_principal_id").gte("duty_date", start).lt("duty_date", next).order("duty_date"),
      supabase.from("teacher_duty_assignments").select("duty_date,teacher_id,duty_location").gte("duty_date", start).lt("duty_date", next).order("duty_date"),
      supabase.from("duty_locations").select("id,name,critical,sort_order").eq("active", true).order("critical", { ascending: false }).order("sort_order"),
      supabase.from("teacher_duty_cycle_members").select("teacher_id,weekday,rotation_offset,active").eq("active", true),
    ]);
    setManagers((managerRes.data ?? []) as Profile[]);
    setTeachers((teacherRes.data ?? []) as Profile[]);
    setActiveVpIds((vpRes.data ?? []).map((x) => x.user_id));
    setRotations((rotationRes.data ?? []) as Rotation[]);
    setAssignments((assignmentRes.data ?? []) as DutyAssignment[]);
    setLocations((locationRes.data ?? []) as Location[]);
    setCycleMembers((memberRes.data ?? []) as CycleMember[]);
  }, [month]);

  useEffect(() => { void loadData(); }, [loadData]);

  async function toggleVp(userId: string) {
    setMessage(null);
    if (activeVpIds.includes(userId)) {
      const { error } = await supabase.from("vice_principals").update({ active: false }).eq("user_id", userId);
      if (!error) setActiveVpIds((v) => v.filter((id) => id !== userId));
    } else {
      const { error } = await supabase.from("vice_principals").upsert({ user_id: userId, active: true });
      if (!error) setActiveVpIds((v) => [...v, userId]);
    }
  }

  async function addLocation() {
    if (!newLocation.trim()) return;
    const { error } = await supabase.from("duty_locations").insert({ name: newLocation.trim(), critical: criticalLocation, sort_order: locations.length + 1 });
    if (error) { setMessage("Nöbet yeri eklenemedi."); return; }
    setNewLocation(""); setCriticalLocation(false); await loadData();
  }

  async function addCycleMember() {
    if (!memberTeacher) return;
    const { error } = await supabase.from("teacher_duty_cycle_members").upsert({ teacher_id: memberTeacher, weekday: memberDay, active: true, rotation_offset: 0 });
    if (error) { setMessage("Öğretmen aylık nöbet döngüsüne eklenemedi."); return; }
    await loadData();
  }

  async function generateMonth() {
    if (!activeVpIds.length) { setMessage("Önce en az bir nöbetçi müdür yardımcısı seçin."); return; }
    if (!locations.length) { setMessage("Önce en az bir nöbet yeri tanımlayın."); return; }
    setBusy(true); setMessage(null);
    const monthStart = `${month}-01`;
    const [vp, teacher] = await Promise.all([
      supabase.rpc("generate_monthly_vp_rotation", { p_month: monthStart, p_vice_principal_ids: activeVpIds, p_overwrite: true }),
      supabase.rpc("generate_monthly_teacher_duties", { p_month: monthStart, p_overwrite: true }),
    ]);
    setBusy(false);
    if (vp.error || teacher.error) { setMessage("Aylık nöbet döngüsü oluşturulamadı. Ay kilidini ve tanımları kontrol edin."); return; }
    setMessage(`Aylık plan oluşturuldu: ${vp.data ?? 0} idareci günü, ${teacher.data ?? 0} öğretmen nöbet kaydı.`);
    await loadData();
  }

  async function loadDutyBook() {
    const { data, error } = await supabase.rpc("get_daily_duty_book", { p_date: selectedDate });
    if (error) { setMessage("Nöbet defteri verileri alınamadı."); return; }
    setDutyBook(data as DutyBook);
  }

  async function printDutyBook() {
    if (!dutyBook || dutyBook.date !== selectedDate) await loadDutyBook();
    window.setTimeout(() => window.print(), 100);
  }

  return (
    <AppShell title="Ayarlar & Nöbet Rotasyonu" subtitle="Aylık döngü · fiziki nöbet defteri çıktısı">
      <div className="print:hidden">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <div className="space-y-2"><Label>Plan Ayı</Label><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <div className="flex items-end gap-2"><Button onClick={() => void generateMonth()} disabled={busy} className="w-full gap-2"><Wand2 className="size-4" />{busy ? "Oluşturuluyor..." : "Aylık Döngüyü Oluştur / Güncelle"}</Button><Button variant="outline" onClick={() => void loadData()}><RefreshCw className="size-4" /></Button></div>
        </div>
        {message ? <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">{message}</p> : null}

        <section className="mt-5 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Nöbetçi Müdür Yardımcısı Havuzu</h2>
          <p className="mt-1 text-xs text-muted-foreground">Seçilen idareciler ayın iş günlerine sırayla ve döngüsel atanır.</p>
          <div className="mt-3 flex flex-wrap gap-2">{managers.map((m) => <button key={m.user_id} onClick={() => void toggleVp(m.user_id)} className={`rounded-lg border px-3 py-2 text-sm ${activeVpIds.includes(m.user_id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{m.full_name ?? "İdareci"}</button>)}</div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4" /> Nöbet Yerleri</h2>
            <div className="mt-3 flex gap-2"><Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Bahçe, Zemin Kat..." /><Button onClick={() => void addLocation()}><Plus className="size-4" /></Button></div>
            <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={criticalLocation} onChange={(e) => setCriticalLocation(e.target.checked)} /> Kritik bölge (dağıtımda öncelikli)</label>
            <div className="mt-3 flex flex-wrap gap-2">{locations.map((l) => <span key={l.id} className="rounded-full bg-muted px-3 py-1 text-xs">{l.name}{l.critical ? " · kritik" : ""}</span>)}</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Öğretmen Aylık Nöbet Döngüsü</h2>
            <div className="mt-3 space-y-2"><select value={memberTeacher} onChange={(e) => setMemberTeacher(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Öğretmen seçin</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select><select value={memberDay} onChange={(e) => setMemberDay(Number(e.target.value))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{weekdays.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select><Button variant="secondary" onClick={() => void addCycleMember()} className="w-full">Döngüye Ekle / Gününü Güncelle</Button></div>
            <p className="mt-3 text-xs text-muted-foreground">Aynı gün nöbetçi öğretmenlerin nöbet yerleri ay içindeki haftalarda otomatik döner; ders programı değişmediği sürece ay planı korunur.</p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarRange className="size-4" /> {month} Aylık Plan</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b"><th className="p-2 text-left">Tarih</th><th className="p-2 text-left">Nöbetçi İdareci</th><th className="p-2 text-left">Nöbetçi Öğretmen / Yer</th></tr></thead><tbody>{rotations.map((r) => <tr key={r.duty_date} className="border-b last:border-0"><td className="p-2">{new Date(`${r.duty_date}T00:00:00`).toLocaleDateString("tr-TR")}</td><td className="p-2 font-medium">{profileMap[r.vice_principal_id] ?? "—"}</td><td className="p-2 text-xs">{assignments.filter((a) => a.duty_date === r.duty_date).map((a) => `${profileMap[a.teacher_id] ?? "Öğretmen"} (${a.duty_location ?? "Yer yok"})`).join(" · ") || "—"}</td></tr>)}</tbody></table></div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Günlük Nöbet Defteri · Fizikî Baskı</h2>
          <p className="mt-1 text-xs text-muted-foreground">Seçilen tarihteki nöbetçi idareci/öğretmenler, devamsız personel, boş dersler ve vekalet atamaları sistemdeki canlı veriden alınır.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /><Button variant="outline" onClick={() => void loadDutyBook()}>Önizle</Button><Button onClick={() => void printDutyBook()} className="gap-2"><Printer className="size-4" /> Fizikî Baskı / PDF</Button></div>
        </section>
      </div>

      {dutyBook ? <DutyBookPrint data={dutyBook} /> : null}
    </AppShell>
  );
}

function DutyBookPrint({ data }: { data: DutyBook }) {
  const periods = Array.from({ length: 12 }, (_, i) => i + 1);
  return <section className="mt-6 bg-white p-4 text-black print:fixed print:inset-0 print:z-[9999] print:m-0 print:block print:min-h-screen print:p-[10mm]">
    <div className="mx-auto max-w-[190mm] border-2 border-black p-4 text-[11px]">
      <h1 className="text-center text-xl font-bold">GÜNLÜK NÖBET DEFTERİ</h1>
      <div className="mt-3 grid grid-cols-4 gap-2 border-b border-black pb-3"><div><b>Nöbet Tarihi</b><br />{new Date(`${data.date}T00:00:00`).toLocaleDateString("tr-TR")}</div><div><b>Başlama</b><br />{data.notes?.start_time ?? "........"}</div><div><b>Bitiş</b><br />{data.notes?.end_time ?? "........"}</div><div><b>Nöbetçi Md. Yrd.</b><br />{data.manager?.full_name ?? "—"}</div></div>
      <p className="mt-3"><b>Nöbetçi Öğretmenler:</b> {data.duty_teachers.map((t) => `${t.full_name ?? "Öğretmen"}${t.location ? ` (${t.location})` : ""}`).join(" · ") || "—"}</p>
      <h2 className="mt-5 border-y border-black py-1 text-center font-bold">DERSE GELMEYEN ÖĞRETMENLER VE ETKİLENEN SINIFLAR</h2>
      <div className="overflow-hidden"><table className="w-full border-collapse"><thead><tr><th className="border border-black p-1 text-left">Öğretmen</th>{periods.map((p) => <th key={p} className="border border-black p-1">{p}</th>)}<th className="border border-black p-1">Düşünceler</th></tr></thead><tbody>{data.absent_teachers.length ? data.absent_teachers.map((a) => <tr key={a.teacher_id}><td className="border border-black p-1">{a.full_name}</td>{periods.map((p) => <td key={p} className="border border-black p-1 text-center">{a.lessons.find((l) => l.period === p)?.class_name ?? ""}</td>)}<td className="border border-black p-1">{a.medical_report ? "Rapor var" : ""} {a.note ?? ""}</td></tr>) : <tr><td colSpan={14} className="border border-black p-4 text-center">Devamsız personel kaydı yoktur.</td></tr>}</tbody></table></div>
      <div className="mt-4"><b>Boş geçen derslerin nasıl doldurulduğu:</b><div className="mt-1 min-h-16 border-b border-black">{data.substitutions.map((s) => `${s.period}. ders ${s.class_name}: ${s.substitute ?? "—"}`).join("; ") || data.notes?.empty_lesson_resolution || ""}</div></div>
      <div className="mt-4"><b>Nöbet süresince olaylar / alınan önlemler:</b><div className="mt-1 min-h-20 border-b border-black">{data.notes?.general_note ?? ""}</div></div>
      <div className="mt-12 grid grid-cols-2 text-center"><div><b>NÖBETÇİ MÜDÜR YARDIMCISI</b><br /><br />{data.manager?.full_name ?? ""}</div><div><b>GÖRÜLDÜ<br />OKUL MÜDÜRÜ</b></div></div>
    </div>
  </section>;
}
