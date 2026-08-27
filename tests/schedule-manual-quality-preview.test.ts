import {describe,expect,test} from "bun:test";
import fs from "node:fs";
const sql=fs.readFileSync("supabase/migrations/20260828010000_schedule_manual_relation_quality_preview_v1.sql","utf8");
describe("manual schedule quality preview",()=>{
 test("HARD preview remains the first and final move gate",()=>{const hard=sql.indexOf("preview_schedule_move_v1");const quality=sql.indexOf("get_schedule_current_generic_relation_summary_v1");expect(hard).toBeGreaterThan(-1);expect(quality).toBeGreaterThan(hard);expect(sql).toContain("if not coalesce((h->>'ok')::boolean,false) then return h||jsonb_build_object('quality_available',false)")});
 test("quality is server canonical relation delta and always rolled back",()=>{expect(sql).toContain("CANONICAL_GENERIC_RELATIONS");expect(sql).toContain("NEGATIVE_DELTA_IS_BETTER");expect(sql).toContain("OKULOS_QUALITY_PREVIEW_ROLLBACK");expect(sql).toContain("medium_delta");expect(sql).toContain("soft_delta")});
 test("move and swap previews share the same fail-safe policy",()=>{expect(sql).toContain("preview_schedule_move_quality_v1");expect(sql).toContain("preview_schedule_swap_quality_v1");expect((sql.match(/quality_available',false/g)??[]).length).toBeGreaterThanOrEqual(4)});
});
