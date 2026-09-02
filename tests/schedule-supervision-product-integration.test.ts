import{describe,expect,test}from"bun:test";
import{solveSupervisionSchedule,type SupervisionProblem}from"../src/lib/schedule-supervision-solver";
const migration=await Bun.file("supabase/migrations/20260902000400_schedule_supervision_product_integration.sql").text();
const ui=await Bun.file("src/routes/schedule-supervision.tsx").text();

describe("schedule supervision product integration",()=>{
 test("live primary, assistant and unavailable slots feed the product problem",()=>{
  for(const token of["get_schedule_supervision_problem_v1","schedule_assignment_additional_teachers","teacher_unavailability","'LESSON'","'UNAVAILABLE'"])expect(migration).toContain(token);
  expect(ui).toContain("solveSupervisionSchedule");expect(ui).toContain("get_schedule_supervision_problem_v1");
 });
 test("draft, administrative approval and publication are distinct fail-closed stages",()=>{
  for(const token of["'DRAFT','APPROVED','PUBLISHED','REJECTED','SUPERSEDED'","decide_schedule_supervision_plan_v1","publish_schedule_supervision_plan_v1","SUPERVISION_PLAN_HAS_HARD_OR_STALE_ISSUES","pg_advisory_xact_lock","schedule_supervision_plan_events","duty.supervision"])expect(migration).toContain(token);
  expect(migration).toContain("perform public.open_permission_context('duty.lock')");
  expect(migration).toContain("revoke all on public.schedule_supervision_requirements");
  expect(migration).toContain("enable row level security");
 });
 test("server recomputes and compares the lexicographic score vector",()=>{
  expect(migration).toContain("SUPERVISION_SCORE_VECTOR_MISMATCH");expect(migration).toContain("v_medium");
  const p:SupervisionProblem={seed:9,positions:[{id:"yard",label:"Bahçe",weekday:1,period:2,required_count:1}],teachers:[{id:"t1",min_load:1,max_load:1},{id:"t2",min_load:0,max_load:1}],occupied_slots:[{teacher_id:"t2",weekday:1,period:2,source:"LESSON"}]};
  const r=solveSupervisionSchedule(p);expect(r.complete).toBe(true);expect(r.assignments).toEqual([{position_id:"yard",teacher_id:"t1",weekday:1,period:2}]);expect(r.score).toEqual({hard:0,unplaced:0,medium:1,soft:0});
 });
 test("canonical timetable authority is not redefined",()=>{
  expect(migration).not.toContain("create or replace function public.validate_schedule_slot");
  expect(migration).not.toContain("create or replace function public.get_schedule_integrity_report");
 });
});
