import { describe, expect, test } from "bun:test";
import { solveLocalSchedule, type LocalProblem, type LocalScore } from "../src/lib/schedule-local-solver-core";

const K = (...x: (string | number | null)[]) => x.join("|");
const lexLe = (a: LocalScore, b: LocalScore) => a.hard < b.hard || (a.hard === b.hard && (a.medium < b.medium || (a.medium === b.medium && a.soft <= b.soft)));

function problem(seed: number, enableLns = false): LocalProblem {
  const assignments = Array.from({ length: 18 }, (_, i) => ({ assignment_id: `a${i}`, teacher_id: `t${i % 9}`, class_id: `c${i % 12}`, course_id: `q${i % 7}`, assigned_hours: i % 3 === 0 ? 3 : 2 }));
  return { days: [1, 2, 3, 4, 5], periods: 8, assignments, locked: [], unavailable: Array.from({ length: 9 }, (_, i) => ({ teacher_id: `t${i}`, weekday: (i % 5) + 1, period: (i % 6) + 1 })), teacherConstraints: Array.from({ length: 9 }, (_, i) => ({ teacher_id: `t${i}`, max_daily_hours: 5, max_consecutive_hours: 3 })), courseRules: Array.from({ length: 7 }, (_, i) => ({ course_id: `q${i}`, block_pattern: null, max_per_day: 2, prohibited_days: null, prohibited_periods: i % 2 ? [8] : null })), seed, enableLns, lnsIterations: enableLns ? 18 : undefined };
}

function audit(p: LocalProblem) {
  const r = solveLocalSchedule(p), teacher = new Set<string>(), clazz = new Set<string>(), daily = new Map<string, number>(), periods = new Map<string, number[]>(), courseDaily = new Map<string, number>();
  for (const x of r.rows) {
    const tk = K(x.teacher_id, x.weekday, x.period), ck = K(x.class_id, x.weekday, x.period);
    expect(teacher.has(tk)).toBe(false); expect(clazz.has(ck)).toBe(false); teacher.add(tk); clazz.add(ck);
    expect(p.unavailable.some((u) => u.teacher_id === x.teacher_id && u.weekday === x.weekday && u.period === x.period)).toBe(false);
    const dk = K(x.teacher_id, x.weekday); daily.set(dk, (daily.get(dk) ?? 0) + 1); periods.set(dk, [...(periods.get(dk) ?? []), x.period]);
    const a = p.assignments.find((a) => a.assignment_id === x.assignment_id); if (a) { const q = p.courseRules.find((q) => q.course_id === a.course_id); expect(q?.prohibited_days?.includes(x.weekday) ?? false).toBe(false); expect(q?.prohibited_periods?.includes(x.period) ?? false).toBe(false); const qk = K(a.class_id, a.course_id, x.weekday); courseDaily.set(qk, (courseDaily.get(qk) ?? 0) + 1); if (q?.max_per_day) expect(courseDaily.get(qk)!).toBeLessThanOrEqual(q.max_per_day); }
  }
  for (const c of p.teacherConstraints) for (const d of p.days) { const dk = K(c.teacher_id, d), n = daily.get(dk) ?? 0; if (c.max_daily_hours) expect(n).toBeLessThanOrEqual(c.max_daily_hours); if (c.max_consecutive_hours) { const s = new Set(periods.get(dk) ?? []); let run = 0, best = 0; for (let i = 1; i <= p.periods; i++) { run = s.has(i) ? run + 1 : 0; best = Math.max(best, run); } expect(best).toBeLessThanOrEqual(c.max_consecutive_hours); } }
  return r;
}

function blockProblem(pattern: number[], seed = 7, locked: LocalProblem["locked"] = [], enableLns = true): LocalProblem {
  const total = pattern.reduce((a, b) => a + b, 0);
  return { days: [1, 2, 3, 4, 5], periods: 8, assignments: [{ assignment_id: "block", teacher_id: "tb", class_id: "cb", course_id: "qb", assigned_hours: total }], locked, unavailable: [], teacherConstraints: [{ teacher_id: "tb", max_daily_hours: 6, max_consecutive_hours: 6 }], courseRules: [{ course_id: "qb", block_pattern: pattern, max_per_day: Math.max(...pattern), prohibited_days: null, prohibited_periods: null }], seed, enableLns, lnsIterations: 24 };
}

function assertAtomicActivities(rows: ReturnType<typeof solveLocalSchedule>["rows"], expectedDurations: number[]) {
  const groups = new Map<string, typeof rows>(); for (const x of rows) { const k = x.activity_key ?? ""; groups.set(k, [...(groups.get(k) ?? []), x]); }
  expect([...groups.values()].map((rs) => rs.length).sort((a, b) => a - b)).toEqual([...expectedDurations].sort((a, b) => a - b));
  for (const rs of groups.values()) { const ps = rs.map((x) => x.period).sort((a, b) => a - b); expect(new Set(rs.map((x) => x.weekday)).size).toBe(1); for (let i = 1; i < ps.length; i++) expect(ps[i]! - ps[i - 1]!).toBe(1); for (const x of rs) expect(x.activity_duration).toBe(rs.length); }
}

