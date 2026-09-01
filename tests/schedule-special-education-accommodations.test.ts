import { describe, expect, it } from "bun:test";

const migration = await Bun.file("supabase/migrations/20260901000300_schedule_accommodation_resources.sql").text();

describe("neutral special-education timetable accommodations", () => {
  it("models support/accessibility as room capabilities, not sensitive student data", () => {
    expect(migration).toContain("schedule_capabilities text[]");
    expect(migration).toContain("required_room_capabilities text[]");
    expect(migration).toContain("INDIVIDUAL_SUPPORT");
    expect(migration).not.toMatch(/diagnosis|disability|medical_detail|health_detail/i);
  });

  it("hard-rejects incompatible rooms at schedule write time", () => {
    expect(migration).toContain("trg_schedule_accommodation_slot_v1");
    expect(migration).toContain("ROOM_CAPABILITY_REQUIRED");
    expect(migration).toContain("ROOM_REQUIRED_FOR_CAPABILITY");
  });

  it("prevents later capability edits from invalidating an active timetable", () => {
    expect(migration).toContain("CLASSROOM_CAPABILITY_IN_USE");
    expect(migration).toContain("REQUIREMENT_ROOM_CAPABILITY_CONFLICT");
    expect(migration).toContain("trg_classroom_schedule_capabilities_v1");
    expect(migration).toContain("trg_requirement_room_capabilities_v1");
  });

  it("reuses active student enrollments for individual-support collision safety", () => {
    expect(migration).toContain("student_schedule_enrollments");
    expect(migration).toContain("STUDENT_TIME_CONFLICT");
    expect(migration).toContain("trg_student_enrollment_slot_v1");
    expect(migration).toContain("allow_overlap");
  });

  it("exposes tenant-scoped hard issues while keeping trigger helpers private", () => {
    expect(migration).toContain("get_schedule_accommodation_hard_issues_v1");
    expect(migration).toContain("tenant_row_allowed");
    expect(migration).toContain("revoke all on function public.assert_schedule_accommodation_slot_v1");
    expect(migration).toContain("grant execute on function public.get_schedule_accommodation_hard_issues_v1() to authenticated");
  });
});
