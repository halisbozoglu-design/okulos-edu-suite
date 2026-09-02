import {solveIncrementalSchedule,type JointLocalProblem} from "@/lib/schedule-local-solver-incremental-core";
import type {LocalCandidate,LocalStudentConflictWeight} from "@/lib/schedule-local-solver-time-core";

export type JointSectionCandidate={assignment_id:string;capacity:number|null;current_load:number;medium_penalty:number;soft_penalty:number;locked?:boolean;current?:boolean};
export type JointSectionRequest={request_id:string;student_id:string;course_id:string;request_kind:"PRIMARY"|"ALTERNATIVE"|"SUBSTITUTE";priority:number;alternative_group:string|null;allow_overlap:boolean;candidates:JointSectionCandidate[]};
export type JointEnrollment={request_id:string;student_id:string;assignment_id:string;locked:boolean;allow_overlap:boolean};
export type JointStudentFreeTime={student_id:string;weekday:number;periods:number[]};
export type JointSectioningProblem={timetable:JointLocalProblem;requests:JointSectionRequest[];existing_locked:JointEnrollment[];hard_free_time?:JointStudentFreeTime[];beam_width?:number;max_timetable_evaluations?:number};
export type JointSectioningScore={hard:number;unassigned_primary:number;unassigned_other:number;medium:number;soft:number;changes:number};
export type JointSectioningSolution={timetable:LocalCandidate;enrollments:JointEnrollment[];score:JointSectioningScore;evaluated:number;complete:boolean};

type Decision={key:string;mandatory:boolean;requests:JointSectionRequest[]};
type State={enrollments:JointEnrollment[];loads:Map<string,number>;unassigned_primary:number;unassigned_other:number;medium:number;soft:number;changes:number};
const lex=(a:JointSectioningScore,b:JointSectioningScore)=>a.hard-b.hard||a.unassigned_primary-b.unassigned_primary||a.unassigned_other-b.unassigned_other||a.medium-b.medium||a.soft-b.soft||a.changes-b.changes;
const stateLex=(a:State,b:State)=>a.unassigned_primary-b.unassigned_primary||a.unassigned_other-b.unassigned_other||a.medium-b.medium||a.soft-b.soft||a.changes-b.changes;
const pair=(a:string,b:string)=>a<b?`${a}|${b}`:`${b}|${a}`;

