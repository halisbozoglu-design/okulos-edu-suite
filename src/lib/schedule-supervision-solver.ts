export type SupervisionMode="HARD"|"MEDIUM"|"SOFT"|"OFF";
export type SupervisionSlot={weekday:number;period:number};
export type SupervisionPosition={id:string;label:string;weekday:number;period:number;required_count:number;eligible_teacher_ids?:string[]|null;nearby_classroom_ids?:string[]|null};
export type SupervisionTeacher={id:string;min_load?:number|null;max_load?:number|null;eligible_position_ids?:string[]|null;preferred_position_ids?:string[]|null;preferred_slots?:SupervisionSlot[]|null};
export type SupervisionOccupiedSlot={teacher_id:string;weekday:number;period:number;source:"LESSON"|"UNAVAILABLE"|"OTHER_DUTY"};
export type SupervisionAssignment={position_id:string;teacher_id:string;weekday:number;period:number};
export type SupervisionScore={hard:number;unplaced:number;medium:number;soft:number};
export type SupervisionResult={assignments:SupervisionAssignment[];unplaced:{position_id:string;count:number}[];score:SupervisionScore;complete:boolean;teacher_loads:Record<string,number>;seed:number};
export type SupervisionProblem={positions:SupervisionPosition[];teachers:SupervisionTeacher[];occupied_slots:SupervisionOccupiedSlot[];seed?:number;fairness_mode?:SupervisionMode;preference_mode?:SupervisionMode};

type Candidate={teacher:SupervisionTeacher;penalty:number};
const slotKey=(teacher:string,weekday:number,period:number)=>`${teacher}|${weekday}|${period}`;
const clampCount=(v:number)=>Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
function rng(seed:number){let s=seed|0;return()=>((s=(Math.imul(1664525,s)+1013904223)|0)>>>0)/4294967296}
function lex(a:SupervisionScore,b:SupervisionScore){if(a.hard!==b.hard)return a.hard-b.hard;if(a.unplaced!==b.unplaced)return a.unplaced-b.unplaced;if(a.medium!==b.medium)return a.medium-b.medium;return a.soft-b.soft}
function modePenalty(mode:SupervisionMode|undefined,amount:number){if(mode==="OFF"||amount<=0)return{hard:0,medium:0,soft:0};if(mode==="HARD")return{hard:amount,medium:0,soft:0};if(mode==="SOFT")return{hard:0,medium:0,soft:amount};return{hard:0,medium:amount,soft:0}}
function slotPreferred(t:SupervisionTeacher,p:SupervisionPosition){return(t.preferred_slots??[]).some(s=>s.weekday===p.weekday&&s.period===p.period)}
function positionEligible(t:SupervisionTeacher,p:SupervisionPosition){if(p.eligible_teacher_ids?.length&&!p.eligible_teacher_ids.includes(t.id))return false;if(t.eligible_position_ids?.length&&!t.eligible_position_ids.includes(p.id))return false;return true}

/**
 * Separate break/area supervision solver.
 * Lesson timetable occupancy is consumed as HARD unavailable input; this solver never edits lesson rows.
 * Objective is strict lexicographic HARD -> unplaced -> MEDIUM -> SOFT.
 */
