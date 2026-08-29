import {
  evaluateCandidateRelations,
  type PlanningActivity,
  type PlanningRelation,
  type PlanningSelector,
} from "@/lib/schedule-planning-relations";
import { IncrementalScheduleScore } from "@/lib/schedule-local-incremental-score";
import {
  chooseConstructionDecision,
  constructionPortfolioForSeed,
} from "@/lib/schedule-construction-heuristics";
import {
  localScopesOverlap,
  type LocalAssignment,
  type LocalCandidate,
  type LocalCourseRule,
  type LocalLockedRow,
  type LocalProblem,
  type LocalScore,
  type LocalSearchStrategy,
  type LnsNeighborhood,
  type LnsStats,
} from "@/lib/schedule-local-solver-time-core";
export type {
  LocalProblem,
  LocalCandidate,
  LocalScore,
  LocalSearchStrategy,
  LnsStats,
  LnsNeighborhood,
} from "@/lib/schedule-local-solver-time-core";
export type LocalRoom = {
  classroom_id: string;
  capacity?: number | null;
  room_type?: string | null;
  features?: string[] | null;
  building_id?: string | null;
  room_pool_id?: string | null;
  pool_capacity?: number | null;
  max_simultaneous_activities?: number | null;
};
export type LocalRoomRequirement = {
  required_classroom_ids?: string[] | null;
  preferred_classroom_ids?: string[] | null;
  prohibited_classroom_ids?: string[] | null;
  required_room_type?: string | null;
  required_features?: string[] | null;
  minimum_capacity?: number | null;
};
export type LocalPeriodBreak = { after_period: number; minutes: number; transfer_allowed: boolean };
export type LocalBuildingTravel = {
  from_building_id: string;
  to_building_id: string;
  minutes: number;
};
export type LocalRoomUnavailable = { classroom_id: string; weekday: number; period: number };
export type JointLocalProblem = LocalProblem & {
  rooms?: LocalRoom[];
  roomRequirements?: Record<string, LocalRoomRequirement>;
  roomUnavailable?: LocalRoomUnavailable[];
  periodBreaks?: LocalPeriodBreak[];
  buildingTravel?: LocalBuildingTravel[];
};
const rng = (seed: number) => {
  let s = seed | 0;
  return () => ((s = (Math.imul(1664525, s) + 1013904223) | 0) >>> 0) / 4294967296;
};
const lex = (a: LocalScore, b: LocalScore) =>
  a.hard - b.hard || a.medium - b.medium || a.soft - b.soft;
const clone = (r: LocalLockedRow[]) => r.map((x) => ({ ...x }));
const pattern = (r: LocalCourseRule | undefined, total: number) => {
  const p = (r?.block_pattern ?? []).map(Number).filter((x) => Number.isInteger(x) && x > 0);
  return p.length && p.reduce((a, b) => a + b, 0) === total
    ? p
    : Array.from({ length: total }, () => 1);
};
const runGroups = (rs: LocalLockedRow[]) => {
  const m = new Map<number, number[]>();
  for (const r of rs) m.set(r.weekday, [...(m.get(r.weekday) ?? []), r.period]);
  const out: { day: number; periods: number[] }[] = [];
  for (const [d, p0] of m) {
    const ps = [...new Set(p0)].sort((a, b) => a - b);
    let q: number[] = [];
    for (const p of ps) {
      if (!q.length || p === q[q.length - 1]! + 1) q.push(p);
      else {
        out.push({ day: d, periods: q });
        q = [p];
      }
    }
    if (q.length) out.push({ day: d, periods: q });
  }
  return out;
};
type Task = { a: LocalAssignment; duration: number; activityKey: string };
type Cell = { d: number; s: number; classroom_id: string | null; score: number };
type Placement = { key: string; a: LocalAssignment; rows: LocalLockedRow[]; locked: boolean };
const selector = (t: Task, s: PlanningSelector) =>
  (!s.activity_key || s.activity_key === t.activityKey) &&
  (!s.assignment_id || s.assignment_id === t.a.assignment_id) &&
  (!s.course_id || s.course_id === t.a.course_id) &&
  (!s.teacher_id || s.teacher_id === t.a.teacher_id) &&
  (!s.class_id || s.class_id === t.a.class_id);