function decisions(requests:JointSectionRequest[]):Decision[]{
 const grouped=new Map<string,JointSectionRequest[]>(),out:Decision[]=[];
 for(const r of requests){const groupKey=r.alternative_group?`${r.student_id}|${r.alternative_group}`:null;if(groupKey)grouped.set(groupKey,[...(grouped.get(groupKey)??[]),r]);else out.push({key:r.request_id,mandatory:r.request_kind==="PRIMARY",requests:[r]});}
 for(const[key,rs]of grouped)out.push({key:`group:${key}`,mandatory:rs.some(r=>r.request_kind==="PRIMARY"),requests:rs});
 return out.sort((a,b)=>Number(b.mandatory)-Number(a.mandatory)||Math.min(...a.requests.map(r=>r.priority))-Math.min(...b.requests.map(r=>r.priority))||a.key.localeCompare(b.key));
}
function conflicts(enrollments:JointEnrollment[]):LocalStudentConflictWeight[]{
 const byStudent=new Map<string,JointEnrollment[]>(),weights=new Map<string,number>();
 for(const e of enrollments)byStudent.set(e.student_id,[...(byStudent.get(e.student_id)??[]),e]);
 for(const es of byStudent.values())for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){const a=es[i]!,b=es[j]!;if(a.allow_overlap||b.allow_overlap||a.assignment_id===b.assignment_id)continue;const k=pair(a.assignment_id,b.assignment_id);weights.set(k,(weights.get(k)??0)+1)}
 return[...weights].map(([k,n])=>{const[a,b]=k.split("|");return{left_assignment_id:a!,right_assignment_id:b!,student_weight:n,severity_weight:n}});
}
function forbidden(problem:JointSectioningProblem,enrollments:JointEnrollment[]){const byStudent=new Map<string,JointStudentFreeTime[]>();for(const f of problem.hard_free_time??[])byStudent.set(f.student_id,[...(byStudent.get(f.student_id)??[]),f]);const out=new Set<string>();for(const e of enrollments)for(const f of byStudent.get(e.student_id)??[])for(const p of f.periods)out.add(`${e.assignment_id}|${f.weekday}|${p}`);return[...out].map(x=>{const[a,d,p]=x.split("|");return{assignment_id:a!,weekday:Number(d),period:Number(p)}})}
function expand(problem:JointSectioningProblem):State[]{
 const lockedLoads=new Map<string,number>();for(const e of problem.existing_locked)lockedLoads.set(e.assignment_id,(lockedLoads.get(e.assignment_id)??0)+1);
 let states:State[]=[{enrollments:[...problem.existing_locked],loads:lockedLoads,unassigned_primary:0,unassigned_other:0,medium:0,soft:0,changes:0}];
 for(const d of decisions(problem.requests)){
  const next:State[]=[];
  for(const s of states){
   for(const r of d.requests)for(const c of r.candidates){const load=s.loads.get(c.assignment_id)??c.current_load;if(c.capacity!=null&&load>=c.capacity)continue;const loads=new Map(s.loads);loads.set(c.assignment_id,load+1);next.push({enrollments:[...s.enrollments,{request_id:r.request_id,student_id:r.student_id,assignment_id:c.assignment_id,locked:Boolean(c.locked),allow_overlap:r.allow_overlap}],loads,unassigned_primary:s.unassigned_primary,unassigned_other:s.unassigned_other,medium:s.medium+c.medium_penalty,soft:s.soft+c.soft_penalty,changes:s.changes+Number(!c.current)});}
   next.push({...s,enrollments:[...s.enrollments],loads:new Map(s.loads),unassigned_primary:s.unassigned_primary+Number(d.mandatory),unassigned_other:s.unassigned_other+Number(!d.mandatory)});
  }
  states=next.sort(stateLex).slice(0,Math.max(4,problem.beam_width??48));
 }
 return states;
}

export function solveJointScheduleSectioning(problem:JointSectioningProblem):JointSectioningSolution{
 const states=expand(problem),limit=Math.max(1,problem.max_timetable_evaluations??states.length);let best:JointSectioningSolution|null=null,evaluated=0;
 for(const s of states.slice(0,limit)){
  const timetable=solveIncrementalSchedule({...problem.timetable,studentConflictWeights:conflicts(s.enrollments),studentConflictMode:"HARD",studentForbiddenSlots:forbidden(problem,s.enrollments),seed:(problem.timetable.seed+evaluated*2654435761)>>>0});evaluated++;
  const score:JointSectioningScore={hard:timetable.score.hard,unassigned_primary:s.unassigned_primary,unassigned_other:s.unassigned_other,medium:timetable.score.medium+s.medium,soft:timetable.score.soft+s.soft,changes:s.changes};
  const solution={timetable,enrollments:s.enrollments,score,evaluated,complete:timetable.complete&&score.hard===0&&score.unassigned_primary===0};if(!best||lex(solution.score,best.score)<0)best=solution;
 }
 if(!best){const timetable=solveIncrementalSchedule({...problem.timetable,studentConflictWeights:[],studentConflictMode:"HARD"});best={timetable,enrollments:[...problem.existing_locked],score:{hard:timetable.score.hard,unassigned_primary:problem.requests.filter(r=>r.request_kind==="PRIMARY").length,unassigned_other:0,medium:timetable.score.medium,soft:timetable.score.soft,changes:0},evaluated:1,complete:false};}
 return{...best,evaluated};
}

export const JOINT_SECTIONING_POLICY="Tek çözüm skoru enrollment seçimini, section kapasitesini ve timetable yerleşimini birlikte değerlendirir. Öğrenci zaman çakışması HARD; kilitli enrollment ve canonical timetable kuralları gevşetilemez.";
