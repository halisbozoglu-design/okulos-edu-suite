import {describe,expect,test} from "bun:test";
import {evaluateParityGate} from "../tools/schedule_parity_gate";

describe("final parity/superiority truth gate",()=>{
 test("unresolved capability rows block parity",async()=>{const r=await evaluateParityGate();expect(r.parity_pass).toBe(false);expect(r.unresolved.length).toBeGreaterThan(0)});
 test("unrun competitors block superiority",async()=>{const r=await evaluateParityGate();expect(r.superiority_claim_allowed).toBe(false);expect(r.competitor_not_run.map(x=>x.engine)).toEqual(expect.arrayContaining(["Timefold","UniTime","FET","aSc"]))});
});
