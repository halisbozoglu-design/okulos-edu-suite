import {describe,expect,test} from "bun:test";
const m=await Bun.file("supabase/migrations/20260827002500_schedule_substitution_split_join_v4.sql").text();
describe("substitution split/join v4",()=>{
 test("effective event can represent joined classes and split subgroups",()=>{expect(m).toContain("effective_class_ids uuid[]");expect(m).toContain("effective_subgroup_id uuid");expect(m).toContain("get_schedule_daily_effective_v2");});
 test("class hard conflict uses class-set overlap but permits distinct subgroups",()=>{expect(m).toContain("a.class_ids&&b.class_ids");expect(m).toContain("a.subgroup_id=b.subgroup_id");});
 test("join and split structures are validated before apply",()=>{expect(m).toContain("SPLIT_REQUIRES_MULTIPLE_PARTS");expect(m).toContain("JOIN_REQUIRES_MULTIPLE_SOURCES_AND_ONE_EMIT");});
 test("joined class populations participate in room-pool capacity",()=>{expect(m).toContain("unnest(e.class_ids)");expect(m).toContain("SUBSTITUTION_ROOM_POOL_CAPACITY_UNKNOWN");expect(m).toContain("SUBSTITUTION_ROOM_POOL_CAPACITY_EXCEEDED");});
});