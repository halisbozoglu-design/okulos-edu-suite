import {describe,expect,test} from "bun:test";
import {candidateDiversity,solveAdaptiveEliteSchedule} from "../src/lib/schedule-adaptive-elite-solver";
import {solveIncrementalSchedule} from "../src/lib/schedule-local-solver-incremental-core";
import type {LocalProblem} from "../src/lib/schedule-local-solver-time-core";

function problem(seed=17):LocalProblem{const assignments=Array.from({length:16},(_,i)=>({assignment_id:`a${i}`,teacher_id:`t${i%8}`,class_id:`c${i%8}`,course_id:`q${i%4}`,assigned_hours:1,week_pattern:i%6===0?"ODD" as const:i%6===1?"EVEN" as const:"ALL" as const}));return{days:[1,2,3,4,5],periods:8,assignments,locked:[],unavailable:[],teacherConstraints:Array.from({length:8},(_,i)=>({teacher_id:`t${i}`,max_daily_hours:5,max_consecutive_hours:4})),courseRules:Array.from({length:4},(_,i)=>({course_id:`q${i}`,block_pattern:[1],max_per_day:2,prohibited_days:null,prohibited_periods:null})),planningRelations:[],studentConflictWeights:[],seed,enableLns:true,lnsIterations:8}}
const lex=(a:{hard:number;medium:number;soft:number},b:{hard:number;medium:number;soft:number})=>a.hard-b.hard||a.medium-b.medium||a.soft-b.soft;

describe("adaptive elite schedule solver",()=>{
 test("same seed is fully deterministic including telemetry",()=>{const a=solveAdaptiveEliteSchedule(problem(77),{rounds:6}),b=solveAdaptiveEliteSchedule(problem(77),{rounds:6});expect(a).toEqual(b);expect(a.complete).toBe(true);expect(a.score.hard).toBe(0)});
 test("UCB explores every local-search operator",()=>{const r=solveAdaptiveEliteSchedule(problem(12),{rounds:7});expect(r.adaptive.operatorStats.length).toBe(5);expect(r.adaptive.operatorStats.every(x=>x.pulls>=1)).toBe(true)});
 test("elite diversity stays normalized",()=>{const a=solveAdaptiveEliteSchedule(problem(1),{rounds:5}),b=solveAdaptiveEliteSchedule(problem(2),{rounds:5}),d=candidateDiversity(a,b);expect(d).toBeGreaterThanOrEqual(0);expect(d).toBeLessThanOrEqual(1);expect(a.adaptive.diversity).toBeGreaterThanOrEqual(0);expect(a.adaptive.diversity).toBeLessThanOrEqual(1)});
 test("restart and path-relink counters are deterministic and non-negative",()=>{const r=solveAdaptiveEliteSchedule(problem(33),{rounds:8,stagnationLimit:2});expect(r.adaptive.restarts).toBeGreaterThanOrEqual(0);expect(r.adaptive.pathRelinks).toBeGreaterThanOrEqual(0);expect(r.adaptive.rounds).toBe(8)});
 test("adaptive result never bypasses canonical inner HARD score",()=>{const r=solveAdaptiveEliteSchedule(problem(5),{rounds:5});expect(r.complete).toBe(true);expect(r.failed).toBe(0);expect(r.score.hard).toBe(0)});
 test("adaptive result is never worse than same-seed AUTO baseline",()=>{const p=problem(91),base=solveIncrementalSchedule({...p,strategy:"AUTO"}),adaptive=solveAdaptiveEliteSchedule(p,{rounds:6});expect(lex(adaptive.score,base.score)).toBeLessThanOrEqual(0)});
});
