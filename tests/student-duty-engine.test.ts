import { describe, expect, it } from "bun:test";
import { fairnessCounts, generateStudentDutyAssignments, genderCapabilityWarning, isCalendarExcluded, isStudentExempt } from "@/lib/student-duty-engine";

const students = [
  { id: "a", fullName: "Ali", classId: "c1", gradeLevel: 5, gender: "male" as const },
  { id: "b", fullName: "Banu", classId: "c1", gradeLevel: 5, gender: "female" as const },
  { id: "c", fullName: "Can", classId: "c2", gradeLevel: 6, gender: null },
];
const locations = [{ id: "l1", name: "Bahçe", studentDutyEnabled: true, genderRule: "any" as const, capacity: 2 }];

describe("student duty engine", () => {
  it("excludes blocked calendar days and exempt students", () => {
    expect(isCalendarExcluded("2026-09-10", [{ startsOn: "2026-09-10", endsOn: "2026-09-10", blocksTeaching: true }])).toBe(true);
    expect(isStudentExempt("a", "2026-09-10", [{ studentId: "a", startsOn: "2026-09-01", endsOn: null, isActive: true }])).toBe(true);
  });
  it("balances by prior duty count and prevents duplicate daily assignment", () => {
    const result = generateStudentDutyAssignments({ date: "2026-09-11", students, locations, exemptions: [], calendarEvents: [], existing: [{ studentId: "a", dutyDate: "2026-09-01", locationId: "l1" }, { studentId: "b", dutyDate: "2026-09-11", locationId: "l1" }], includedGradeLevels: [], includedClassIds: [], genderRuleEnabled: false });
    expect(result.assignments.map((item) => item.studentId)).toEqual(["c", "a"]);
    expect(new Set(result.assignments.map((item) => item.studentId)).size).toBe(result.assignments.length);
    expect(fairnessCounts([{ studentId: "a", dutyDate: "2026-09-01", locationId: "l1" }]).get("a")).toBe(1);
  });
  it("warns when constrained gender capability cannot be guaranteed", () => {
    expect(genderCapabilityWarning(students, [{ ...locations[0], genderRule: "female" }], true)).toContain("cinsiyet");
  });
  it("skips an excluded date without mutating input", () => {
    const result = generateStudentDutyAssignments({ date: "2026-09-10", students, locations, exemptions: [], calendarEvents: [{ startsOn: "2026-09-10", endsOn: "2026-09-10", blocksTeaching: true }], existing: [], includedGradeLevels: [], includedClassIds: [], genderRuleEnabled: false });
    expect(result.assignments).toHaveLength(0);
    expect(result.skippedReason).toBeTruthy();
  });
});
