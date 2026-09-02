import{describe,expect,test}from"bun:test";
import{solveIncrementalSchedule,type JointLocalProblem}from"../src/lib/schedule-local-solver-incremental-core";
const migration=await Bun.file("supabase/migrations/20260902000300_schedule_composite_room_bundles.sql").text();
const source=await Bun.file("src/lib/schedule-local-solver.ts").text();
const ui=await Bun.file("src/routes/schedule-solver.tsx").text();
const problem=(periods=2):JointLocalProblem=>({days:[1],periods,assignments:[
 {assignment_id:"a",teacher_id:"ta",class_id:"ca",course_id:"x",assigned_hours:1},
 {assignment_id:"b",teacher_id:"tb",class_id:"cb",course_id:"y",assigned_hours:1},
],locked:[],unavailable:[],teacherConstraints:[],courseRules:[],rooms:[
 {classroom_id:"a-primary",capacity:30},{classroom_id:"b-primary",capacity:30},{classroom_id:"shared-prep",capacity:30},
],roomBundles:[
 {room_bundle_id:"bundle-a",primary_classroom_id:"a-primary",classroom_ids:["a-primary","shared-prep"]},
 {room_bundle_id:"bundle-b",primary_classroom_id:"b-primary",classroom_ids:["b-primary","shared-prep"]},
],roomBundleOptions:{a:["bundle-a"],b:["bundle-b"]},planningRelations:[],studentConflictWeights:[],seed:20260902,enableLns:false});

describe("virtual/composite/shared room bundles",()=>{
 test("schema is tenant-scoped and application remains behind canonical authority",()=>{
  for(const token of["schedule_room_bundles","schedule_room_bundle_members","schedule_assignment_room_bundle_options","ROOM_BUNDLE_REQUIRES_ONE_PRIMARY_ROOM","COMPOSITE_ROOM_TIME_CONFLICT","COMPOSITE_ROOM_COMPONENT_INFEASIBLE","v_applied:=public.apply_schedule_scenario(p_scenario_id)"])expect(migration).toContain(token);
  expect(migration).toContain("enable row level security");expect(migration).toContain("grant select on table");
  expect(migration).not.toContain("create or replace function public.validate_schedule_slot");
  expect(migration).not.toContain("create or replace function public.get_schedule_integrity_report");
 });
 test("solver reserves every physical component atomically",()=>{
  const result=solveIncrementalSchedule(problem());expect(result.complete).toBe(true);
  const a=result.rows.find(r=>r.assignment_id==="a")!,b=result.rows.find(r=>r.assignment_id==="b")!;
  expect(a.room_bundle_id).toBe("bundle-a");expect(a.classroom_ids).toEqual(["a-primary","shared-prep"]);
  expect(b.room_bundle_id).toBe("bundle-b");expect(a.period).not.toBe(b.period);
 });
 test("shared support room makes an impossible single-slot world fail closed",()=>{
  const result=solveIncrementalSchedule(problem(1));expect(result.complete).toBe(false);expect(result.failed).toBeGreaterThan(0);
 });
 test("local, joint and apply paths preserve the bundle identity",()=>{
  expect(source).toContain("import_composite_room_candidate_v1");expect(source).toContain("room_bundle_id:r.room_bundle_id");
  expect(ui).toContain("apply_joint_composite_schedule_candidate_v1");expect(ui).toContain("apply_composite_room_candidate_v1");
 });
});
