export type DutyGender = "male" | "female" | null | undefined;

export type DutyStudent = {
  id: string;
  fullName: string;
  classId: string | null;
  gradeLevel?: number | null;
  gender?: DutyGender;
  active?: boolean;
};

export type DutyLocation = {
  id: string;
  name: string;
  studentDutyEnabled: boolean;
  genderRule: "any" | "male" | "female";
  capacity: number;
};

export type DutyCalendarExclusion = { startsOn: string; endsOn: string; blocksTeaching: boolean };
export type DutyExemption = { studentId: string; startsOn: string; endsOn: string | null; isActive: boolean };
export type ExistingDuty = { studentId: string; dutyDate: string; locationId: string | null };
export type StudentDutyAssignment = { studentId: string; locationId: string; assignmentSource: "auto" | "manual"; warning?: string };

function dateInRange(date: string, startsOn: string, endsOn: string | null) {
  return date >= startsOn && (!endsOn || date <= endsOn);
}

export function isCalendarExcluded(date: string, events: DutyCalendarExclusion[]) {
  return events.some((event) => event.blocksTeaching && dateInRange(date, event.startsOn, event.endsOn));
}

export function isStudentExempt(studentId: string, date: string, exemptions: DutyExemption[]) {
  return exemptions.some((item) => item.isActive && item.studentId === studentId && dateInRange(date, item.startsOn, item.endsOn));
}

export function genderCapabilityWarning(students: DutyStudent[], locations: DutyLocation[], genderRuleEnabled: boolean) {
  if (!genderRuleEnabled) return null;
  const constrained = locations.filter((location) => location.genderRule !== "any");
  if (!constrained.length) return null;
  const hasMissingGender = students.some((student) => !student.gender);
  return hasMissingGender ? "Öğrenci verisinde cinsiyet alanı bulunmadığı için cinsiyet kuralı kesin uygulanamaz; eşleşmeleri manuel kontrol edin." : null;
}

export function fairnessCounts(existing: ExistingDuty[], dateBefore?: string) {
  const counts = new Map<string, number>();
  for (const item of existing) {
    if (!dateBefore || item.dutyDate < dateBefore) counts.set(item.studentId, (counts.get(item.studentId) ?? 0) + 1);
  }
  return counts;
}

export function generateStudentDutyAssignments({
  date,
  students,
  locations,
  exemptions,
  calendarEvents,
  existing,
  includedGradeLevels,
  includedClassIds,
  genderRuleEnabled,
}: {
  date: string;
  students: DutyStudent[];
  locations: DutyLocation[];
  exemptions: DutyExemption[];
  calendarEvents: DutyCalendarExclusion[];
  existing: ExistingDuty[];
  includedGradeLevels: number[];
  includedClassIds: string[];
  genderRuleEnabled: boolean;
}) {
  if (isCalendarExcluded(date, calendarEvents)) return { assignments: [] as StudentDutyAssignment[], skippedReason: "Takvimde öğretimi bloke eden gün" };
  const usableLocations = locations.filter((location) => location.studentDutyEnabled && location.capacity > 0);
  const counts = fairnessCounts(existing, date);
  const usedToday = new Set(existing.filter((item) => item.dutyDate === date).map((item) => item.studentId));
  const eligible = students.filter((student) => {
    if (student.active === false || usedToday.has(student.id) || isStudentExempt(student.id, date, exemptions)) return false;
    if (includedClassIds.length && (!student.classId || !includedClassIds.includes(student.classId))) return false;
    return !includedGradeLevels.length || (student.gradeLevel !== null && student.gradeLevel !== undefined && includedGradeLevels.includes(student.gradeLevel));
  }).sort((a, b) => (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0) || a.fullName.localeCompare(b.fullName, "tr"));
  const assignments: StudentDutyAssignment[] = [];
  const capacityByLocation = new Map(usableLocations.map((location) => [location.id, 0]));
  for (const student of eligible) {
    const location = usableLocations.find((candidate) => {
      const occupied = capacityByLocation.get(candidate.id) ?? 0;
      if (occupied >= candidate.capacity) return false;
      if (candidate.genderRule !== "any" && genderRuleEnabled && student.gender && student.gender !== candidate.genderRule) return false;
      return true;
    });
    if (!location) continue;
    capacityByLocation.set(location.id, (capacityByLocation.get(location.id) ?? 0) + 1);
    const warning = genderRuleEnabled && location.genderRule !== "any" && !student.gender ? "Cinsiyet bilgisi eksik; manuel kontrol gerekli" : undefined;
    assignments.push({ studentId: student.id, locationId: location.id, assignmentSource: "auto", ...(warning ? { warning } : {}) });
  }
  return { assignments, skippedReason: null as string | null };
}
