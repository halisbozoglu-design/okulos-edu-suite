import { expect, test } from "bun:test";

const source = await Bun.file("src/routes/schedule.tsx").text();

test("schedule workspace has a global search across operational labels", () => {
  expect(source).toContain("globalSearch");
  expect(source).toContain("normalizeSearch");
  expect(source).toContain("Sınıf, ders, öğretmen, derslik veya alt grup ara");
  expect(source).toContain("filteredPool");
});
