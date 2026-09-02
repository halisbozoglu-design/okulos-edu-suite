import { describe, expect, it } from "bun:test";
import { isValidTckn } from "@/lib/auth-validation";
import { canCompleteCheckIn, createIdentityReading, extractIdentityReading, isStableIdentityReadings, maskTckn, resolveRestriction } from "@/lib/visitor-security";

describe("visitor security identity rules", () => {
  it("validates Turkish ID checksum and masks stored display", () => {
    expect(isValidTckn("10000000146")).toBe(true);
    expect(isValidTckn("10000000147")).toBe(false);
    expect(maskTckn("10000000146")).toBe("10*******46");
  });
  it("requires two matching live reads", () => {
    const first = createIdentityReading("10000000146", "Ayşe Yılmaz");
    const second = createIdentityReading("10000000146", "Ayşe Yılmaz");
    expect(first && second ? isStableIdentityReadings([first, second]) : false).toBe(true);
    expect(first ? isStableIdentityReadings([first]) : true).toBe(false);
  });
  it("extracts a checksum-valid identity without persisting image data", () => {
    const result = extractIdentityReading("TURKIYE CUMHURIYETI\nAYŞE YILMAZ\n10000000146");
    expect(result?.fullName).toContain("AYŞE");
    expect(result?.tckn).toBe("10000000146");
    expect(Bun.file("src/components/okulos/LiveIdCardScanner.tsx").text()).resolves.toMatch(/clearRect|stop\(\)/);
  });
  it("requires physical identity acknowledgement before entry", () => {
    expect(canCompleteCheckIn(false, true, "Ayşe Yılmaz", "location")).toBe(false);
    expect(canCompleteCheckIn(true, false, "Ayşe Yılmaz", "location")).toBe(false);
    expect(canCompleteCheckIn(true, true, "Ayşe Yılmaz", "location")).toBe(true);
  });
  it("resolves restrictive decisions conservatively", () => {
    expect(resolveRestriction(["allow", "approval_required"])).toBe("approval_required");
    expect(resolveRestriction(["allow", "deny"])).toBe("deny");
  });
});
