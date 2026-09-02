import { supabase } from "@/lib/supabase";
import { detectLocalScheduleCompute } from "@/lib/schedule-local-compute";
import { gpuScoreScheduleCandidates } from "@/lib/schedule-gpu-compute";
import {adaptiveContextKey,buildRelinkProblem,chooseAdaptiveStrategies,diversitySummary,mergeOperatorPriors,mostDiverseGuide,normalizeRelinkCandidate,selectElite,telemetryObservations,type OperatorPrior} from "@/lib/schedule-adaptive-elite";
import type { LnsStats, LocalCandidate, LocalProblem } from "@/lib/schedule-local-solver-time-core";
import type { PlanningRelation } from "@/lib/schedule-planning-relations";

export type LocalSolveMode = "AUTO" | "CPU" | "GPU" | "HYBRID" | "DB";
export type LocalSolveProgress = { worker: number; kind: "CPU" | "GPU"; status: "running" | "done" | "error"; completed: number; total: number; durationMs?: number };
type Candidate=LocalCandidate;

export async function loadLocalScheduleProblem() {
  const [a, l, u, t, c, p, rel, sw, tm] = await Promise.all([
    supabase.from("schedule_assignment_options").select("teacher_assignment_id,teacher_id,additional_teacher_ids,class_id,course_id,assigned_hours"),
    supabase.from("teacher_schedule").select("teacher_assignment_id,teacher_id,class_id,weekday,period,classroom_id,subgroup_id,schedule_session_id,locked").eq("active", true).eq("locked", true),
    supabase.from("teacher_unavailability").select("teacher_id,weekday,period,schedule_session_id").eq("active", true),
    supabase.from("teacher_schedule_constraints").select("teacher_id,max_daily_hours,max_consecutive_hours"),
    supabase.from("course_schedule_rules").select("course_id,block_pattern,max_per_day,prohibited_days,prohibited_periods").eq("active", true),
    supabase.rpc("get_active_schedule_time_profile"),
    supabase.rpc("get_schedule_planning_relations_v1"),
    supabase.rpc("get_schedule_assignment_student_conflict_weights_v2"),
    supabase.rpc("get_schedule_assignment_time_model_v1"),
  ]);
  const e = a.error || l.error || u.error || t.error || c.error || p.error || rel.error || sw.error || tm.error; if (e) throw e;
  const prof = p.data as { teaching_days: number[]; periods_per_day: number };
  const time = new Map((tm.data ?? []).map((x: any) => [String(x.assignment_id), x]));
  return {
    days: prof.teaching_days, periods: prof.periods_per_day,
    assignments: (a.data ?? []).filter((x: any) => x.teacher_assignment_id).map((x: any) => { const m:any=time.get(String(x.teacher_assignment_id))??{}; return { assignment_id: String(x.teacher_assignment_id), teacher_id: String(x.teacher_id), additional_teacher_ids:Array.isArray(x.additional_teacher_ids)?x.additional_teacher_ids.map(String):[], class_id: String(x.class_id), course_id: String(x.course_id), assigned_hours: Number(x.assigned_hours), week_pattern:m.week_pattern??"ALL", valid_from:m.valid_from??null, valid_to:m.valid_to??null, term_no:m.term_no==null?null:Number(m.term_no), schedule_session_id:m.schedule_session_id?String(m.schedule_session_id):null, allowed_periods:Array.isArray(m.allowed_periods)?m.allowed_periods.map(Number):[] }; }),
    locked: (l.data ?? []).filter((x: any) => x.teacher_assignment_id).map((x: any) => ({ assignment_id: String(x.teacher_assignment_id), teacher_id: String(x.teacher_id), class_id: x.class_id ? String(x.class_id) : null, weekday: Number(x.weekday), period: Number(x.period), classroom_id: x.classroom_id ? String(x.classroom_id) : null, subgroup_id: x.subgroup_id ? String(x.subgroup_id) : null, schedule_session_id:x.schedule_session_id?String(x.schedule_session_id):null, locked: true })),
    unavailable: (u.data??[]).map((x:any)=>({...x,weekday:Number(x.weekday),period:Number(x.period),schedule_session_id:x.schedule_session_id?String(x.schedule_session_id):null})), teacherConstraints: t.data ?? [],
    courseRules: (c.data ?? []).map((x: any) => ({ ...x, block_pattern: Array.isArray(x.block_pattern) ? x.block_pattern.map(Number) : null })),
    planningRelations: (rel.data ?? []).map((x: any) => ({ ...x, weight: Number(x.weight), left_selector: x.left_selector ?? {}, right_selector: x.right_selector ?? {}, parameters: x.parameters ?? {} })) as PlanningRelation[],
    studentConflictWeights: (sw.data ?? []).map((x: any) => ({ left_assignment_id: String(x.left_assignment_id), right_assignment_id: String(x.right_assignment_id), student_weight: Number(x.student_weight), severity_weight: Number(x.severity_weight) })),
  };
}

