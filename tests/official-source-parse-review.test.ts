import { describe, expect, it } from "bun:test";

const migration = await Bun.file(
  "supabase/migrations/20260831010800_secure_official_source_parse_review.sql",
).text();

describe("official source parse review boundary", () => {
  it("requires authenticated Super Admin evidence before a source can await approval", () => {
    expect(migration).toContain("auth.uid() is null or not public.is_super_admin()");
    expect(migration).toContain("SOURCE_PARSE_EVIDENCE_REQUIRED");
    expect(migration).toContain("SOURCE_PARSE_REVIEW_NOTE_REQUIRED");
    expect(migration).toContain("'PARSED_AWAITING_APPROVAL'");
  });

  it("does not reopen approved or applied changes", () => {
    expect(migration).toContain("status in ('DETECTED','PARSE_FAILED')");
    expect(migration).toContain("SOURCE_CHANGE_NOT_READY_FOR_PARSE_REVIEW");
  });
});
