import {solveIncrementalSchedule,type LocalCandidate,type LocalProblem,type LocalScore,type LocalSearchStrategy} from "@/lib/schedule-local-solver-incremental-core";

export type AdaptiveOperator=Exclude<LocalSearchStrategy,"AUTO">;
export type OperatorTelemetry={operator:AdaptiveOperator;pulls:number;wins:number;reward:number;avg_reward:number;last_score:LocalScore|null};
export type EliteEntry={candidate:LocalCandidate;signature:string};
export type AdaptiveTelemetry={rounds:number;restarts:number;path_relinks:number;accepted_elites:number;operators:OperatorTelemetry[];elite_size:number;diversity:number};
export type AdaptiveCandidate=LocalCandidate&{adaptive:AdaptiveTelemetry};
export type AdaptiveConfig={rounds?:number;eliteSize?:number;stagnationRounds?:number;exploration?:number;pathRelinkEvery?:number};

const OPS:AdaptiveOperator[]=["LATE_ACCEPTANCE","TABU","SIMULATED_ANNEALING","GREAT_DELUGE","VND"];
const lex=(a:LocalScore,b:LocalScore)=>a.hard-b.hard||a.medium-b.medium||a.soft-b.soft;
const scalar=(s:LocalScore)=>s.hard*1e12+s.medium*1e6+s.soft;
const rng=(seed:number)=>{let s=seed|0;return()=>((s=(Math.imul(1664525,s)+1013904223)|0)>>>0)/4294967296};
const rowKey=(r:LocalCandidate["rows"][number])=>`${r.assignment_id}@${r.weekday}:${r.period}`;
export const candidateSignature=(c:LocalCandidate)=>c.rows.map(rowKey).sort().join("|");
export function candidateDistance(a:LocalCandidate,b:LocalCandidate){const A=new Set(a.rows.map(rowKey)),B=new Set(b.rows.map(rowKey));let diff=0;for(const x of A)if(!B.has(x))diff++;for(const x of B)if(!A.has(x))diff++;return diff/Math.max(1,A.size+B.size)}
function meanDiversity(elite:EliteEntry[]){let n=0,sum=0;for(let i=0;i<elite.length;i++)for(let j=i+1;j<elite.length;j++){sum+=candidateDistance(elite[i]!.candidate,elite[j]!.candidate);n++}return n?sum/n:0}
function addElite(elite:EliteEntry[],candidate:LocalCandidate,max:number){if(!candidate.complete||candidate.score.hard!==0)return false;const sig=candidateSignature(candidate);if(elite.some(e=>e.signature===sig))return false;elite.push({candidate,signature:sig});elite.sort((a,b)=>lex(a.candidate.score,b.candidate.score)||b.candidate.rows.length-a.candidate.rows.length);if(elite.length>max){const best=elite[0]!;let drop=elite.length-1,worst=-1;for(let i=1;i<elite.length;i++){const d=candidateDistance(best.candidate,elite[i]!.candidate);const quality=scalar(elite[i]!.candidate.score)-scalar(best.candidate.score);const redundancy=(1-d)*1e4;const v=quality+redundancy;if(v>worst){worst=v;drop=i}}elite.splice(drop,1)}return true}
function chooseOperator(stats:Map<AdaptiveOperator,OperatorTelemetry>,round:number,exploration:number){for(const op of OPS)if((stats.get(op)?.pulls??0)===0)return op;let best=OPS[0]!,bestU=-Infinity;for(const op of OPS){const s=stats.get(op)!;const u=s.avg_reward+exploration*Math.sqrt(Math.log(round+1)/s.pulls);if(u>bestU){bestU=u;best=op}}return best}
function hybridLocked(a:LocalCandidate,b:LocalCandidate,R:()=>number){const by=new Map<string,LocalCandidate["rows"]>();for(const c of[a,b])for(const r of c.rows){const arr=by.get(r.assignment_id)??[];arr.push(r);by.set(r.assignment_id,arr)}const out:LocalProblem["locked"]=[];const ids=[...new Set([...a.rows,...b.rows].map(r=>r.assignment_id))].sort();for(const id of ids){const ar=a.rows.filter(r=>r.assignment_id===id),br=b.rows.filter(r=>r.assignment_id===id),pick=R()<.5?ar:br;for(const r of pick)out.push({...r,locked:true})}return out}
export function solveAdaptiveEliteSchedule(problem:LocalProblem,config:AdaptiveConfig={}):AdaptiveCandidate{
 const rounds=Math.max(8,config.rounds??18),eliteSize=Math.max(2,config.eliteSize??5),stagnationLimit=Math.max(3,config.stagnationRounds??5),pathEvery=Math.max(2,config.pathRelinkEvery??4),exploration=config.exploration??1.15,R=rng(problem.seed^0x9e3779b9);
 const stats=new Map<AdaptiveOperator,OperatorTelemetry>(OPS.map(op=>[op,{operator:op,pulls:0,wins:0,reward:0,avg_reward:0,last_score:null}]));const elite:EliteEntry[]=[];let best:LocalCandidate|null=null,stagnant=0,restarts=0,pathRelinks=0,accepted=0;
 for(let round=0;round<rounds;round++){
  const op=chooseOperator(stats,round+1,exploration),s=stats.get(op)!;const seed=(problem.seed+Math.imul(round+1,7919)+Math.imul(restarts,104729))>>>0;const before=best?scalar(best.score):Number.POSITIVE_INFINITY;const cand=solveIncrementalSchedule({...problem,seed,strategy:op,enableLns:true,lnsIterations:problem.lnsIterations});s.pulls++;s.last_score=cand.score;
  const after=scalar(cand.score),reward=Number.isFinite(before)?Math.max(0,(before-after)/Math.max(1,Math.abs(before))):cand.complete?1:0;s.reward+=reward;s.avg_reward=s.reward/s.pulls;if(!best||lex(cand.score,best.score)<0){best=cand;s.wins++;stagnant=0}else stagnant++;if(addElite(elite,cand,eliteSize))accepted++;
  if(elite.length>=2&&(round+1)%pathEvery===0){const left=elite[0]!.candidate;let right=elite[1]!.candidate;for(const e of elite.slice(1))if(candidateDistance(left,e.candidate)>candidateDistance(left,right))right=e.candidate;const child=solveIncrementalSchedule({...problem,seed:(seed^0x85ebca6b)>>>0,strategy:op,locked:[...problem.locked,...hybridLocked(left,right,R)]});pathRelinks++;if(addElite(elite,child,eliteSize))accepted++;if(!best||lex(child.score,best.score)<0){best=child;stagnant=0}}
  if(stagnant>=stagnationLimit){restarts++;stagnant=0;const restart=solveIncrementalSchedule({...problem,seed:(seed^0xc2b2ae35)>>>0,strategy:OPS[Math.floor(R()*OPS.length)]!,enableLns:true,lnsIterations:Math.max(problem.lnsIterations??0,24)});if(addElite(elite,restart,eliteSize))accepted++;if(!best||lex(restart.score,best.score)<0)best=restart}
 }
 if(!best)best=solveIncrementalSchedule(problem);const adaptive:AdaptiveTelemetry={rounds,restarts,path_relinks:pathRelinks,accepted_elites:accepted,operators:OPS.map(op=>stats.get(op)!),elite_size:elite.length,diversity:meanDiversity(elite)};return{...best,adaptive};
}
