import { describe, expect, it } from "bun:test";
import {
  AccessDeniedError,
  assertAnyRole,
  assertInstitutionScope,
  canonicalRoles,
  type AccessContext,
} from "../src/lib/access-control";

const base: AccessContext = {
  userId: "u-1",
  institutionCode: "SCHOOL-A",
  systemAdmin: false,
  institutionAdmin: false,
  profileRole: "teacher",
  membershipRoles: ["teacher"],
};

describe("stage 1 access control", () => {
  it("maps the five canonical access roles", () => {
    expect([...canonicalRoles(base)]).toContain("teacher");
    expect([...canonicalRoles({ ...base, profileRole: "student", membershipRoles: ["student"] })]).toContain("student");
    expect([...canonicalRoles({ ...base, profileRole: "guardian", membershipRoles: ["guardian"] })]).toContain("guardian");
    expect([...canonicalRoles({ ...base, institutionAdmin: true })]).toContain("institution_admin");
    expect([...canonicalRoles({ ...base, systemAdmin: true })]).toContain("system_admin");
  });

  it("blocks cross-institution access", () => {
    expect(() => assertInstitutionScope(base, "SCHOOL-B")).toThrow(AccessDeniedError);
    expect(() => assertInstitutionScope(base, "SCHOOL-A")).not.toThrow();
  });

  it("allows system admin across institutions", () => {
    expect(() => assertInstitutionScope({ ...base, systemAdmin: true }, "SCHOOL-B")).not.toThrow();
  });

  it("requires an explicitly allowed role", () => {
    expect(() => assertAnyRole(base, ["teacher"])).not.toThrow();
    expect(() => assertAnyRole(base, ["student", "guardian"])).toThrow(AccessDeniedError);
  });
});
