import {supabase} from "@/lib/supabase";
import type {LocalSolveProgress} from "@/lib/schedule-local-solver";
type RemoteWorker={worker_key:string;worker_type:"CPU"|"GPU"|"DB";health:string;heartbeat_fresh:boolean;available_slots:number;load_ratio:number;recommended:boolean};
type RemoteAttempt={attempt_id:string;attempt_no:number;worker_type:"CPU"|"GPU"|"DB"|null;attempt_status:string;audit_status:string|null;duration_ms:number|null;scenario_id:string|null;job_status:string;deadline_at:string|null};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const terminal=(a:RemoteAttempt)=>["FAILED","CANCELLED"].includes(a.attempt_status)||["ACCEPTED","REJECTED","LATE","DUPLICATE"].includes(a.audit_status??"");
export async function runRemoteScheduleAccelerators(opts:{candidateCount:number;onProgress?:(p:LocalSolveProgress)=>void;timeoutMs?:number;baseSeed?:number}){
 const budget=Math.max(5000,Math.min(300000,opts.timeoutMs??30000)),cap=await supabase.rpc("get_schedule_compute_capabilities_v2");if(cap.error)return{scenarioIds:[],used:false,timedOut:false};
 const ext=((cap.data??[]) as RemoteWorker[]).filter(w=>w.worker_type!=="DB"&&w.recommended&&w.heartbeat_fresh&&w.available_slots>0);if(!ext.length)return{scenarioIds:[],used:false,timedOut:false};
 const pref=ext.some(w=>w.worker_type==="GPU")?"GPU":"CPU",plan=await supabase.rpc("plan_schedule_solve_job_v2",{p_mode:"ADVANCED",p_candidate_count:opts.candidateCount,p_compute_preference:pref,p_quality_target:75,p_budget_ms:budget,p_base_seed:opts.baseSeed??null});if(plan.error||!plan.data)return{scenarioIds:[],used:false,timedOut:false};
 const jobId=String(plan.data),deadline=Date.now()+budget,accepted=new Set<string>();let timedOut=false;
 while(Date.now()<deadline){const q=await supabase.rpc("get_schedule_solve_job_status_v2",{p_job_id:jobId});if(q.error)break;const rows=(q.data??[]) as RemoteAttempt[];for(const a of rows){if(a.attempt_status==="COMPLETED"&&(a.audit_status==="PENDING"||a.audit_status==="DUPLICATE")){const x=await supabase.rpc("accept_schedule_worker_result_v2",{p_attempt_id:a.attempt_id});if(!x.error&&x.data)accepted.add(String(x.data))}const kind=(a.worker_type==="GPU"?"GPU":"CPU") as "CPU"|"GPU";opts.onProgress?.({worker:a.attempt_no,kind,status:a.audit_status==="ACCEPTED"?"done":terminal(a)?"error":"running",completed:rows.filter(terminal).length,total:rows.length,...(a.duration_ms!=null?{durationMs:a.duration_ms}:{})})}if(rows.length&&rows.every(terminal))break;await sleep(400)}
 if(Date.now()>=deadline){timedOut=true;await supabase.rpc("cancel_schedule_solve_job_v2",{p_job_id:jobId,p_reason:"CLIENT_TIMEOUT"})}
 return{scenarioIds:[...accepted],used:true,jobId,timedOut};
}
