import {describe,expect,test} from "bun:test";
const sql=await Bun.file("supabase/migrations/20260827000500_schedule_student_sectioning_v2.sql").text();
const ui=await Bun.file("src/routes/student-sectioning.tsx").text();
describe("student sectioning v2 contract",()=>{
 test("request scope defaults to home class and supports explicit offering/cross-class",()=>{expect(sql).toContain("default 'HOME_CLASS'");expect(sql).toContain("'OFFERING'");expect(sql).toContain("'CROSS_CLASS'");expect(sql).toContain("cr.class_id=q.home_class_id");expect(sql).toContain("cr.offering_rule_id=q.home_offering_rule_id")});
 test("request-kind importance is case-safe",()=>{expect(sql).toContain("case upper(scr.request_kind)");expect(sql).toContain("when'PRIMARY'then 4");expect(sql).toContain("when'ALTERNATIVE'then 2");expect(sql).toContain("when'SUBSTITUTE'then 1")});
 test("one candidate authority explains all hard infeasibility",()=>{for(const code of ["NO_TIMETABLE","CAPACITY_UNKNOWN","SECTION_FULL","LOCKED_SECTION","HARD_FREE_TIME","TIME_CONFLICT"])expect(sql).toContain(code);expect(sql).toContain("get_student_section_candidates_v2")});
 test("candidate soft objective includes balance and stability",()=>{expect(sql).toContain("section_balance_penalty");expect(sql).toContain("section_change_penalty");expect(sql).toContain("medium_penalty");expect(sql).toContain("soft_penalty")});
 test("online sectioning is concurrency-safe and locked-aware",()=>{expect(sql).toContain("pg_advisory_xact_lock");expect(sql).toContain("not e.locked");expect(sql).toContain("v_old<>c.assignment_id")});
 test("alternative groups clear failed sibling issues after fulfillment",()=>{expect(sql).toContain("rr.alternative_group=q.alternative_group");expect(sql).toContain("delete from public.student_sectioning_issues i using public.student_course_requests rr")});
 test("batch is fail-first and conflict repair reuses online authority",()=>{expect(sql).toContain("order by feasible_count,req_count desc");expect(sql).toContain("repair_student_sectioning_conflicts_v2");expect(sql).toContain("section_student_v2(s.student_id,true)")});
 test("legacy batch entry delegates to v2",()=>{expect(sql).toContain("section_students_batch_v1");expect(sql).toContain("section_students_batch_v2(p_replace_solver)")});
 test("operator UI exposes requests free-time candidates batch and repair",()=>{for(const token of ["HOME_CLASS","OFFERING","CROSS_CLASS","PRIMARY","ALTERNATIVE","SUBSTITUTE","get_student_section_candidates_v2","section_student_v2","section_students_batch_v2","repair_student_sectioning_conflicts_v2","get_student_sectioning_health_v2"])expect(ui).toContain(token)});
});
