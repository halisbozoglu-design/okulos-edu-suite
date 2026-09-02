import { expect, test } from "bun:test";

const migration = await Bun.file("supabase/migrations/20260901000100_schedule_command_canonical_preview.sql").text();
const command = await Bun.file("src/components/okulos/ScheduleVoiceCommand.tsx").text();

test("command actions have server previews before apply", () => {
  expect(migration).toContain("preview_schedule_assignment_slot_v1");
  expect(migration).toContain("preview_teacher_slot_unavailable_v1");
  expect(command).toContain("canonicalPreview");
  expect(command).toContain("Önce canonical kontrol");
});
