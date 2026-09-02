import os from "node:os";
import { solveIncrementalSchedule } from "../src/lib/schedule-local-solver-incremental-core";
import type { LocalProblem } from "../src/lib/schedule-local-solver-time-core";

type Profile={id:string;kind:string;classes:number;assignments_per_class:number;teachers:number;courses:number;periods:number;density:string};
type Manifest={schema:string;seed_count:number;wall_clock_budget_ms:number;profiles:Profile[];solvers:any[];required_metrics:string[]};
type WorldBenchmarkResult={profile_id:string;runs:number;feasible_rate:number;hard_max:number;unplaced_max:number;deterministic_replay:boolean;budget_pass:boolean;[key:string]:unknown};
type WorldBenchmarkReport={schema:string;seed_count:number;results:WorldBenchmarkResult[];[key:string]:unknown};
const manifest=await Bun.file(new URL("../benchmarks/world/manifest.json",import.meta.url)).json() as Manifest;
const pct=(a:number[],q:number)=>{const x=[...a].sort((m,n)=>m-n);return x[Math.min(x.length-1,Math.max(0,Math.ceil(x.length*q)-1))]??0};
const stableRows=(r:any[])=>r.map(x=>[x.assignment_id,x.weekday,x.period,x.teacher_id,x.class_id,x.schedule_session_id??null]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
const sha=(x:unknown)=>new Bun.CryptoHasher("sha256").update(JSON.stringify(x)).digest("hex");

export function makeWorldProblem(p:Profile,seed:number):LocalProblem{
 const assignments=[] as any[],rules=[] as any[];for(let q=0;q<p.courses;q++)rules.push({course_id:`q${q}`,block_pattern:[1],max_per_day:2,prohibited_days:null,prohibited_periods:null});
 let n=0;for(let c=0;c<p.classes;c++)for(let j=0;j<p.assignments_per_class;j++){const q=(c*3+j)%p.courses,t=(c+j*7)%p.teachers;assignments.push({assignment_id:`a${n++}`,teacher_id:`t${t}`,class_id:`c${c}`,course_id:`q${q}`,assigned_hours:1,week_pattern:n%17===0?"ODD":n%17===1?"EVEN":"ALL",valid_from:null,valid_to:null,term_no:null,schedule_session_id:null,allowed_periods:null})}
 const weights=[] as any[];const stride=p.density==="DENSE"?3:7;for(let i=0;i<assignments.length-stride;i+=stride)weights.push({left_assignment_id:assignments[i]!.assignment_id,right_assignment_id:assignments[i+stride]!.assignment_id,student_weight:2,severity_weight:2});
 const constraints=Array.from({length:p.teachers},(_,i)=>({teacher_id:`t${i}`,max_daily_hours:p.kind==="MEB_MTAL"?7:6,max_consecutive_hours:p.kind==="MEB_MESEM"?5:4}));
 return{days:[1,2,3,4,5],periods:p.periods,assignments,locked:[],unavailable:[],teacherConstraints:constraints,courseRules:rules,planningRelations:[],studentConflictWeights:weights,seed,enableLns:false};
}

export async function runWorldBenchmark(opts:{seedCount?:number;ci?:boolean;replayAll?:boolean}={}){
 const seedCount=opts.seedCount??manifest.seed_count,seeds=Array.from({length:seedCount},(_,i)=>101+i*7919),results:any[]=[];
 for(const profile of manifest.profiles){const times:number[]=[],timedSeeds:{seed:number;ms:number}[]=[],first:number[]=[],best:number[]=[],hard:number[]=[],unplaced:number[]=[],medium:number[]=[],soft:number[]=[];let feasible=0;const heap0=process.memoryUsage().heapUsed;let inputHash="",replay=true,replayCount=0;
   for(let i=0;i<seeds.length;i++){const seed=seeds[i]!,problem=makeWorldProblem(profile,seed);if(!inputHash){const {seed:_,...struct}=problem;inputHash=sha(struct)}const t=performance.now(),r=solveIncrementalSchedule(problem),ms=performance.now()-t;times.push(ms);timedSeeds.push({seed,ms});hard.push(r.score.hard);unplaced.push(r.failed);medium.push(r.score.medium);soft.push(r.score.soft);if(r.complete&&r.failed===0&&r.score.hard===0){feasible++;first.push(ms);best.push(ms)}if(opts.replayAll||i===0){const again=solveIncrementalSchedule(makeWorldProblem(profile,seed)),same=JSON.stringify(stableRows(r.rows))===JSON.stringify(stableRows(again.rows))&&JSON.stringify(r.score)===JSON.stringify(again.score);replay&&=same;replayCount+=same?1:0}}
   const heap=Math.max(0,process.memoryUsage().heapUsed-heap0),overBudget=timedSeeds.filter(x=>x.ms>manifest.wall_clock_budget_ms),slowest=timedSeeds.reduce((a,b)=>a.ms>=b.ms?a:b);results.push({profile_id:profile.id,kind:profile.kind,input_hash:inputHash,runs:seedCount,feasible_rate:feasible/seedCount,hard_max:Math.max(...hard),unplaced_max:Math.max(...unplaced),medium_p50:pct(medium,.5),soft_p50:pct(soft,.5),runtime_p50_ms:Math.round(pct(times,.5)),runtime_p95_ms:Math.round(pct(times,.95)),runtime_max_ms:Math.round(slowest.ms),slowest_seed:slowest.seed,over_budget_count:overBudget.length,over_budget_seeds:overBudget.map(x=>x.seed),time_to_first_feasible_p50_ms:first.length?Math.round(pct(first,.5)):null,time_to_best_p50_ms:best.length?Math.round(pct(best,.5)):null,heap_delta_mb:Math.round(heap/1048576),deterministic_replay:replay,deterministic_replay_count:replayCount,budget_pass:overBudget.length===0});
 }
 const report={schema:manifest.schema,generated_at:new Date().toISOString(),seed_count:seedCount,replay_all:opts.replayAll??false,wall_clock_budget_ms:manifest.wall_clock_budget_ms,hardware:{platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model??"unknown",logical_cpus:os.cpus().length,bun:Bun.version},solver_status:manifest.solvers,results};
 return report;
}

export function readPositiveIntegerFlag(args:string[],name:string,fallback:number){
 const index=args.indexOf(name);if(index<0)return fallback;const raw=args[index+1];if(raw==null||!/^[1-9]\d*$/.test(raw))throw new Error(`${name} must be a positive integer`);return Number(raw);
}

export function assertWorldBenchmarkGate(report:WorldBenchmarkReport,minSeeds=manifest.seed_count){
 if(report.seed_count<minSeeds)throw new Error(`WORLD_BENCH_GATE_FAILED:seed_count:${report.seed_count}<${minSeeds}`);
 for(const r of report.results){if(r.runs<minSeeds||r.feasible_rate!==1||r.hard_max!==0||r.unplaced_max!==0||!r.deterministic_replay||(report.replay_all&&r.deterministic_replay_count!==r.runs)||!r.budget_pass)throw new Error(`WORLD_BENCH_GATE_FAILED:${r.profile_id}`)}
}

if(import.meta.main){const args=process.argv.slice(2),ci=args.includes("--ci"),replayAll=args.includes("--replay-all"),oi=args.indexOf("--out"),out=oi>=0?args[oi+1]:null,seedCount=readPositiveIntegerFlag(args,"--seeds",manifest.seed_count),minSeeds=readPositiveIntegerFlag(args,"--min-seeds",manifest.seed_count);const report=await runWorldBenchmark({seedCount,ci,replayAll});console.log("SCHEDULE_WORLD_BENCH",JSON.stringify(report));if(out)await Bun.write(out,JSON.stringify(report,null,2));assertWorldBenchmarkGate(report,minSeeds)}
