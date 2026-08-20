import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Archive, BookOpenCheck, Building2, CalendarRange, ChevronRight, Columns3, GripVertical, History, LockKeyhole, Moon, PanelLeftClose, Play, RotateCcw, Save, Settings2, ShieldCheck, Sparkles, Sun, Table2, Users, WandSparkles } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "Ders Programı Çalışma Alanı — OkulOS" }] }),
  component: TimetableWorkspace,
});

type AcademicYear = { id: string; code: string; title: string; starts_on: string; ends_on: string; active: boolean };
type RuleMode = { rule_code: string; label: string; mode: string; config: unknown };
type MenuItem = { id: string; label: string; to?: string; parentId: string | null; kind: "group" | "item" };

const DEFAULT_MENU: MenuItem[] = [
  { id: "prep", label: "Veri Hazırlığı", parentId: null, kind: "group" },
  { id: "year", label: "Eğitim-Öğretim Yılı", to: "/academic-years", parentId: "prep", kind: "item" },
  { id: "classes", label: "Sınıflar", to: "/classes", parentId: "prep", kind: "item" },
  { id: "teachers", label: "Öğretmenler", to: "/personnel-admin", parentId: "prep", kind: "item" },
  { id: "curriculum", label: "Ders Havuzu & Atamalar", to: "/curriculum", parentId: "prep", kind: "item" },
  { id: "rooms", label: "Derslikler", to: "/classrooms", parentId: "prep", kind: "item" },
  { id: "program", label: "Program İşlemleri", parentId: null, kind: "group" },
  { id: "weekly", label: "Haftalık Program", to: "/schedule", parentId: "program", kind: "item" },
  { id: "rules", label: "Kurallar", to: "/schedule-rules", parentId: "program", kind: "item" },
  { id: "solver", label: "Program Üret", to: "/schedule-solver", parentId: "program", kind: "item" },
  { id: "roomAssign", label: "Derslik Atama", to: "/room-assignment", parentId: "program", kind: "item" },
  { id: "control", label: "Kontrol & Yayın", parentId: null, kind: "group" },
  { id: "validation", label: "Preflight / Kontrol", to: "/schedule-validation", parentId: "control", kind: "item" },
  { id: "history", label: "Geçmiş / Geri Al", to: "/schedule-history", parentId: "control", kind: "item" },
  { id: "archive", label: "Yayın & Arşiv", to: "/schedule-archive", parentId: "control", kind: "item" },
];

const workspaceTabs = [
  ["Program", "/schedule"], ["Sınıflar", "/classes"], ["Öğretmenler", "/personnel-admin"], ["Ders Havuzu", "/curriculum"], ["Derslikler", "/classrooms"], ["Kurallar", "/schedule-rules"], ["Kontrol", "/schedule-validation"], ["Raporlar", "/schedule-archive"],
] as const;

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem("okulos-theme", theme);
}

