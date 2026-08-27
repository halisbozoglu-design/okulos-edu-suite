import {describe,expect,test} from "bun:test";
import {generationEffortProfile,GENERATION_EFFORT_POLICY} from "../src/lib/schedule-generation-effort";
describe("schedule generation effort profiles",()=>{
 test("scales search effort without changing rule semantics",()=>{const q=generationEffortProfile("QUICK"),b=generationEffortProfile("BALANCED"),d=generationEffortProfile("DEEP");expect(q.candidateCount).toBeLessThan(b.candidateCount);expect(b.candidateCount).toBeLessThan(d.candidateCount);expect(q.lnsIterations).toBeLessThan(d.lnsIterations);expect(d.preferredMode).toBe("HYBRID")});
 test("never changes canonical rule authority",()=>{expect(GENERATION_EFFORT_POLICY).toContain("yalnız arama bütçesi");expect(GENERATION_EFFORT_POLICY).toContain("kural setini");expect(GENERATION_EFFORT_POLICY).toContain("validator otoritesini değiştirmez")});
});
