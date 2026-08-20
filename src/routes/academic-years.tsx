import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, CalendarRange, CheckCircle2, ChevronRight, CircleDashed, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";

export const Route = createFileRoute("/academic-years")({
  head: () => ({ meta: [{ title: "Eğitim-Öğretim Yılları — OkulOS" }] }),
  component: AcademicYearsPage,
});

type AcademicYear = {
  id: string;
  code: string;
  title: string;
  starts_on: string;
  ends_on: string;
  teacher_work_starts_on: string | null;
  teaching_starts_on: string | null;
  first_term_ends_on: string | null;
  second_term_starts_on: string | null;
  teaching_ends_on: string | null;
  active: boolean;
  source_note: string | null;
};

type YearDraft = {
  code: string;
  title: string;
  startsOn: string;
  endsOn: string;
  teacherStart: string;
  teachingStart: string;
  firstTermEnd: string;
  secondTermStart: string;
  teachingEnd: string;
  sourceNote: string;
};

const EMPTY: YearDraft = { code: "", title: "", startsOn: "", endsOn: "", teacherStart: "", teachingStart: "", firstTermEnd: "", secondTermStart: "", teachingEnd: "", sourceNote: "" };

function nextYearSuggestion(years: AcademicYear[]): YearDraft {
  const latestStart = years.reduce((max, year) => Math.max(max, Number(year.starts_on.slice(0, 4)) || 0), 0);
  const now = new Date();
  const calendarCandidate = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const start = Math.max(latestStart ? latestStart + 1 : 0, calendarCandidate);
  const end = start + 1;
  return {
    ...EMPTY,
    code: `${start}-${end}`,
    title: `${start}-${end} Eğitim Öğretim Yılı`,
    startsOn: `${start}-09-01`,
    endsOn: `${end}-08-31`,
  };
}

