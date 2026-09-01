import{describe,expect,test}from"bun:test";
import{solveIncrementalSchedule,type JointLocalProblem}from"../src/lib/schedule-local-solver-incremental-core";
const migration=await Bun.file("supabase/migrations/20260901000500_schedule_additional_teacher_resources.sql").text();
const base=(extra:string[]=[]):JointLocalProblem=>({days:[1],periods:2,assignments:[
 {assignment_id:"a",teacher_id:"primary-a",additional_teacher_ids:extra,class_id:"c1",course_id:"x",assigned_hours:1},
 {assignment_id:"b",teacher_id:"shared",class_id:"c2",course_id:"y",assigned_hours:1},
],locked:[],unavailable:[],teacherConstraints:[],courseRules:[],planningRelations:[],studentConflictWeights:[],seed:1903,enableLns:false});
describe("assistant/co-teacher resources",()=>{
 test("migration makes additional teachers tenant-scoped hard resources",()=>{
  expect(migration).toContain("schedule_assignment_additional_teachers");
  expect(migration).toContain("TEACHER_RESOURCE_DOUBLE_BOOKING");
  expect(migration).toContain("TEACHER_RESOURCE_UNAVAILABLE");
  expect(migration).toContain("TEACHER_RESOURCE_DAILY_LIMIT");
  expect(migration).toContain("TEACHER_RESOURCE_CONSECUTIVE_LIMIT");
  expect(migration).toContain("SCENARIO_TEACHER_RESOURCE_DOUBLE_BOOKING");
  expect(migration).toContain("additional_teacher_ids");
 expect(migration).not.toContain("create or replace function public.validate_schedule_slot");
  expect(migration).not.toContain("create or replace function public.get_schedule_integrity_report");
 });
 test("solver reserves the shared assistant teacher as a HARD resource",()=>{
  const r=solveIncrementalSchedule(base(["shared"]));
  expect(r.complete).toBe(true);
  const a=r.rows.find(x=>x.assignment_id==="a")!,b=r.rows.find(x=>x.assignment_id==="b")!;
  expect([a.weekday,a.period]).not.toEqual([b.weekday,b.period]);
 });
 test("assistant unavailability blocks the assignment",()=>{
  const p=base(["assistant"]);
  p.unavailable=[{teacher_id:"assistant",weekday:1,period:1},{teacher_id:"assistant",weekday:1,period:2}];
  const r=solveIncrementalSchedule(p);
  expect(r.complete).toBe(false);
  expect(r.failed).toBeGreaterThan(0);
 });
 test("assistant daily limit is enforced independently",()=>{
  const p=base(["assistant"]);
  p.assignments[0]!.assigned_hours=2;
  p.teacherConstraints=[{teacher_id:"assistant",max_daily_hours:1,max_consecutive_hours:null}];
  const r=solveIncrementalSchedule(p);
  expect(r.complete).toBe(false);
 });
});
