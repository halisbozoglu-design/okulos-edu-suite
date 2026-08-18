import * as XLSX from "xlsx";

export type ScheduleImportRow = {
  teacherName: string;
  className: string;
  programType: string;
  subject: string;
  dayOfWeek: number;
  periodNumber: number;
  classroom: string;
  subgroupKey: string;
  isGroupSplit: boolean;
};

const dayMap: Record<string, number> = {
  pazartesi: 1,
  monday: 1,
  sali: 2,
  salı: 2,
  tuesday: 2,
  carsamba: 3,
  çarşamba: 3,
  wednesday: 3,
  persembe: 4,
  perşembe: 4,
  thursday: 4,
  cuma: 5,
  friday: 5,
  cumartesi: 6,
  saturday: 6,
  pazar: 7,
  sunday: 7,
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ");
}

function pick(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const found = entries.find(([key]) => normalizeHeader(key) === normalizedAlias);
    if (found) return found[1];
  }
  return undefined;
}

function parseDay(value: unknown) {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 7) return numeric;
  return dayMap[normalizeHeader(value)] ?? 0;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  const normalized = normalizeHeader(value);
  return ["1", "true", "evet", "e", "yes", "var"].includes(normalized);
}

function normalizeRow(raw: Record<string, unknown>): ScheduleImportRow {
  const teacherName = String(pick(raw, ["Öğretmen", "Öğretmen Adı", "Teacher", "Teacher Name"]) ?? "").trim();
  const className = String(pick(raw, ["Sınıf", "Şube", "Sınıf/Şube", "Class", "Class Name"]) ?? "").trim();
  const programType = String(pick(raw, ["Program", "Program Türü", "Program Type"]) ?? "").trim();
  const subject = String(pick(raw, ["Ders", "Ders Adı", "Subject"]) ?? "").trim();
  const dayOfWeek = parseDay(pick(raw, ["Gün", "Haftanın Günü", "Day", "Day Of Week"]));
  const periodNumber = Number(pick(raw, ["Ders Saati", "Saat", "Ders No", "Period", "Period Number"]) ?? 0);
  const classroom = String(pick(raw, ["Derslik", "Sınıf Dersliği", "Atölye", "Classroom", "Room"]) ?? "").trim();
  const subgroupKey = String(pick(raw, ["Alt Grup", "Grup", "Subgroup", "Subgroup Key"]) ?? "").trim();
  const isGroupSplit = parseBoolean(pick(raw, ["Grup Bölünmüş", "Grup Dersi", "Group Split", "Is Group Split"])) || Boolean(subgroupKey);

  if (!teacherName || !className || !subject || !dayOfWeek || !Number.isInteger(periodNumber) || periodNumber < 1 || periodNumber > 12) {
    throw new Error("PROGRAM_SATIRI_GECERSIZ");
  }

  return {
    teacherName,
    className,
    programType,
    subject,
    dayOfWeek,
    periodNumber,
    classroom,
    subgroupKey,
    isGroupSplit,
  };
}

function delimitedTextToObjects(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("PROGRAM_DOSYASI_BOS");
  const delimiter = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((cell) => cell.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""]));
  });
}

export async function parseScheduleImport(file: File): Promise<ScheduleImportRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let rawRows: Record<string, unknown>[];

  if (extension === "xlsx" || extension === "xls") {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } else if (extension === "csv" || extension === "txt") {
    rawRows = delimitedTextToObjects(await file.text());
  } else {
    throw new Error("DESTEKLENMEYEN_PROGRAM_DOSYASI");
  }

  if (!rawRows.length) throw new Error("PROGRAM_DOSYASI_BOS");
  return rawRows.map(normalizeRow);
}
