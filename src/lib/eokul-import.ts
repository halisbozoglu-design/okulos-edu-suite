export type EokulStudentRow = {
  schoolNumber: string;
  fullName: string;
  className: string;
  programType: string;
  gradeLevel: number | null;
  section: string;
};

const aliases = {
  schoolNumber: ["okul no", "öğrenci no", "ogrenci no", "no"],
  fullName: ["adı soyadı", "ad soyad", "adi soyadi", "öğrenci adı", "ogrenci adi"],
  className: ["sınıfı", "sinifi", "sınıf", "sinif", "şube", "sube"],
  programType: ["program", "program türü", "program turu", "alan"],
};

function normalize(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function findColumn(headers: string[], names: string[]) {
  const normalized = headers.map((h) => normalize(h).toLocaleLowerCase("tr-TR"));
  return normalized.findIndex((h) => names.some((name) => h === name || h.includes(name)));
}

function parseClass(value: string) {
  const text = normalize(value).toLocaleUpperCase("tr-TR");
  const match = text.match(/(\d{1,2})\s*[\/-]?\s*([A-ZÇĞİÖŞÜ])/u);
  if (!match) return { className: text, gradeLevel: null, section: "" };
  return {
    className: `${match[1]}/${match[2]}`,
    gradeLevel: Number(match[1]),
    section: match[2] ?? "",
  };
}

export function normalizeRows(rows: unknown[][]): EokulStudentRow[] {
  if (!rows.length) return [];
  const headers = (rows[0] ?? []).map(normalize);
  const noIdx = findColumn(headers, aliases.schoolNumber);
  const nameIdx = findColumn(headers, aliases.fullName);
  const classIdx = findColumn(headers, aliases.className);
  const programIdx = findColumn(headers, aliases.programType);
  if (noIdx < 0 || nameIdx < 0 || classIdx < 0) throw new Error("REQUIRED_COLUMNS_NOT_FOUND");

  return rows.slice(1).flatMap((row) => {
    const schoolNumber = normalize(row[noIdx]);
    const fullName = normalize(row[nameIdx]);
    const classInfo = parseClass(normalize(row[classIdx]));
    if (!schoolNumber || !fullName || !classInfo.className) return [];
    return [{
      schoolNumber,
      fullName,
      className: classInfo.className,
      programType: programIdx >= 0 ? normalize(row[programIdx]).toLocaleUpperCase("tr-TR") : "",
      gradeLevel: classInfo.gradeLevel,
      section: classInfo.section,
    }];
  });
}

export async function parseEokulFile(file: File): Promise<EokulStudentRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
    if (!sheet) throw new Error("EMPTY_WORKBOOK");
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    return normalizeRows(rows);
  }

  if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const lines: string[] = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      let current = "";
      for (const item of content.items as Array<{ str?: string; hasEOL?: boolean }>) {
        if (item.str) current += `${item.str} `;
        if (item.hasEOL) { if (current.trim()) lines.push(current.trim()); current = ""; }
      }
      if (current.trim()) lines.push(current.trim());
    }

    const rows: EokulStudentRow[] = [];
    let activeClass = "";
    let activeProgram = "";
    for (const line of lines) {
      const classMatch = line.match(/(\d{1,2}\s*[\/-]\s*[A-ZÇĞİÖŞÜ])(?:\s*[-–]\s*([A-ZÇĞİÖŞÜ0-9 ]+))?/u);
      if (classMatch && /sınıf|şube|sinif|sube/i.test(line)) {
        activeClass = classMatch[1]!.replace(/\s/g, "");
        activeProgram = normalize(classMatch[2] ?? "");
        continue;
      }
      const student = line.match(/^\s*(\d{1,8})\s+([A-ZÇĞİÖŞÜa-zçğıöşü][A-ZÇĞİÖŞÜa-zçğıöşü .'-]{2,})$/u);
      if (student && activeClass) {
        const info = parseClass(activeClass);
        rows.push({
          schoolNumber: student[1]!,
          fullName: normalize(student[2] ?? ""),
          className: info.className,
          programType: activeProgram.toLocaleUpperCase("tr-TR"),
          gradeLevel: info.gradeLevel,
          section: info.section,
        });
      }
    }
    if (!rows.length) throw new Error("PDF_LAYOUT_NOT_RECOGNIZED");
    return rows;
  }

  throw new Error("UNSUPPORTED_FILE_TYPE");
}
