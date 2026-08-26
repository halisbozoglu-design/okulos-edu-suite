import { describe, expect, it } from "bun:test";
import { evaluateCandidateRelations, evaluatePlanningRelations, isSupportedPlanningRelationType, type PlanningActivity, type PlanningMode, type PlanningRelation } from "../src/lib/schedule-planning-relations";
import { PLANNING_RELATION_TYPES, getPlanningRelationTypeSpec } from "../src/lib/schedule-constraint-ontology";

function act(key: string, weekday: number, start: number, end = start, classroom_id: string | null = null): PlanningActivity {
  return { activity_key: key, assignment_id: `as-${key}`, course_id: `c-${key}`, teacher_id: `t-${key}`, class_id: `k-${key}`, weekday, start, end, classroom_id };
}
function rel(relation_type: string, parameters: Record<string, unknown> = {}, mode: PlanningMode = "HARD", left = "a", right = "b", weight = 1): PlanningRelation {
  return { id: `r-${relation_type}`, relation_type, mode, weight, left_selector: { activity_key: left }, right_selector: { activity_key: right }, parameters };
}
const score = (acts: PlanningActivity[], r: PlanningRelation) => evaluatePlanningRelations(acts, [r]);

describe("ontology", () => {
  it("covers canonical types", () => {
    for (const t of ["SAME_TIME", "DIFFERENT_TIME", "SAME_START", "SAME_DAY", "DIFFERENT_DAY", "SAME_ROOM", "DIFFERENT_ROOM", "ORDERED", "CONSECUTIVE", "OVERLAP", "NOT_OVERLAP", "MIN_GAP", "MAX_GAP", "MIN_DAYS", "MAX_DAYS", "STARTS_DAY", "ENDS_DAY", "PREFERRED_SLOT", "FORBIDDEN_SLOT"]) {
      expect(isSupportedPlanningRelationType(t)).toBe(true);
      expect(getPlanningRelationTypeSpec(t)?.description.length).toBeGreaterThan(0);
    }
    expect(PLANNING_RELATION_TYPES.length).toBeGreaterThanOrEqual(19);
  });
  it("rejects unknown types", () => {
    expect(isSupportedPlanningRelationType("NOT_A_REAL_RELATION")).toBe(false);
    expect(score([act("a", 1, 1), act("b", 2, 3)], rel("NOT_A_REAL_RELATION")).hard).toBe(0);
  });
});

describe("room relations", () => {
  it("SAME_ROOM violates on different rooms", () => {
    expect(score([act("a", 1, 1, 1, "R1"), act("b", 2, 1, 1, "R2")], rel("SAME_ROOM")).hard).toBe(1);
    expect(score([act("a", 1, 1, 1, "R1"), act("b", 2, 1, 1, "R1")], rel("SAME_ROOM")).hard).toBe(0);
  });
  it("DIFFERENT_ROOM violates on same room", () => {
    expect(score([act("a", 1, 1, 1, "R1"), act("b", 2, 1, 1, "R1")], rel("DIFFERENT_ROOM")).hard).toBe(1);
  });
  it("no false positive when room is unknown", () => {
    expect(score([act("a", 1, 1, 1, null), act("b", 2, 1, 1, "R2")], rel("SAME_ROOM")).hard).toBe(0);
    expect(score([act("a", 1, 1, 1, null), act("b", 2, 1, 1, null)], rel("DIFFERENT_ROOM")).hard).toBe(0);
  });
});

describe("time relations", () => {
  it("SAME_START ignores day", () => {
    expect(score([act("a", 1, 3), act("b", 4, 3)], rel("SAME_START")).hard).toBe(0);
    expect(score([act("a", 1, 3), act("b", 1, 4)], rel("SAME_START")).hard).toBe(1);
  });
  it("OVERLAP / NOT_OVERLAP use interval overlap", () => {
    const overlapping = [act("a", 2, 1, 3), act("b", 2, 3, 5)];
    const disjoint = [act("a", 2, 1, 2), act("b", 2, 4, 5)];
    expect(score(overlapping, rel("OVERLAP")).hard).toBe(0);
    expect(score(disjoint, rel("OVERLAP")).hard).toBe(1);
    expect(score(overlapping, rel("NOT_OVERLAP")).hard).toBe(1);
    expect(score(disjoint, rel("NOT_OVERLAP")).hard).toBe(0);
  });
  it("MIN_DAYS / MAX_DAYS use weekday distance", () => {
    expect(score([act("a", 1, 1), act("b", 2, 1)], rel("MIN_DAYS", { days: 2 })).hard).toBe(1);
    expect(score([act("a", 1, 1), act("b", 3, 1)], rel("MIN_DAYS", { days: 2 })).hard).toBe(0);
    expect(score([act("a", 1, 1), act("b", 5, 1)], rel("MAX_DAYS", { days: 2 })).hard).toBe(1);
    expect(score([act("a", 1, 1), act("b", 2, 1)], rel("MAX_DAYS", { days: 2 })).hard).toBe(0);
  });
});

