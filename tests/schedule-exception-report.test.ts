import { describe, expect, it } from "bun:test";
const source = await Bun.file("src/routes/schedule-reports.tsx").text();
describe("manual teacher assignment report", () => it("exposes confirmed manual assignments without reason/date workflow", () => {
  expect(source).toContain('value="exceptions">Manuel Atamalar');
  expect(source).toContain("Kullanıcı onayıyla atandı");
  expect(source).toContain("get_manual_teacher_assignment_overrides_v1");
  expect(source).not.toContain("Süresi geçmiş");
  expect(source).not.toContain("İstisnai Atamalar");
}));
