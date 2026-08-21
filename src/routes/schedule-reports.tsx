import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer, RefreshCw, Table2 } from "lucide-react";
import * as XLSX from "xlsx";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/schedule-reports")({
  head: () => ({ meta: [{ title: "Ders Programı Raporları — OkulOS" }] }),
  component: ScheduleReports,
});

type AssignmentOption = {
  teacher_assignment_id: string;
  teacher_id: string;
  teacher_name: string | null;
  class_id: string;
  class_name: string;
  composite_key: string | null;
  course_name: string;
};

type ScheduleRow = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  weekday: number;
  period: number;
  class_name: string;
  subject: string;
  classroom_id: string | null;
  classroom: string | null;
  locked: boolean;
  teacher_assignment_id: string | null;
};

type TimeProfile = { teaching_days: number[]; periods_per_day: number };
type ActiveYear = { code?: string; title?: string } | null;
type ReportKind = "schedule" | "teacher" | "class" | "room" | "subject";

type FlatRow = {
  Gün: string;
  Saat: number;
  Öğretmen: string;
  Sınıf: string;
  Ders: string;
  Derslik: string;
  Kilitli: string;
};

const dayName: Record<number, string> = { 1: "Pazartesi", 2: "Salı", 3: "Çarşamba", 4: "Perşembe", 5: "Cuma", 6: "Cumartesi", 7: "Pazar" };
const safeName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();

