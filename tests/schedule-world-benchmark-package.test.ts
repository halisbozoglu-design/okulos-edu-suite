import {describe,expect,test} from "bun:test";
import {makeWorldProblem,runWorldBenchmark} from "../tools/schedule_world_benchmark";
const manifest=await Bun.file("benchmarks/world/manifest.json").json();
const readme=await Bun.file("benchmarks/world/README.md").text();

describe("world benchmark package",()=>{
 test("requires >=30 seeds and all declared structural profiles",()=>{expect(manifest.seed_count).toBeGreaterThanOrEqual(30);for(const id of["synthetic-small","synthetic-medium","synthetic-large","synthetic-dense","mtal","mesem"])expect(manifest.profiles.some((x:any)=>x.id===id)).toBe(true)});
 test("competitors are never fabricated",()=>{for(const id of["timefold","unitime","fet","asc"]){const s=manifest.solvers.find((x:any)=>x.id===id);expect(s?.status).toBe("NOT_RUN")}expect(readme).toContain("never replaced by estimates")});
 test("fairness contract fixes hash/budget/result semantics",()=>{expect(readme).toContain("Same input SHA-256");expect(readme).toContain("Same wall-clock budget");expect(readme).toContain("At least 30 deterministic seeds");expect(readme).toContain("No superiority claim")});
 test("profile generator is deterministic and preserves Section 8 scopes",()=>{const p=manifest.profiles[0],a=makeWorldProblem(p,123),b=makeWorldProblem(p,123);expect(a).toEqual(b);expect(a.assignments.some((x:any)=>x.week_pattern==="ODD"||x.week_pattern==="EVEN")).toBe(true)});
 test("smoke runner emits complete comparable metrics",async()=>{const old=manifest.profiles;manifest.profiles=[manifest.profiles[0]];const r=await runWorldBenchmark({seedCount:2,ci:true});manifest.profiles=old;expect(r.results[0]?.feasible_rate).toBe(1);expect(r.results[0]?.hard_max).toBe(0);expect(r.results[0]?.deterministic_replay).toBe(true);expect(r.results[0]?.input_hash).toHaveLength(64)},30000);
});
