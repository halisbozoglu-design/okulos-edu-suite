import { describe, expect, test } from "bun:test";
import * as XLSX from "xlsx";
import { parseScheduleImport } from "../src/lib/schedule-import";
import { normalizeRows } from "../src/lib/eokul-import";

describe("schedule import regression", () => {
  test("Turkish CSV headers, day names and subgroup are normalized", async () => {
    const csv = [
      "Öğretmen;Sınıf/Şube;Program Türü;Ders;Gün;Ders Saati;Derslik;Alt Grup;Grup Bölünmüş",
      "Ayşe Yılmaz;9/A;AİHL;Matematik;Pazartesi;2;D-101;G1;Evet",
    ].join("\n");
    const rows = await parseScheduleImport(new File([csv], "program.csv", { type: "text/csv" }));
    expect(rows).toEqual([{ teacherName:"Ayşe Yılmaz", className:"9/A", programType:"AİHL", subject:"Matematik", dayOfWeek:1, periodNumber:2, classroom:"D-101", subgroupKey:"G1", isGroupSplit:true }]);
  });

  test("XLSX import preserves core timetable fields", async () => {
    const sheet = XLSX.utils.json_to_sheet([{ Teacher:"Mehmet Kaya", Class:"10/B", Subject:"Fizik", Day:"Friday", Period:7, Room:"Lab-1" }]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Program");
    const bytes = XLSX.write(book, { type:"array", bookType:"xlsx" }) as ArrayBuffer;
    const rows = await parseScheduleImport(new File([bytes], "program.xlsx"));
    expect(rows[0]).toMatchObject({ teacherName:"Mehmet Kaya", className:"10/B", subject:"Fizik", dayOfWeek:5, periodNumber:7, classroom:"Lab-1" });
  });

  test("invalid period is rejected instead of silently imported", async () => {
    const csv = "Öğretmen;Sınıf;Ders;Gün;Ders Saati\nA;9/A;Matematik;Pazartesi;99";
    await expect(parseScheduleImport(new File([csv], "bad.csv"))).rejects.toThrow("PROGRAM_SATIRI_GECERSIZ");
  });
});

describe("e-Okul normalization regression", () => {
  test("Turkish aliases and class-section are normalized", () => {
    const result = normalizeRows([
      ["Okul No", "Adı Soyadı", "Sınıfı", "Program Türü"],
      ["123", "Ali Veli", "9-A", "AİHL"],
    ]);
    expect(result).toEqual([{ schoolNumber:"123", fullName:"Ali Veli", className:"9/A", programType:"AİHL", gradeLevel:9, section:"A" }]);
  });

  test("required e-Okul columns cannot disappear unnoticed", () => {
    expect(() => normalizeRows([["X"],["Y"]])).toThrow("REQUIRED_COLUMNS_NOT_FOUND");
  });
});