function statusOf(year: AcademicYear) {
  if (year.active) return { label: "Aktif", icon: CheckCircle2, className: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" };
  const today = new Date().toISOString().slice(0, 10);
  if (year.starts_on > today) return { label: "Taslak", icon: CircleDashed, className: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" };
  return { label: "Arşiv", icon: Archive, className: "border-border bg-muted/40 text-muted-foreground" };
}

function validateChronology(draft: YearDraft): string | null {
  if (draft.startsOn >= draft.endsOn) return "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.";
  const inside = (value: string) => !value || (value >= draft.startsOn && value <= draft.endsOn);
  if (![draft.teacherStart, draft.teachingStart, draft.firstTermEnd, draft.secondTermStart, draft.teachingEnd].every(inside)) {
    return "İşbaşı, dönem ve ders tarihleri eğitim-öğretim yılının başlangıç/bitiş aralığında olmalıdır.";
  }
  if (draft.teacherStart && draft.teachingStart && draft.teacherStart > draft.teachingStart) return "Öğretmen işbaşı tarihi ders başlangıcından sonra olamaz.";
  if (draft.teachingStart && draft.firstTermEnd && draft.teachingStart >= draft.firstTermEnd) return "1. dönem sonu ders başlangıcından sonra olmalıdır.";
  if (draft.firstTermEnd && draft.secondTermStart && draft.firstTermEnd >= draft.secondTermStart) return "2. dönem başlangıcı 1. dönem sonundan sonra olmalıdır.";
  if (draft.secondTermStart && draft.teachingEnd && draft.secondTermStart >= draft.teachingEnd) return "Ders yılı sonu 2. dönem başlangıcından sonra olmalıdır.";
  if (draft.teachingStart && draft.teachingEnd && draft.teachingStart >= draft.teachingEnd) return "Ders yılı sonu ders başlangıcından sonra olmalıdır.";
  return null;
}

function AcademicYearsPage() {
  const { can, loading: permissionLoading } = usePermissions();
  const editable = can("settings.manage");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [draft, setDraft] = useState<YearDraft>(EMPTY);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("academic_years")
      .select("id,code,title,starts_on,ends_on,teacher_work_starts_on,teaching_starts_on,first_term_ends_on,second_term_starts_on,teaching_ends_on,active,source_note")
      .order("starts_on", { ascending: false });
    if (error) { setMessage("Eğitim-öğretim yılları okunamadı."); return; }
    setYears((data ?? []) as AcademicYear[]);
  }, []);

  useEffect(() => { void load(); }, [load]);
  const activeYear = useMemo(() => years.find((year) => year.active) ?? null, [years]);

  function openNewYear() {
    setDraft(nextYearSuggestion(years));
    setFormOpen(true);
    setMessage(null);
  }

  async function saveYear() {
    if (!editable) return;
    if (!draft.code.trim() || !draft.title.trim() || !draft.startsOn || !draft.endsOn) { setMessage("Yıl kodu, başlık, başlangıç ve bitiş tarihi zorunludur."); return; }
    if (!/^\d{4}-\d{4}$/.test(draft.code.trim())) { setMessage("Yıl kodu 2026-2027 biçiminde olmalıdır."); return; }
    const [codeStart, codeEnd] = draft.code.trim().split("-").map(Number);
    if (codeEnd !== codeStart + 1) { setMessage("Eğitim-öğretim yılı kodunda ikinci yıl ilk yıldan bir büyük olmalıdır."); return; }
    if (!draft.startsOn.startsWith(String(codeStart)) || !draft.endsOn.startsWith(String(codeEnd))) { setMessage("Yıl kodu ile başlangıç/bitiş tarihleri aynı eğitim-öğretim dönemini göstermelidir."); return; }
    const chronologyError = validateChronology(draft);
    if (chronologyError) { setMessage(chronologyError); return; }
    if (years.some((year) => year.code === draft.code.trim())) { setMessage("Bu eğitim-öğretim yılı kurumunuz için zaten kayıtlıdır."); return; }

    setBusy(true); setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("academic_years").insert({
      code: draft.code.trim(), title: draft.title.trim(), starts_on: draft.startsOn, ends_on: draft.endsOn,
      teacher_work_starts_on: draft.teacherStart || null, teaching_starts_on: draft.teachingStart || null,
      first_term_ends_on: draft.firstTermEnd || null, second_term_starts_on: draft.secondTermStart || null,
      teaching_ends_on: draft.teachingEnd || null, source_note: draft.sourceNote || null,
      created_by: userData.user?.id ?? null,
    });
    setBusy(false);
    if (error) { setMessage("Eğitim-öğretim yılı kaydedilemedi. Tarih sırası, kurum kapsamı ve yetkinizi kontrol edin."); return; }
    setMessage(`${draft.code} yılı açıldı. Aktif çalışma yılı yapılmadan hiçbir programı kendiliğinden değiştirmez.`);
    setFormOpen(false); setDraft(EMPTY); await load();
  }

  async function activateYear(id: string) {
    if (!editable) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc("set_active_academic_year", { p_academic_year_id: id });
    setBusy(false);
    if (error) { setMessage("Aktif çalışma yılı değiştirilemedi. Yalnız kendi kurumunuzdaki bir yıl aktif yapılabilir."); return; }
    setMessage("Aktif eğitim-öğretim yılı değiştirildi. Yıl bağımlı modüller bu merkezi yılı kullanır.");
    await load();
  }

  return <AppShell title="Eğitim-Öğretim Yılları" subtitle="Yılı siz açarsınız; sistem yalnız sıradaki yılı önerir ve hiçbir yılı kendiliğinden aktif etmez">
    {message ? <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}
    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold">Çalışma yılı</h2><p className="mt-1 text-xs text-muted-foreground">Program, nöbet, sınav, ek ders, takvim ve görevler kurumunuzun aktif yılı kapsamında değerlendirilir.</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-1 size-4"/>Yenile</Button>{editable ? <Button size="sm" onClick={openNewYear}><Plus className="mr-1 size-4"/>Yeni Yıl Aç</Button> : null}</div>
      </div>
      {activeYear ? <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"><CalendarRange className="size-5"/><div><p className="font-semibold">{activeYear.title}</p><p className="text-xs opacity-80">{activeYear.starts_on} → {activeYear.ends_on}</p></div></div> : <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Henüz aktif eğitim-öğretim yılı seçilmedi. Önce yılı açın, sonra “Aktif Yap” deyin.</div>}
    </section>

    {formOpen && editable ? <section className="mt-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Yeni eğitim-öğretim yılı aç</h2><p className="text-xs text-muted-foreground">Önerilen değerleri değiştirebilirsiniz. Kaydetmek yılı sadece oluşturur; aktif etmez.</p></div><Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Kapat</Button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5"><Label>Yıl Kodu</Label><Input value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} placeholder="2027-2028"/></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Başlık</Label><Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>Yıl Başlangıcı</Label><Input type="date" value={draft.startsOn} onChange={(e) => setDraft((d) => ({ ...d, startsOn: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>Yıl Bitişi</Label><Input type="date" value={draft.endsOn} onChange={(e) => setDraft((d) => ({ ...d, endsOn: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>Öğretmen İşbaşı</Label><Input type="date" value={draft.teacherStart} onChange={(e) => setDraft((d) => ({ ...d, teacherStart: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>Ders Başlangıcı</Label><Input type="date" value={draft.teachingStart} onChange={(e) => setDraft((d) => ({ ...d, teachingStart: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>1. Dönem Sonu</Label><Input type="date" value={draft.firstTermEnd} onChange={(e) => setDraft((d) => ({ ...d, firstTermEnd: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>2. Dönem Başlangıcı</Label><Input type="date" value={draft.secondTermStart} onChange={(e) => setDraft((d) => ({ ...d, secondTermStart: e.target.value }))}/></div>
        <div className="space-y-1.5"><Label>Ders Yılı Sonu</Label><Input type="date" value={draft.teachingEnd} onChange={(e) => setDraft((d) => ({ ...d, teachingEnd: e.target.value }))}/></div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Kaynak / Not</Label><Input value={draft.sourceNote} onChange={(e) => setDraft((d) => ({ ...d, sourceNote: e.target.value }))} placeholder="MEB çalışma takvimi / kurum notu"/></div>
      </div>
      <Button className="mt-4 w-full sm:w-auto" disabled={busy} onClick={() => void saveYear()}>{busy ? "Kaydediliyor…" : "Yılı Oluştur"}</Button>
    </section> : null}

    <section className="mt-4 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="font-semibold">Yıllar</h2><p className="mt-1 text-xs text-muted-foreground">En yeni yıl üstte. Geçmiş yıllar silinmez; arşiv olarak kalır.</p>
      <div className="mt-4 space-y-2">{years.map((year) => { const status = statusOf(year); const Icon = status.icon; return <div key={year.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className={`grid size-10 shrink-0 place-items-center rounded-xl border ${status.className}`}><Icon className="size-5"/></div><div><p className="font-semibold">{year.title}</p><p className="text-xs text-muted-foreground">{year.code} · {year.starts_on} → {year.ends_on}</p><span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>{status.label}</span></div></div><div className="flex gap-2">{!year.active && editable ? <Button size="sm" variant="outline" disabled={busy || permissionLoading} onClick={() => void activateYear(year.id)}>Aktif Yap</Button> : null}<Link to="/calendar" className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium">Takvimi Aç<ChevronRight className="ml-1 size-4"/></Link></div></div>; })}{!years.length ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Henüz eğitim-öğretim yılı açılmamış.</div> : null}</div>
    </section>
  </AppShell>;
}
