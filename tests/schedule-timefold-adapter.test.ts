import {describe,expect,test} from "bun:test";

const src=await Bun.file("benchmarks/timefold-adapter/src/main/java/org/okulos/bench/TimefoldWorldBenchmark.java").text();

describe("Timefold external benchmark adapter",()=>{
 test("models assignment allowed periods as solver HARD score",()=>{
  expect(src).toContain('a.has("allowed_periods")');
  expect(src).toContain('!l.allowedPeriods.contains(l.slot.period))hard++');
 });
 test("preserves canonical odd/even disjointness",()=>{
  expect(src).toContain('"ODD".equals(a)&&"EVEN".equals(b)');
  expect(src).toContain('"EVEN".equals(a)&&"ODD".equals(b)');
 });
 test("keeps common-hard evidence objective-incomparable",()=>{
  expect(src).toContain('z.put("mapping","HARD_COMMON_CORE")');
  expect(src).toContain('z.put("comparable_objective",false)');
 });
});
