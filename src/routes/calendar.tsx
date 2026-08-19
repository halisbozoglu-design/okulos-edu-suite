import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Çalışma Takvimi — OkulOS" }] }),
  component: CalendarCenter,
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

type CalendarEvent = {
  id: string;
  academic_year_id: string;
  event_type: string;
  title: string;
  starts_on: string;
  ends_on: string;
  blocks_teaching: boolean;
  counts_as_workday: boolean;
  note: string | null;
};

const eventLabels: Record<string, string> = {
  holiday: "Resmî Tatil",
  break: "Ara Tatil / Yarıyıl",
  professional_work: "Mesleki Çalışma",
  teaching_day: "Eğitim Günü",
  exam_window: "Sınav Aralığı",
  common_exam_window: "Ortak Sınav Aralığı",
  responsibility_exam_window: "Sorumluluk Sınavı Aralığı",
  ceremony: "Tören / Etkinlik",
  other: "Diğer",
};

function CalendarCenter() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [code, setCode] = useState("2026-2027");
  const [title, setTitle] = useState("2026-2027 Eğitim Öğretim Yılı");
  const [startsOn, setStartsOn] = useState("2026-09-01");
  const [endsOn, setEndsOn] = useState("2027-08-31");
  const [teacherStart, setTeacherStart] = useState("");
  const [teachingStart, setTeachingStart] = useState("");
  const [firstTermEnd, setFirstTermEnd] = useState("");
  const [secondTermStart, setSecondTermStart] = useState("");
  const [teachingEnd, setTeachingEnd] = useState("");
  const [sourceNote, setSourceNote] = useState("");

  const [eventYear, setEventYear] = useState("");
  const [eventType, setEventType] = useState("holiday");
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [blocksTeaching, setBlocksTeaching] = useState(true);
  const [countsWorkday, setCountsWorkday] = useState(false);
  const [eventNote, setEventNote] = useState("");

  const activeYear = useMemo(() => years.find((y) => y.active) ?? null, [years]);

  const load = useCallback(async () => {
    const [y, e] = await Promise.all([
      supabase.from("academic_years").select("id,code,title,starts_on,ends_on,teacher_work_starts_on,teaching_starts_on,first_term_ends_on,second_term_starts_on,teaching_ends_on,active,source_note").order("starts_on", { ascending: false }),
      supabase.from("school_calendar_events").select("id,academic_year_id,event_type,title,starts_on,ends_on,blocks_teaching,counts_as_workday,note").order("starts_on"),
    ]);
    setYears((y.data ?? []) as AcademicYear[]);
    setEvents((e.data ?? []) as CalendarEvent[]);
    const active = (y.data ?? []).find((row) => row.active);
    if (active && !eventYear) setEventYear(active.id);
  }, [eventYear]);

  useEffect(() => { void load(); }, [load]);

  async function addYear() {
    setMessage(null);
    if (!code.trim() || !title.trim() || !startsOn || !endsOn) return setMessage("Kod, başlık ve yıl başlangıç/bitiş tarihleri zorunludur.");
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("academic_years").upsert({
      code: code.trim(), title: title.trim(), starts_on: startsOn, ends_on: endsOn,
      teacher_work_starts_on: teacherStart || null, teaching_starts_on: teachingStart || null,
      first_term_ends_on: firstTermEnd || null, second_term_starts_on: secondTermStart || null,
      teaching_ends_on: teachingEnd || null, source_note: sourceNote || null,
      created_by: userData.user?.id ?? null,
    }, { onConflict: "code" });
    if (error) return setMessage("Eğitim-öğretim yılı kaydedilemedi.");
    setMessage("Eğitim-öğretim yılı kaydedildi.");
    await load();
  }

  async function activateYear(id: string) {
    const { error } = await supabase.rpc("set_active_academic_year", { p_academic_year_id: id });
    if (error) return setMessage("Aktif eğitim-öğretim yılı değiştirilemedi.");
    setMessage("Aktif eğitim-öğretim yılı güncellendi.");
    await load();
  }

  async function addEvent() {
    if (!eventYear || !eventTitle.trim() || !eventStart || !eventEnd) return setMessage("Yıl, olay başlığı ve tarih aralığı zorunludur.");
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("school_calendar_events").insert({
      academic_year_id: eventYear, event_type: eventType, title: eventTitle.trim(), starts_on: eventStart, ends_on: eventEnd,
      blocks_teaching: blocksTeaching, counts_as_workday: countsWorkday, note: eventNote || null, created_by: userData.user?.id ?? null,
    });
    if (error) return setMessage("Takvim olayı kaydedilemedi.");
    setEventTitle(""); setEventStart(""); setEventEnd(""); setEventNote("");
    setMessage("Takvim olayı kaydedildi."); await load();
  }

  return <AppShell title="Çalışma Takvimi" subtitle="Akademik yıl · tatil · mesleki çalışma · sınav aralıkları" action={<CalendarDays className="size-5" />}>
    {message ? <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}
    {activeYear ? <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 size-5 shrink-0"/><div><b>Aktif yıl: {activeYear.title}</b><p className="mt-1 text-xs">{activeYear.starts_on} → {activeYear.ends_on}. Program, nöbet, sınav ve ek ders bu merkezi tarih kaynağını kullanır.</p></div></div> : <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Henüz aktif eğitim-öğretim yılı seçilmedi.</div>}

    <Tabs defaultValue="year">
      <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="year">Yıl</TabsTrigger><TabsTrigger value="events">Olaylar</TabsTrigger><TabsTrigger value="list">Takvim</TabsTrigger></TabsList>
      <TabsContent value="year" className="mt-4 space-y-4">
        <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Eğitim-Öğretim Yılı</h2><div className="mt-3 grid gap-3 md:grid-cols-2">
          <div><Label>Kod</Label><Input value={code} onChange={(e)=>setCode(e.target.value)}/></div><div><Label>Başlık</Label><Input value={title} onChange={(e)=>setTitle(e.target.value)}/></div>
          <div><Label>Yıl Başlangıcı</Label><Input type="date" value={startsOn} onChange={(e)=>setStartsOn(e.target.value)}/></div><div><Label>Yıl Bitişi</Label><Input type="date" value={endsOn} onChange={(e)=>setEndsOn(e.target.value)}/></div>
          <div><Label>Öğretmen Mesai Başlangıcı</Label><Input type="date" value={teacherStart} onChange={(e)=>setTeacherStart(e.target.value)}/></div><div><Label>Derslerin Başlangıcı</Label><Input type="date" value={teachingStart} onChange={(e)=>setTeachingStart(e.target.value)}/></div>
          <div><Label>1. Dönem Sonu</Label><Input type="date" value={firstTermEnd} onChange={(e)=>setFirstTermEnd(e.target.value)}/></div><div><Label>2. Dönem Başlangıcı</Label><Input type="date" value={secondTermStart} onChange={(e)=>setSecondTermStart(e.target.value)}/></div>
          <div><Label>Derslerin Bitişi</Label><Input type="date" value={teachingEnd} onChange={(e)=>setTeachingEnd(e.target.value)}/></div><div><Label>Kaynak / Not</Label><Input value={sourceNote} onChange={(e)=>setSourceNote(e.target.value)} placeholder="MEB/İstanbul çalışma takvimi vb."/></div>
        </div><Button className="mt-3 w-full" onClick={()=>void addYear()}><Plus className="mr-2 size-4"/>Yılı Kaydet</Button></section>
        {years.map((y)=><div key={y.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"><div className="flex-1"><b>{y.title}</b><p className="text-xs text-muted-foreground">{y.starts_on} → {y.ends_on}</p></div>{y.active?<span className="text-xs font-semibold text-emerald-700">AKTİF</span>:<Button variant="outline" size="sm" onClick={()=>void activateYear(y.id)}>Aktif Yap</Button>}</div>)}
      </TabsContent>

      <TabsContent value="events" className="mt-4 space-y-4"><section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Takvim Olayı Ekle</h2><div className="mt-3 grid gap-3 md:grid-cols-2">
        <div><Label>Eğitim Yılı</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={eventYear} onChange={(e)=>setEventYear(e.target.value)}><option value="">Seçiniz</option>{years.map(y=><option key={y.id} value={y.id}>{y.title}</option>)}</select></div>
        <div><Label>Tür</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={eventType} onChange={(e)=>{const v=e.target.value;setEventType(v);setBlocksTeaching(v==="holiday"||v==="break");setCountsWorkday(v==="professional_work");}}>{Object.entries(eventLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><Label>Başlık</Label><Input value={eventTitle} onChange={(e)=>setEventTitle(e.target.value)}/></div><div><Label>Açıklama</Label><Input value={eventNote} onChange={(e)=>setEventNote(e.target.value)}/></div>
        <div><Label>Başlangıç</Label><Input type="date" value={eventStart} onChange={(e)=>{setEventStart(e.target.value);if(!eventEnd)setEventEnd(e.target.value);}}/></div><div><Label>Bitiş</Label><Input type="date" value={eventEnd} onChange={(e)=>setEventEnd(e.target.value)}/></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={blocksTeaching} onChange={(e)=>setBlocksTeaching(e.target.checked)}/> Ders yapılmasını engeller</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={countsWorkday} onChange={(e)=>setCountsWorkday(e.target.checked)}/> Çalışma günü sayılır</label>
      </div><Button className="mt-3 w-full" onClick={()=>void addEvent()}>Olayı Kaydet</Button></section></TabsContent>

      <TabsContent value="list" className="mt-4 space-y-2">{events.filter(e=>!activeYear||e.academic_year_id===activeYear.id).map((e)=><div key={e.id} className="rounded-xl border bg-card p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><b>{e.title}</b><span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{eventLabels[e.event_type]??e.event_type}</span>{e.blocks_teaching?<span className="text-[10px] text-red-600">Ders yok</span>:null}{e.counts_as_workday?<span className="text-[10px] text-emerald-700">Çalışma günü</span>:null}</div><p className="mt-1 text-xs text-muted-foreground">{e.starts_on}{e.ends_on!==e.starts_on?` → ${e.ends_on}`:""}{e.note?` · ${e.note}`:""}</p></div>)}{!events.length?<p className="rounded-xl border p-5 text-center text-sm text-muted-foreground">Takvim olayı yok.</p>:null}</TabsContent>
    </Tabs>
    <Button variant="ghost" className="mt-5 gap-2" onClick={()=>void load()}><RefreshCw className="size-4"/>Yenile</Button>
  </AppShell>;
}