describe("placement relations", () => {
  it("STARTS_DAY defaults to period 1", () => {
    expect(score([act("a", 1, 1)], rel("STARTS_DAY")).hard).toBe(0);
    expect(score([act("a", 1, 2)], rel("STARTS_DAY")).hard).toBe(1);
    expect(score([act("a", 1, 2)], rel("STARTS_DAY", { first_period: 2 })).hard).toBe(0);
  });
  it("ENDS_DAY uses last_period", () => {
    expect(score([act("a", 1, 7, 8)], rel("ENDS_DAY", { last_period: 8 })).hard).toBe(0);
    expect(score([act("a", 1, 6, 7)], rel("ENDS_DAY", { last_period: 8 })).hard).toBe(1);
    expect(score([act("a", 1, 6, 7)], rel("ENDS_DAY")).hard).toBe(0);
  });
  it("PREFERRED_SLOT violates outside the preferred set", () => {
    expect(score([act("a", 1, 2)], rel("PREFERRED_SLOT", { days: [1, 2], periods: [1, 2, 3] })).hard).toBe(0);
    expect(score([act("a", 4, 2)], rel("PREFERRED_SLOT", { days: [1, 2], periods: [1, 2, 3] })).hard).toBe(1);
    expect(score([act("a", 1, 7)], rel("PREFERRED_SLOT", { days: [1, 2], periods: [1, 2, 3] })).hard).toBe(1);
  });
  it("FORBIDDEN_SLOT violates inside the forbidden set", () => {
    expect(score([act("a", 5, 8)], rel("FORBIDDEN_SLOT", { days: [5], periods: [8] })).hard).toBe(1);
    expect(score([act("a", 5, 3)], rel("FORBIDDEN_SLOT", { days: [5], periods: [8] })).hard).toBe(0);
    expect(score([act("a", 5, 3)], rel("FORBIDDEN_SLOT", {})).hard).toBe(0);
  });
});

describe("modes and counting", () => {
  it("accumulates HARD / MEDIUM / SOFT separately and ignores OFF", () => {
    const acts = [act("a", 1, 1), act("b", 2, 1)];
    const rels = [rel("SAME_DAY", {}, "HARD", "a", "b", 1), rel("SAME_DAY", {}, "MEDIUM", "a", "b", 2), rel("SAME_DAY", {}, "SOFT", "a", "b", 3), rel("SAME_DAY", {}, "OFF", "a", "b", 9)];
    const out = evaluatePlanningRelations(acts, rels);
    expect(out).toEqual({ hard: 1, medium: 2, soft: 3 });
  });
  it("counts a symmetric relation once per pair", () => {
    const acts = [act("a", 1, 1), act("b", 2, 1)];
    const symmetric: PlanningRelation = { id: "s1", relation_type: "DIFFERENT_DAY", mode: "HARD", weight: 1, left_selector: {}, right_selector: {}, parameters: {} };
    expect(evaluatePlanningRelations(acts, [symmetric]).hard).toBe(0);
    const same: PlanningRelation = { ...symmetric, relation_type: "SAME_DAY" };
    expect(evaluatePlanningRelations(acts, [same]).hard).toBe(1);
    const directional: PlanningRelation = { ...symmetric, relation_type: "ORDERED" };
    expect(evaluatePlanningRelations(acts, [directional]).hard).toBe(1);
  });
  it("evaluates candidates against placed activities", () => {
    const placed = [act("b", 2, 1)];
    expect(evaluateCandidateRelations(act("a", 1, 1), placed, [rel("SAME_DAY")]).hard).toBe(1);
    expect(evaluateCandidateRelations(act("a", 2, 1), placed, [rel("SAME_DAY")]).hard).toBe(0);
    expect(evaluateCandidateRelations(act("a", 1, 3), [], [rel("STARTS_DAY")]).hard).toBe(1);
  });
});
