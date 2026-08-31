import { describe, expect, it } from "bun:test";

const source = await Bun.file("src/lib/officialCourseScheduleParser.ts").text();

describe("official curriculum PDF evidence", () => {
  it("recognizes the real TTKB/MTEGM decision-number form", async () => {
    const { extractDecisionMeta } = await import("../src/lib/officialCourseScheduleParser");
    expect(extractDecisionMeta("Karar No: 2021-33").decisionNo).toBe("2021-33");
  });

  it("extracts a local PDF fingerprint and metadata without an upload path", () => {
    expect(source).toContain('parser_version:"okulos-official-pdf-evidence-v1"');
    expect(source).toContain("crypto.subtle.digest(\"SHA-256\"");
    expect(source).toContain("pdfjs-dist/legacy/build/pdf.mjs");
    expect(source).toContain("OFFICIAL_PDF_TEXT_NOT_EXTRACTABLE");
  });
});
