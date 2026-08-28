import{describe,expect,test}from"bun:test";
const src=await Bun.file("benchmarks/unitime-adapter/src/main/java/org/okulos/bench/UnitimeWorldBenchmark.java").text(),agg=await Bun.file("tools/schedule_unitime_world_benchmark.ts").text();
describe("UniTime external benchmark adapter",()=>{
 test("keeps HARD in CPSolver constraints and optimizes the remaining canonical vector lexicographically",()=>{expect(src).toContain("implements SolutionComparator<Activity,Location>");expect(src).toContain("long[] objective");expect(src).toContain("return cur[i]<best[i]");expect(src).toContain('Termination.StopWhenComplete","false');expect(src).toContain('WORLD_CANONICAL_LEX_HARD_UNPLACED_MEDIUM_SOFT');});
 test("models canonical student conflict and soft quality without scalarizing objective levels",()=>{expect(src).toContain("medium+=c.weight");expect(src).toContain("*8L");expect(src).toContain("*2L");expect(src).not.toContain("medium*1000");});
 test("fails closed for benchmark semantics not mapped into CPSolver",()=>{expect(src).toContain("UNSUPPORTED_WORLD_OBJECTIVE_INPUT");expect(src).toContain('p.path("planningRelations").size()!=0');});
 test("requires independent canonical objective parity before RUN_COMPARABLE",()=>{expect(agg).toContain("r.objective_match=r.comparable_objective===true");expect(agg).toContain('?"RUN_COMPARABLE"');expect(agg).toContain('r.status!=="RUN_COMPARABLE"||!r.objective_parity');});
});
