import { describe, expect, test } from "bun:test";
import * as XLSX from "xlsx";
import { parseOfficialWeeklyCourseSchedule } from "../src/lib/course-schedule-import";

function xlsxFile(rows: unknown[][], name="2026-2027_İmam_Hatip_Ortaokulu.xlsx") {
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"Haftalık Ders Çizelgesi");
  const bytes=XLSX.write(wb,{type:"array",bookType:"xlsx"}) as ArrayBuffer;
  return new File([bytes],name,{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}

describe("official weekly course schedule parser",()=>{
  test("extracts grades, mandatory/elective categories and hour options",async()=>{
    const file=xlsxFile([
      ["2026-2027 İmam Hatip Ortaokulu Haftalık Ders Çizelgesi"],
      ["ZORUNLU DERSLER"],
      ["Dersler",5,6,7,8],
      ["Türkçe",6,6,5,5],
      ["Matematik",5,5,5,5],
      ["SEÇMELİ DERSLER"],
      ["Dersler",5,6,7,8],
      ["Akademik Destek", "1/2", "1/2", 2, 2],
    ]);
    const result=await parseOfficialWeeklyCourseSchedule(file);
    expect(result.academicYear).toBe("2026-2027");
    expect(result.schoolType).toBe("İmam Hatip Ortaokulu");
    expect(result.rows.find(x=>x.gradeLevel===5&&x.courseName==="Türkçe")?.category).toBe("zorunlu");
    expect(result.rows.find(x=>x.gradeLevel===5&&x.courseName==="Akademik Destek")?.hourOptions).toEqual([1,2]);
    expect(result.rows.find(x=>x.gradeLevel===5&&x.courseName==="Akademik Destek")?.category).toBe("secmeli");
  });
});
