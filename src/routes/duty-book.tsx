import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ClipboardCheck, Plus, Printer, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/duty-book")({
  head: () => ({ meta: [{ title: "Günlük Nöbet Defteri — OkulOS" }] }),
  component: DutyBookPage,
});

type Teacher = { user_id: string; full_name: string | null };
type DutyBook = {
  date: string;
  manager: { user_id: string; full_name: string | null; phone?: string | null } | null;
  duty_teachers: { user_id: string; full_name: string | null; location: string | null }[];
  absent_teachers: { teacher_id: string; full_name: string | null; medical_report: boolean; note: string | null; lessons: { period: number; class_name: string; subject: string }[] }[];
  substitutions: { period: number; class_name: string; subject: string; substitute: string | null }[];
  tardiness: { id: string; teacher_id: string; full_name: string | null; period: number | null; class_name: string | null; minutes_late: number; note: string | null }[];
  incidents: { id: string; reporter: string | null; location: string | null; description: string; action_taken: string | null; occurred_at: string }[];
  notes: { start_time?: string; end_time?: string; teaching_mode?: string; general_note?: string; empty_lesson_resolution?: string } | null;
};

function DutyBookPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [book, setBook] = useState<DutyBook | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [teachingMode, setTeachingMode] = useState("normal");
  const [generalNote, setGeneralNote] = useState("");
  const [emptyLessonResolution, setEmptyLessonResolution] = useState("");
  const [lateTeacher, setLateTeacher] = useState("");
  const [lateMinutes, setLateMinutes] = useState("5");
  const [latePeriod, setLatePeriod] = useState("1");
  const [lateClass, setLateClass] = useState("");
  const [lateNote, setLateNote] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentAction, setIncidentAction] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [bookRes, teachersRes] = await Promise.all([
      supabase.rpc("get_daily_duty_book", { p_date: date }),
      supabase.from("profiles").select("user_id,full_name").in("role", ["teacher", "manager"]).order("full_name"),
    ]);
    if (bookRes.error) { setMessage("Nöbet defteri verileri yüklenemedi."); return; }
    const next = bookRes.data as DutyBook;
    setBook(next);
    setTeachers((teachersRes.data ?? []) as Teacher[]);
    setStartTime(next.notes?.start_time?.slice(0, 5) ?? "");
    setEndTime(next.notes?.end_time?.slice(0, 5) ?? "");
    setTeachingMode(next.notes?.teaching_mode ?? "normal");
    setGeneralNote(next.notes?.general_note ?? "");
    setEmptyLessonResolution(next.notes?.empty_lesson_resolution ?? "");
  }, [date]);

  useEffect(() => { void load(); }, [load]);

  async function saveDayNotes() {
    const { error } = await supabase.from("duty_day_notes").upsert({
      duty_date: date,
      start_time: startTime || null,
      end_time: endTime || null,
      teaching_mode: teachingMode,
      general_note: generalNote || null,
      empty_lesson_resolution: emptyLessonResolution || null,
      updated_at: new Date().toISOString(),
    });
    if (error) { setMessage("Günlük nöbet notları kaydedilemedi."); return; }
    setMessage("Günlük nöbet bilgileri kaydedildi.");
    await load();
  }

  async function addLateTeacher() {
    if (!lateTeacher || Number(lateMinutes) < 1) { setMessage("Geç kalan öğretmen ve dakika bilgisi zorunludur."); return; }
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("duty_tardiness_logs").insert({
      duty_date: date,
      teacher_id: lateTeacher,
      minutes_late: Number(lateMinutes),
      period: Number(latePeriod),
      class_name: lateClass || null,
      note: lateNote || null,
      recorded_by: user.user?.id ?? null,
    });
    if (error) { setMessage("Geç kalma kaydı eklenemedi."); return; }
    setLateClass(""); setLateNote(""); setMessage("Geç kalma kaydı eklendi."); await load();
  }

  async function addIncident() {
    if (!incidentDescription.trim()) { setMessage("Olay açıklaması zorunludur."); return; }
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("duty_incident_logs").insert({
      duty_date: date,
      reporter_id: user.user?.id ?? null,
      duty_location: incidentLocation || null,
      description: incidentDescription.trim(),
      action_taken: incidentAction.trim() || null,
      occurred_at: new Date().toISOString(),
    });
    if (error) { setMessage("Olay kaydı eklenemedi."); return; }
    setIncidentLocation(""); setIncidentDescription(""); setIncidentAction(""); setMessage("Olay kaydı eklendi."); await load();
  }

  function printBook() {
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  return <AppShell title="Günlük Nöbet Defteri" subtitle="Canlı kayıt · günlük operasyon · fiziki baskı">
    <div className="print:hidden">
      <div className="flex flex-col gap-2 sm:flex-row"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><Button variant="outline" onClick={() => void load()} className="gap-2"><RefreshCw className="size-4" /> Yenile</Button><Button onClick={printBook} className="gap-2"><Printer className="size-4" /> Fizikî Baskı / PDF</Button></div>
      {message ? <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">{message}</p> : null}

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold"><ClipboardCheck className="size-4" /> Günlük Defter Bilgileri</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="space-y-2"><Label>Başlama Saati</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div><div className="space-y-2"><Label>Bitiş Saati</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div><div className="space-y-2"><Label>Öğretim Şekli</Label><select value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="normal">Normal / Tam Gün</option><option value="sabahci">Sabahçı</option><option value="oglenci">Öğlenci</option></select></div></div>
        <div className="mt-3 space-y-2"><Label>Boş Derslerin Nasıl Doldurulduğuna İlişkin Ek Açıklama</Label><textarea value={emptyLessonResolution} onChange={(e) => setEmptyLessonResolution(e.target.value)} className="min-h-20 w-full rounded-md border bg-background p-3 text-sm" /></div>
        <div className="mt-3 space-y-2"><Label>Gün Sonu Genel Not / Olay ve Tedbirler</Label><textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" /></div>
        <Button onClick={() => void saveDayNotes()} className="mt-3 w-full sm:w-auto">Günlük Bilgileri Kaydet</Button>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">Derse Geç Giren Öğretmen</h2>
          <div className="mt-3 space-y-2"><select value={lateTeacher} onChange={(e) => setLateTeacher(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Öğretmen seçin</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select><div className="grid grid-cols-2 gap-2"><Input type="number" min="1" value={lateMinutes} onChange={(e) => setLateMinutes(e.target.value)} placeholder="Dakika" /><select value={latePeriod} onChange={(e) => setLatePeriod(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">{Array.from({ length: 12 }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}. ders</option>)}</select></div><Input value={lateClass} onChange={(e) => setLateClass(e.target.value)} placeholder="Geç girdiği sınıf" /><Input value={lateNote} onChange={(e) => setLateNote(e.target.value)} placeholder="Düşünceler / açıklama" /><Button onClick={() => void addLateTeacher()} variant="secondary" className="w-full gap-2"><Plus className="size-4" /> Kaydı Ekle</Button></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">Nöbet Süresince Olay Kaydı</h2>
          <div className="mt-3 space-y-2"><Input value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)} placeholder="Olay yeri: Bahçe, 1. Kat..." /><textarea value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} className="min-h-20 w-full rounded-md border bg-background p-3 text-sm" placeholder="Olayın açıklaması" /><textarea value={incidentAction} onChange={(e) => setIncidentAction(e.target.value)} className="min-h-16 w-full rounded-md border bg-background p-3 text-sm" placeholder="Alınan tedbir / yapılan işlem" /><Button onClick={() => void addIncident()} variant="secondary" className="w-full gap-2"><Plus className="size-4" /> Olay Kaydı Ekle</Button></div>
        </div>
      </section>
    </div>

    {book ? <DutyBookPrint data={book} /> : <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="size-4" /> Defter verisi bulunamadı.</div>}
  </AppShell>;
}

function DutyBookPrint({ data }: { data: DutyBook }) {
  const periods = Array.from({ length: 12 }, (_, i) => i + 1);
  return <section className="mt-6 bg-white p-4 text-black print:fixed print:inset-0 print:z-[9999] print:m-0 print:min-h-screen print:p-[8mm]">
    <div className="mx-auto max-w-[194mm] border-2 border-black p-3 text-[10px] leading-tight">
      <h1 className="text-center text-lg font-bold">GÜNLÜK NÖBET DEFTERİ</h1>
      <div className="mt-2 grid grid-cols-5 border border-black"><div className="p-2"><b>Öğretim Şekli</b><br />{data.notes?.teaching_mode ?? "normal"}</div><div className="border-l border-black p-2"><b>Nöbet Tarihi</b><br />{new Date(`${data.date}T00:00:00`).toLocaleDateString("tr-TR")}</div><div className="border-l border-black p-2"><b>Başlama</b><br />{data.notes?.start_time ?? "........"}</div><div className="border-l border-black p-2"><b>Bitiş</b><br />{data.notes?.end_time ?? "........"}</div><div className="border-l border-black p-2"><b>Nöbetçi Md. Yrd.</b><br />{data.manager?.full_name ?? "—"}</div></div>
      <div className="mt-2 border-b border-black pb-2"><b>Nöbetçi Öğretmenler / Yerleri:</b> {data.duty_teachers.map((t) => `${t.full_name ?? "Öğretmen"}${t.location ? ` — ${t.location}` : ""}`).join(" | ") || "—"}</div>

      <h2 className="mt-3 border border-black bg-gray-100 py-1 text-center font-bold">DERSE GELMEYEN ÖĞRETMENLER VE DERSİ ETKİLENEN SINIFLAR</h2>
      <table className="w-full border-collapse"><thead><tr><th className="border border-black p-1 text-left">Öğretmen</th>{periods.map((p) => <th key={p} className="border border-black p-1">{p}</th>)}<th className="border border-black p-1">Düşünceler</th></tr></thead><tbody>{data.absent_teachers.length ? data.absent_teachers.map((a) => <tr key={a.teacher_id}><td className="border border-black p-1">{a.full_name}</td>{periods.map((p) => <td key={p} className="border border-black p-1 text-center">{a.lessons.find((l) => l.period === p)?.class_name ?? ""}</td>)}<td className="border border-black p-1">{a.medical_report ? "Rapor var. " : ""}{a.note ?? ""}</td></tr>) : <tr><td colSpan={14} className="border border-black p-2 text-center">Kayıt yoktur.</td></tr>}</tbody></table>

      <div className="mt-2 min-h-10 border-b border-black"><b>Boş geçen derslerin nasıl doldurulduğu:</b> {data.substitutions.map((s) => `${s.period}. ders ${s.class_name}: ${s.substitute ?? "—"}`).join("; ") || data.notes?.empty_lesson_resolution || ""}</div>

      <h2 className="mt-3 border border-black bg-gray-100 py-1 text-center font-bold">DERSİNE GEÇ GİREN ÖĞRETMENLER</h2>
      <table className="w-full border-collapse"><thead><tr><th className="border border-black p-1">Adı Soyadı</th><th className="border border-black p-1">Kaç Dakika</th><th className="border border-black p-1">Ders Saati</th><th className="border border-black p-1">Sınıf</th><th className="border border-black p-1">Düşünceler</th></tr></thead><tbody>{data.tardiness.length ? data.tardiness.map((l) => <tr key={l.id}><td className="border border-black p-1">{l.full_name}</td><td className="border border-black p-1 text-center">{l.minutes_late}</td><td className="border border-black p-1 text-center">{l.period ?? ""}</td><td className="border border-black p-1 text-center">{l.class_name ?? ""}</td><td className="border border-black p-1">{l.note ?? ""}</td></tr>) : <tr><td colSpan={5} className="border border-black p-2 text-center">Kayıt yoktur.</td></tr>}</tbody></table>

      <h2 className="mt-3 border border-black bg-gray-100 py-1 text-center font-bold">NÖBET SÜRESİNCE OLAYLAR VE ALINAN TEDBİRLER</h2>
      <div className="min-h-16 border-x border-b border-black p-2">{data.incidents.map((i) => <p key={i.id} className="mb-1"><b>{i.location ? `${i.location}: ` : ""}</b>{i.description}{i.action_taken ? ` — Alınan tedbir: ${i.action_taken}` : ""}</p>)}{data.notes?.general_note ? <p>{data.notes.general_note}</p> : null}{!data.incidents.length && !data.notes?.general_note ? "Kayıt yoktur." : null}</div>

      <div className="mt-10 grid grid-cols-2 text-center"><div><b>NÖBETÇİ MÜDÜR YARDIMCISI</b><br /><br />{data.manager?.full_name ?? ""}</div><div><b>GÖRÜLDÜ<br />OKUL MÜDÜRÜ</b></div></div>
    </div>
  </section>;
}
