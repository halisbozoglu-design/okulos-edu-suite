import { describe, expect, test } from "bun:test";

const schedule = await Bun.file("src/routes/schedule.tsx").text();
const reports = await Bun.file("src/routes/schedule-reports.tsx").text();
const eokul = await Bun.file("src/lib/eokul-schedule-export.ts").text();

describe("assistant/co-teacher user-facing paths", () => {
  test("main timetable resolves names and filters every teacher resource", () => {
    expect(schedule).toContain("additional_teacher_ids:string[]");
    expect(schedule).toContain('supabase.from("profiles").select("user_id,full_name")');
    expect(schedule).toContain("assignmentTeacherIds(option).includes(teacherFilter)");
    expect(schedule).toContain("assignmentTeacherText(optionMap[r.teacher_assignment_id??\"\"])");
    expect(schedule).toContain("Yardımcı/eş:");
  });

  test("reports, CSV, Excel, print and e-Okul retain additional teachers", () => {
    expect(reports).toContain('"Yardımcı / Eş Öğretmen"');
    expect(reports).toContain("filtered.flatMap(assignmentTeacherIds)");
    expect(reports).toContain("subjectRows.flatMap(assignmentTeacherIds)");
    expect(reports).toContain("additionalTeachers: additionalTeacherNames(row)");
    expect(eokul).toContain("additionalTeachers?: string[]");
    expect(eokul).toContain("new Set(row.additionalTeachers ?? [])");
  });

  test("schedule import remains assignment-linked and does not rewrite co-teacher resources", () => {
    expect(schedule).toContain('supabase.rpc("import_weekly_schedule"');
    expect(schedule).not.toContain('from("schedule_assignment_additional_teachers").delete');
  });
});
