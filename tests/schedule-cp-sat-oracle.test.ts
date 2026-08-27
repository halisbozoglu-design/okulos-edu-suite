import {describe,expect,test} from "bun:test";
import {normalizeOracleModel,objectiveGap,solveExactOracle} from "../src/lib/schedule-exact-oracle";
import type {LocalProblem} from "../src/lib/schedule-local-solver-time-core";

const base=():LocalProblem=>({days:[1],periods:2,seed:7,assignments:[
 {assignment_id:"a",teacher_id:"t1",class_id:"c1",course_id:"m",assigned_hours:1,week_pattern:"ALL",allowed_periods:[1,2]},
 {assignment_id:"b",teacher_id:"t1",class_id:"c2",course_id:"n",assigned_hours:1,week_pattern:"ALL",allowed_periods:[1,2]},
],locked:[],unavailable:[],teacherConstraints:[],courseRules:[],planningRelations:[],studentConflictWeights:[]});

describe("CP-SAT exact oracle contract",()=>{
 test("normalizes canonical time/resource inputs without inventing data",()=>{const m=normalizeOracleModel(base());expect(m.version).toBe(1);expect(m.assignments[0]?.allowed_periods).toEqual([1,2]);expect(m.unsupported).toEqual([])});
 test("proves a tiny feasible timetable optimal",()=>{const r=solveExactOracle(normalizeOracleModel(base()),{timeLimitMs:1000,nodeLimit:10000});expect(r.status).toBe("OPTIMAL");expect(r.score.hard).toBe(0);expect(r.rows).toHaveLength(2);expect(new Set(r.rows.map(x=>x.period)).size).toBe(2)});
 test("proves infeasible when one teacher has two assignments but one slot",()=>{const p=base();p.periods=1;p.assignments.forEach(a=>a.allowed_periods=[1]);const r=solveExactOracle(normalizeOracleModel(p),{timeLimitMs:1000,nodeLimit:10000});expect(r.status).toBe("INFEASIBLE")});
 test("ODD and EVEN assignments may share a physical slot",()=>{const p=base();p.periods=1;p.assignments[0]!.week_pattern="ODD";p.assignments[1]!.week_pattern="EVEN";p.assignments.forEach(a=>a.allowed_periods=[1]);const r=solveExactOracle(normalizeOracleModel(p),{timeLimitMs:1000,nodeLimit:10000});expect(r.status).toBe("OPTIMAL");expect(r.rows.every(x=>x.period===1)).toBe(true)});
 test("unsupported generic relations are explicit and block false optimality claims",()=>{const p=base();p.planningRelations=[{id:"r",institution_code:"x",relation_type:"SAME_TIME",mode:"HARD",weight:1,left_selector:{assignment_id:"a"},right_selector:{assignment_id:"b"},parameters:{},active:true} as any];const m=normalizeOracleModel(p);expect(m.unsupported[0]?.code).toBe("RELATION_SAME_TIME");expect(solveExactOracle(m).status).toBe("UNSUPPORTED")});
 test("objective gap is reported against an oracle result",()=>{const r=solveExactOracle(normalizeOracleModel(base()));expect(objectiveGap({hard:0,medium:3,soft:9},r)).toEqual({hard:0,medium:3,soft:9-r.score.soft})});
 test("production CP-SAT runner is pinned and consumes normalized unsupported reporting",async()=>{const py=await Bun.file("scripts/cp-sat-oracle.py").text(),req=await Bun.file("scripts/requirements-cp-sat.txt").text();expect(py).toContain("from ortools.sat.python import cp_model");expect(py).toContain("UNSUPPORTED");expect(py).toContain("BestObjectiveBound");expect(req).toContain("ortools==")});
});