function runWorker(payload: unknown) { return new Promise<Candidate>((resolve, reject) => { const w = new Worker(new URL("../workers/schedule-local-solver-worker.ts", import.meta.url), { type: "module" }); const timer = setTimeout(() => { w.terminate(); reject(new Error("LOCAL_WORKER_TIMEOUT")); }, 30000); w.onmessage = (e) => { clearTimeout(timer); w.terminate(); resolve(e.data as Candidate); }; w.onerror = (e) => { clearTimeout(timer); w.terminate(); reject(new Error(e.message)); }; w.postMessage(payload); }); }
function metrics(c: Candidate) { const byTeacher = new Map<string, number[]>(), byClass = new Map<string, number[]>(); let late = 0; for (const r of c.rows) { late += Math.max(0, r.period - 6); const tk = `${r.teacher_id}|${r.weekday}`, ck = `${r.class_id}|${r.weekday}`; byTeacher.set(tk, [...(byTeacher.get(tk) ?? []), r.period]); byClass.set(ck, [...(byClass.get(ck) ?? []), r.period]); } let gap = 0; for (const v of [...byTeacher.values(), ...byClass.values()]) { const a = [...new Set(v)].sort((x, y) => x - y); if (a.length) { const first = a[0] ?? 0, last = a.at(-1) ?? first; gap += Math.max(0, last - first + 1 - a.length); } } return { hard: c.complete ? 0 : 1, unplaced: c.failed, medium: c.score?.medium ?? 0, gap, late, repeat: 0, preference: 0 }; }
const byScore=(a:Candidate,b:Candidate)=>a.score.hard-b.score.hard||a.failed-b.failed||a.score.medium-b.score.medium||a.score.soft-b.score.soft||a.seed-b.seed;
const derivedSeed=(base:number,i:number)=>((base^Math.imul(i+1,0x9e3779b1))>>>0);

