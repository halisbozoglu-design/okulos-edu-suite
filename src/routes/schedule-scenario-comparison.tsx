import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, GitCompareArrows, Sparkles } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route=createFileRoute("/schedule-scenario-comparison")({
  head:()=>({meta:[{title:"Senaryo Karşılaştırması — OkulOS"}]}),component:ScenarioComparison,
});

type Scenario={generation_group:string;scenario_id:string;scenario_no:number;score:number;row_count:number;unplaced_count:number;status:string;hard_issue_count:number;room_issue_count:number;stale:boolean;applicable:boolean};
type Explanation={scenario_id:string;total_score:number;pedagogic_score:number;teacher_score:number;room_score:number;duty_score:number;workshop_score:number;positives:Array<{metric:string;score:number;detail:string}>;negatives:Array<{metric:string;score:number;detail:string}>;metrics:Record<string,{score:number;detail:string}>};

function ScenarioComparison(){
 const [rows,setRows]=useState<Scenario[]>([]),[explanations,setExplanations]=useState<Explanation[]>([]),[error,setError]=useState<string|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{void(async()=>{setLoading(true);setError(null);const latest=await supabase.from("schedule_scenarios").select("generation_group").order("generated_at",{ascending:false}).limit(1).maybeSingle();if(latest.error){setError(latest.error.message);setLoading(false);return}if(!latest.data?.generation_group){setRows([]);setLoading(false);return}const [s,e]=await Promise.all([
   supabase.from("schedule_scenario_status_v2").select("generation_group,scenario_id,scenario_no,score,row_count,unplaced_count,status,hard_issue_count,room_issue_count,stale,applicable").eq("generation_group",latest.data.generation_group).order("scenario_no"),
   supabase.from("schedule_scenario_explanations").select("scenario_id,total_score,pedagogic_score,teacher_score,room_score,duty_score,workshop_score,positives,negatives,metrics")
  ]);if(s.error||e.error)setError(s.error?.message??e.error?.message??"Karşılaştırma okunamadı.");setRows((s.data??[]) as Scenario[]);setExplanations((e.data??[]) as unknown as Explanation[]);setLoading(false)})()},[]);
 const best=useMemo(()=>rows.filter(x=>x.applicable&&!x.stale).sort((a,b)=>a.score-b.score)[0]?.scenario_id??null,[rows]);
 if(loading)return <AppShell title="Senaryo Karşılaştırması" subtitle="Son üretim grubunun açıklanabilir kalite karşılaştırması"><div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">Senaryolar yükleniyor…</div></AppShell>;
 return <AppShell title="Senaryo Karşılaştırması" subtitle="Hard bütünlük + pedagojik kalite + nöbet + atölye etkisi" action={<GitCompareArrows className="size-5"/>}>
  <div className="mb-4 flex flex-wrap gap-2"><Link to="/schedule-solver"><Button variant="outline">Çözücü</Button></Link><Link to="/schedule-optimization"><Button variant="outline">Optimizasyon</Button></Link></div>
  {error?<div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}
  {!rows.length?<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Karşılaştırılacak senaryo yok. Önce Program Çözücü'den senaryo üretin.</div>:<div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">{rows.map(s=>{const ex=explanations.find(x=>x.scenario_id===s.scenario_id);const recommended=s.scenario_id===best;return <section key={s.scenario_id} className={`rounded-2xl border p-4 ${recommended?"border-emerald-400 bg-emerald-50/30":"bg-card"}`}>
    <div className="flex items-start justify-between gap-2"><div><h2 className="font-semibold">Senaryo {s.scenario_no}</h2><p className="text-xs text-muted-foreground">Toplam skor {s.score}</p></div>{recommended?<span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">Önerilen</span>:null}</div>
    <div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs"><div className="rounded-lg border p-2"><b>{s.hard_issue_count}</b><br/>Hard</div><div className="rounded-lg border p-2"><b>{s.unplaced_count}</b><br/>Yerleşmeyen</div><div className="rounded-lg border p-2"><b>{s.room_issue_count}</b><br/>Derslik</div></div>
    <div className="mt-3 flex items-center gap-2 text-xs">{s.stale?<><AlertTriangle className="size-4 text-red-600"/>Eski veri</>:s.applicable?<><CheckCircle2 className="size-4 text-emerald-600"/>Uygulanabilir</>:<><AlertTriangle className="size-4 text-amber-600"/>Düzeltme gerekli</>}</div>
    {ex?<><div className="mt-4 space-y-1 text-xs"><Metric label="Pedagojik" value={ex.pedagogic_score}/><Metric label="Nöbet" value={ex.duty_score}/><Metric label="Atölye" value={ex.workshop_score}/></div><div className="mt-4"><h3 className="flex items-center gap-1 text-xs font-semibold"><Sparkles className="size-3"/>En belirgin etkiler</h3>{(ex.negatives??[]).slice(0,3).map((x,i)=><p key={i} className="mt-1 text-[11px] leading-relaxed text-amber-700">+{x.score} · {x.detail}</p>)}{(ex.positives??[]).slice(0,2).map((x,i)=><p key={`p${i}`} className="mt-1 text-[11px] leading-relaxed text-emerald-700">{x.score} · {x.detail}</p>)}</div></>:<p className="mt-4 text-xs text-muted-foreground">Açıklama henüz üretilmedi; senaryoyu yeniden puanlayın.</p>}
   </section>})}</div>}
 </AppShell>
}
function Metric({label,value}:{label:string;value:number}){return <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"><span>{label}</span><b>{value}</b></div>}
