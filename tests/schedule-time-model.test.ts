import {describe,expect,test} from "bun:test";
import {localScopesOverlap,solveLocalSchedule,type LocalProblem} from "../src/lib/schedule-local-solver-time-core";

const schema=await Bun.file("supabase/migrations/20260827010000_schedule_time_model_v1.sql").text();
const validator=await Bun.file("supabase/migrations/20260827010500_schedule_time_scope_validator_v1.sql").text();
const solverMigration=await Bun.file("supabase/migrations/20260827011000_schedule_time_scope_solver_v1.sql").text();
const localLoader=await Bun.file("src/lib/schedule-local-solver.ts").text();
const worker=await Bun.file("src/workers/schedule-local-solver-worker.ts").text();
const ui=await Bun.file("src/routes/schedule-time-model.tsx").text();
const absence=await Bun.file("supabase/functions/report-absence/index.ts").text();
const a=(id:string,week_pattern:"ALL"|"ODD"|"EVEN",extra:Record<string,unknown>={})=>({assignment_id:id,teacher_id:"T",class_id:"C",course_id:id,assigned_hours:1,week_pattern,schedule_session_id:"S",allowed_periods:[1],...extra});
const base=(assignments:ReturnType<typeof a>[]):LocalProblem=>({days:[1],periods:1,assignments,locked:[],unavailable:[],teacherConstraints:[],courseRules:assignments.map(x=>({course_id:x.course_id,block_pattern:[1],max_per_day:null,prohibited_days:null,prohibited_periods:null})),seed:7,strategy:"AUTO",enableLns:false});

describe("schedule canonical time model",()=>{
 test("ODD and EVEN scopes are disjoint while ALL overlaps both",()=>{expect(localScopesOverlap(a("A","ODD"),a("B","EVEN"))).toBe(false);expect(localScopesOverlap(a("A","ALL"),a("B","EVEN"))).toBe(true)});
 test("different explicit terms and non-overlapping date ranges are disjoint",()=>{expect(localScopesOverlap(a("A","ALL",{term_no:1}),a("B","ALL",{term_no:2}))).toBe(false);expect(localScopesOverlap(a("A","ALL",{valid_to:"2026-10-01"}),a("B","ALL",{valid_from:"2026-10-02"}))).toBe(false)});
 test("ODD and EVEN can share the only teacher/class slot",()=>{const r=solveLocalSchedule(base([a("A","ODD"),a("B","EVEN")]));expect(r.complete).toBe(true);expect(r.failed).toBe(0);expect(r.rows).toHaveLength(2);expect(new Set(r.rows.map(x=>`${x.weekday}:${x.period}`)).size).toBe(1)});
 test("ALL and ODD cannot share the only teacher/class slot",()=>{const r=solveLocalSchedule(base([a("A","ALL"),a("B","ODD")]));expect(r.complete).toBe(false);expect(r.failed).toBe(1)});
 test("assignment allowed canonical periods constrain local solver",()=>{const p=base([a("A","ALL")]);p.periods=2;p.assignments[0]!.allowed_periods=[2];const r=solveLocalSchedule(p);expect(r.complete).toBe(true);expect(r.rows[0]?.period).toBe(2)});
 test("schema models sessions, local periods, week/date/term scope and 24 canonical slots",()=>{for(const s of["schedule_sessions","schedule_period_definitions","local_period","week_pattern","valid_from","valid_to","term_no","schedule_session_id","between 1 and 24"])expect(schema).toContain(s)});
 test("validator keeps unknown multi-session configuration conservative and date-aware",()=>{for(const s of["schedule_assignment_scopes_overlap_v1","schedule_requirement_slot_allowed_v1","schedule_assignment_applies_on_date_v1","schedule_slot_open_on_date_v1","SCHEDULE_SESSION_REQUIRED","PERIOD_OUTSIDE_SESSION","validate_schedule_scenario_temporal_v1"])expect(validator).toContain(s)});
 test("DB generator, student conflicts and room authority share scope semantics",()=>{for(const s of["scenario_teacher_daily_count_scope_v1","scenario_teacher_working_days_scope_v1","scenario_teacher_consecutive_count_block_scope_v1","generate_schedule_scenarios","get_schedule_scenario_student_conflict_summary_v1","get_schedule_student_conflict_report_v2","get_schedule_scenario_room_candidates_v2","schedule_assignment_scopes_overlap_v1"])expect(solverMigration).toContain(s)});
 test("browser worker consumes time-aware core and canonical time model RPC",()=>{expect(worker).toContain("schedule-local-solver-time-core");expect(localLoader).toContain("get_schedule_assignment_time_model_v1");expect(localLoader).toContain("allowed_periods");expect(localLoader).toContain("week_pattern")});
 test("operator UI never invents default clock values",()=>{expect(ui).toContain("schedule_period_definitions");expect(ui).toContain("week_pattern");expect(ui).toContain("term_no");expect(ui).not.toContain('starts_at:"08:00"');expect(ui).not.toContain('ends_at:"08:40"')});
 test("absence snapshots use date-applicable schedule authority",()=>{expect(absence).toContain("get_teacher_schedule_for_date_v1");expect(absence).not.toContain('.from("teacher_schedule").select')});
});
