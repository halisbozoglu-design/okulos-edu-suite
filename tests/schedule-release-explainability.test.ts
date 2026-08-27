import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";

const read=(p:string)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");

describe("schedule release/explainability closure",()=>{
 test("scenario explainability consumes canonical server authorities",()=>{
  const s=read("src/routes/schedule-scenario-comparison.tsx");
  expect(s).toContain('get_schedule_scenario_objective_vector_v1');
  expect(s).toContain('schedule_scenario_explanations');
  expect(s).toContain('schedule_repair_suggestions');
  expect(s).toContain('Objective delta');
  expect(s).toContain('Kök neden');
  expect(s).toContain('Neden burada?');
  expect(s).toContain('Neden daha iyi değil / neden değil?');
 });
 test("publish gate remains canonical and auditable",()=>{
  const a=read("src/routes/schedule-archive.tsx"),solver=read("src/routes/schedule-solver.tsx");
  expect(a).toContain('get_schedule_integrity_report');
  expect(a).toContain('publish_current_schedule');
  expect(a).toContain('get_schedule_publication_history');
  expect(solver).toContain('create_schedule_restore_point');
  expect(a).toContain('benchmarks/world/baseline-20260827.json');
  expect(a).toContain('schedule-world-benchmark-94368a072739d85cd6a59571948220610aabf6a1');
 });
 test("CI retains release regression evidence",()=>{
  const ci=read(".github/workflows/ci.yml");
  expect(ci).toContain('Run 30-seed world benchmark gate');
  expect(ci).toContain('Upload world benchmark evidence');
  expect(ci).toContain('Production build and generate routes');
  expect(ci).toContain('TypeScript check');
 });
});
