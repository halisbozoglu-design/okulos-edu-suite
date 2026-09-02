import {describe,expect,test} from "bun:test";
const sql=await Bun.file("supabase/migrations/20260902000200_schedule_joint_sectioning_candidate.sql").text();
const runner=await Bun.file("src/lib/schedule-joint-sectioning-runner.ts").text();
const ui=await Bun.file("src/routes/student-sectioning.tsx").text();
describe("joint timetable-sectioning persistence contract",()=>{
 test("stages enrollments under the canonical scenario instead of a parallel timetable",()=>{expect(sql).toContain("schedule_scenario_enrollments");expect(sql).toContain("references public.schedule_scenarios(id)");expect(sql).not.toContain("create table if not exists public.joint_teacher_schedule")});
 test("candidate import audits capacity primary requests student time and HARD free-time",()=>{for(const token of ["JOINT_SECTION_CAPACITY_INVALID","JOINT_PRIMARY_REQUEST_UNASSIGNED","JOINT_STUDENT_TIME_CONFLICT","JOINT_HARD_FREE_TIME_CONFLICT"])expect(sql).toContain(token)});
 test("application is atomic and delegates timetable authority",()=>{expect(sql).toContain("v_schedule:=public.apply_schedule_scenario(p_scenario_id)");expect(sql).toContain("pg_advisory_xact_lock");expect(sql).toContain("on conflict(institution_code,student_id,teacher_assignment_id)")});
 test("new public surface has explicit RLS grants and definer lockdown",()=>{expect(sql).toContain("enable row level security");expect(sql).toContain("grant select on table public.schedule_scenario_enrollments to authenticated");expect(sql).toContain("revoke all on function public.assert_joint_schedule_candidate_v1")});
 test("browser runner sends one combined candidate through server audit",()=>{expect(runner).toContain("solveJointScheduleSectioning");expect(runner).toContain("import_joint_schedule_candidate_v1");expect(runner).toContain("student_free_time_requests");expect(ui).toContain("Joint Aday Üret")});
});