export async function runLocalScheduleSolve(opts: { candidateCount: number; mode: LocalSolveMode; enableLns?: boolean; lnsIterations?: number; seed?:number; onProgress?: (p: LocalSolveProgress) => void }) {
  if (opts.mode === "DB") return { scenarioIds: [], capability: await detectLocalScheduleCompute(), generated: 0, complete: 0, useGpu: false, lns: null as LnsStats | null,adaptive:null };
  const cap=await detectLocalScheduleCompute(),baseSeed=(opts.seed??Date.now())>>>0,raw=await loadLocalScheduleProblem(),p={...raw,seed:baseSeed} as LocalProblem,useGpu=(opts.mode==="GPU"||opts.mode==="HYBRID"||opts.mode==="AUTO")&&cap.webGpu,oversample=useGpu?Math.max(opts.candidateCount*3,8):Math.max(opts.candidateCount*2,8),workers=opts.mode==="GPU"?1:Math.max(1,Math.min(cap.recommendedCpuWorkers,oversample)),context=adaptiveContextKey(p);
  const priorQ=await supabase.rpc("get_schedule_solver_operator_priors_v1",{p_context_key:context}),priors:OperatorPrior[]=priorQ.error?[]:((priorQ.data??[]) as OperatorPrior[]).map(x=>({...x,attempts:Number(x.attempts),wins:Number(x.wins),reward_sum:Number(x.reward_sum)})),plan=chooseAdaptiveStrategies(priors,oversample),out:Array<Candidate|undefined>=Array(oversample);let next=0,done=0;
  await Promise.all(Array.from({length:workers},async(_,wi)=>{while(true){const i=next++;if(i>=oversample)break;opts.onProgress?.({worker:wi+1,kind:"CPU",status:"running",completed:done,total:oversample});const st=performance.now();try{out[i]=await runWorker({...p,seed:derivedSeed(baseSeed,i),strategy:plan[i],enableLns:opts.enableLns??true,lnsIterations:opts.lnsIterations});done++;opts.onProgress?.({worker:wi+1,kind:"CPU",status:"done",completed:done,total:oversample,durationMs:Math.round(performance.now()-st)})}catch{done++;opts.onProgress?.({worker:wi+1,kind:"CPU",status:"error",completed:done,total:oversample})}}}));
  let candidates=out.filter((x):x is Candidate=>Boolean(x)),complete=candidates.filter(x=>x.complete&&x.failed===0&&x.score.hard===0),elite=selectElite(complete,Math.max(6,opts.candidateCount*2),.08),relinks=0,restarts=0;
  const firstObs=telemetryObservations(candidates),updated=mergeOperatorPriors(priors,firstObs);
  if(elite.length>=2){const base=elite[0]!,guide=mostDiverseGuide(base,elite);if(guide){const st=chooseAdaptiveStrategies(updated,1)[0]!,rp=buildRelinkProblem(p,base,guide,derivedSeed(baseSeed,oversample+1),.2);try{const c=normalizeRelinkCandidate(await runWorker({...rp,strategy:st,enableLns:true,lnsIterations:Math.max(opts.lnsIterations??0,24)}),p);candidates.push(c);relinks++}catch{}}}
  complete=candidates.filter(x=>x.complete&&x.failed===0&&x.score.hard===0);elite=selectElite(complete,Math.max(6,opts.candidateCount*2),.08);
  const stagnant=elite.length<2||new Set(complete.map(c=>`${c.score.medium}:${c.score.soft}`)).size<2;
  if(stagnant){const st=chooseAdaptiveStrategies(mergeOperatorPriors(priors,telemetryObservations(candidates)),1,1.8)[0]!;try{const c=await runWorker({...p,seed:derivedSeed(baseSeed,oversample+2),strategy:st,enableLns:true,lnsIterations:Math.max(opts.lnsIterations??0,36)});candidates.push(c);restarts++}catch{}}
  complete=candidates.filter(x=>x.complete&&x.failed===0&&x.score.hard===0);elite=selectElite(complete,Math.max(6,opts.candidateCount*2),.08);const fill=[...elite,...complete.filter(c=>!elite.includes(c)).sort(byScore)],pool=fill.slice(0,Math.max(opts.candidateCount,elite.length));let chosen=pool.slice(0,opts.candidateCount);
  if(useGpu&&pool.length){opts.onProgress?.({worker:1,kind:"GPU",status:"running",completed:0,total:pool.length});const st=performance.now();try{const scores=await gpuScoreScheduleCandidates(pool.map(metrics));chosen=pool.map((c,i)=>({c,s:scores[i]??Number.POSITIVE_INFINITY})).sort((a,b)=>a.s-b.s||byScore(a.c,b.c)).slice(0,opts.candidateCount).map(x=>x.c);opts.onProgress?.({worker:1,kind:"GPU",status:"done",completed:pool.length,total:pool.length,durationMs:Math.round(performance.now()-st)})}catch{chosen=pool.sort(byScore).slice(0,opts.candidateCount);opts.onProgress?.({worker:1,kind:"GPU",status:"error",completed:0,total:pool.length})}}
  const observations=telemetryObservations(candidates);if(observations.length)void supabase.rpc("record_schedule_solver_operator_telemetry_v1",{p_context_key:context,p_observations:observations}).then(()=>undefined);
  const scenarioIds:string[]=[];for(let i=0;i<chosen.length;i++){const candidate=chosen[i];if(!candidate)continue;const rows=candidate.rows.map(r=>({assignment_id:r.assignment_id,weekday:r.weekday,period:r.period,classroom_id:r.classroom_id??null,subgroup_id:r.subgroup_id??null,locked:r.locked}));const q=await supabase.rpc("import_local_schedule_candidate_v1",{p_rows:rows,p_title:`Yerel Adaptif ${candidate.strategy??"CPU"} Adayı ${i+1}`});if(!q.error&&q.data)scenarioIds.push(String(q.data))}
  const bestLns=chosen.find(x=>x.lns?.enabled)?.lns??null,diversity=diversitySummary(elite);return{scenarioIds,capability:cap,generated:candidates.length,complete:complete.length,useGpu,lns:bestLns,adaptive:{context,baseSeed,operatorPlan:plan,eliteSize:elite.length,diversity,relinks,restarts}};
}