const activitySelector = (a: PlanningActivity, s: PlanningSelector) =>
  (!s.activity_key || s.activity_key === a.activity_key) &&
  (!s.assignment_id || s.assignment_id === a.assignment_id) &&
  (!s.course_id || s.course_id === a.course_id) &&
  (!s.teacher_id || s.teacher_id === a.teacher_id) &&
  (!s.class_id || s.class_id === a.class_id);
export function solveIncrementalSchedule(p: JointLocalProblem): LocalCandidate {
  const R = rng(p.seed),
    strategy = p.strategy ?? "AUTO",
    relations = p.planningRelations ?? [],
    assign = new Map(p.assignments.map((a) => [a.assignment_id, a])),
    rules = new Map(p.courseRules.map((r) => [r.course_id, r])),
    cons = new Map(p.teacherConstraints.map((c) => [c.teacher_id, c])),
    rooms = p.rooms ?? [],
    roomById = new Map(rooms.map((r) => [r.classroom_id, r])),
    breakByPeriod = new Map((p.periodBreaks ?? []).map((b) => [b.after_period, b])),
    travelByPair = new Map(
      (p.buildingTravel ?? []).flatMap(
        (t) =>
          [
            [`${t.from_building_id}|${t.to_building_id}`, t.minutes],
            [`${t.to_building_id}|${t.from_building_id}`, t.minutes],
          ] as const,
      ),
    );
  let baseHard = 0,
    failed = 0;
  const rows: LocalLockedRow[] = [],
    tasks: Task[] = [];
  const lockedBy = new Map<string, LocalLockedRow[]>();
  for (const r of p.locked)
    lockedBy.set(r.assignment_id, [
      ...(lockedBy.get(r.assignment_id) ?? []),
      { ...r, locked: true },
    ]);
  for (const a of p.assignments) {
    const left = [...pattern(rules.get(a.course_id), a.assigned_hours)],
      locked = lockedBy.get(a.assignment_id) ?? [];
    let n = 0;
    for (const run of runGroups(locked)) {
      const i = left.indexOf(run.periods.length);
      if (i < 0) {
        baseHard++;
        continue;
      }
      left.splice(i, 1);
      const ak = `${a.assignment_id}:locked:${++n}`;
      for (const period of run.periods) {
        const o = locked.find((x) => x.weekday === run.day && x.period === period)!;
        if (a.allowed_periods?.length && !a.allowed_periods.includes(period)) baseHard++;
        rows.push({
          ...o,
          schedule_session_id: a.schedule_session_id ?? o.schedule_session_id ?? null,
          activity_key: ak,
          activity_duration: run.periods.length,
          locked: true,
        });
      }
    }
    left.forEach((d, i) =>
      tasks.push({ a, duration: d, activityKey: `${a.assignment_id}:component:${i + 1}:${d}` }),
    );
  }
  const state = new IncrementalScheduleScore(
    p.assignments,
    rows,
    relations,
    p.studentConflictWeights ?? [],
  );
  const groups = (): Placement[] =>
    state.index.activityGroups().flatMap((g) => {
      const rs = g.rows.sort((a, b) => a.period - b.period),
        a = assign.get(rs[0]?.assignment_id ?? "");
      return a ? [{ key: g.activity_key, a, rows: rs, locked: rs.some((x) => x.locked) }] : [];
    });
  const taskAct = (
    t: Task,
    d: number,
    s: number,
    classroom_id: string | null,
  ): PlanningActivity => ({
    activity_key: t.activityKey,
    assignment_id: t.a.assignment_id,
    course_id: t.a.course_id,
    teacher_id: t.a.teacher_id,
    class_id: t.a.class_id,
    weekday: d,
    start: s,
    end: s + t.duration - 1,
    classroom_id,
  });
  const dep = (t: Task, acts: PlanningActivity[]) =>
    relations.reduce((v, r) => {
      if (r.mode !== "HARD") return v;
      if (r.relation_type === "ORDERED" || r.relation_type === "CONSECUTIVE")
        return (
          v + (selector(t, r.left_selector) ? 1000 : 0) - (selector(t, r.right_selector) ? 1000 : 0)
        );
      if (r.relation_type !== "SAME_TIME") return v;
      const left = selector(t, r.left_selector),
        right = selector(t, r.right_selector),
        leftPlaced = acts.some((a) => activitySelector(a, r.left_selector)),
        rightPlaced = acts.some((a) => activitySelector(a, r.right_selector));
      if (right && leftPlaced) return v + 100000;
      if (left && rightPlaced) return v + 100000;
      if (left && !rightPlaced) return v + 10000;
      if (right && !leftPlaced) return v + 9000;
      return v;
    }, 0);
  const unavailable = (a: LocalAssignment, d: number, s: number) =>
    p.unavailable.some(
      (u) =>
        u.teacher_id === a.teacher_id &&
        u.weekday === d &&
        u.period === s &&
        (u.schedule_session_id == null || u.schedule_session_id === a.schedule_session_id),
    );
  const consecutive = (
    a: LocalAssignment,
    d: number,
    start: number,
    duration: number,
    max: number | null | undefined,
  ) => {
    if (!max) return true;
    const ps = state.index.teacherPeriods(a, d);
    for (let x = start; x < start + duration; x++) ps.add(x);
    let run = 0,
      best = 0;
    for (let i = 1; i <= p.periods; i++) {
      run = ps.has(i) ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best <= max;
  };
  const roomEligible = (a: LocalAssignment, room: LocalRoom) => {
    const q = p.roomRequirements?.[a.assignment_id];
    if (!q) return true;
    if (q.required_classroom_ids?.length && !q.required_classroom_ids.includes(room.classroom_id))
      return false;
    if (q.prohibited_classroom_ids?.includes(room.classroom_id)) return false;
    if (q.required_room_type && room.room_type !== q.required_room_type) return false;
    if (q.minimum_capacity != null && (room.capacity ?? 0) < q.minimum_capacity) return false;
    if (
      q.required_features?.length &&
      !q.required_features.every((f) => room.features?.includes(f))
    )
      return false;
    return true;
  };
  const roomFree = (a: LocalAssignment, room: LocalRoom, d: number, s: number, n: number) => {
    for (let x = s; x < s + n; x++) {
      if (
        p.roomUnavailable?.some(
          (u) => u.classroom_id === room.classroom_id && u.weekday === d && u.period === x,
        )
      )
        return false;
      const slot = state.index.slot(a, d, x);
      if (!room.room_pool_id) {
        if (slot.some((r) => r.classroom_id === room.classroom_id)) return false;
        continue;
      }
      const poolRows = slot.filter(
          (r) => roomById.get(r.classroom_id ?? "")?.room_pool_id === room.room_pool_id,
        ),
        max = Math.max(1, room.max_simultaneous_activities ?? 1),
        used = poolRows.reduce((v, r) => v + (assign.get(r.assignment_id)?.student_count ?? 0), 0),
        capacity = room.pool_capacity ?? room.capacity ?? 0;
      if (poolRows.length >= max || (capacity > 0 && used + (a.student_count ?? 0) > capacity))
        return false;
    }
    return true;
  };
  const transferOk = (a: LocalAssignment, room: LocalRoom, d: number, s: number, n: number) => {
    if (!p.periodBreaks?.length || !room.building_id) return true;
    const adjacent = [...state.index.teacherDay(a, d)].filter(
      (r) => r.period === s - 1 || r.period === s + n,
    );
    for (const row of adjacent) {
      const other = row.classroom_id ? roomById.get(row.classroom_id) : null;
      if (!other?.building_id || other.building_id === room.building_id) continue;
      const after = row.period === s - 1 ? row.period : s + n - 1,
        b = breakByPeriod.get(after),
        needed = travelByPair.get(`${other.building_id}|${room.building_id}`) ?? 0;
      if (!b?.transfer_allowed || b.minutes < needed) return false;
    }
    return true;
  };
  const roomChoices = (a: LocalAssignment, d: number, s: number, n: number) => {
    if (!rooms.length) return [{ id: null as string | null, penalty: 0 }];
    const q = p.roomRequirements?.[a.assignment_id],
      preferred = new Set(q?.preferred_classroom_ids ?? []);
    return rooms
      .filter((r) => roomEligible(a, r) && roomFree(a, r, d, s, n) && transferOk(a, r, d, s, n))
      .map((r) => ({
        id: r.classroom_id,
        penalty: preferred.size && !preferred.has(r.classroom_id) ? 4 : 0,
      }))
      .sort((x, y) => x.penalty - y.penalty || String(x.id).localeCompare(String(y.id)));
  };
  const cells = (t: Task): Cell[] => {
    const a = t.a,
      r = rules.get(a.course_id),
      c = cons.get(a.teacher_id),
      out: Cell[] = [],
      placed = relations.length ? state.activities() : [];
    for (const d of p.days)
      for (let s = 1; s <= p.periods - t.duration + 1; s++) {
        if (r?.prohibited_days?.includes(d)) continue;
        let bad = false;
        for (let x = s; x < s + t.duration; x++)
          if (
            (a.allowed_periods?.length && !a.allowed_periods.includes(x)) ||
            r?.prohibited_periods?.includes(x) ||
            unavailable(a, d, x) ||
            state.index.occupied(a, d, x)
          ) {
            bad = true;
            break;
          }
        if (bad) continue;
        const td = state.index.teacherDay(a, d).length,
          cd = state.index.courseDay(a, d).length;
        if (c?.max_daily_hours && td + t.duration > c.max_daily_hours) continue;
        if (r?.max_per_day && cd + t.duration > r.max_per_day) continue;
        if (!consecutive(a, d, s, t.duration, c?.max_consecutive_hours)) continue;
        const rcs = roomChoices(a, d, s, t.duration);
        if (!rcs.length) continue;
        for (const rc of rcs) {
          const rel = relations.length
            ? evaluateCandidateRelations(taskAct(t, d, s, rc.id), placed, relations)
            : { hard: 0, medium: 0, soft: 0 };
          if (rel.hard) continue;
          const student = state.studentPenalty(a.assignment_id, d, s, t.duration);
          const preferredPenalty =
            a.preferred_periods?.length &&
            Array.from({ length: t.duration }, (_, i) => s + i).some(
              (period) => !a.preferred_periods!.includes(period),
            )
              ? (a.preferred_period_weight ?? 1)
              : 0;
          out.push({
            d,
            s,
            classroom_id: rc.id,
            score:
              td * 3 +
              cd * 8 +
              Math.max(0, s + t.duration - 1 - 6) * 2 +
              (rel.medium + student) * 100 +
              rel.soft +
              preferredPenalty +
              rc.penalty +
              R() * 0.35,
          });
        }
      }
    return out.sort(
      (x, y) => x.score - y.score || String(x.classroom_id).localeCompare(String(y.classroom_id)),
    );
  };
  const place = (t: Task, d: number, s: number, classroom_id: string | null) => {
    for (let x = s; x < s + t.duration; x++) {
      const row: LocalLockedRow = {
        assignment_id: t.a.assignment_id,
        teacher_id: t.a.teacher_id,
        class_id: t.a.class_id,
        weekday: d,
        period: x,
        classroom_id,
        subgroup_id: t.a.subgroup_id ?? null,
        schedule_session_id: t.a.schedule_session_id ?? null,
        locked: false,
        activity_key: t.activityKey,
        activity_duration: t.duration,
      };
      rows.push(row);
      state.add(row);
    }
  };
  const removeRows = (rs: LocalLockedRow[]) => {
    for (const r of rs) {
      state.remove(r);
      const i = rows.indexOf(r);
      if (i >= 0) rows.splice(i, 1);
    }
  };
  const toTask = (g: Placement): Task => ({ a: g.a, duration: g.rows.length, activityKey: g.key });
  const constructionPortfolio = constructionPortfolioForSeed(p.seed);
  let constructionStep = 0;
  const construct = (q0: Task[]) => {
    const q = [...q0];
    let f = 0;
    while (q.length) {
      const placedActivities = state.activities();
      const options = q.map((t, index) => ({
          index,
          duration: t.duration,
          dependency: dep(t, placedActivities),
          cells: cells(t),
        })),
        heuristic = constructionPortfolio[constructionStep++ % constructionPortfolio.length]!,
        decision = chooseConstructionDecision(options, heuristic);
      if (!decision) {
        const t = q.shift()!;
        f += t.duration;
        continue;
      }
      const t = q.splice(decision.taskIndex, 1)[0]!,
        cs = options[decision.taskIndex]!.cells as Cell[],
        c = cs[decision.cellIndex]!;
      place(t, c.d, c.s, c.classroom_id);
    }
    return f;
  };
  failed += construct(tasks);
  const score = (u = failed) => {
    const base = state.score(baseHard, u);
    const preferencePenalty = rows.reduce((total, row) => {
      const a = assign.get(row.assignment_id);
      return (
        total +
        (a?.preferred_periods?.length && !a.preferred_periods.includes(row.period)
          ? (a.preferred_period_weight ?? 1)
          : 0)
      );
    }, 0);
    return { ...base, soft: base.soft + preferencePenalty };
  };
  let current = score(),
    best = current,
    bestRows = clone(rows),
    iterations = 0;
  if (failed === 0 && current.hard === 0) {
    const modes: LocalSearchStrategy[] = [
        "LATE_ACCEPTANCE",
        "TABU",
        "SIMULATED_ANNEALING",
        "GREAT_DELUGE",
        "VND",
      ],
      limit = p.maxSearchIterations ?? Math.min(1800, Math.max(240, Math.ceil(rows.length * 3.5))),
      hist = Array.from({ length: 64 }, () => current.medium * 100 + current.soft),
      tabu = new Map<string, number>(),
      initial = Math.max(1, current.medium * 100 + current.soft);
    for (let it = 0; it < limit; it++) {
      iterations = it + 1;
      const movable = groups().filter((g) => !g.locked);
      if (!movable.length) break;
      const g = movable[Math.floor(R() * movable.length)]!,
        before = clone(g.rows);
      removeRows(g.rows);
      const t = toTask(g),
        choices = cells(t).slice(0, 10),
        mode =
          strategy === "AUTO"
            ? modes[Math.min(modes.length - 1, Math.floor(it / Math.max(1, limit / modes.length)))]!
            : strategy;
      let accepted = false;
      for (const c of choices) {
        place(t, c.d, c.s, c.classroom_id);
        const next = score(0),
          cur = current.medium * 100 + current.soft,
          nv = next.medium * 100 + next.soft,
          bv = best.medium * 100 + best.soft,
          delta = nv - cur,
          temp = Math.max(0.25, initial * (1 - it / limit)),
          water = bv + (initial - bv) * Math.max(0, 1 - it / limit),
          ok =
            mode === "LATE_ACCEPTANCE"
              ? nv <= cur || nv <= hist[it % hist.length]!
              : mode === "TABU"
                ? (tabu.get(g.key) ?? -1) <= it || lex(next, best) < 0
                : mode === "SIMULATED_ANNEALING"
                  ? delta <= 0 || R() < Math.exp(-delta / temp)
                  : mode === "GREAT_DELUGE"
                    ? nv <= water
                    : nv < cur;
        if (next.hard === 0 && ok) {
          current = next;
          accepted = true;
          tabu.set(g.key, it + 11);
          if (lex(next, best) < 0) {
            best = next;
            bestRows = clone(rows);
          }
          break;
        }
        const placed = groups().find((x) => x.key === g.key);
        if (placed) removeRows(placed.rows);
      }
      if (!accepted)
        for (const r of before) {
          rows.push(r);
          state.add(r);
        }
      hist[it % hist.length] = current.medium * 100 + current.soft;
    }
    if (rows !== bestRows) {
      for (const r of [...rows]) removeRows([r]);
      for (const r of bestRows) {
        rows.push(r);
        state.add(r);
      }
    }
  }
  const lns: LnsStats = {
    enabled: p.enableLns !== false && failed === 0 && best.hard === 0,
    iterations: 0,
    accepted: 0,
    improved: 0,
    rejected: 0,
    ruinedActivities: 0,
    neighborhoods: {
      RANDOM_SMALL: 0,
      TEACHER_DAY: 0,
      CLASS_DAY: 0,
      COURSE_BLOCK: 0,
      CONFLICT_HOTSPOT: 0,
      LOW_QUALITY_ZONE: 0,
    },
  };
  if (lns.enabled) {
    const kinds: LnsNeighborhood[] = [
        "TEACHER_DAY",
        "CLASS_DAY",
        "COURSE_BLOCK",
        "CONFLICT_HOTSPOT",
        "LOW_QUALITY_ZONE",
        "RANDOM_SMALL",
      ],
      limit = Math.min(72, p.lnsIterations ?? Math.max(12, Math.ceil(rows.length * 0.08)));
    for (let it = 0; it < limit; it++) {
      lns.iterations++;
      const kind = kinds[it % kinds.length]!;
      lns.neighborhoods[kind]++;
      const all = groups().filter((g) => !g.locked);
      if (!all.length) break;
      const seed = all[Math.floor(R() * all.length)]!,
        ruin =
          kind === "TEACHER_DAY"
            ? all.filter(
                (g) =>
                  g.a.teacher_id === seed.a.teacher_id &&
                  g.rows[0]!.weekday === seed.rows[0]!.weekday,
              )
            : kind === "CLASS_DAY"
              ? all.filter(
                  (g) =>
                    g.a.class_id === seed.a.class_id &&
                    g.rows[0]!.weekday === seed.rows[0]!.weekday,
                )
              : kind === "COURSE_BLOCK"
                ? all.filter(
                    (g) => g.a.class_id === seed.a.class_id && g.a.course_id === seed.a.course_id,
                  )
                : [...all]
                    .sort(() => R() - 0.5)
                    .slice(0, Math.max(2, Math.min(8, Math.ceil(all.length * 0.05))));
      lns.ruinedActivities += ruin.length;
      const beforeRows = clone(rows),
        before = score(0);
      ruin.forEach((g) => removeRows(g.rows));
      const f = construct(ruin.map(toTask)),
        after = score(f);
      if (f === 0 && after.hard === 0 && lex(after, before) <= 0) {
        lns.accepted++;
        if (lex(after, before) < 0) lns.improved++;
        if (lex(after, best) < 0) {
          best = after;
          bestRows = clone(rows);
        }
      } else {
        lns.rejected++;
        for (const r of [...rows]) removeRows([r]);
        for (const r of beforeRows) {
          rows.push(r);
          state.add(r);
        }
      }
    }
    for (const r of [...rows]) removeRows([r]);
    for (const r of bestRows) {
      rows.push(r);
      state.add(r);
    }
  }
  const final = state.score(baseHard, failed);
  return {
    rows,
    failed,
    complete: failed === 0 && final.hard === 0,
    seed: p.seed,
    score: final,
    iterations,
    strategy,
    lns,
  };
}
export function incrementalCoreStats(p: JointLocalProblem) {
  const rows: LocalLockedRow[] = [];
  const s = new IncrementalScheduleScore(
    p.assignments,
    rows,
    p.planningRelations ?? [],
    p.studentConflictWeights ?? [],
  );
  return s.stats();
}
export { localScopesOverlap };