export function solveSupervisionSchedule(problem:SupervisionProblem):SupervisionResult{
 const seed=problem.seed??1,R=rng(seed),teachers=[...problem.teachers].sort((a,b)=>a.id.localeCompare(b.id)),positions=[...problem.positions].sort((a,b)=>a.weekday-b.weekday||a.period-b.period||a.id.localeCompare(b.id));
 const occupied=new Set(problem.occupied_slots.map(x=>slotKey(x.teacher_id,x.weekday,x.period))),used=new Set<string>(),loads=new Map(teachers.map(t=>[t.id,0])),assignments:SupervisionAssignment[]=[],unplaced:SupervisionResult["unplaced"]=[];
 let hard=0,medium=0,soft=0;
 const ids=new Set<string>();
 for(const t of teachers){if(ids.has(t.id))hard++;ids.add(t.id);if((t.min_load??0)<0||(t.max_load??0)<0||((t.min_load??0)>(t.max_load??Number.POSITIVE_INFINITY)))hard++}
 const posIds=new Set<string>();
 for(const p of positions){if(posIds.has(p.id))hard++;posIds.add(p.id);if(!Number.isInteger(p.weekday)||!Number.isInteger(p.period)||clampCount(p.required_count)!==p.required_count)hard++}
 const demand=positions.reduce((n,p)=>n+clampCount(p.required_count),0);
 const ordered=positions.map(p=>({p,scarcity:teachers.filter(t=>positionEligible(t,p)&&!occupied.has(slotKey(t.id,p.weekday,p.period))).length})).sort((a,b)=>a.scarcity-b.scarcity||a.p.weekday-b.p.weekday||a.p.period-b.p.period||a.p.id.localeCompare(b.p.id));
 for(const {p} of ordered){let missing=0;for(let n=0;n<clampCount(p.required_count);n++){
   const candidates:Candidate[]=[];
   for(const t of teachers){const sk=slotKey(t.id,p.weekday,p.period),load=loads.get(t.id)??0;if(!positionEligible(t,p)||occupied.has(sk)||used.has(sk))continue;if(t.max_load!=null&&load>=t.max_load)continue;let penalty=load*10;const min=t.min_load??0;if(load<min)penalty-=25;if((t.preferred_position_ids??[]).includes(p.id))penalty-=5;if(slotPreferred(t,p))penalty-=3;penalty+=R()*0.001;candidates.push({teacher:t,penalty})}
   candidates.sort((a,b)=>a.penalty-b.penalty||a.teacher.id.localeCompare(b.teacher.id));const chosen=candidates[0]?.teacher;if(!chosen){missing++;continue}const sk=slotKey(chosen.id,p.weekday,p.period);used.add(sk);loads.set(chosen.id,(loads.get(chosen.id)??0)+1);assignments.push({position_id:p.id,teacher_id:chosen.id,weekday:p.weekday,period:p.period});
 }
 if(missing)unplaced.push({position_id:p.id,count:missing});
 }
 const unplacedCount=unplaced.reduce((n,x)=>n+x.count,0);
 for(const t of teachers){const load=loads.get(t.id)??0,min=t.min_load??0,max=t.max_load??Number.POSITIVE_INFINITY;if(load>max)hard+=load-max;const under=Math.max(0,min-load),pen=modePenalty(problem.fairness_mode??"MEDIUM",under);hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}
 if(teachers.length){const values=teachers.map(t=>loads.get(t.id)??0),spread=Math.max(...values)-Math.min(...values),pen=modePenalty(problem.fairness_mode??"MEDIUM",spread);hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}
 for(const a of assignments){const t=teachers.find(x=>x.id===a.teacher_id)!,p=positions.find(x=>x.id===a.position_id)!;if((t.preferred_position_ids?.length&&!t.preferred_position_ids.includes(p.id))||(t.preferred_slots?.length&&!slotPreferred(t,p))){const pen=modePenalty(problem.preference_mode??"SOFT",1);hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}}
 const score={hard,unplaced:unplacedCount,medium,soft};
 return{assignments,unplaced,score,complete:hard===0&&unplacedCount===0&&assignments.length===demand,teacher_loads:Object.fromEntries([...loads.entries()].sort()),seed};
}

export function validateSupervisionResult(problem:SupervisionProblem,result:SupervisionResult):SupervisionScore{
 const positions=new Map(problem.positions.map(p=>[p.id,p])),teachers=new Map(problem.teachers.map(t=>[t.id,t])),occupied=new Set(problem.occupied_slots.map(x=>slotKey(x.teacher_id,x.weekday,x.period))),seen=new Set<string>(),coverage=new Map<string,number>();let hard=0;
 for(const a of result.assignments){const p=positions.get(a.position_id),t=teachers.get(a.teacher_id);if(!p||!t){hard++;continue}if(a.weekday!==p.weekday||a.period!==p.period)hard++;const sk=slotKey(t.id,a.weekday,a.period);if(seen.has(sk)||occupied.has(sk)||!positionEligible(t,p))hard++;seen.add(sk);coverage.set(p.id,(coverage.get(p.id)??0)+1)}
 let unplaced=0;for(const p of problem.positions)unplaced+=Math.max(0,clampCount(p.required_count)-(coverage.get(p.id)??0));
 const loads=new Map<string,number>();for(const a of result.assignments)loads.set(a.teacher_id,(loads.get(a.teacher_id)??0)+1);let medium=0,soft=0;for(const t of problem.teachers){const load=loads.get(t.id)??0;if(t.max_load!=null&&load>t.max_load)hard+=load-t.max_load;const pen=modePenalty(problem.fairness_mode??"MEDIUM",Math.max(0,(t.min_load??0)-load));hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}
 if(problem.teachers.length){const values=problem.teachers.map(t=>loads.get(t.id)??0),pen=modePenalty(problem.fairness_mode??"MEDIUM",Math.max(...values)-Math.min(...values));hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}
 for(const a of result.assignments){const t=teachers.get(a.teacher_id),p=positions.get(a.position_id);if(!t||!p)continue;if((t.preferred_position_ids?.length&&!t.preferred_position_ids.includes(p.id))||(t.preferred_slots?.length&&!slotPreferred(t,p))){const pen=modePenalty(problem.preference_mode??"SOFT",1);hard+=pen.hard;medium+=pen.medium;soft+=pen.soft}}
 return{hard,unplaced,medium,soft};
}

export function compareSupervisionScores(a:SupervisionScore,b:SupervisionScore){return lex(a,b)}
