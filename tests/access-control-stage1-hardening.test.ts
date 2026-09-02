import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

const stage1Url = new URL(
  "../supabase/migrations/20260902013000_access_control_stage1.sql",
  import.meta.url,
);
const hardeningUrl = new URL(
  "../supabase/migrations/20260902014500_access_control_stage1_hardening.sql",
  import.meta.url,
);

const dangerousLegacyPolicies = [
  "delegated class managers manage classes",
  "delegated curriculum managers manage teacher course assignments",
  "managers manage teacher course assignments",
  "admins can update all profiles",
  "admins can read all profiles",
  "managers can read operational profiles",
  "delegated operators read operational profiles",
];

describe("stage 1 RLS hardening", () => {
  it("drops every known permissive legacy write/read policy in both stage1 and hardening defense layers", async () => {
    const [stage1, hardening] = await Promise.all([
      readFile(stage1Url, "utf8"),
      readFile(hardeningUrl, "utf8"),
    ]);

    for (const policy of dangerousLegacyPolicies) {
      expect(stage1).toContain(`drop policy if exists \"${policy}\"`);
      expect(hardening).toContain(`drop policy if exists \"${policy}\"`);
    }
  });

  it("keeps all replacement write policies tenant-bound", async () => {
    const sql = await readFile(hardeningUrl, "utf8");

    expect(sql).toContain("institution_code = public.current_tenant_code()");
    expect(sql).toContain("public.has_permission('classes.manage')");
    expect(sql).toContain("public.has_permission('curriculum.manage')");
    expect(sql).toContain("public.is_institution_admin(institution_code)");
  });

  it("rejects guardian links whose student belongs to another tenant", async () => {
    const sql = await readFile(hardeningUrl, "utf8");

    expect(sql).toContain("function public.enforce_student_guardian_tenant");
    expect(sql).toContain("GUARDIAN_STUDENT_CROSS_TENANT_BLOCKED");
    expect(sql).toContain("before insert or update of institution_code, student_id");
  });
});
