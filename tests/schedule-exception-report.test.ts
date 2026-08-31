import { describe, expect, it } from "bun:test";
const source = await Bun.file("src/routes/schedule-reports.tsx").text();
describe("schedule exception report", () => it("exposes dated teacher-assignment exceptions in the report selector", () => {
  expect(source).toContain('value="exceptions"');
  expect(source).toContain("İstisnai Atamalar");
  expect(source).toContain("Süresi geçmiş");
}));
