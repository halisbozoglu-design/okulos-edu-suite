import { describe, expect, it } from "bun:test";

const source = await Bun.file("src/routes/schedule-reports.tsx").text();

describe("schedule report print settings", () => {
  it("keeps paper, orientation and margin in the browser print stylesheet", () => {
    expect(source).toContain("@page { size: ${paperSize} ${orientation}; margin: ${printMargin}; }");
    expect(source).toContain("Dar boşluk");
    expect(source).toContain("Geniş boşluk");
  });

  it("renders an optional dated signature block only in printed output", () => {
    expect(source).toContain("Oluşturulma:");
    expect(source).toContain("İmza sahibi adı");
    expect(source).toContain("print:flex");
  });
});
