import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../supabase/migrations/20260902013000_access_control_stage1.sql",
  import.meta.url,
);

describe("stage 1 database access contract", () => {
  it("removes the permissive tenant-bypass read policies", async () => {
    const sql = await readFile(migrationUrl, "utf8");
    for (const policy of [
      "authenticated can read school classes",
      "authenticated can read students",
      "authenticated read teacher course assignments",
      "admins can read all profiles",
      "tenant_boundary_profiles",
    ]) {
      expect(sql).toContain(`drop policy if exists \"${policy}\"`);
    }
  });

  it("creates student ownership, guardian links and scoped access functions", async () => {
    const sql = await readFile(migrationUrl, "utf8");
    expect(sql).toContain("auth_user_id uuid references auth.users(id)");
    expect(sql).toContain("create table if not exists public.student_guardians");
    expect(sql).toContain("function public.can_access_class");
    expect(sql).toContain("function public.can_access_student");
    expect(sql).toContain("function public.current_access_context");
  });

  it("keeps teacher class visibility assignment-based", async () => {
    const sql = await readFile(migrationUrl, "utf8");
    expect(sql).toContain("function public.teacher_can_access_class");
    expect(sql).toContain("tca.teacher_id=auth.uid()");
    expect(sql).toContain("sc.advisor_teacher_id=auth.uid()");
  });

  it("audits membership and guardian authorization changes", async () => {
    const sql = await readFile(migrationUrl, "utf8");
    expect(sql).toContain("create table if not exists public.security_audit_log");
    expect(sql).toContain("audit_institution_memberships_access");
    expect(sql).toContain("audit_student_guardians_access");
  });
});
