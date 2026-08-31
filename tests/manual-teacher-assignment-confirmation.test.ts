import { expect, test } from "bun:test";

const migration = await Bun.file("supabase/migrations/20260831010900_manual_teacher_assignment_confirmation.sql").text();
const curriculum = await Bun.file("src/routes/curriculum.tsx").text();

test("manual teacher assignment needs confirmation but no reason or validity range", () => {
  expect(migration).toContain("is_manual_override boolean not null default false");
  expect(migration).toContain("p_confirm_manual_override boolean default false");
  expect(migration).toContain("MANUAL_ASSIGNMENT_CONFIRMATION_REQUIRED");
  expect(migration).not.toContain("p_exception_reason");
  expect(migration).not.toContain("p_exception_valid_from");
});

test("curriculum UI only asks the user to confirm the warning", () => {
  expect(curriculum).toContain("Evet, yine de ata");
  expect(curriculum).toContain("assign_teacher_to_class_course_v4");
  expect(curriculum).not.toContain("İstisnai atama gerekçesi");
  expect(curriculum).not.toContain("exception-valid-until");
});