function TimetableWorkspace() {
  const { can } = usePermissions();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [rules, setRules] = useState<RuleMode[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    try { const raw = window.localStorage.getItem("okulos-timetable-menu-v1"); return raw ? JSON.parse(raw) as MenuItem[] : DEFAULT_MENU; } catch { return DEFAULT_MENU; }
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("okulos-theme");
    return stored === "dark" ? "dark" : "light";
  });

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { window.localStorage.setItem("okulos-timetable-menu-v1", JSON.stringify(menu)); }, [menu]);
  useEffect(() => { void (async () => {
    const [yearResult, ruleResult] = await Promise.all([
      supabase.from("academic_years").select("id,code,title,starts_on,ends_on,active").order("starts_on", { ascending: false }),
      supabase.from("schedule_rule_modes").select("rule_code,label,mode,config").in("rule_code", ["physical_education_edge_slots", "music_edge_slots"]),
    ]);
    if (!yearResult.error) setYears((yearResult.data ?? []) as AcademicYear[]);
    if (!ruleResult.error) setRules((ruleResult.data ?? []) as RuleMode[]);
  })(); }, []);

  const activeYear = useMemo(() => years.find((year) => year.active) ?? null, [years]);
  const groups = useMemo(() => menu.filter((item) => item.kind === "group" && item.parentId === null), [menu]);
  const ruleEnabled = (code: string) => rules.find((rule) => rule.rule_code === code)?.mode !== "off";

  async function toggleEdgeRule(code: string, enabled: boolean) {
    if (!can("schedule.rules")) return;
    const { error } = await supabase.from("schedule_rule_modes").update({ mode: enabled ? "hard" : "off", updated_at: new Date().toISOString() }).eq("rule_code", code);
    if (error) { setMessage("Özel yerleşim kuralı kaydedilemedi."); return; }
    setRules((current) => current.map((rule) => rule.rule_code === code ? { ...rule, mode: enabled ? "hard" : "off" } : rule));
    setMessage(`${code === "physical_education_edge_slots" ? "Beden Eğitimi" : "Müzik"} kenar saat kuralı ${enabled ? "zorunlu" : "kapalı"} olarak kaydedildi.`);
  }

  function dropOn(targetId: string) {
    if (!dragged || dragged === targetId) return;
    setMenu((current) => {
      const source = current.find((item) => item.id === dragged);
      const target = current.find((item) => item.id === targetId);
      if (!source || !target) return current;
      const next = current.filter((item) => item.id !== dragged);
      const moved: MenuItem = { ...source, parentId: target.kind === "group" ? target.id : target.parentId };
      const targetIndex = next.findIndex((item) => item.id === targetId);
      next.splice(Math.max(0, targetIndex + (target.kind === "group" ? 1 : 0)), 0, moved);
      return next;
    });
    setDragged(null);
  }

  function moveRoot(id: string) {
    setMenu((current) => current.map((item) => item.id === id ? { ...item, parentId: null } : item));
  }

  function resetMenu() {
    setMenu(DEFAULT_MENU);
    window.localStorage.removeItem("okulos-timetable-menu-v1");
  }

  return <AppShell title="Ders Programı" subtitle="Veri hazırlığı → kurallar → üretim → kontrol → yayın, tek çalışma alanında">
    {message ? <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}

    <section className="rounded-2xl border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/academic-years" className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-semibold"><CalendarRange className="size-4"/>{activeYear?.code ?? "Yıl seçilmedi"}<ChevronRight className="size-3.5"/></Link>
          {activeYear ? <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">Aktif yıl</span> : null}
        </div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="mr-1 size-4"/> : <Moon className="mr-1 size-4"/>}{theme === "dark" ? "Açık Tema" : "Koyu Tema"}</Button><Button variant="outline" size="sm" onClick={() => setCustomizing((value) => !value)}><Settings2 className="mr-1 size-4"/>Menüyü Düzenle</Button></div>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">{workspaceTabs.map(([label, to]) => <Link key={to} to={to as never} className="whitespace-nowrap rounded-lg border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{label}</Link>)}</div>
    </section>

    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {can("schedule.generate") ? <Link to="/schedule-solver" className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><WandSparkles className="mr-2 size-4"/>Program Üret</Link> : null}
      <Link to="/schedule-solver" className="inline-flex h-10 shrink-0 items-center rounded-lg border bg-card px-4 text-sm font-medium"><Columns3 className="mr-2 size-4"/>Senaryolar</Link>
      {can("schedule.publish") ? <Link to="/schedule-archive" className="inline-flex h-10 shrink-0 items-center rounded-lg border bg-card px-4 text-sm font-medium"><Save className="mr-2 size-4"/>Yayınla</Link> : null}
      {can("schedule.edit") ? <Link to="/schedule" className="inline-flex h-10 shrink-0 items-center rounded-lg border bg-card px-4 text-sm font-medium"><Table2 className="mr-2 size-4"/>Ders Ekle / Taşı</Link> : null}
      <Link to="/schedule-history" className="inline-flex h-10 shrink-0 items-center rounded-lg border bg-card px-4 text-sm font-medium"><History className="mr-2 size-4"/>Geri Al</Link>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_280px]">
      <aside className="rounded-2xl border bg-card p-3">
        <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Çalışma Akışı</p><p className="text-[11px] text-muted-foreground">İlgili işler birlikte</p></div><PanelLeftClose className="size-4 text-muted-foreground"/></div>
        <div className="space-y-4">{groups.map((group) => <div key={group.id}><p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</p><div className="space-y-1">{menu.filter((item) => item.parentId === group.id).map((item) => item.to ? <Link key={item.id} to={item.to as never} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition hover:bg-muted"><span>{item.label}</span><ChevronRight className="size-3.5 text-muted-foreground"/></Link> : null)}</div></div>)}</div>
      </aside>

      <main className="min-w-0 rounded-2xl border bg-card p-4">
        {!activeYear ? <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"><b>Program üretilemez:</b> Önce eğitim-öğretim yılı açıp aktif çalışma yılı seçin. <Link to="/academic-years" className="ml-1 underline">Yıl yönetimini aç</Link></div> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/schedule-preparation" className="rounded-xl border p-3 transition hover:border-primary/40"><ShieldCheck className="size-5 text-primary"/><p className="mt-2 text-sm font-semibold">Hazırlık Kontrolü</p><p className="mt-1 text-xs text-muted-foreground">Eksik ders, öğretmen, blok ve çakışmaları üretimden önce yakala.</p></Link>
          <Link to="/schedule-rules" className="rounded-xl border p-3 transition hover:border-primary/40"><Settings2 className="size-5 text-primary"/><p className="mt-2 text-sm font-semibold">Kurallar</p><p className="mt-1 text-xs text-muted-foreground">HARD / SOFT / KAPALI, bloklar, gün ve saat tercihleri.</p></Link>
          <Link to="/schedule-solver" className="rounded-xl border p-3 transition hover:border-primary/40"><Sparkles className="size-5 text-primary"/><p className="mt-2 text-sm font-semibold">Akıllı Üretim</p><p className="mt-1 text-xs text-muted-foreground">Senaryo üret, repair ve kalite puanıyla karşılaştır.</p></Link>
          <Link to="/schedule-validation" className="rounded-xl border p-3 transition hover:border-primary/40"><Play className="size-5 text-primary"/><p className="mt-2 text-sm font-semibold">Son Kontrol</p><p className="mt-1 text-xs text-muted-foreground">Yayın öncesi hard constraint ve bütünlük denetimi.</p></Link>
        </div>

        <div className="mt-4 rounded-xl border border-dashed bg-muted/15 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Haftalık program çalışma alanı</h2><p className="mt-1 text-sm text-muted-foreground">Program tablosu ayrı bir modül gibi dağılmak yerine bu akışın merkezinde tutulur. Mevcut tabloyu açıp düzenleyebilir, ardından aynı yerden kontrol/yayın akışına dönebilirsiniz.</p></div><Link to="/schedule" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Programı Aç<ChevronRight className="ml-1 size-4"/></Link></div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link to="/curriculum" className="flex items-center gap-3 rounded-xl border p-3"><BookOpenCheck className="size-5 text-primary"/><div><p className="text-sm font-semibold">Ders Havuzu</p><p className="text-[11px] text-muted-foreground">Parse + manuel ekle/saat düzelt</p></div></Link>
          <Link to="/classrooms" className="flex items-center gap-3 rounded-xl border p-3"><Building2 className="size-5 text-primary"/><div><p className="text-sm font-semibold">Derslikler</p><p className="text-[11px] text-muted-foreground">Kapasite, tür, ekipman</p></div></Link>
          <Link to="/personnel-admin" className="flex items-center gap-3 rounded-xl border p-3"><Users className="size-5 text-primary"/><div><p className="text-sm font-semibold">Öğretmenler</p><p className="text-[11px] text-muted-foreground">Branş, yük, müsaitlik</p></div></Link>
        </div>
      </main>

      <aside className="space-y-4">
        <section className="rounded-2xl border bg-card p-4"><h2 className="text-sm font-semibold">Özel Yerleşim Kuralları</h2><p className="mt-1 text-xs text-muted-foreground">Default açık ve HARD. İmkânsızsa motor sessizce bozmaz; nedenini raporlar.</p><div className="mt-4 space-y-3">{[["physical_education_edge_slots","Beden Eğitimi"],["music_edge_slots","Müzik"]].map(([code,label]) => <label key={code} className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">Pazartesi 1. ders + Cuma son ders</p></div><input type="checkbox" className="mt-1 size-4" disabled={!can("schedule.rules") || !rules.some((r) => r.rule_code === code)} checked={ruleEnabled(code)} onChange={(e) => void toggleEdgeRule(code, e.target.checked)}/></label>)}</div>{!rules.length ? <p className="mt-3 text-[11px] text-amber-700 dark:text-amber-300">Cloud migration uygulanınca bu iki kural burada aktif olacaktır.</p> : null}</section>
        <section className="rounded-2xl border bg-card p-4"><h2 className="text-sm font-semibold">Yayın Kapısı</h2><div className="mt-3 space-y-2 text-xs"><p className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600"/>0 hard hata</p><p className="flex items-center gap-2"><LockKeyhole className="size-4 text-emerald-600"/>Kilitli slotlar korunur</p><p className="flex items-center gap-2"><Archive className="size-4 text-emerald-600"/>Restore noktası / arşiv</p></div></section>
      </aside>
    </div>

    {customizing ? <section className="mt-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Menüyü Düzenle</h2><p className="text-xs text-muted-foreground">Sürükleyip bir grubun üzerine bırakırsanız alt menü olur; başka öğenin üzerine bırakırsanız o grubun sırasına taşınır. Düzen bu cihazda kullanıcı tercihi olarak saklanır.</p></div><Button variant="outline" size="sm" onClick={resetMenu}><RotateCcw className="mr-1 size-4"/>Varsayılan</Button></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{menu.map((item) => <div key={item.id} draggable onDragStart={() => setDragged(item.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropOn(item.id)} className={cn("flex items-center gap-2 rounded-xl border p-3", item.kind === "group" ? "bg-primary/5 font-semibold" : "bg-background", dragged === item.id && "opacity-50")}><GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground"/><div className="min-w-0 flex-1"><p className="truncate text-sm">{item.label}</p><p className="truncate text-[10px] text-muted-foreground">{item.kind === "group" ? "Ana grup" : `Altında: ${menu.find((m) => m.id === item.parentId)?.label ?? "Kök"}`}</p></div>{item.kind === "item" && item.parentId ? <button type="button" className="text-[10px] text-muted-foreground underline" onClick={() => moveRoot(item.id)}>Köke al</button> : null}</div>)}</div>
    </section> : null}
  </AppShell>;
}
