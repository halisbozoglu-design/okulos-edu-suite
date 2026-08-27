import type {LocalCandidate,LocalLockedRow,LocalProblem,LocalScore,LocalSearchStrategy} from "@/lib/schedule-local-solver-time-core";

export const ADAPTIVE_ARMS=["LATE_ACCEPTANCE","TABU","SIMULATED_ANNEALING","GREAT_DELUGE","VND"] as const satisfies readonly LocalSearchStrategy[];
export type AdaptiveArm=(typeof ADAPTIVE_ARMS)[number];
export type OperatorPrior={strategy:AdaptiveArm;attempts:number;wins:number;reward_sum:number};
export type OperatorObservation={strategy:AdaptiveArm;reward:number;win:boolean};

const scoreCmp=(a:LocalScore,b:LocalScore)=>a.hard-b.hard||a.medium-b.medium||a.soft-b.soft;
const rowSig=(r:LocalLockedRow)=>`${r.assignment_id}@${r.weekday}:${r.period}`;
const candidateSet=(c:LocalCandidate)=>new Set(c.rows.map(rowSig));
const seededHash=(s:string,seed:number)=>{let h=seed|0;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0};

export function adaptiveContextKey(p:Pick<LocalProblem,"assignments"|"planningRelations"|"studentConflictWeights">){const n=p.assignments.length,size=n<80?"SMALL":n<220?"MEDIUM":"LARGE",pressure=(p.planningRelations?.length??0)+(p.studentConflictWeights?.length??0);return `${size}:${pressure>n*2?"DENSE":pressure>n*.5?"MIXED":"SPARSE"}`}

export function chooseAdaptiveStrategies(priors:OperatorPrior[],count:number,exploration=1.15):AdaptiveArm[]{const m=new Map<AdaptiveArm,{attempts:number;reward:number}>();for(const arm of ADAPTIVE_ARMS){const p=priors.find(x=>x.strategy===arm);m.set(arm,{attempts:Number(p?.attempts??0),reward:Number(p?.reward_sum??0)})}const out:AdaptiveArm[]=[];for(let i=0;i<count;i++){const total=[...m.values()].reduce((n,x)=>n+x.attempts,0)+1;let best:AdaptiveArm=ADAPTIVE_ARMS[0]!,bestU=-Infinity;for(const arm of ADAPTIVE_ARMS){const x=m.get(arm)!,mean=x.attempts?x.reward/x.attempts:0,ucb=mean+exploration*Math.sqrt(Math.log(total+1)/(x.attempts+1));if(ucb>bestU){best=arm;bestU=ucb}}out.push(best);m.get(best)!.attempts++}return out}

export function candidateDistance(a:LocalCandidate,b:LocalCandidate){const x=candidateSet(a),y=candidateSet(b);let inter=0;for(const k of x)if(y.has(k))inter++;const union=x.size+y.size-inter;return union?1-inter/union:0}

export function selectElite(candidates:LocalCandidate[],size=6,minDiversity=.08){const sorted=[...candidates].filter(c=>c.complete&&c.failed===0&&c.score.hard===0).sort((a,b)=>scoreCmp(a.score,b.score)||a.seed-b.seed),elite:LocalCandidate[]=[];for(const c of sorted){const near=elite.findIndex(e=>candidateDistance(c,e)<minDiversity);if(near<0)elite.push(c);else if(scoreCmp(c.score,elite[near]!.score)<0)elite[near]=c;if(elite.length>=size)break}return elite.sort((a,b)=>scoreCmp(a.score,b.score)||a.seed-b.seed)}

export function mostDiverseGuide(base:LocalCandidate,elite:LocalCandidate[]){return elite.filter(x=>x!==base).sort((a,b)=>candidateDistance(base,b)-candidateDistance(base,a)||scoreCmp(a.score,b.score))[0]??null}

export function buildRelinkProblem(p:LocalProblem,base:LocalCandidate,guide:LocalCandidate,seed:number,fraction=.2):LocalProblem{const originalLockedAssignments=new Set(p.locked.map(r=>r.assignment_id)),byBase=new Map<string,string[]>(),byGuide=new Map<string,LocalLockedRow[]>();for(const r of base.rows)byBase.set(r.assignment_id,[...(byBase.get(r.assignment_id)??[]),rowSig(r)]);for(const r of guide.rows)byGuide.set(r.assignment_id,[...(byGuide.get(r.assignment_id)??[]),r]);const differing=[...byGuide.keys()].filter(id=>!originalLockedAssignments.has(id)&&[...(byBase.get(id)??[])].sort().join("|")!==[...(byGuide.get(id)??[])].map(rowSig).sort().join("|")).sort((a,b)=>seededHash(a,seed)-seededHash(b,seed));const take=Math.min(differing.length,Math.max(1,Math.ceil(differing.length*Math.max(.05,Math.min(.5,fraction))))),chosen=new Set(differing.slice(0,take)),genes:LocalLockedRow[]=[];for(const id of chosen)for(const r of byGuide.get(id)??[])genes.push({...r,locked:true});return{...p,seed,locked:[...p.locked.map(r=>({...r})),...genes]}}

export function normalizeRelinkCandidate(c:LocalCandidate,p:LocalProblem):LocalCandidate{const original=new Set(p.locked.map(rowSig));return{...c,rows:c.rows.map(r=>({...r,locked:original.has(rowSig(r))}))}}

export function telemetryObservations(candidates:LocalCandidate[]):OperatorObservation[]{const valid=candidates.filter(c=>ADAPTIVE_ARMS.includes(c.strategy as AdaptiveArm));if(!valid.length)return[];const best=[...valid].sort((a,b)=>scoreCmp(a.score,b.score)||a.failed-b.failed)[0]!,base=Math.max(1,best.score.medium*100+best.score.soft);return valid.map(c=>{const v=Math.max(0,c.score.hard*1e9+c.failed*1e7+c.score.medium*100+c.score.soft),reward=c.complete&&c.score.hard===0?1/(1+v/base):0;return{strategy:c.strategy as AdaptiveArm,reward,win:c===best}})}

export function mergeOperatorPriors(priors:OperatorPrior[],observations:OperatorObservation[]):OperatorPrior[]{const m=new Map<AdaptiveArm,OperatorPrior>();for(const arm of ADAPTIVE_ARMS){const p=priors.find(x=>x.strategy===arm);m.set(arm,{strategy:arm,attempts:Number(p?.attempts??0),wins:Number(p?.wins??0),reward_sum:Number(p?.reward_sum??0)})}for(const o of observations){const x=m.get(o.strategy)!;x.attempts++;x.wins+=o.win?1:0;x.reward_sum+=o.reward}return[...m.values()]}

export function diversitySummary(elite:LocalCandidate[]){if(elite.length<2)return{min:0,avg:0,max:0};const d:number[]=[];for(let i=0;i<elite.length;i++)for(let j=i+1;j<elite.length;j++)d.push(candidateDistance(elite[i]!,elite[j]!));return{min:Math.min(...d),avg:d.reduce((a,b)=>a+b,0)/d.length,max:Math.max(...d)}}
