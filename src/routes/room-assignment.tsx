import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/room-assignment")({ head: () => ({ meta: [{ title: "Derslik Atama — OkulOS" }] }), component: RoomAssignment });

type Scenario = { id: string; generation_group: string; scenario_no: number; title: string; score: number; unplaced_count: number; row_count: number; generated_at: string; status: string };
type Gate = { scenario_id: string; stale: boolean; applicable: boolean; basis_revision: number | null; current_revision: number; hard_issue_count: number; room_issue_count: number };
type Status = { total_rows: number; assigned_rows: number; unassigned_rows: number; room_issue_count: number; rooms_configured: boolean };
type RoomSummary = { hard: number; soft: number };
type Issue = { id: string; scenario_id: string; reason: string; detail: string | null; schedule_scenario_rows?: { class_name: string; subject: string; weekday: number; period: number } | null };
const db = supabase as any;

function RoomAssignment() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [gates, setGates] = useState<Record<string, Gate>>({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [summaries, setSummaries] = useState<Record<string, RoomSummary>>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await db.from("schedule_scenarios").select("id,generation_group,scenario_no,title,score,unplaced_count,row_count,generated_at,status").in("status", ["generated", "selected"]).order("generated_at", { ascending: false }).limit(8);
    if (error) { setScenarios([]); setStatuses({}); setGates({}); setSummaries({}); setIssues([]); setLoadError(`Senaryolar okunamadı: ${error.message}`); return; }
    const next = (data ?? []) as Scenario[]; setScenarios(next);
    if (!next.length) { setStatuses({}); setGates({}); setSummaries({}); setIssues([]); return; }
    const ids = next.map((x) => x.id);
    const [gateResult, issueResult] = await Promise.all([
      db.from("schedule_scenario_status_v2").select("scenario_id,stale,applicable,basis_revision,current_revision,hard_issue_count,room_issue_count").in("scenario_id", ids),
      db.from("schedule_room_assignment_issues").select("id,scenario_id,reason,detail,schedule_scenario_rows(class_name,subject,weekday,period)").in("scenario_id", ids),
    ]);
    if (gateResult.error) { setLoadError(`Senaryo güvenlik durumu okunamadı: ${gateResult.error.message}`); setGates({}); } else setGates(Object.fromEntries(((gateResult.data ?? []) as Gate[]).map((g) => [g.scenario_id, g])));
    if (issueResult.error) { setLoadError((v) => v ?? `Derslik sorunları okunamadı: ${issueResult.error.message}`); setIssues([]); } else setIssues((issueResult.data ?? []) as unknown as Issue[]);
    const pairs = await Promise.all(next.map(async (s) => {
      const [status, summary] = await Promise.all([db.rpc("get_scenario_room_status", { p_scenario_id: s.id }), db.rpc("get_schedule_scenario_room_summary_v2", { p_scenario_id: s.id })]);
      return { id: s.id, status, summary };
    }));
    const failed = pairs.find((x) => x.status.error || x.summary.error);
    if (failed) { setLoadError((v) => v ?? `Derslik kalite verileri okunamadı: ${(failed.status.error ?? failed.summary.error)?.message ?? "Bilinmeyen hata"}`); setStatuses({}); setSummaries({}); }
    else {
      setStatuses(Object.fromEntries(pairs.map((x) => [x.id, (((x.status.data ?? [])[0] ?? { total_rows: 0, assigned_rows: 0, unassigned_rows: 0, room_issue_count: 0, rooms_configured: false }) as Status)])));
      setSummaries(Object.fromEntries(pairs.map((x) => [x.id, (((x.summary.data ?? [])[0] ?? { hard: 0, soft: 0 }) as RoomSummary)])));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function assign(id: string, optimize = false) {
    const gate = gates[id];
    if (!gate) return setMessage("Senaryo güvenlik durumu doğrulanamadığı için derslik ataması başlatılamaz.");
    if (gate.stale) return setMessage("Bu senaryo eski program verisine dayanıyor. Önce Program Çözücü'den yeniden senaryo üretin.");
    setBusy(id); setMessage(null);
    const result = optimize
      ? await db.rpc("optimize_classrooms_to_scenario_v2", { p_scenario_id: id, p_preserve_locked: true })
      : await db.rpc("assign_classrooms_to_scenario", { p_scenario_id: id });
    setBusy(null);
    if (result.error) return setMessage(`Derslik ataması yapılamadı: ${result.error.message}`);
    const row = ((result.data ?? [])[0] ?? { assigned_count: 0, unassigned_count: 0 }) as { assigned_count: number; unassigned_count: number };
    setMessage(`${optimize ? "Derslik dağılımı yeniden optimize edildi" : "Derslik ataması tamamlandı"}: ${row.assigned_count} atama; ${row.unassigned_count} ders uygun derslik bekliyor.`);
    await load();
  }

  return <AppShell title="Akıllı Derslik Atama" subtitle="HARD uygunluk · shared room · bina geçişi · SOFT oda tercih optimizasyonu" action={<Building2 className="size-5"/>}>
    <div className="grid gap-2 sm:grid-cols-4">
      <Link to="/schedule-solver"><Button variant="outline" className="w-full">Program Çözücü</Button></Link>
      <Link to="/schedule"><Button variant="outline" className="w-full">Çalışma Programı</Button></Link>
      <Link to="/classrooms"><Button variant="outline" className="w-full">Derslik · Bina Ayarları</Button></Link>
      <Link to="/management"><Button variant="outline" className="w-full">Yönetim Merkezi</Button></Link>
    </div>
    {message ? <div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}
    {loadError ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mr-2 inline size-4"/><b>Derslik atama verileri doğrulanamadı.</b> {loadError}</div> : null}
    <div className="mt-4 grid gap-3 lg:grid-cols-2">{scenarios.map((s) => {
      const st = statuses[s.id], gate = gates[s.id], sm = summaries[s.id], si = issues.filter((x) => x.scenario_id === s.id), stale = !gate || gate.stale;
      return <section key={s.id} className={stale ? "rounded-xl border-2 border-red-300 bg-red-50/30 p-4" : "rounded-xl border bg-card p-4"}>
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Senaryo {s.scenario_no}{stale ? " · Eski/Doğrulanamadı" : ""}</h2><p className="mt-1 text-xs text-muted-foreground">Puan {s.score} · {s.row_count} ders · {s.unplaced_count} programda yerleşmeyen{gate ? ` · rev ${gate.basis_revision ?? "—"}/${gate.current_revision}` : ""}</p></div>{!loadError && !stale && st?.rooms_configured && sm?.hard === 0 && st.unassigned_rows === 0 ? <CheckCircle2 className="size-5 text-emerald-600"/> : null}</div>
        {st ? <div className="mt-3 grid grid-cols-5 gap-2 text-center"><div className="rounded-lg bg-muted/50 p-2"><p className="text-lg font-semibold">{st.assigned_rows}</p><p className="text-[10px] text-muted-foreground">Derslikli</p></div><div className="rounded-lg bg-muted/50 p-2"><p className="text-lg font-semibold">{st.unassigned_rows}</p><p className="text-[10px] text-muted-foreground">Dersliksiz</p></div><div className="rounded-lg bg-muted/50 p-2"><p className="text-lg font-semibold">{st.room_issue_count}</p><p className="text-[10px] text-muted-foreground">Atama sorunu</p></div><div className="rounded-lg bg-muted/50 p-2"><p className="text-lg font-semibold">{sm?.hard ?? "—"}</p><p className="text-[10px] text-muted-foreground">Room HARD</p></div><div className="rounded-lg bg-muted/50 p-2"><p className="text-lg font-semibold">{sm?.soft ?? "—"}</p><p className="text-[10px] text-muted-foreground">Room SOFT</p></div></div> : null}
        {stale ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">Program girdileri değişmiş veya senaryo revision bilgisi doğrulanamamış. Derslik ataması için senaryoyu yeniden üretin.</p> : null}
        {st && !st.rooms_configured ? <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">Aktif derslik tanımı yok. Önce derslik envanterini girin.</p> : null}
        {si.length ? <div className="mt-3 max-h-36 overflow-auto rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{si.map((x) => <div key={x.id} className="py-1">{x.schedule_scenario_rows?.class_name} · {x.schedule_scenario_rows?.subject} · {x.detail ?? x.reason}</div>)}</div> : null}
        <div className="mt-3 grid gap-2 sm:grid-cols-2"><Button className="gap-2" onClick={() => void assign(s.id, false)} disabled={busy === s.id || Boolean(loadError) || stale || !st?.rooms_configured}><Sparkles className="size-4"/>{busy === s.id ? "Çalışıyor…" : "Eksik Derslikleri Ata"}</Button><Button variant="outline" className="gap-2" onClick={() => void assign(s.id, true)} disabled={busy === s.id || Boolean(loadError) || stale || !st?.rooms_configured}><RefreshCw className="size-4"/>Derslikleri Yeniden Optimize Et</Button></div>
      </section>;
    })}</div>
    {!scenarios.length && !loadError ? <div className="mt-4 rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Önce Program Çözücü ile güncel bir senaryo üretin.</div> : null}
    <Button variant="ghost" className="mt-4 gap-2" onClick={() => void load()}><RefreshCw className="size-4"/>Yenile</Button>
  </AppShell>;
}