describe("local timetable solver benchmark gate", () => {
  test("same seed is deterministic", () => { const a = solveLocalSchedule(problem(42, true)), b = solveLocalSchedule(problem(42, true)); expect(a).toEqual(b); });
  test("30-seed medium suite has zero hard leakage and high feasibility", () => { let feasible = 0, totalMs = 0; for (let seed = 1; seed <= 30; seed++) { const p = problem(seed, false), t = performance.now(), r = audit(p); totalMs += performance.now() - t; if (r.complete) feasible++; } expect(feasible / 30).toBeGreaterThanOrEqual(0.95); expect(totalMs).toBeLessThan(8000); });
  test("[2,2] block pattern stays atomic through local search and LNS", () => { const r = audit(blockProblem([2, 2])); expect(r.complete).toBe(true); expect(r.rows).toHaveLength(4); assertAtomicActivities(r.rows, [2, 2]); expect(r.lns.enabled).toBe(true); expect(r.lns.iterations).toBeGreaterThan(0); });
  test("[3] block cannot be split by optimization", () => { const r = audit(blockProblem([3], 13)); expect(r.complete).toBe(true); assertAtomicActivities(r.rows, [3]); });
  test("valid locked block is preserved and only remaining component is generated", () => { const locked = [1, 2].map((period) => ({ assignment_id: "block", teacher_id: "tb", class_id: "cb", weekday: 1, period, locked: true })); const r = audit(blockProblem([2, 2], 21, locked)); expect(r.complete).toBe(true); expect(r.rows.filter((x) => x.locked)).toHaveLength(2); expect(r.rows.filter((x) => x.locked).map((x) => x.period).sort()).toEqual([1, 2]); assertAtomicActivities(r.rows, [2, 2]); });
  test("LNS never returns a lexicographically worse solution than baseline", () => { const base = solveLocalSchedule(problem(73, false)), lns = solveLocalSchedule(problem(73, true)); expect(base.complete).toBe(true); expect(lns.complete).toBe(true); expect(lexLe(lns.score, base.score)).toBe(true); expect(lns.lns.enabled).toBe(true); });
  test("HARD DIFFERENT_DAY relation is enforced", () => { const p: LocalProblem = { days: [1, 2], periods: 2, assignments: [{ assignment_id: "l", teacher_id: "tl", class_id: "cl", course_id: "ql", assigned_hours: 1 }, { assignment_id: "r", teacher_id: "tr", class_id: "cr", course_id: "qr", assigned_hours: 1 }], locked: [], unavailable: [], teacherConstraints: [], courseRules: [{ course_id: "ql", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: null }, { course_id: "qr", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: null }], planningRelations: [{ id: "rel", relation_type: "DIFFERENT_DAY", mode: "HARD", weight: 1, left_selector: { activity_key: "l:component:1:1" }, right_selector: { activity_key: "r:component:1:1" }, parameters: {} }], seed: 11, enableLns: true }; const r = solveLocalSchedule(p); expect(r.complete).toBe(true); expect(r.rows.find((x) => x.assignment_id === "l")?.weekday).not.toBe(r.rows.find((x) => x.assignment_id === "r")?.weekday); });
  test("HARD ORDERED relation is enforced", () => { const p: LocalProblem = { days: [1], periods: 4, assignments: [{ assignment_id: "l", teacher_id: "tl", class_id: "cl", course_id: "ql", assigned_hours: 1 }, { assignment_id: "r", teacher_id: "tr", class_id: "cr", course_id: "qr", assigned_hours: 1 }], locked: [], unavailable: [], teacherConstraints: [], courseRules: [{ course_id: "ql", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: [3, 4] }, { course_id: "qr", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: null }], planningRelations: [{ id: "ord", relation_type: "ORDERED", mode: "HARD", weight: 1, left_selector: { activity_key: "l:component:1:1" }, right_selector: { activity_key: "r:component:1:1" }, parameters: {} }], seed: 3, enableLns: true }; const r = solveLocalSchedule(p); expect(r.complete).toBe(true); expect(r.rows.find((x) => x.assignment_id === "l")!.period).toBeLessThan(r.rows.find((x) => x.assignment_id === "r")!.period); });
  test("student conflict weights are minimized before soft quality", () => { const p: LocalProblem = { days: [1], periods: 2, assignments: [{ assignment_id: "a", teacher_id: "ta", class_id: "ca", course_id: "qa", assigned_hours: 1 }, { assignment_id: "b", teacher_id: "tb", class_id: "cb", course_id: "qb", assigned_hours: 1 }], locked: [], unavailable: [], teacherConstraints: [], courseRules: [{ course_id: "qa", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: null }, { course_id: "qb", block_pattern: null, max_per_day: 1, prohibited_days: null, prohibited_periods: null }], studentConflictWeights: [{ left_assignment_id: "a", right_assignment_id: "b", student_weight: 12, severity_weight: 12 }], seed: 19, enableLns: true }; const r = solveLocalSchedule(p); expect(r.complete).toBe(true); expect(r.score.medium).toBe(0); expect(r.rows.find((x) => x.assignment_id === "a")?.period).not.toBe(r.rows.find((x) => x.assignment_id === "b")?.period); });
});