function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function ScheduleReports() {
  const { can, loading: permissionLoading } = usePermissions();
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [profile, setProfile] = useState<TimeProfile>({ teaching_days: [1, 2, 3, 4, 5], periods_per_day: 8 });
  const [year, setYear] = useState<ActiveYear>(null);
  const [kind, setKind] = useState<ReportKind>("schedule");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    const [a, s, p, y] = await Promise.all([
      supabase.from("schedule_assignment_options").select("teacher_assignment_id,teacher_id,teacher_name,class_id,class_name,composite_key,course_name").order("teacher_name"),
      supabase.from("teacher_schedule").select("id,teacher_id,class_id,weekday,period,class_name,subject,classroom_id,classroom,locked,teacher_assignment_id").eq("active", true).order("weekday").order("period"),
      supabase.rpc("get_active_schedule_time_profile"),
      supabase.from("academic_years").select("code,title").eq("active", true).maybeSingle(),
    ]);
    setBusy(false);
    if (a.error || s.error) {
      setError(`Rapor verileri yüklenemedi: ${(a.error ?? s.error)?.message ?? "Bilinmeyen hata"}`);
      return;
    }
    setAssignments((a.data ?? []) as AssignmentOption[]);
    setRows((s.data ?? []) as ScheduleRow[]);
    if (!p.error && p.data) setProfile(p.data as TimeProfile);
    if (!y.error) setYear((y.data ?? null) as ActiveYear);
  }, []);

  useEffect(() => {
    if (!permissionLoading && can("schedule.view")) void load();
  }, [load, permissionLoading, can]);

  const optionMap = useMemo(() => Object.fromEntries(assignments.map((a) => [a.teacher_assignment_id, a])), [assignments]);
  const teacherName = useCallback((row: ScheduleRow) => optionMap[row.teacher_assignment_id ?? ""]?.teacher_name ?? "—", [optionMap]);

  const teachers = useMemo(() => Array.from(new Set(rows.map(teacherName).filter((x) => x !== "—"))).sort((a, b) => a.localeCompare(b, "tr")), [rows, teacherName]);
  const classes = useMemo(() => Array.from(new Set(rows.map((r) => r.class_name).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr")), [rows]);
  const subjects = useMemo(() => Array.from(new Set(rows.map((r) => r.subject).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr")), [rows]);
  const rooms = useMemo(() => Array.from(new Set(rows.map((r) => r.classroom ?? "Derslik atanmamış"))).sort((a, b) => a.localeCompare(b, "tr")), [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!teacherFilter || teacherName(r) === teacherFilter) &&
    (!classFilter || r.class_name === classFilter) &&
    (!subjectFilter || r.subject === subjectFilter) &&
    (!roomFilter || (r.classroom ?? "Derslik atanmamış") === roomFilter)
  ), [rows, teacherFilter, classFilter, subjectFilter, roomFilter, teacherName]);

  const flatRows = useMemo<FlatRow[]>(() => filtered.map((r) => ({
    Gün: dayName[r.weekday] ?? String(r.weekday),
    Saat: r.period,
    Öğretmen: teacherName(r),
    Sınıf: r.class_name,
    Ders: r.subject,
    Derslik: r.classroom ?? "—",
    Kilitli: r.locked ? "Evet" : "Hayır",
  })), [filtered, teacherName]);

  const teacherSummary = useMemo(() => {
    const map = new Map<string, { teacher: string; lessons: number; days: Set<number>; gaps: number; first: number; last: number }>();
    for (const r of filtered) {
      const name = teacherName(r);
      const item = map.get(name) ?? { teacher: name, lessons: 0, days: new Set<number>(), gaps: 0, first: 99, last: 0 };
      item.lessons += 1; item.days.add(r.weekday); item.first = Math.min(item.first, r.period); item.last = Math.max(item.last, r.period); map.set(name, item);
    }
    for (const item of map.values()) {
      item.gaps = profile.teaching_days.reduce((sum, d) => {
        const periods = filtered.filter((r) => teacherName(r) === item.teacher && r.weekday === d).map((r) => r.period).sort((a, b) => a - b);
        return periods.length > 1 ? sum + (periods[periods.length - 1]! - periods[0]! + 1 - new Set(periods).size) : sum;
      }, 0);
    }
    return Array.from(map.values()).sort((a, b) => a.teacher.localeCompare(b.teacher, "tr"));
  }, [filtered, profile.teaching_days, teacherName]);

  const classSummary = useMemo(() => {
    const names = Array.from(new Set(filtered.map((r) => r.class_name)));
    return names.map((name) => {
      const classRows = filtered.filter((r) => r.class_name === name);
      const gaps = profile.teaching_days.reduce((sum, d) => {
        const periods = classRows.filter((r) => r.weekday === d).map((r) => r.period).sort((a, b) => a - b);
        return periods.length > 1 ? sum + (periods[periods.length - 1]! - periods[0]! + 1 - new Set(periods).size) : sum;
      }, 0);
      return { name, lessons: classRows.length, subjects: new Set(classRows.map((r) => r.subject)).size, gaps };
    }).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [filtered, profile.teaching_days]);

  const roomSummary = useMemo(() => {
    const possible = Math.max(1, profile.teaching_days.length * profile.periods_per_day);
    const names = Array.from(new Set(filtered.map((r) => r.classroom ?? "Derslik atanmamış")));
    return names.map((name) => {
      const count = filtered.filter((r) => (r.classroom ?? "Derslik atanmamış") === name).length;
      return { name, lessons: count, utilization: name === "Derslik atanmamış" ? null : Math.round((count / possible) * 100) };
    }).sort((a, b) => b.lessons - a.lessons || a.name.localeCompare(b.name, "tr"));
  }, [filtered, profile]);

  const subjectSummary = useMemo(() => {
    const names = Array.from(new Set(filtered.map((r) => r.subject)));
    return names.map((name) => {
      const subjectRows = filtered.filter((r) => r.subject === name);
      return { name, lessons: subjectRows.length, teachers: new Set(subjectRows.map(teacherName)).size, classes: new Set(subjectRows.map((r) => r.class_name)).size };
    }).sort((a, b) => b.lessons - a.lessons || a.name.localeCompare(b.name, "tr"));
  }, [filtered, teacherName]);

  const totalGaps = teacherSummary.reduce((n, x) => n + x.gaps, 0);
  const unassignedRooms = filtered.filter((r) => !r.classroom_id).length;
  const title = `Ders Programı Raporu${year?.code ? ` · ${year.code}` : ""}`;

  function exportCsv() {
    const headers = Object.keys(flatRows[0] ?? { Gün: "", Saat: "", Öğretmen: "", Sınıf: "", Ders: "", Derslik: "", Kilitli: "" });
    const lines = [headers.map(csvEscape).join(";"), ...flatRows.map((row) => headers.map((h) => csvEscape(row[h as keyof FlatRow])).join(";"))];
    downloadText(`\uFEFF${lines.join("\r\n")}`, `${safeName(title)}.csv`, "text/csv;charset=utf-8");
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatRows), "Program");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teacherSummary.map((x) => ({ Öğretmen: x.teacher, "Ders Saati": x.lessons, "Çalışma Günü": x.days.size, Boşluk: x.gaps }))), "Öğretmen");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classSummary.map((x) => ({ Sınıf: x.name, "Ders Saati": x.lessons, "Ders Çeşidi": x.subjects, Boşluk: x.gaps }))), "Sınıf");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomSummary.map((x) => ({ Derslik: x.name, "Ders Saati": x.lessons, "Kullanım %": x.utilization ?? "—" }))), "Derslik");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subjectSummary.map((x) => ({ Ders: x.name, "Ders Saati": x.lessons, Öğretmen: x.teachers, Sınıf: x.classes }))), "Ders");
    XLSX.writeFile(wb, `${safeName(title)}.xlsx`);
  }

  if (!permissionLoading && !can("schedule.view")) {
    return <AppShell title="Ders Programı Raporları"><div className="rounded-2xl border bg-card p-6 text-center"><h2 className="font-semibold">Rapor görüntüleme yetkisi gerekli</h2><p className="mt-2 text-sm text-muted-foreground">Bu ekran için schedule.view görevi atanmalıdır.</p><Link to="/management" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Yönetim Merkezi</Link></div></AppShell>;
  }

  return <AppShell title="Ders Programı Raporları" subtitle={`${year?.title ?? year?.code ?? "Aktif eğitim-öğretim yılı"} · tenant kapsamlı canlı program verisi`}>
    <div className="print:hidden flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => void load()} disabled={busy}><RefreshCw className="mr-2 size-4"/>Yenile</Button>
      <Button variant="outline" onClick={exportExcel} disabled={!flatRows.length}><FileSpreadsheet className="mr-2 size-4"/>Excel</Button>
      <Button variant="outline" onClick={exportCsv} disabled={!flatRows.length}><Download className="mr-2 size-4"/>CSV</Button>
      <Button variant="outline" onClick={() => window.print()} disabled={!flatRows.length}><Printer className="mr-2 size-4"/>Yazdır / PDF</Button>
      <Link to="/timetable" className="inline-flex h-10 items-center rounded-md border bg-background px-4 text-sm font-medium"><Table2 className="mr-2 size-4"/>Program Çalışma Alanı</Link>
    </div>
    {error ? <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {[["Toplam Ders", filtered.length], ["Öğretmen", new Set(filtered.map(teacherName)).size], ["Sınıf", new Set(filtered.map((r) => r.class_name)).size], ["Öğretmen Boşluğu", totalGaps], ["Dersliksiz", unassignedRooms]].map(([label, value]) => <div key={String(label)} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}
    </section>

    <section className="print:hidden mt-4 rounded-2xl border bg-card p-4">
      <div className="grid gap-2 md:grid-cols-5">
        <select value={kind} onChange={(e) => setKind(e.target.value as ReportKind)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="schedule">Haftalık Program</option><option value="teacher">Öğretmen Yükü</option><option value="class">Sınıf Özeti</option><option value="room">Derslik Kullanımı</option><option value="subject">Ders / Branş Özeti</option></select>
        <select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Tüm öğretmenler</option>{teachers.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Tüm sınıflar</option>{classes.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Tüm dersler</option>{subjects.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Tüm derslikler</option>{rooms.map((x) => <option key={x}>{x}</option>)}</select>
      </div>
    </section>

    <section className="mt-4 rounded-2xl border bg-card p-4 print:border-0 print:p-0">
      <div className="mb-4 hidden print:block"><h1 className="text-xl font-bold">{title}</h1><p className="text-sm">{year?.title ?? ""}</p></div>
      {kind === "schedule" ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-2 text-left">Gün</th><th className="p-2 text-left">Saat</th><th className="p-2 text-left">Öğretmen</th><th className="p-2 text-left">Sınıf</th><th className="p-2 text-left">Ders</th><th className="p-2 text-left">Derslik</th></tr></thead><tbody>{flatRows.map((r, i) => <tr key={`${r.Gün}-${r.Saat}-${r.Öğretmen}-${i}`} className="border-b"><td className="p-2">{r.Gün}</td><td className="p-2">{r.Saat}</td><td className="p-2">{r.Öğretmen}</td><td className="p-2">{r.Sınıf}</td><td className="p-2">{r.Ders}</td><td className="p-2">{r.Derslik}</td></tr>)}</tbody></table></div> : null}
      {kind === "teacher" ? <SummaryTable headers={["Öğretmen", "Ders Saati", "Çalışma Günü", "Boşluk"]} rows={teacherSummary.map((x) => [x.teacher, x.lessons, x.days.size, x.gaps])}/> : null}
      {kind === "class" ? <SummaryTable headers={["Sınıf", "Ders Saati", "Ders Çeşidi", "Boşluk"]} rows={classSummary.map((x) => [x.name, x.lessons, x.subjects, x.gaps])}/> : null}
      {kind === "room" ? <SummaryTable headers={["Derslik", "Ders Saati", "Kullanım"]} rows={roomSummary.map((x) => [x.name, x.lessons, x.utilization === null ? "—" : `%${x.utilization}`])}/> : null}
      {kind === "subject" ? <SummaryTable headers={["Ders / Branş", "Ders Saati", "Öğretmen", "Sınıf"]} rows={subjectSummary.map((x) => [x.name, x.lessons, x.teachers, x.classes])}/> : null}
      {!filtered.length ? <div className="p-8 text-center text-sm text-muted-foreground">Seçili filtrelerde program satırı bulunamadı.</div> : null}
    </section>
  </AppShell>;
}

function SummaryTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b bg-muted/40">{headers.map((h) => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b">{row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}</tr>)}</tbody></table></div>;
}
