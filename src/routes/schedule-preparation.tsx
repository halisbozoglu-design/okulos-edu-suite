import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, WandSparkles } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route=createFileRoute("/schedule-preparation")({head:()=>({meta:[{title:"Program Hazırlık Kontrolü — OkulOS"}]}),component:Preparation});
type Item={category:string;code:string;status:string;affected_count:number;detail:string};
const target:Record<string,string>={
 ACTIVE_TIME_PROFILE:"/schedule-rules",CURRICULUM_NOT_READY:"/curriculum",TEACHER_CONSTRAINT_ROW_MISSING:"/schedule-rules",
 LOCKED_ROW_UNLINKED:"/schedule",LOCKED_ROW_SEMANTIC_MISMATCH:"/schedule",LOCKED_TEACHER_UNAVAILABLE:"/schedule-rules",LOCKED_HOURS_EXCEED_ASSIGNMENT:"/schedule",
 SYNC_GROUP_EMPTY:"/schedule-rules",SYNC_MEMBER_BLOCK_LENGTH_MISMATCH:"/schedule-rules",SYNC_SUBGROUP_MISMATCH:"/schedule-rules",SYNC_SUBGROUP_HAS_NO_STUDENTS:"/schedule-rules",SYNC_SUBGROUP_STUDENT_OVERLAP:"/schedule-rules",
 QURAN_WEEKLY_SYNC_INCOMPLETE:"/quran-groups",ROOM_RULE_HAS_NO_MATCHING_ROOM:"/classrooms",BLOCK_PATTERN_ASSIGNMENT_MISMATCH:"/schedule-rules",
 TIME_PROFILE_CONFIGURATION_INVALID:"/schedule-rules",TEACHER_CONSTRAINT_CONFIGURATION_INVALID:"/schedule-rules",COURSE_RULE_CONFIGURATION_INVALID:"/schedule-rules",
 SYNC_GROUP_REQUIRES_TWO_MEMBERS:"/schedule-rules",SYNC_GROUP_CLASS_MISMATCH:"/schedule-rules",SYNC_TOTAL_HOURS_EXCEED_ASSIGNMENT:"/schedule-rules"
};
function Preparation(){const [items,setItems]=useState<Item[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState<string|null>(null);const [loadError,setLoadError]=useState<string|null>(null);const [loaded,setLoaded]=useState(false);
 const load=useCallback(async()=>{setBusy(true);setLoaded(false);const {data,error}=await supabase.rpc("get_schedule_preparation_readiness");setBusy(false);if(error){setItems([]);setLoadError(error.message);setLoaded(true);return}setLoadError(null);setItems((data??[]) as Item[]);setLoaded(true)},[]);useEffect(()=>{void load()},[load]);
 async function syncQuran(){setBusy(true);const {data,error}=await supabase.rpc("sync_all_quran_plans_to_timetable");setBusy(false);const result=Array.isArray(data)?data[0]:data;setMessage(error?error.message:`Kur’an planı senkronu tamamlandı. Başarılı: ${result?.synced??0}, eksik veri nedeniyle tamamlanamayan: ${result?.failed??0}.`);await load()}
 const ready=loaded&&!loadError&&items.length===0;
 return <AppShell title="Program Hazırlık Kontrolü" subtitle="Senaryo üretiminden önce tüm zorunlu girdiler" action={<WandSparkles className="size-5"/>}>
 {!loaded||busy?<div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">Program hazırlık kontrolleri çalıştırılıyor…</div>:loadError?<div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertTriangle className="mr-2 inline size-5"/><b>Hazırlık doğrulaması çalıştırılamadı.</b><p className="mt-2 text-sm">{loadError}</p><p className="mt-2 text-xs">Kontrol tamamlanmadan çözücü çalıştırılamaz.</p></div>:ready?<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"><CheckCircle2 className="mr-2 inline size-5"/><b>Hazırlık tamam.</b> Ders programı çözücüsü çalıştırılabilir.</div>:<div className="space-y-3">{items.map(x=><div key={x.code} className="rounded-xl border border-red-200 bg-red-50 p-4"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 size-5 text-red-600"/><div className="flex-1"><p className="font-semibold">{x.category} · {x.code} · {x.affected_count}</p><p className="mt-1 text-sm text-red-800">{x.detail}</p>{target[x.code]?<Link to={target[x.code] as never}><Button size="sm" variant="outline" className="mt-3">Eksik Veriyi Düzenle</Button></Link>:null}</div></div></div>)}</div>}
 {message?<p className="mt-3 rounded-lg bg-muted p-3 text-sm">{message}</p>:null}<div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={()=>void load()} disabled={busy} className="gap-2"><RefreshCw className="size-4"/>Yeniden Kontrol Et</Button><Button variant="outline" onClick={()=>void syncQuran()} disabled={busy}>Kur’an Planlarını Senkronize Et</Button><Link to="/schedule-rules"><Button variant="outline">Program Kuralları</Button></Link><Link to="/schedule-solver"><Button disabled={!ready}>Çözücüye Geç</Button></Link></div></AppShell>}
