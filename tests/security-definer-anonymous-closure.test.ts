import { describe, expect, it } from "bun:test";

const migration = await Bun.file(
  "supabase/migrations/20260831010700_close_anonymous_security_definer_surface.sql",
).text();

describe("security definer anonymous closure", () => {
  it("removes inherited public access before authenticating intended endpoints", () => {
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("get_schedule_integrity_report()");
    expect(migration).toContain("apply_official_curriculum_to_class_v2");
  });

  it("keeps trigger helpers internal", () => {
    const grant = migration.slice(migration.indexOf("grant execute"));
    expect(grant).not.toContain("audit_teacher_course_assignment_exception_v1");
    expect(grant).not.toContain("capture_publication_curriculum_fingerprint_v1");
  });
});
