import {describe,expect,test} from "bun:test";
import {assertImpossibleSuiteGate,auditHard,getImpossibleSuiteCases,runImpossibleSuite} from "../tools/schedule_impossible_near_impossible";
import {solveLocalSchedule} from "../src/lib/schedule-local-solver-core";

describe("impossible and near-impossible timetable gate",()=>{
 test("fixture contains five impossible and four boundary-feasible cases",()=>{const cases=getImpossibleSuiteCases();expect(cases).toHaveLength(9);expect(cases.filter(c=>c.expected==="INFEASIBLE")).toHaveLength(5);expect(cases.filter(c=>c.expected==="FEASIBLE")).toHaveLength(4);expect(new Set(cases.map(c=>c.id)).size).toBe(9)});
 test("all nine cases are classified fail-closed without HARD leakage",async()=>{const report=await runImpossibleSuite();expect(report.summary.passed).toBe(9);expect(report.summary.failed).toBe(0);expect(report.summary.hard_leakage).toBe(0);expect(()=>assertImpossibleSuiteGate(report)).not.toThrow()});
 test("independent HARD audit verifies every boundary-feasible solution",()=>{for(const c of getImpossibleSuiteCases().filter(c=>c.expected==="FEASIBLE")){const r=solveLocalSchedule(c.problem),audit=auditHard(c.problem,r.rows);expect(r.complete,c.id).toBe(true);expect(r.failed,c.id).toBe(0);expect(audit,c.id).toEqual({hard:0,unplaced:0,violations:[]})}});
 test("deterministic replay and gate shape cannot be weakened",async()=>{const report=await runImpossibleSuite();expect(report.results.every(r=>r.deterministic)).toBe(true);expect(()=>assertImpossibleSuiteGate({...report,summary:{...report.summary,passed:8,failed:1}})).toThrow("IMPOSSIBLE_SUITE_GATE_FAILED")});
});
