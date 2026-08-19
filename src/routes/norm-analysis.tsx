import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Scale, Settings2 } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/norm-analysis")({
  head: () => ({ meta: [{ title: "Norm Kadro Analizi — OkulOS" }] }),
  component: NormAnalysis,
});

type Readiness = {
  missing_course_area_count: number;
  missing_area_rule_count: number;
  mapped_course_count: number;
  mapped_area_count: number;
  ready: boolean;
};
type Missing = { item_type: string; item_id: string; item_name: string; detail: string };
type NormRow = {
  teaching_area_id: string;
  teaching_area_name: string;
  total_weekly_hours: number;
  rule_set_id: string;
  rule_set_name: string;
  formal_norm: number;
  active_teacher_count: number;
  operational_difference: number;
  status: "TEACHER_DEFICIT" | "TEACHER_SURPLUS" | "BALANCED";
};

function todayIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function NormAnalysis() {
  const [date, setDate] = useState(todayIstanbul);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [missing, setMissing] = useState<Missing[]>([]);
  const [rows, setRows] = useState<NormRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true); setError(null);
    const { data: readyData, error: readyError } = await supabase.rpc("get_norm_readiness", { p_on_date: date });
    if (readyError) { setError("Norm hazırlık durumu okunamadı. Migration durumunu kontrol edin."); setBusy(false); return; }
    const ready = ((readyData ?? [])[0] ?? null) as Readiness | null;
    setReadiness(ready);

    const { data: missingData } = await supabase.rpc("get_norm_missing_mappings", { p_on_date: date });
    setMissing((missingData ?? []) as Missing[]);

    if (ready?.ready) {
      const { data: analysisData, error: analysisError } = await supabase.rpc("get_formal_norm_analysis", { p_on_date: date });
      if (analysisError) setError("Norm analizi hesaplanamadı. Kural setlerindeki bant ve tekrar parametrelerini kontrol edin.");
      setRows((analysisData ?? []) as NormRow[]);
    } else setRows([]);
    setBusy(false);
  }, [date]);

  useEffect(() => { void load(); }, [load]);

  const totalNorm = rows.reduce((sum, r) => sum + Number(r.formal_norm || 0), 0);
  const totalTeachers = rows.reduce((sum, r) => sum + Number(r.active_teacher_count || 0), 0);

  return <AppShell title="Norm Kadro Analizi" subtitle="Formal norm ≠ operasyonel öğretmen kapasitesi" action={<Scale className="size-5" />}>
    <div className="grid gap-2 sm:grid-cols-[180px_auto]">
      <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
      <Button variant="outline" className="gap-2 sm:w-fit" onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?"size-4 animate-spin":"size-4"}/>Yenile</Button>
    </div>

    {readiness ? <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Ders eşleşmesi</p><p className="mt-1 text-xl font-semibold">{readiness.mapped_course_count}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Alan eşleşmesi</p><p className="mt-1 text-xl font-semibold">{readiness.mapped_area_count}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Eksik kayıt</p><p className="mt-1 text-xl font-semibold">{readiness.missing_course_area_count + readiness.missing_area_rule_count}</p></div>
      <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Durum</p><p className="mt-1 font-semibold">{readiness.ready?"Hesaplamaya hazır":"Veri eksik"}</p></div>
    </div> : null}

    {!readiness?.ready && missing.length ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 size-5 text-amber-700"/><div className="min-w-0 flex-1"><p className="font-semibold text-amber-900">Norm sonucu üretilmedi</p><p className="mt-1 text-xs text-amber-800">Eksik resmi eşleştirme varken sistem tahmin yapmaz. Süper Admin üzerinden kaynaklı kayıtları tamamlayın.</p></div><Link to="/super-admin" className="text-xs font-semibold text-amber-900 underline">Süper Admin</Link></div>
      <div className="mt-3 divide-y rounded-lg border border-amber-200 bg-white">{missing.map(item=><div key={`${item.item_type}-${item.item_id}`} className="px-3 py-2"><p className="text-sm font-medium">{item.item_name}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div>)}</div>
    </div> : null}

    {readiness?.ready ? <>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Toplam formal norm</p><p className="mt-1 text-2xl font-semibold">{totalNorm}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Atama alanı tanımlı öğretmen</p><p className="mt-1 text-2xl font-semibold">{totalTeachers}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Alan sayısı</p><p className="mt-1 text-2xl font-semibold">{rows.length}</p></div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-card"><table className="min-w-full text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-left">Alan</th><th className="px-3 py-2 text-center">Ders Yükü</th><th className="px-3 py-2 text-center">Formal Norm</th><th className="px-3 py-2 text-center">Mevcut Öğr.</th><th className="px-3 py-2 text-center">Fark</th><th className="px-3 py-2 text-left">Kural</th><th className="px-3 py-2 text-left">Durum</th></tr></thead><tbody>{rows.map(r=><tr key={r.teaching_area_id} className="border-t"><td className="px-3 py-2 font-medium">{r.teaching_area_name}</td><td className="px-3 py-2 text-center tabular-nums">{r.total_weekly_hours}</td><td className="px-3 py-2 text-center font-semibold tabular-nums">{r.formal_norm}</td><td className="px-3 py-2 text-center tabular-nums">{r.active_teacher_count}</td><td className="px-3 py-2 text-center tabular-nums">{r.operational_difference>0?`+${r.operational_difference}`:r.operational_difference}</td><td className="px-3 py-2 text-xs text-muted-foreground">{r.rule_set_name}</td><td className="px-3 py-2">{r.status==="BALANCED"?<span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="size-4"/>Dengeli</span>:r.status==="TEACHER_DEFICIT"?<span className="font-medium text-red-700">Öğretmen açığı</span>:<span className="font-medium text-amber-700">Norm fazlası</span>}</td></tr>)}</tbody></table></div>
      <p className="mt-3 text-xs text-muted-foreground">“Mevcut öğretmen” yalnız profilde atama alanı tanımlı aktif öğretmen sayısını gösterir. Formal norm hesabı ders yükü ve seçili yürürlükteki norm kural setinden üretilir.</p>
    </> : null}

    {error?<div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}
    <div className="mt-4 flex justify-end"><Link to="/super-admin" className="inline-flex items-center gap-2 text-sm font-medium text-primary"><Settings2 className="size-4"/>Norm/TTKB kaynaklarını yönet</Link></div>
  </AppShell>;
}
