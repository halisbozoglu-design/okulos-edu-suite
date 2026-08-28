import {describe,expect,test} from "bun:test";

const src=await Bun.file("benchmarks/timefold-adapter/src/main/java/org/okulos/bench/TimefoldWorldBenchmark.java").text();
const gate=await Bun.file("tools/schedule_timefold_world_benchmark.ts").text();

describe("Timefold external benchmark adapter",()=>{
 test("models assignment allowed periods as solver HARD score",()=>{
  expect(src).toContain('a.has("allowed_periods")');
  expect(src).toContain('!l.allowedPeriods.contains(l.slot.period))hard++');
 });
 test("preserves canonical odd/even disjointness",()=>{
  expect(src).toContain('"ODD".equals(a)&&"EVEN".equals(b)');
  expect(src).toContain('"EVEN".equals(a)&&"ODD".equals(b)');
 });
 test("optimizes the canonical lexicographic benchmark objective",()=>{
  expect(src).toContain('allowsUnassigned=true');
  expect(src).toContain('bendableHardLevelsSize=1,bendableSoftLevelsSize=3');
  expect(src).toContain('new long[]{-unplaced,-medium,-soft}');
  expect(src).toContain('WORLD_CANONICAL_LEX_HARD_UNPLACED_MEDIUM_SOFT');
 });
 test("fails closed when the world corpus exceeds the proven mapping",()=>{
  expect(src).toContain('UNSUPPORTED_WORLD_OBJECTIVE_INPUT');
  expect(src).toContain('p.path("planningRelations").size()!=0');
  expect(src).toContain('a.path("assigned_hours").asInt()!=1');
 });
 test("requires independent canonical objective parity before RUN_COMPARABLE",()=>{
  expect(gate).toContain('r.objective_match=r.comparable_objective===true');
  expect(gate).toContain('status=full&&objectiveParity?"RUN_COMPARABLE"');
  expect(gate).toContain('r.status!=="RUN_COMPARABLE"||!r.objective_parity');
 });
});
