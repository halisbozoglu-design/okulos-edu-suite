import { describe, expect, test } from "bun:test";

const migration = await Bun.file(
  "supabase/migrations/20260902000100_schedule_substitution_additional_teacher_resources.sql",
).text();

describe("substitution additional-teacher resources", () => {
  test("expands every effective event into primary and additional teacher resources", () => {
    expect(migration).toContain("get_schedule_daily_teacher_resources_v1");
    expect(migration).toContain("schedule_assignment_additional_teachers");
    expect(migration).toContain("x.teacher_assignment_id=ts.teacher_assignment_id");
    expect(migration).toContain("distinct on(r.event_key,r.teacher_id)");
  });

  test("blocks a candidate who is busy as an assistant or co-teacher", () => {
    expect(migration).toContain("get_substitute_candidates_v4");
    expect(migration).toContain("r.teacher_id=p.user_id and r.period=p.period");
    expect(migration).toContain("r.source_schedule_id is distinct from p.source_schedule_id");
    expect(migration).toContain("then 'TIME_CONFLICT'");
  });

  test("audits overlay collisions and transfers for every teacher resource", () => {
    expect(migration).toContain("SUBSTITUTION_TEACHER_RESOURCE_CONFLICT");
    expect(migration).toContain("group by teacher_id,period having count(*)>1");
    expect(migration).toContain("from public.get_schedule_daily_teacher_resources_v1(p_date)");
    expect(migration).toContain("get_substitution_transfer_issues_v1");
  });

  test("keeps the resource helper private and tenant-scoped", () => {
    expect(migration).toContain("tenant_row_allowed(x.institution_code)");
    expect(migration).toContain(
      "revoke all on function public.get_schedule_daily_teacher_resources_v1(date) from public,anon,authenticated",
    );
  });
});
