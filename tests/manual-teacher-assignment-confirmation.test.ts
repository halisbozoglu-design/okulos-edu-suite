import { expect, test } from "bun:test";

const migration = await Bun.file("supabase/migrations/20260831001000_teacher_course_assignment_exceptions.sql").text();
const cloneMigration = await Bun.file("supabase/migrations/20260831003000_manual_teacher_assignment_clone.sql").text();
const curriculum = await Bun.file("src/routes/curriculum.tsx").text();

test("manual teacher assignment needs confirmation but no reason or validity range", () => {
  expect(migration).toContain("is_manual_override boolean not null default false");
  expect(migration).toContain("p_confirm_manual_override boolean default false");
  expect(migration).toContain("MANUAL_ASSIGNMENT_CONFIRMATION_REQUIRED");
  expect(migration).not.toContain("p_exception_reason");
  expect(migration).not.toContain("p_exception_valid_from");
  expect(migration).not.toContain("is_justified_exception");
});

test("copying a curriculum preserves a previously confirmed manual assignment", () => {
  expect(cloneMigration).toContain("is_manual_override");
  expect(cloneMigration).not.toContain("exception_reason");
  expect(cloneMigration).not.toContain("exception_valid_from");
  expect(cloneMigration).not.toContain("is_justified_exception");
});

test("curriculum UI only asks the user to confirm the warning", () => {
  expect(curriculum).toContain("Evet, yine de ata");
  expect(curriculum).toContain("assign_teacher_to_class_course_v4");
  expect(curriculum).toContain("Manuel atama");
  expect(curriculum).not.toContain("Gerekçeli istisna");
  expect(curriculum).not.toContain("İstisnai atama gerekçesi");
  expect(curriculum).not.toContain("exception-valid-until");
});
