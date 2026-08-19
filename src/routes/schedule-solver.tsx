import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, RefreshCw, Sparkles, Unlock } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/schedule-solver")({ head:()=>({meta:[{title:"Ders Programı Çözücü — OkulOS"}]}), component:ScheduleSolver });

type Scenario={generation_group:string;scenario_id:string;scenario_no:number;score:number;unplaced_count:number;row_count:number};
type CurrentRow={id:string;teacher_id:string;class_name:string;subject:string;weekday:number;period:number;locked:boolean;profiles?:{full_name:string|null}|null};
type Unplaced={id:string;scenario_id:string;subject:string;reason:string;teacher_id:string|null;class_id:string|null};
type Settings={periods_per_day:number;max_same_course_per_day:number;gap_penalty:number;late_period_penalty:number;repeated_course_penalty:number};
const dayNames=["","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];

function ScheduleSolver(){
  const [scenarios,setScenarios]=useState<Scenario[]>([]);const [current,setCurrent]=useState<CurrentRow[]>([]);const [unplaced,setUnplaced]=useState<Unplaced[]>([]);
  const [settings,setSettings]=useState<Settings>({periods_per_day:8,max_same_course_per_day:2,gap_penalty:8,late_period_penalty:2,repeated_course_penalty:12});
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState<string|null>(null);const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{const [c,s]=await Promise.all([
    supabase.from("teacher_schedule").select("id,teacher_id,class_name,subject,weekday,period,locked,profiles!teacher_schedule_teacher_id_fkey(full_name)").eq("active",true).order("weekday").order("period"),
    supabase.from("schedule_generation_settings").select("periods_per_day,max_same_course_per_day,gap_penalty,late_period_penalty,repeated_course_penalty").eq("id",true).maybeSingle(),
  ]);setCurrent((c.data??[]) as unknown as CurrentRow[]);if(s.data)setSettings(s.data as Settings);},[]);
  useEffect(()=>{void load();},[load]);

  async function toggleLock(row:CurrentRow){const {error:e}=await supabase.from("teacher_schedule").update({locked:!row.locked}).eq("id",row.id);if(e)return setError("Ders kilidi değiştirilemedi.");await load();}
  async function saveSettings(){const {error:e}=await supabase.from("schedule_generation_settings").update({...settings,updated_at:new Date().toISOString()}).eq("id",true);if(e)return setError("Çözücü ayarları kaydedilemedi.");setMessage("Çözücü ayarları kaydedildi.");}
  async function generate(){setBusy(true);setError(null);setMessage(null);const {data,error:e}=await supabase.rpc("generate_schedule_scenarios");setBusy(false);if(e)return setError(`Senaryolar üretilemedi: ${e.message}`);const next=(data??[]) as Scenario[];setScenarios(next);if(next.length){const ids=next.map(x=>x.scenario_id);const {data:u}=await supabase.from("schedule_unplaced_items").select("id,scenario_id,subject,reason,teacher_id,class_id").in("scenario_id",ids);setUnplaced((u??[]) as Unplaced[]);}setMessage("4 program senaryosu üretildi. En düşük puan daha iyi dengelenmiş senaryodur.");}
  async function apply(id:string){setBusy(true);setError(null);const {data,error:e}=await supabase.rpc("apply_schedule_scenario",{p_scenario_id:id});setBusy(false);if(e)return setError(`Senaryo uygulanamadı: ${e.message}`);setMessage(`${Number(data??0)} ders çalışma programına uygulandı. Yayınlanana kadar öğretmenler bu taslağı görmez.`);await load();}
  const lockedCount=useMemo(()=>current.filter(x=>x.locked).length,[current]);

  return <AppShell title="Ders Programı Çözücü" subtitle="Kilitler · 4 senaryo · puanlama · atomik uygulama" action={<Sparkles className="size-5"/>}>
    <div className="grid gap-2 sm:grid-cols-3"><Link to="/curriculum"><Button variant="outline" className="w-full">Müfredat Hazırlığı</Button></Link><Link to="/schedule"><Button variant="outline" className="w-full">Çalışma Programı</Button></Link><Link to="/schedule-archive"><Button variant="outline" className="w-full">Yayın / Arşiv</Button></Link></div>
    {message?<div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">{message}</div>:null}{error?<div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}

    <section className="mt-4 rounded-xl border bg-card p-4"><h2 className="font-semibold">Çözücü Ayarları</h2><div className="mt-3 grid gap-3 sm:grid-cols-5"><div><Label>Günlük Ders</Label><Input type="number" min={1} max={12} value={settings.periods_per_day} onChange={e=>setSettings({...settings,periods_per_day:Number(e.target.value)})}/></div><div><Label>Aynı Ders/Gün</Label><Input type="number" min={1} max={8} value={settings.max_same_course_per_day} onChange={e=>setSettings({...settings,max_same_course_per_day:Number(e.target.value)})}/></div><div><Label>Boşluk Cezası</Label><Input type="number" value={settings.gap_penalty} onChange={e=>setSettings({...settings,gap_penalty:Number(e.target.value)})}/></div><div><Label>Geç Ders Cezası</Label><Input type="number" value={settings.late_period_penalty} onChange={e=>setSettings({...settings,late_period_penalty:Number(e.target.value)})}/></div><div><Label>Tekrar Cezası</Label><Input type="number" value={settings.repeated_course_penalty} onChange={e=>setSettings({...settings,repeated_course_penalty:Number(e.target.value)})}/></div></div><Button variant="secondary" className="mt-3" onClick={()=>void saveSettings()}>Ayarları Kaydet</Button></section>

    <section className="mt-4 rounded-xl border bg-card p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Kilitli Dersler</h2><p className="text-xs text-muted-foreground">{lockedCount} ders kilitli. Kilitli hücreler senaryo üretiminde yerinde kalır.</p></div><Button onClick={()=>void generate()} disabled={busy} className="gap-2"><Sparkles className="size-4"/>4 Senaryo Üret</Button></div>
      <div className="mt-3 max-h-72 overflow-auto rounded-lg border"><table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-2 text-left">Gün/Saat</th><th className="p-2 text-left">Sınıf</th><th className="p-2 text-left">Ders</th><th className="p-2 text-left">Öğretmen</th><th className="p-2">Kilit</th></tr></thead><tbody>{current.map(r=><tr key={r.id} className="border-b"><td className="p-2">{dayNames[r.weekday]} · {r.period}</td><td className="p-2">{r.class_name}</td><td className="p-2">{r.subject}</td><td className="p-2">{r.profiles?.full_name??"—"}</td><td className="p-2 text-center"><Button size="sm" variant={r.locked?"secondary":"ghost"} onClick={()=>void toggleLock(r)}>{r.locked?<Lock className="size-4"/>:<Unlock className="size-4"/>}</Button></td></tr>)}{!current.length?<tr><td colSpan={5} className="p-5 text-center text-muted-foreground">Çalışma programında henüz ders yok. Müfredat ve öğretmen dağıtımını tamamlayın.</td></tr>:null}</tbody></table></div>
    </section>

    <div className="mt-4 grid gap-3 lg:grid-cols-2">{scenarios.sort((a,b)=>a.score-b.score).map((s,index)=>{const problems=unplaced.filter(u=>u.scenario_id===s.scenario_id);return <section key={s.scenario_id} className={index===0?"rounded-xl border-2 border-emerald-400 bg-emerald-50/30 p-4":"rounded-xl border bg-card p-4"}><div className="flex items-start justify-between"><div><h3 className="font-semibold">Senaryo {s.scenario_no}{index===0?" · Önerilen":""}</h3><p className="mt-1 text-xs text-muted-foreground">Puan {s.score} · {s.row_count} ders · {s.unplaced_count} yerleşmeyen</p></div>{s.unplaced_count===0?<CheckCircle2 className="size-5 text-emerald-600"/>:null}</div>{problems.length?<div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{problems.slice(0,6).map(p=><div key={p.id}>{p.subject} · {p.reason}</div>)}{problems.length>6?<div>+{problems.length-6} kayıt daha</div>:null}</div>:null}<Button className="mt-3 w-full" disabled={busy||s.unplaced_count>0} onClick={()=>void apply(s.scenario_id)}>Bu Senaryoyu Uygula</Button></section>})}</div>
    {!scenarios.length?<div className="mt-4 rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Senaryo üretildiğinde dört alternatif burada karşılaştırılır.</div>:null}
    <Button variant="ghost" className="mt-5 gap-2" onClick={()=>void load()}><RefreshCw className="size-4"/>Yenile</Button>
  </AppShell>;
}
