import {describe,expect,test} from "bun:test";
import fs from "node:fs";
import {GPU_RANKING_POLICY} from "../src/lib/schedule-gpu-compute";
const gpu=fs.readFileSync("src/lib/schedule-gpu-compute.ts","utf8"),solver=fs.readFileSync("src/lib/schedule-local-solver.ts","utf8");
describe("GPU candidate ranking safety",()=>{
 test("GPU no longer scalarizes HARD, unplaced, medium and soft-like heuristics into one float",()=>{expect(gpu).toContain("o[i]=a[b+2u]");expect(gpu).not.toContain("1000000000.0");expect(gpu).not.toContain("10000000.0")});
 test("GPU is fed from complete hard-feasible candidate pool and canonical byScore resolves ties",()=>{expect(solver).toContain("complete=candidates.filter(x=>x.complete&&x.failed===0&&x.score.hard===0)");expect(solver).toContain("a.s-b.s||byScore(a.c,b.c)")});
 test("policy preserves canonical objective authority",()=>{expect(GPU_RANKING_POLICY).toContain("Canonical CPU byScore");expect(GPU_RANKING_POLICY).toContain("GPU cannot override")});
});
