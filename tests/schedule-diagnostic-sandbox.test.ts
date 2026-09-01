import { expect, test } from "bun:test";

const migration=await Bun.file("supabase/migrations/20260901000200_schedule_diagnostic_sandbox.sql").text();

test("diagnostic sandbox is immutable, tenant-scoped, and cannot publish",()=>{
  expect(migration).toContain("schedule_diagnostic_sandboxes");
  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all on public.schedule_diagnostic_sandboxes from public, anon, authenticated");
  expect(migration).toContain("'canonical_publish_allowed',false");
  expect(migration).toContain("'hard_rules_relaxed',false");
  expect(migration).toContain("DIAGNOSTIC_SANDBOX_NOT_PUBLISHABLE");
});
