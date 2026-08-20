export type ClassSummaryRow = {
  className: string;
  gradeLevel: number | null;
  section: string;
  programType: string;
  studentCount: number;
  compositeKey: string;
};

export type PersonnelImportRow = {
  fullName: string;
  title: string;
  dutyTitle: string;
  teachingArea: string;
  employmentStatus: string;
  systemRole: "teacher" | "principal" | "vice_principal" | "other";
};

export type CalendarImportRow = {
  title: string;
  startsOn: string;
  endsOn: string;
  eventType: string;
  note: string;
  schoolLevels: string[];
  schoolTypes: string[];
  gradeLevels: string[];
  audiences: string[];
  conditional: boolean;
  confidence: "high" | "medium" | "low";
};

const MONTHS: Record<string, number> = {
  ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5, haziran: 6,
  temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9, ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
};

const SCHOOL_LEVELS = [
  "Okul Öncesi", "İlkokul", "Ortaokul", "İmam Hatip Ortaokulu", "Lise", "Anadolu Lisesi",
  "Anadolu İmam Hatip Lisesi", "Mesleki ve Teknik Anadolu Lisesi", "Mesleki Eğitim Merkezi",
  "Özel Eğitim", "Özel Eğitim Meslek Okulu / İş Okulu",
] as const;

