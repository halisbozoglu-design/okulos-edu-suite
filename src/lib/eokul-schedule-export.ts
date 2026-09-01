export type EokulScheduleExportRow = {
  weekday: number;
  period: number;
  teacher: string;
  additionalTeachers?: string[];
  className: string;
  subject: string;
  classroom: string | null;
};

export type EokulScheduleExportPayload = {
  format: "okulos-eokul-schedule-v1";
  generatedAt: string;
  source: { title: string; academicYear: string | null };
  rows: EokulScheduleExportRow[];
};

export function createEokulScheduleExportPayload(input: {
  title: string;
  academicYear?: string | null;
  rows: EokulScheduleExportRow[];
}): EokulScheduleExportPayload {
  return {
    format: "okulos-eokul-schedule-v1",
    generatedAt: new Date().toISOString(),
    source: { title: input.title, academicYear: input.academicYear ?? null },
    rows: input.rows.map((row) => ({ ...row, additionalTeachers: [...new Set(row.additionalTeachers ?? [])] })).sort((a, b) => a.weekday - b.weekday || a.period - b.period || a.className.localeCompare(b.className, "tr")),
  };
}
