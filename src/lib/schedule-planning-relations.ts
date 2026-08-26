import { getPlanningRelationTypeSpec, isSupportedPlanningRelationType, isSymmetricPlanningRelationType, isUnaryPlanningRelationType } from "./schedule-constraint-ontology";

export { isSupportedPlanningRelationType, isSymmetricPlanningRelationType, isUnaryPlanningRelationType };

export type PlanningMode = "HARD" | "MEDIUM" | "SOFT" | "OFF";
export type PlanningSelector = { activity_key?: string; assignment_id?: string; course_id?: string; teacher_id?: string; class_id?: string };
export type PlanningRelation = { id: string; relation_type: string; mode: PlanningMode; weight: number; left_selector: PlanningSelector; right_selector: PlanningSelector; parameters: Record<string, unknown> };
export type PlanningActivity = { activity_key: string; assignment_id: string; course_id: string; teacher_id: string; class_id: string | null; weekday: number; start: number; end: number; classroom_id?: string | null };
export type RelationScore = { hard: number; medium: number; soft: number };

const zero = (): RelationScore => ({ hard: 0, medium: 0, soft: 0 });

function matches(a: PlanningActivity, s: PlanningSelector) {
  return (!s.activity_key || a.activity_key === s.activity_key) && (!s.assignment_id || a.assignment_id === s.assignment_id) && (!s.course_id || a.course_id === s.course_id) && (!s.teacher_id || a.teacher_id === s.teacher_id) && (!s.class_id || a.class_id === s.class_id);
}
function before(a: PlanningActivity, b: PlanningActivity) {
  return a.weekday < b.weekday || (a.weekday === b.weekday && a.end < b.start);
}
function gap(a: PlanningActivity, b: PlanningActivity) {
  if (a.weekday !== b.weekday) return Number.POSITIVE_INFINITY;
  if (a.end < b.start) return b.start - a.end - 1;
  if (b.end < a.start) return a.start - b.end - 1;
  return -1;
}
function overlaps(a: PlanningActivity, b: PlanningActivity) {
  return a.weekday === b.weekday && a.start <= b.end && b.start <= a.end;
}
function num(p: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = p?.[k];
    if (v !== undefined && v !== null && Number.isFinite(Number(v))) return Number(v);
  }
  return null;
}
function numList(p: Record<string, unknown>, key: string) {
  const v = p?.[key];
  return Array.isArray(v) ? v.map((x) => Number(x)).filter((x) => Number.isFinite(x)) : [];
}
function slotMatches(a: PlanningActivity, days: number[], periods: number[]) {
  const dayOk = days.length === 0 || days.includes(a.weekday);
  const periodOk = periods.length === 0 || periods.some((p) => p >= a.start && p <= a.end);
  return dayOk && periodOk;
}

function violatesUnary(type: string, a: PlanningActivity, p: Record<string, unknown>) {
  if (type === "STARTS_DAY") return a.start !== (num(p, ["first_period"]) ?? 1);
  if (type === "ENDS_DAY") {
    const last = num(p, ["last_period"]);
    return last === null ? false : a.end !== last;
  }
  if (type === "PREFERRED_SLOT" || type === "FORBIDDEN_SLOT") {
    const days = numList(p, "days"), periods = numList(p, "periods");
    if (days.length === 0 && periods.length === 0) return false;
    const inside = slotMatches(a, days, periods);
    return type === "PREFERRED_SLOT" ? !inside : inside;
  }
  return false;
}

function violates(t: string, l: PlanningActivity, r: PlanningActivity, p: Record<string, unknown>) {
  const type = String(t ?? "").trim().toUpperCase();
  if (!isSupportedPlanningRelationType(type)) return false;
  if (isUnaryPlanningRelationType(type)) return violatesUnary(type, l, p);
  if (type === "SAME_TIME") return l.weekday !== r.weekday || l.start !== r.start;
  if (type === "DIFFERENT_TIME") return l.weekday === r.weekday && l.start === r.start;
  if (type === "SAME_START") return l.start !== r.start;
  if (type === "SAME_DAY") return l.weekday !== r.weekday;
  if (type === "DIFFERENT_DAY") return l.weekday === r.weekday;
  if (type === "SAME_ROOM" || type === "DIFFERENT_ROOM") {
    const a = l.classroom_id ?? null, b = r.classroom_id ?? null;
    if (!a || !b) return false;
    return type === "SAME_ROOM" ? a !== b : a === b;
  }
  if (type === "ORDERED") return !before(l, r);
  if (type === "CONSECUTIVE") return l.weekday !== r.weekday || r.start !== l.end + 1;
  if (type === "OVERLAP") return !overlaps(l, r);
  if (type === "NOT_OVERLAP") return overlaps(l, r);
  if (type === "MIN_GAP") return gap(l, r) < (num(p, ["periods", "gap", "value"]) ?? 0);
  if (type === "MAX_GAP") {
    const g = gap(l, r);
    return !Number.isFinite(g) || g > (num(p, ["periods", "gap", "value"]) ?? 0);
  }
  if (type === "MIN_DAYS") return Math.abs(l.weekday - r.weekday) < (num(p, ["days", "value"]) ?? 0);
  if (type === "MAX_DAYS") return Math.abs(l.weekday - r.weekday) > (num(p, ["days", "value"]) ?? 0);
  return false;
}

function add(out: RelationScore, r: PlanningRelation, count = 1) {
  const v = Math.max(0, Number(r.weight) || 0) * count;
  if (r.mode === "HARD") out.hard += v || count;
  else if (r.mode === "MEDIUM") out.medium += v;
  else if (r.mode === "SOFT") out.soft += v;
}

export function evaluateCandidateRelations(candidate: PlanningActivity, placed: PlanningActivity[], relations: PlanningRelation[]) {
  const out = zero();
  for (const r of relations) {
    if (r.mode === "OFF") continue;
    const type = String(r.relation_type ?? "").trim().toUpperCase();
    if (!isSupportedPlanningRelationType(type)) continue;
    const left = matches(candidate, r.left_selector), right = matches(candidate, r.right_selector);
    if (isUnaryPlanningRelationType(type)) {
      if (left && violatesUnary(type, candidate, r.parameters)) add(out, r);
      continue;
    }
    if (left) for (const other of placed) if (other.activity_key !== candidate.activity_key && matches(other, r.right_selector) && violates(type, candidate, other, r.parameters)) add(out, r);
    if (right) for (const other of placed) if (other.activity_key !== candidate.activity_key && matches(other, r.left_selector) && violates(type, other, candidate, r.parameters)) add(out, r);
  }
  return out;
}

export function evaluatePlanningRelations(activities: PlanningActivity[], relations: PlanningRelation[]) {
  const out = zero();
  for (const r of relations) {
    if (r.mode === "OFF") continue;
    const type = String(r.relation_type ?? "").trim().toUpperCase();
    const spec = getPlanningRelationTypeSpec(type);
    if (!spec) continue;
    const left = activities.filter((a) => matches(a, r.left_selector));
    if (spec.arity === "unary") {
      for (const a of left) if (violatesUnary(type, a, r.parameters)) add(out, r);
      continue;
    }
    const seen = new Set<string>();
    const right = activities.filter((a) => matches(a, r.right_selector));
    for (const l of left)
      for (const rr of right) {
        if (l.activity_key === rr.activity_key) continue;
        const k = spec.symmetry === "symmetric" ? [l.activity_key, rr.activity_key].sort().join("|") : `${l.activity_key}|${rr.activity_key}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (violates(type, l, rr, r.parameters)) add(out, r);
      }
  }
  return out;
}