function text(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}
function lower(value: unknown) { return text(value).toLocaleLowerCase("tr-TR"); }
function upper(value: unknown) { return text(value).toLocaleUpperCase("tr-TR"); }
function digits(value: unknown) {
  const match = text(value).replace(/\./g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}
function normalizeDatePart(year: number, month: number, day: number) {
  return `${String(year).padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function excelSerialToDate(value: number) {
  const utc = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  return normalizeDatePart(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}
function parseDate(value: unknown, defaultYear?: number): string | null {
  if (typeof value === "number" && value > 20000 && value < 80000) return excelSerialToDate(value);
  const raw = lower(value).replace(/[,]/g, " ");
  let m = raw.match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\b/);
  if (m) return normalizeDatePart(Number(m[3]), Number(m[2]), Number(m[1]));
  m = raw.match(/\b(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})\b/u);
  if (m) {
    const monthName = m[2] ?? "";
    const month = MONTHS[monthName];
    if (month) return normalizeDatePart(Number(m[3]), month, Number(m[1]));
  }
  m = raw.match(/\b(\d{1,2})[.\/-](\d{1,2})\b/);
  if (m && defaultYear) return normalizeDatePart(defaultYear, Number(m[2]), Number(m[1]));
  return null;
}
function parseDateRange(value: unknown, defaultYear?: number): [string | null, string | null] {
  const raw = text(value);
  const direct = parseDate(raw, defaultYear);
  const parts = raw.split(/\s*(?:-|–|—|ile|ve)\s*/i).filter(Boolean);
  if (parts.length >= 2) {
    const first = parseDate(parts[0], defaultYear);
    const second = parseDate(parts[1], first ? Number(first.slice(0,4)) : defaultYear);
    if (first && second) return [first, second];
  }
  return [direct, direct];
}

async function workbookRows(file: File): Promise<unknown[][][]> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false, raw: true });
  return workbook.SheetNames.map((name) => XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name]!, { header: 1, defval: "", raw: true }));
}

async function pdfLines(file: File): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const result: string[] = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const items = (content.items as Array<{ str?: string; transform?: number[] }>).filter((x) => x.str?.trim());
    const buckets = new Map<number, Array<{ x: number; str: string }>>();
    for (const item of items) {
      const y = Math.round((item.transform?.[5] ?? 0) / 3) * 3;
      const x = item.transform?.[4] ?? 0;
      const arr = buckets.get(y) ?? [];
      arr.push({ x, str: item.str!.trim() });
      buckets.set(y, arr);
    }
    [...buckets.entries()].sort((a,b)=>b[0]-a[0]).forEach(([,arr]) => {
      const line = arr.sort((a,b)=>a.x-b.x).map((x)=>x.str).join(" ").replace(/\s+/g," ").trim();
      if (line) result.push(line);
    });
  }
  return result;
}

function parseClassToken(value: unknown): { className:string; gradeLevel:number; section:string } | null {
  const raw = upper(value).replace(/SINIFI|SINIF|ŞUBE|SUBE/g, " ");
  const m = raw.match(/\b(\d{1,2})\s*[\/-]?\s*([A-ZÇĞİÖŞÜ])\b/u);
  if (!m) return null;
  return { className: `${m[1]}/${m[2]}`, gradeLevel: Number(m[1]), section: m[2] ?? "" };
}

export async function parseMebClassSummary(file: File): Promise<ClassSummaryRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "xls" && ext !== "xlsx") throw new Error("CLASS_SUMMARY_REQUIRES_EXCEL");
  const sheets = await workbookRows(file);
  const found = new Map<string, ClassSummaryRow>();
  for (const rows of sheets) {
    let headerRow = -1;
    let classCol = -1;
    let programCol = -1;
    let countCol = -1;
    for (let i = 0; i < Math.min(rows.length, 40); i += 1) {
      const row = rows[i] ?? [];
      const normalized = row.map(lower);
      const c = normalized.findIndex((x) => /sınıf|sinif|şube|sube/.test(x));
      const p = normalized.findIndex((x) => /program|alan|okul tür|okul tur/.test(x));
      const n = normalized.findIndex((x) => /öğrenci.*say|ogrenci.*say|mevcut|toplam/.test(x));
      if (c >= 0 && n >= 0) { headerRow=i; classCol=c; programCol=p; countCol=n; break; }
    }
    const start = headerRow >= 0 ? headerRow + 1 : 0;
    for (let i = start; i < rows.length; i += 1) {
      const row = rows[i] ?? [];
      let info = classCol >= 0 ? parseClassToken(row[classCol]) : null;
      if (!info) {
        for (const cell of row) { info = parseClassToken(cell); if (info) break; }
      }
      if (!info) continue;
      let studentCount = countCol >= 0 ? digits(row[countCol]) : null;
      if (studentCount === null) {
        const numericCandidates = row.map(digits).filter((x): x is number => x !== null && x >= 0 && x <= 999);
        studentCount = numericCandidates.length ? numericCandidates[numericCandidates.length - 1]! : 0;
      }
      let programType = programCol >= 0 ? text(row[programCol]) : "";
      if (!programType) {
        const joined = row.map(text).join(" ");
        const pm = joined.match(/(?:program(?:ı|i)?|alan(?:ı|i)?)[\s:;-]+(.+?)(?=\s{2,}|öğrenci|ogrenci|mevcut|$)/i);
        programType = text(pm?.[1] ?? "");
      }
      programType = upper(programType).replace(/^[-–—: ]+|[-–—: ]+$/g, "");
      const compositeKey = programType ? `${info.className} - ${programType}` : info.className;
      found.set(compositeKey, { ...info, programType, studentCount: Math.max(0, studentCount ?? 0), compositeKey });
    }
  }
  if (!found.size) throw new Error("MEB_CLASS_LAYOUT_NOT_RECOGNIZED");
  return [...found.values()].sort((a,b)=>(a.gradeLevel??99)-(b.gradeLevel??99)||a.section.localeCompare(b.section,"tr")||a.programType.localeCompare(b.programType,"tr"));
}

function findHeader(rows: unknown[][], aliases: RegExp[]) {
  for (let i=0;i<Math.min(rows.length,60);i+=1) {
    const normalized=(rows[i]??[]).map(lower);
    if (aliases.every((re)=>normalized.some((v)=>re.test(v)))) return i;
  }
  return -1;
}
function colIndex(row: unknown[], re: RegExp) { return row.map(lower).findIndex((v)=>re.test(v)); }

export async function parseMebPersonnel(file: File): Promise<PersonnelImportRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "xls" && ext !== "xlsx") throw new Error("PERSONNEL_REQUIRES_EXCEL");
  const sheets=await workbookRows(file);
  const result: PersonnelImportRow[]=[];
  const seen=new Set<string>();
  for (const rows of sheets) {
    const h=findHeader(rows,[/(ad.*soyad|adı.*soyadı|adi.*soyadi)/i,/(unvan|görev|gorev)/i]);
    if(h<0) continue;
    const headers=rows[h]??[];
    const name=colIndex(headers,/(ad.*soyad|adı.*soyadı|adi.*soyadi)/i);
    const title=colIndex(headers,/^\s*unvan|ünvan/i);
    const duty=colIndex(headers,/görev|gorev/i);
    const area=colIndex(headers,/atama.*alan|branş|brans|alanı|alani/i);
    const status=colIndex(headers,/kadro|statü|statu|sözleş|sozles|ücretli|ucretli/i);
    for(let i=h+1;i<rows.length;i+=1){
      const row=rows[i]??[];
      const fullName=text(row[name]);
      if(!fullName || fullName.length<4 || /toplam|sayfa|rapor/i.test(fullName)) continue;
      const dutyTitle=text(row[duty>=0?duty:title]);
      const titleText=text(row[title>=0?title:duty]);
      const teachingArea=text(row[area]);
      const employmentStatus=text(row[status]);
      const roleText=lower(`${titleText} ${dutyTitle}`);
      const systemRole: PersonnelImportRow["systemRole"] = /müdür yardım|mudur yardim/.test(roleText) ? "vice_principal" : /(^|\s)müdür($|\s)|(^|\s)mudur($|\s)/.test(roleText) ? "principal" : /öğretmen|ogretmen|başöğretmen|basogretmen|uzman öğretmen|uzman ogretmen/.test(roleText) ? "teacher" : "other";
      const key=`${lower(fullName)}|${lower(teachingArea)}|${lower(dutyTitle)}`;
      if(seen.has(key)) continue;seen.add(key);
      result.push({fullName,title:titleText,dutyTitle,teachingArea,employmentStatus,systemRole});
    }
  }
  if(!result.length) throw new Error("MEB_PERSONNEL_LAYOUT_NOT_RECOGNIZED");
  return result;
}

function inferEventType(value: string) {
  const v=lower(value);
  if(/ortak.*sınav|ortak.*sinav/.test(v)) return "common_exam_window";
  if(/sorumluluk.*sınav|sorumluluk.*sinav/.test(v)) return "responsibility_exam_window";
  if(/sınav|sinav/.test(v)) return "exam_window";
  if(/ara tatil|yarıyıl|yariyil/.test(v)) return "break";
  if(/tatil|bayram/.test(v)) return "holiday";
  if(/mesleki çalışma|mesleki calisma|seminer/.test(v)) return "professional_work";
  if(/tören|toren|etkinlik/.test(v)) return "ceremony";
  return "other";
}

export function inferCalendarScope(value: string) {
  const v=lower(value);
  const schoolLevels: string[]=[];
  const schoolTypes: string[]=[];
  const gradeLevels: string[]=[];
  const audiences: string[]=[];
  const add=(arr:string[],x:string)=>{if(!arr.includes(x))arr.push(x)};
  if(/okul öncesi|okul oncesi|ana sınıf|anasınıf/.test(v)) add(schoolLevels,"Okul Öncesi");
  if(/ilkokul/.test(v)) add(schoolLevels,"İlkokul");
  if(/imam hatip ortaokul|iho\b/.test(v)) { add(schoolLevels,"İmam Hatip Ortaokulu"); add(schoolTypes,"İmam Hatip Ortaokulu"); }
  else if(/ortaokul/.test(v)) add(schoolLevels,"Ortaokul");
  if(/anadolu imam hatip|aihl\b/.test(v)) { add(schoolLevels,"Lise"); add(schoolTypes,"Anadolu İmam Hatip Lisesi"); }
  if(/mesleki ve teknik|mtal\b/.test(v)) { add(schoolLevels,"Lise"); add(schoolTypes,"Mesleki ve Teknik Anadolu Lisesi"); }
  if(/mesleki eğitim merkez|mesem\b/.test(v)) { add(schoolLevels,"Mesleki Eğitim Merkezi"); add(schoolTypes,"Mesleki Eğitim Merkezi"); }
  if(/özel eğitim meslek|ozel egitim meslek|iş okulu|is okulu/.test(v)) { add(schoolLevels,"Özel Eğitim Meslek Okulu / İş Okulu"); add(schoolTypes,"Özel Eğitim Meslek Okulu / İş Okulu"); }
  else if(/özel eğitim|ozel egitim/.test(v)) add(schoolLevels,"Özel Eğitim");
  if(/anadolu lises/.test(v) && !/imam hatip/.test(v)) { add(schoolLevels,"Lise"); add(schoolTypes,"Anadolu Lisesi"); }
  if(/pansiyon/.test(v)) add(schoolTypes,"Pansiyonlu Okul");
  if(/taşımalı|tasimali/.test(v)) add(schoolTypes,"Taşımalı Eğitim");
  for(let g=1;g<=12;g+=1){ if(new RegExp(`(?:^|\\D)${g}(?:\\.|\\s*[-/]?\\s*sınıf|\\s*[-/]?\\s*sinif|\\D|$)`).test(v)) add(gradeLevels,String(g)); }
  if(/rehber|pdr/.test(v)) add(audiences,"Rehberlik/PDR");
  if(/müdür yardım|mudur yardim/.test(v)) add(audiences,"Müdür Yardımcısı");
  if(/müdür|mudur/.test(v) && !audiences.includes("Müdür Yardımcısı")) add(audiences,"Müdür");
  if(/zümre|zumre/.test(v)) add(audiences,"Zümre Başkanı / Zümre");
  if(/komisyon/.test(v)) add(audiences,"Komisyon");
  if(/öğretmen|ogretmen/.test(v)) add(audiences,"Öğretmen");
  return { schoolLevels, schoolTypes, gradeLevels, audiences, conditional: /varsa|bulunan|pansiyonlu|taşımalı|tasimali|uygulanması halinde|gerektiğinde|gerektiginde/.test(v) };
}

function calendarRowsFromExcel(rows: unknown[][], defaultYear?: number): CalendarImportRow[] {
  const result: CalendarImportRow[]=[];
  for(let i=0;i<rows.length;i+=1){
    const row=rows[i]??[];
    const cells=row.map(text).filter(Boolean);
    if(!cells.length) continue;
    const joined=cells.join(" | ");
    let startsOn:string|null=null, endsOn:string|null=null;
    for(const cell of row){ const [s,e]=parseDateRange(cell,defaultYear); if(s){startsOn=s;endsOn=e??s;break;} }
    if(!startsOn) continue;
    const titleCandidates=cells.filter((x)=>!parseDate(x,defaultYear) && x.length>3 && !/^\d+$/.test(x));
    const title=text(titleCandidates.sort((a,b)=>b.length-a.length)[0]??joined);
    if(!title || /tarih\s*$|başlangıç|baslangic|bitiş|bitis/i.test(title)) continue;
    const scope=inferCalendarScope(joined);
    result.push({title,startsOn,endsOn:endsOn??startsOn,eventType:inferEventType(title),note:"",...scope,confidence:scope.schoolLevels.length||scope.schoolTypes.length?"high":"medium"});
  }
  return result;
}

export async function parseMebCalendar(file: File, defaultYear?: number): Promise<CalendarImportRow[]> {
  const ext=file.name.split(".").pop()?.toLowerCase();
  let parsed:CalendarImportRow[]=[];
  if(ext==="xls"||ext==="xlsx"){
    const sheets=await workbookRows(file);
    parsed=sheets.flatMap((rows)=>calendarRowsFromExcel(rows,defaultYear));
  } else if(ext==="pdf") {
    const lines=await pdfLines(file);
    parsed=lines.flatMap((line)=>{
      const [startsOn,endsOn]=parseDateRange(line,defaultYear);
      if(!startsOn) return [];
      const title=line.replace(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-]\d{2,4})?\b/g,"").replace(/\s*[-–—]\s*/g," ").trim();
      if(title.length<4) return [];
      const scope=inferCalendarScope(line);
      return [{title,startsOn,endsOn:endsOn??startsOn,eventType:inferEventType(title),note:"",...scope,confidence:scope.schoolLevels.length||scope.schoolTypes.length?"high":"low"}];
    });
  } else throw new Error("UNSUPPORTED_CALENDAR_FILE");
  const unique=new Map<string,CalendarImportRow>();
  for(const row of parsed){ unique.set(`${row.startsOn}|${row.endsOn}|${lower(row.title)}`,row); }
  if(!unique.size) throw new Error("MEB_CALENDAR_LAYOUT_NOT_RECOGNIZED");
  return [...unique.values()].sort((a,b)=>a.startsOn.localeCompare(b.startsOn));
}

export { SCHOOL_LEVELS };
