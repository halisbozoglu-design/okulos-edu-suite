import {describe,expect,test} from "bun:test";

const migration=await Bun.file("supabase/migrations/20260901000400_multi_week_bell_schedule.sql").text();

describe("multi-week bell clock authority",()=>{
 test("keeps canonical period identity and stores only scoped clock variants",()=>{
  expect(migration).toContain("schedule_period_clock_variants");
  expect(migration).toContain("period_definition_id uuid not null references public.schedule_period_definitions(id)");
  expect(migration).toContain("week_pattern text not null default 'ALL'");
  expect(migration).toContain("term_no smallint");
  expect(migration).toContain("valid_from date");
  expect(migration).toContain("valid_to date");
 });
 test("resolves the actual bell clock from date, week parity and term",()=>{
  expect(migration).toContain("get_schedule_period_clock_for_date_v1");
  expect(migration).toContain("schedule_week_pattern_applies_v1(x.week_pattern,p_date)");
  expect(migration).toContain("schedule_term_applies_on_date_v1(x.term_no,p_date)");
  expect(migration).toContain("case when v.id is null then 'BASE' else 'VARIANT' end");
 });
 test("rejects ambiguous active variants at equal priority",()=>{
  expect(migration).toContain("AMBIGUOUS_BELL_CLOCK_SCOPE");
  expect(migration).toContain("trg_schedule_period_clock_variant_v1");
  expect(migration).toContain("v.priority=new.priority");
 });
 test("provides date-aware physical overlap and teacher schedule clocks",()=>{
  expect(migration).toContain("schedule_slots_overlap_on_date_v1");
  expect(migration).toContain("get_teacher_schedule_for_date_v2");
  expect(migration).toContain("clock_source text");
 });
 test("keeps resolver tenant-scoped and anonymous callers closed",()=>{
  expect(migration).toContain("tenant_row_allowed");
  expect(migration).toContain("revoke all on function");
  expect(migration).toContain("to authenticated");
 });
});
