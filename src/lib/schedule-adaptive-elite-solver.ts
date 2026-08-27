import {solveIncrementalSchedule} from "@/lib/schedule-local-solver-incremental-core";
import type {LocalCandidate,LocalLockedRow,LocalProblem,LocalScore,LocalSearchStrategy} from "@/lib/schedule-local-solver-time-core";

const OPS:LocalSearchStrategy[]=["LATE_ACCEPTANCE","TABU","SIMULATED_ANNEALING","GREAT_DELUGE","VND"];
export type AdaptiveOperatorStat={operator:LocalSearchStrategy;pulls:number;improvements:number;reward:number;meanReward:number};
export type AdaptiveEliteCandidate=LocalCandidate&{adaptive:{rounds:number;restarts:number;pathRelinks:number;diversity:number;operatorStats:AdaptiveOperatorStat[]}};
type Stat={pulls:number;improvements:number;reward:number};
const lex=(a:LocalScore,b:LocalScore)=>a.hard-b.hard||a.medium-b.medium||a.soft-b.soft;
const scoreScalar=(s:LocalScore)=>s.hard*1e12+s.medium*1e6+s.soft;
const rowKey=(r:LocalLockedRow)=>`${r.assignment_id}|${r.weekday}|${r.period}|${r.schedule_session_id??""}`;
const signature=(c:LocalCandidate)=>new Set(c.rows.map(rowKey));
export function candidateDiversity(a:LocalCandidate,b:LocalCandidate){const A=signature(a),B=signature(b);if(!A.size&&!B.size)return 0;let same=0;for(const x of A)if(B.has(x))same++;return 1-(2*same)/(A.size+B.size)}
function addElite(pool:LocalCandidate[],c:LocalCandidate,max=6){if(!c.complete||c.score.hard!==0)return;const dup=pool.some(x=>candidateDiversity(x,c)<0.01);if(dup){const i=pool.findIndex(x=>candidateDiversity(x,c)<0.01);if(i>=0&&lex(c.score,pool[i]!.score)<0)pool[i]=c}else pool.push(c);pool.sort((a,b)=>lex(a.score,b.score));while(pool.length>max)pool.pop()}
function ucb(stats:Map<LocalSearchStrategy,Stat>,total:number){let best=OPS[0]!,value=-Infinity;for(const op of OPS){const s=stats.get(op)!;if(!s.pulls)return op;const mean=s.reward/s.pulls,bonus=Math.sqrt(2*Math.log(Math.max(2,total))/s.pulls),v=mean+bonus;if(v>value){value=v;best=op}}return best}
function deterministicSeed(base:number,round:number,salt:number){return (Math.imul((base^0x9e3779b9)>>>0,1664525)+1013904223+round*7919+salt*104729)>>>0}
function chooseRelinkLocks(a:LocalCandidate,b:LocalCandidate,round:number){const by=new Map<string,LocalLockedRow[]>();for(const r of [...a.rows,...b.rows]){const k=r.assignment_id;by.set(k,[...(by.get(k)??[]),r])}const out:LocalLockedRow[]=[];for(const [id,rs] of [...by].sort(([x],[y])=>x.localeCompare(y))){const unique=new Map(rs.map(r=>[rowKey(r),r]));if(unique.size===1||(round+id.length)%3===0){for(const r of (unique.size===1?[...unique.values()]:rs.filter((_,i)=>i%2===round%2)).slice(0,8))out.push({...r,locked:true})}}return out}
export function solveAdaptiveEliteSchedule(p:LocalProblem,opts?:{rounds?:number;eliteSize?:number;stagnationLimit?:number}):AdaptiveEliteCandidate{
 const rounds=Math.max(5,Math.min(24,opts?.rounds??10)),eliteSize=Math.max(2,Math.min(8,opts?.eliteSize??5)),stagnationLimit=Math.max(2,opts?.stagnationLimit??4);
 const stats=new Map<LocalSearchStrategy,Stat>(OPS.map(x=>[x,{pulls:0,improvements:0,reward:0}]));const elite:LocalCandidate[]=[];let best:LocalCandidate|null=null,restarts=0,pathRelinks=0,stagnation=0;
 for(let round=0;round<rounds;round++){
  const op=ucb(stats,round+1),seed=deterministicSeed(p.seed,round,restarts),before=best?scoreScalar(best.score):Number.POSITIVE_INFINITY;
  let candidate=solveIncrementalSchedule({...p,seed,strategy:op,enableLns:true,lnsIterations:p.lnsIterations??24});
  if(elite.length>=2&&round>=Math.floor(rounds/2)&&round%2===1){const a=elite[round%elite.length]!,b=elite[(round+1)%elite.length]!,locks=chooseRelinkLocks(a,b,round);if(locks.length){const relink=solveIncrementalSchedule({...p,seed:deterministicSeed(p.seed,round,999),strategy:op,locked:[...p.locked,...locks],enableLns:true,lnsIterations:16});pathRelinks++;if(relink.complete&&lex(relink.score,candidate.score)<0)candidate=relink}}
  const after=scoreScalar(candidate.score),gain=Number.isFinite(before)?Math.max(0,before-after):candidate.complete?1:0,s=stats.get(op)!;s.pulls++;s.reward+=gain>0?Math.log1p(gain):0;if(gain>0)s.improvements++;
  addElite(elite,candidate,eliteSize);if(!best||lex(candidate.score,best.score)<0){best=candidate;stagnation=0}else stagnation++;
  if(stagnation>=stagnationLimit){restarts++;stagnation=0;const restart=solveIncrementalSchedule({...p,seed:deterministicSeed(p.seed,round,restarts*17),strategy:OPS[(round+restarts)%OPS.length],enableLns:true,lnsIterations:32});addElite(elite,restart,eliteSize);if(!best||lex(restart.score,best.score)<0)best=restart}
 }
 if(!best)best=solveIncrementalSchedule({...p,seed:p.seed,strategy:"AUTO",enableLns:true});
 let diversity=0,pairs=0;for(let i=0;i<elite.length;i++)for(let j=i+1;j<elite.length;j++){diversity+=candidateDiversity(elite[i]!,elite[j]!);pairs++}diversity=pairs?diversity/pairs:0;
 return {...best,adaptive:{rounds,restarts,pathRelinks,diversity,operatorStats:OPS.map(operator=>{const s=stats.get(operator)!;return{operator,pulls:s.pulls,improvements:s.improvements,reward:s.reward,meanReward:s.pulls?s.reward/s.pulls:0}})}};
}
