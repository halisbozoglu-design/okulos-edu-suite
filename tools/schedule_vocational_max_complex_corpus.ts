import os from "node:os";
import { readFile, writeFile } from "node:fs/promises";
import {
  solveIncrementalSchedule,
  type JointLocalProblem,
  type LocalRoom,
  type LocalRoomRequirement,
} from "../src/lib/schedule-local-solver-incremental-core";
import {
  localScopesOverlap,
  localStudentScopesOverlap,
  type LocalAssignment,
  type LocalLockedRow,
} from "../src/lib/schedule-local-solver-time-core";
import type { PlanningRelation } from "../src/lib/schedule-planning-relations";

type Program = "AMP" | "ATP" | "MESEM";
type Kind = "GENERAL" | "VOCATIONAL";
type Profile = {
  id: string;
  classes: number;
  periods: number;
  buildings: number;
  general_rooms: number;
  workshop_rooms: number;
  split_every: number;
  shifted: boolean;
  pooled_workshop: boolean;
  maintenance: boolean;
};
type Manifest = {
  schema: string;
  seed_count: number;
  wall_clock_budget_ms: number;
  provenance: string;
  institution_code: string;
  profiles: Profile[];
  impossible_cases: string[];
};
type AssignmentMeta = {
  program: Program;
  kind: Kind;
  field_id: string;
  workplace_days: number[];
  split_pair_id: string | null;
};
type CoordinatorQualification = "SAME_FIELD" | "NEAR_FIELD" | "FALLBACK";
type CoordinatorDuty = {
  teacher_id: string;
  program: Program;
  enterprise_unit_id: string;
  student_class_id: string | null;
  field_id: string;
  qualification: CoordinatorQualification;
  weekday: number;
  period: number;
  kind: "WORKPLACE_VISIT" | "COORDINATION";
};
type EnterpriseWindow = {
  enterprise_unit_id: string;
  program: Program;
  student_class_id: string | null;
  field_id: string;
  weekday: number;
  periods: number[];
  source: "CLASS_AUTO" | "EXPLICIT_ASSIGNMENT";
};
export type VocationalProblem = JointLocalProblem & {
  vocationalMeta: {
    assignment: Record<string, AssignmentMeta>;
    splitPairs: [string, string][];
    pinned: Record<string, { weekday: number; period: number }>;
    maintenanceRooms: string[];
    coordinatorDuties: CoordinatorDuty[];
    coordinatorFields: Record<string, string[]>;
    enterpriseWindows: EnterpriseWindow[];
  };
};
type Audit = {
  hard: number;
  unplaced: number;
  violations: string[];
  atomic: boolean;
  program_identity: boolean;
  general_and_vocational: boolean;
  split_and_unsplit: boolean;
  split_sync: boolean;
  workshop_pool_capacity: boolean;
  pooled_parallel_use: boolean;
  maintenance_exclusion: boolean;
  coordination_area_eligibility: boolean;
  coordination_enterprise_alignment: boolean;
  coordination_exclusion: boolean;
  workplace_day_exclusion: boolean;
  locked_edge_slots: boolean;
  music_monday_first: boolean;
  physical_education_friday_last: boolean;
  cross_program_teacher: boolean;
  soft_policy_count: number;
};
type Result = {
  profile_id: string;
  runs: number;
  assignments: number;
  scheduled_rows: number;
  feasible_rate: number;
  hard_max: number;
  unplaced_max: number;
  amp_atp_mesem_identity: boolean;
  general_and_vocational_mix: boolean;
  split_and_unsplit: boolean;
  split_synchronization: boolean;
  workshop_pool_capacity: boolean;
  pooled_parallel_use: boolean;
  maintenance_exclusion: boolean;
  coordination_area_eligibility: boolean;
  coordination_enterprise_alignment: boolean;
  coordination_exclusion: boolean;
  workplace_day_exclusion: boolean;
  locked_edge_slots: boolean;
  music_monday_first: boolean;
  physical_education_friday_last: boolean;
  cross_program_teacher: boolean;
  general_culture_soft_preferences: boolean;
  atomic_blocks: boolean;
  deterministic_replay: boolean;
  runtime_p50_ms: number;
  runtime_p95_ms: number;
  runtime_max_ms: number;
  budget_pass: boolean;
};
type Report = {
  schema: string;
  generated_at: string;
  seed_count: number;
  provenance: string;
  institution_code: string;
  wall_clock_budget_ms: number;
  hardware: Record<string, unknown>;
  impossible_cases: { case_id: string; failed: number; complete: boolean; fail_closed: boolean }[];
  results: Result[];
};

const manifest = JSON.parse(
  await readFile(
    new URL("../benchmarks/vocational-max-complex/manifest.json", import.meta.url),
    "utf8",
  ),
) as Manifest;
const programs: Program[] = ["AMP", "ATP", "MESEM"];
const generalSubjects = [
  "TURK_DILI",
  "MATEMATIK",
  "FIZIK",
  "TARIH",
  "YABANCI_DIL",
  "MUZIK",
  "BEDEN",
];
const pct = (a: number[], q: number) => {
  const x = [...a].sort((m, n) => m - n);
  return x[Math.min(x.length - 1, Math.max(0, Math.ceil(x.length * q) - 1))] ?? 0;
};
const stable = (rows: LocalLockedRow[]) =>
  rows
    .map((r) => [
      r.assignment_id,
      r.weekday,
      r.period,
      r.classroom_id ?? null,
      r.subgroup_id ?? null,
      r.activity_key ?? null,
    ])
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
const activityStarts = (rows: LocalLockedRow[], id: string) => {
  const rs = rows
    .filter((r) => r.assignment_id === id)
    .sort((a, b) => a.weekday - b.weekday || a.period - b.period);
  return rs[0] ? `${rs[0].weekday}|${rs[0].period}` : null;
};

export function makeVocationalMaxProblem(profile: Profile, seed: number): VocationalProblem {
  const buildings = Array.from({ length: profile.buildings }, (_, i) => `B${i}`),
    generalRooms: LocalRoom[] = Array.from({ length: profile.general_rooms }, (_, i) => ({
      classroom_id: `G${i}`,
      capacity: 36,
      room_type: "GENERAL",
      features: ["board", i % 2 === 0 ? "projector" : "smart-board"],
      building_id: buildings[i % buildings.length],
    })),
    workshopRooms: LocalRoom[] = Array.from({ length: profile.workshop_rooms }, (_, i) =>
      i === 0 && profile.pooled_workshop
        ? {
            classroom_id: "WPOOL",
            capacity: 20,
            room_type: "WORKSHOP",
            features: ["workshop", "safety", "equipment"],
            building_id: buildings[(i + 1) % buildings.length],
            room_pool_id: "SHARED-WORKSHOP",
            pool_capacity: 32,
            max_simultaneous_activities: 2,
          }
        : {
            classroom_id: `W${i}`,
            capacity: 24,
            room_type: "WORKSHOP",
            features: ["workshop", "safety", i % 2 === 0 ? "equipment" : "sink"],
            building_id: buildings[(i + 1) % buildings.length],
          },
    ),
    rooms = [...generalRooms, ...workshopRooms];
  const assignments: LocalAssignment[] = [],
    courseRules: JointLocalProblem["courseRules"] = [],
    roomRequirements: Record<string, LocalRoomRequirement> = {},
    relations: PlanningRelation[] = [],
    unavailable: JointLocalProblem["unavailable"] = [],
    meta: Record<string, AssignmentMeta> = {},
    splitPairs: [string, string][] = [],
    pinned: Record<string, { weekday: number; period: number }> = {},
    locked: LocalLockedRow[] = [],
    coordinatorDuties: CoordinatorDuty[] = [],
    coordinatorFields: Record<string, string[]> = {
      "VOC-3": ["ALAN-0"],
      "VOC-4": ["ALAN-1"],
      "VOC-5": ["ALAN-0"],
    },
    enterpriseWindows: EnterpriseWindow[] = [];
  const add = (
    a: LocalAssignment,
    m: AssignmentMeta,
    rule: {
      block_pattern: number[];
      max_per_day: number;
      prohibited_days: number[];
      prohibited_periods: number[] | null;
    },
    req: LocalRoomRequirement,
  ) => {
    assignments.push(a);
    meta[a.assignment_id] = m;
    courseRules.push({ course_id: a.course_id, ...rule });
    roomRequirements[a.assignment_id] = req;
  };

  for (let c = 0; c < profile.classes; c++) {
    const program = programs[c % programs.length]!,
      grade = 9 + (c % 4),
      fieldId = `ALAN-${c % 5}`,
      klass = `${manifest.institution_code}:${program}:${fieldId}:DAL-${c % 7}:${grade}:${Math.floor(c / 4) + 1}`,
      workplaceDays =
        program === "MESEM"
          ? [2, 3, 4, 5]
          : program === "AMP" && grade === 12
            ? [
                1 + (Math.floor(c / 4) % 3),
                2 + (Math.floor(c / 4) % 3),
                3 + (Math.floor(c / 4) % 3),
              ]
            : [],
      generalAllowed = profile.shifted && program === "MESEM" ? [1, 2, 3, 4, 5] : null;
    for (const [suffix, subject] of [
      ["CORE", generalSubjects[c % 5]!],
      ["ART", generalSubjects[5 + (c % 2)]!] as const,
    ]) {
      const generalId = `C${c}-GEN-${suffix}`,
        generalTeacher = `GEN-${(c + (suffix === "ART" ? 7 : 0)) % 16}`;
      add(
        {
          assignment_id: generalId,
          teacher_id: generalTeacher,
          class_id: klass,
          course_id: `${generalId}:${subject}`,
          assigned_hours: 1,
          student_count: 32,
          allowed_periods: generalAllowed,
          preferred_periods: [1, 2, 3, 4, 5, 6],
          preferred_period_weight: 2,
          schedule_session_id: program,
        },
        {
          program,
          kind: "GENERAL",
          field_id: fieldId,
          workplace_days: workplaceDays,
          split_pair_id: null,
        },
        {
          block_pattern: [1],
          max_per_day: 1,
          prohibited_days: workplaceDays,
          prohibited_periods: null,
        },
        { required_room_type: "GENERAL", required_features: ["board"], minimum_capacity: 30 },
      );
    }

    const split = c % profile.split_every === 0,
      v1 = `C${c}-VOC-A`,
      v2 = `C${c}-VOC-B`,
      vocTeacherA = `VOC-${(c * 2) % 36}`,
      // One qualified teacher deliberately spans AMP, ATP and MESEM; the rest of the
      // pool remains wide enough that MESEM's single school day is not artificially
      // infeasible under the seven-hour daily teacher ceiling.
      vocTeacherB = c < 3 ? "VOC-30" : `VOC-${(c * 2 + 1) % 36}`,
      vocAllowed = profile.shifted
        ? program === "ATP"
          ? [4, 5, 6, 7, 8, 9, 10]
          : program === "MESEM"
            ? [1, 2, 3, 4, 5]
            : null
        : null,
      reqBase: LocalRoomRequirement = {
        required_room_type: "WORKSHOP",
        required_features: ["workshop", "safety"],
        minimum_capacity: split ? 16 : 20,
      };
    if (split) {
      const pair = `PAIR-${c}`,
        pooled = c === 0 ? { ...reqBase, required_classroom_ids: ["WPOOL"] } : reqBase;
      add(
        {
          assignment_id: v1,
          teacher_id: vocTeacherA,
          class_id: klass,
          subgroup_id: `${klass}:G1`,
          course_id: `${v1}:${program}:UYGULAMA`,
          assigned_hours: 2,
          student_count: 16,
          allowed_periods: vocAllowed,
          schedule_session_id: program,
        },
        {
          program,
          kind: "VOCATIONAL",
          field_id: fieldId,
          workplace_days: workplaceDays,
          split_pair_id: pair,
        },
        {
          block_pattern: [2],
          max_per_day: 2,
          prohibited_days: workplaceDays,
          prohibited_periods: null,
        },
        pooled,
      );
      add(
        {
          assignment_id: v2,
          teacher_id: vocTeacherB,
          class_id: klass,
          subgroup_id: `${klass}:G2`,
          course_id: `${v2}:${program}:UYGULAMA`,
          assigned_hours: 2,
          student_count: 16,
          allowed_periods: vocAllowed,
          schedule_session_id: program,
        },
        {
          program,
          kind: "VOCATIONAL",
          field_id: fieldId,
          workplace_days: workplaceDays,
          split_pair_id: pair,
        },
        {
          block_pattern: [2],
          max_per_day: 2,
          prohibited_days: workplaceDays,
          prohibited_periods: null,
        },
        pooled,
      );
      relations.push({
        id: `SYNC-${pair}`,
        relation_type: "SAME_TIME",
        mode: "HARD",
        weight: 1,
        left_selector: { assignment_id: v1 },
        right_selector: { assignment_id: v2 },
        parameters: {},
      });
      splitPairs.push([v1, v2]);
    } else {
      add(
        {
          assignment_id: v1,
          teacher_id: vocTeacherA,
          class_id: klass,
          course_id: `${v1}:${program}:UYGULAMA`,
          assigned_hours: 2,
          student_count: 32,
          allowed_periods: vocAllowed,
          schedule_session_id: program,
        },
        {
          program,
          kind: "VOCATIONAL",
          field_id: fieldId,
          workplace_days: workplaceDays,
          split_pair_id: null,
        },
        {
          block_pattern: [2],
          max_per_day: 2,
          prohibited_days: workplaceDays,
          prohibited_periods: null,
        },
        reqBase,
      );
      add(
        {
          assignment_id: v2,
          teacher_id: vocTeacherB,
          class_id: klass,
          course_id: `${v2}:${program}:MESLEK`,
          assigned_hours: 1,
          student_count: 32,
          allowed_periods: vocAllowed,
          schedule_session_id: program,
        },
        {
          program,
          kind: "VOCATIONAL",
          field_id: fieldId,
          workplace_days: workplaceDays,
          split_pair_id: null,
        },
        {
          block_pattern: [1],
          max_per_day: 1,
          prohibited_days: workplaceDays,
          prohibited_periods: null,
        },
        reqBase,
      );
    }
  }

  for (const [program, teacher_id, field_id] of [
    ["AMP", "VOC-3", "ALAN-0"],
    ["MESEM", "VOC-5", "ALAN-0"],
  ] as const) {
    const assignment = assignments.find(
      (a) =>
        meta[a.assignment_id]?.program === program &&
        meta[a.assignment_id]?.field_id === field_id &&
        meta[a.assignment_id]?.workplace_days.length &&
        a.teacher_id !== teacher_id,
    )!;
    const weekday = meta[assignment.assignment_id]!.workplace_days[0]!,
      enterprise_unit_id = `${program}-AUTO-${assignment.class_id}`;
    enterpriseWindows.push({
      enterprise_unit_id,
      program,
      student_class_id: assignment.class_id,
      field_id,
      weekday,
      periods: [3, 4],
      source: "CLASS_AUTO",
    });
  }
  const atpAssignment = assignments.find(
    (a) =>
      meta[a.assignment_id]?.program === "ATP" &&
      meta[a.assignment_id]?.field_id === "ALAN-1" &&
      a.teacher_id !== "VOC-4",
  )!;
  enterpriseWindows.push({
    enterprise_unit_id: "ATP-DECLARED-IME-COHORT",
    program: "ATP",
    student_class_id: atpAssignment.class_id,
    field_id: "ALAN-1",
    weekday: 3,
    periods: [4, 5],
    source: "EXPLICIT_ASSIGNMENT",
  });
  for (const [teacher_id, program] of [
    ["VOC-3", "AMP"],
    ["VOC-4", "ATP"],
    ["VOC-5", "MESEM"],
  ] as const) {
    const window = enterpriseWindows.find((x) => x.program === program)!;
    for (const [position, period] of window.periods.entries()) {
      coordinatorDuties.push({
        teacher_id,
        program,
        enterprise_unit_id: window.enterprise_unit_id,
        student_class_id: window.student_class_id,
        field_id: window.field_id,
        qualification: "SAME_FIELD",
        weekday: window.weekday,
        period,
        kind: position === 0 ? "WORKPLACE_VISIT" : "COORDINATION",
      });
      unavailable.push({ teacher_id, weekday: window.weekday, period });
    }
  }
  for (let i = 0; i < 8; i++)
    unavailable.push({ teacher_id: `GEN-${i}`, weekday: 5, period: 8 + (i % 3) });
  const pin = (id: string, weekday: number, period: number, room: string) => {
    const a = assignments.find((x) => x.assignment_id === id)!;
    pinned[id] = { weekday, period };
    locked.push({
      assignment_id: id,
      teacher_id: a.teacher_id,
      class_id: a.class_id,
      weekday,
      period,
      classroom_id: room,
      subgroup_id: a.subgroup_id ?? null,
      schedule_session_id: a.schedule_session_id ?? null,
      locked: true,
    });
  };
  pin("C0-GEN-ART", 1, 1, "G0");
  pin("C1-GEN-ART", 5, profile.periods, "G1");
  const roomUnavailable = profile.maintenance
    ? [1, 2, 3, 4, 5].map((period) => ({ classroom_id: "W1", weekday: 2, period }))
    : [];
  const teacherConstraints = Array.from({ length: 52 }, (_, i) => ({
    teacher_id: i < 16 ? `GEN-${i}` : `VOC-${i - 16}`,
    max_daily_hours: 7,
    max_consecutive_hours: i % 5 === 0 ? 4 : 5,
  }));
  const periodBreaks = Array.from({ length: profile.periods - 1 }, (_, i) => ({
      after_period: i + 1,
      // This corpus combines program, group, workshop and coordinator pressure.
      // The separate room/building corpus owns forbidden or too-short transfers;
      // here all multi-building transitions have an explicitly sufficient break.
      minutes: profile.buildings > 1 ? 15 : i % 3 === 1 ? 15 : 7,
      transfer_allowed: profile.buildings > 1 || i % 4 !== 2,
    })),
    buildingTravel = [] as NonNullable<JointLocalProblem["buildingTravel"]>;
  for (let i = 0; i < buildings.length; i++)
    for (let j = i + 1; j < buildings.length; j++)
      buildingTravel.push({
        from_building_id: buildings[i]!,
        to_building_id: buildings[j]!,
        minutes: 5 + (j - i) * 2,
      });
  return {
    days: [1, 2, 3, 4, 5],
    periods: profile.periods,
    assignments,
    locked,
    unavailable,
    teacherConstraints,
    courseRules,
    planningRelations: relations,
    studentConflictWeights: [],
    rooms,
    roomRequirements,
    roomUnavailable,
    periodBreaks,
    buildingTravel,
    seed,
    maxSearchIterations: 0,
    enableLns: false,
    vocationalMeta: {
      assignment: meta,
      splitPairs,
      pinned,
      maintenanceRooms: ["W1"],
      coordinatorDuties,
      coordinatorFields,
      enterpriseWindows,
    },
  };
}

export function auditVocationalMax(p: VocationalProblem, rows: LocalLockedRow[]): Audit {
  const violations: string[] = [],
    byId = new Map(p.assignments.map((a) => [a.assignment_id, a])),
    rooms = new Map((p.rooms ?? []).map((r) => [r.classroom_id, r])),
    rules = new Map(p.courseRules.map((r) => [r.course_id, r])),
    counts = new Map<string, number>(),
    unavailable = new Set(
      p.unavailable.map(
        (u) => `${u.teacher_id}|${u.weekday}|${u.period}|${u.schedule_session_id ?? "*"}`,
      ),
    ),
    maintenance = new Set(
      (p.roomUnavailable ?? []).map((u) => `${u.classroom_id}|${u.weekday}|${u.period}`),
    );
  for (const r of rows) {
    const a = byId.get(r.assignment_id);
    if (!a) {
      violations.push(`UNKNOWN:${r.assignment_id}`);
      continue;
    }
    counts.set(a.assignment_id, (counts.get(a.assignment_id) ?? 0) + 1);
    if (a.allowed_periods?.length && !a.allowed_periods.includes(r.period))
      violations.push(`ALLOWED:${a.assignment_id}`);
    if (
      unavailable.has(`${a.teacher_id}|${r.weekday}|${r.period}|*`) ||
      unavailable.has(`${a.teacher_id}|${r.weekday}|${r.period}|${a.schedule_session_id ?? "*"}`)
    )
      violations.push(`COORDINATION:${a.assignment_id}`);
    const rule = rules.get(a.course_id);
    if (rule?.prohibited_days?.includes(r.weekday) || rule?.prohibited_periods?.includes(r.period))
      violations.push(`WORKPLACE_OR_DOMAIN:${a.assignment_id}`);
    const room = r.classroom_id ? rooms.get(r.classroom_id) : null,
      req = p.roomRequirements?.[a.assignment_id];
    if (!room) violations.push(`ROOM_MISSING:${a.assignment_id}`);
    else {
      if (
        req?.required_classroom_ids?.length &&
        !req.required_classroom_ids.includes(room.classroom_id)
      )
        violations.push(`ROOM_REQUIRED:${a.assignment_id}`);
      if (req?.required_room_type && room.room_type !== req.required_room_type)
        violations.push(`ROOM_TYPE:${a.assignment_id}`);
      if (req?.minimum_capacity != null && (room.capacity ?? 0) < req.minimum_capacity)
        violations.push(`ROOM_CAPACITY:${a.assignment_id}`);
      if (req?.required_features?.some((f) => !room.features?.includes(f)))
        violations.push(`ROOM_FEATURE:${a.assignment_id}`);
      if (maintenance.has(`${room.classroom_id}|${r.weekday}|${r.period}`))
        violations.push(`MAINTENANCE:${a.assignment_id}`);
    }
  }
  for (const a of p.assignments)
    if ((counts.get(a.assignment_id) ?? 0) !== a.assigned_hours)
      violations.push(`HOURS:${a.assignment_id}`);
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!,
        b = rows[j]!,
        aa = byId.get(a.assignment_id),
        bb = byId.get(b.assignment_id);
      if (a.weekday !== b.weekday || a.period !== b.period || !localScopesOverlap(aa, bb)) continue;
      if (a.teacher_id === b.teacher_id) violations.push(`TEACHER_COLLISION:${i}:${j}`);
      if (localStudentScopesOverlap(aa, bb)) violations.push(`CLASS_OR_GROUP_COLLISION:${i}:${j}`);
      const ar = a.classroom_id ? rooms.get(a.classroom_id) : null,
        br = b.classroom_id ? rooms.get(b.classroom_id) : null;
      if (a.classroom_id && a.classroom_id === b.classroom_id && !ar?.room_pool_id)
        violations.push(`ROOM_COLLISION:${i}:${j}`);
      else if (ar?.room_pool_id && ar.room_pool_id === br?.room_pool_id) {
        const slot = rows.filter(
            (x) =>
              x.weekday === a.weekday &&
              x.period === a.period &&
              rooms.get(x.classroom_id ?? "")?.room_pool_id === ar.room_pool_id,
          ),
          unique = new Set(slot.map((x) => x.assignment_id)),
          used = [...unique].reduce((v, id) => v + (byId.get(id)?.student_count ?? 0), 0);
        if (
          unique.size > (ar.max_simultaneous_activities ?? 1) ||
          used > (ar.pool_capacity ?? ar.capacity ?? 0)
        )
          violations.push(`ROOM_POOL_CAPACITY:${a.weekday}:${a.period}`);
      }
    }
  const groups = new Map<string, LocalLockedRow[]>();
  for (const r of rows) {
    const k = r.activity_key ?? `${r.assignment_id}:${r.weekday}:${r.period}`;
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  let atomic = true;
  for (const [k, rs] of groups) {
    const ps = rs.map((r) => r.period).sort((a, b) => a - b),
      duration = rs[0]?.activity_duration ?? rs.length;
    if (
      new Set(rs.map((r) => r.weekday)).size !== 1 ||
      rs.length !== duration ||
      ps.some((x, i) => i > 0 && x !== ps[i - 1]! + 1)
    ) {
      atomic = false;
      violations.push(`ATOMIC:${k}`);
    }
  }
  const splitSync = p.vocationalMeta.splitPairs.every(
      ([a, b]) =>
        activityStarts(rows, a) !== null && activityStarts(rows, a) === activityStarts(rows, b),
    ),
    programsPresent = new Set(Object.values(p.vocationalMeta.assignment).map((m) => m.program)),
    kinds = new Set(Object.values(p.vocationalMeta.assignment).map((m) => m.kind)),
    subgroups = p.assignments.filter((a) => a.subgroup_id != null).length,
    whole = p.assignments.filter((a) => a.subgroup_id == null).length,
    poolSlots = new Map<string, Set<string>>();
  for (const r of rows) {
    const room = rooms.get(r.classroom_id ?? "");
    if (room?.room_pool_id) {
      const k = `${room.room_pool_id}|${r.weekday}|${r.period}`,
        s = poolSlots.get(k) ?? new Set<string>();
      s.add(r.assignment_id);
      poolSlots.set(k, s);
    }
  }
  const pooledParallel = [...poolSlots.values()].some((s) => s.size > 1),
    programByTeacher = new Map<string, Set<Program>>();
  for (const a of p.assignments) {
    const s = programByTeacher.get(a.teacher_id) ?? new Set<Program>();
    s.add(p.vocationalMeta.assignment[a.assignment_id]!.program);
    programByTeacher.set(a.teacher_id, s);
  }
  const lockedEdge = Object.entries(p.vocationalMeta.pinned).every(([id, x]) =>
      rows.some(
        (r) =>
          r.assignment_id === id && r.weekday === x.weekday && r.period === x.period && r.locked,
      ),
    ),
    maintenanceOk = !violations.some((v) => v.startsWith("MAINTENANCE")),
    coordinatorAreaEligible = p.vocationalMeta.coordinatorDuties.every((d) => {
      const fields = p.vocationalMeta.coordinatorFields[d.teacher_id] ?? [];
      if (d.qualification === "SAME_FIELD") return fields.includes(d.field_id);
      return fields.length > 0;
    }),
    coordinatorDoesNotNeedCourseAssignment = p.vocationalMeta.coordinatorDuties.every(
      (d) =>
        !p.assignments.some(
          (a) => a.class_id === d.student_class_id && a.teacher_id === d.teacher_id,
        ),
    ),
    coordinatorEnterpriseAligned = p.vocationalMeta.coordinatorDuties.every((d) =>
      p.vocationalMeta.enterpriseWindows.some(
        (window) =>
          window.enterprise_unit_id === d.enterprise_unit_id &&
          window.program === d.program &&
          window.student_class_id === d.student_class_id &&
          window.weekday === d.weekday &&
          window.periods.includes(d.period),
      ),
    ),
    coordinationOk =
      coordinatorEnterpriseAligned &&
      p.vocationalMeta.coordinatorDuties.every(
        (d) =>
          !rows.some(
            (r) =>
              r.teacher_id === d.teacher_id && r.weekday === d.weekday && r.period === d.period,
          ),
      ),
    workplaceOk = !violations.some((v) => v.startsWith("WORKPLACE_OR_DOMAIN")),
    poolOk = !violations.some((v) => v.startsWith("ROOM_POOL_CAPACITY")),
    softCount = p.assignments.filter(
      (a) =>
        p.vocationalMeta.assignment[a.assignment_id]?.kind === "GENERAL" &&
        a.preferred_periods?.length,
    ).length,
    musicMonday = rows.some(
      (r) => r.assignment_id === "C0-GEN-ART" && r.weekday === 1 && r.period === 1 && r.locked,
    ),
    peFriday = rows.some(
      (r) =>
        r.assignment_id === "C1-GEN-ART" && r.weekday === 5 && r.period === p.periods && r.locked,
    );
  return {
    hard: violations.length,
    unplaced: p.assignments.reduce(
      (n, a) => n + Math.max(0, a.assigned_hours - (counts.get(a.assignment_id) ?? 0)),
      0,
    ),
    violations,
    atomic,
    program_identity: programsPresent.size === 3,
    general_and_vocational: kinds.size === 2,
    split_and_unsplit: subgroups > 0 && whole > 0,
    split_sync: splitSync,
    workshop_pool_capacity: poolOk,
    pooled_parallel_use: pooledParallel,
    maintenance_exclusion: maintenanceOk,
    coordination_area_eligibility:
      coordinatorAreaEligible && coordinatorDoesNotNeedCourseAssignment,
    coordination_enterprise_alignment: coordinatorEnterpriseAligned,
    coordination_exclusion: coordinationOk,
    workplace_day_exclusion: workplaceOk,
    locked_edge_slots: lockedEdge,
    music_monday_first: musicMonday,
    physical_education_friday_last: peFriday,
    cross_program_teacher: [...programByTeacher.values()].some((s) => s.size === 3),
    soft_policy_count: softCount,
  };
}

export function makeVocationalImpossibleCases(): { case_id: string; problem: JointLocalProblem }[] {
  const a = (
    id: string,
    teacher: string,
    klass: string,
    student_count: number,
  ): LocalAssignment => ({
    assignment_id: id,
    teacher_id: teacher,
    class_id: klass,
    subgroup_id: `${klass}:${id}`,
    course_id: `q-${id}`,
    assigned_hours: 1,
    allowed_periods: [1],
    student_count,
  });
  const room: LocalRoom = {
    classroom_id: "WPOOL",
    capacity: 20,
    room_type: "WORKSHOP",
    features: ["workshop"],
    room_pool_id: "POOL",
    pool_capacity: 24,
    max_simultaneous_activities: 1,
  };
  const common = {
    days: [1],
    periods: 1,
    locked: [],
    unavailable: [],
    teacherConstraints: [],
    courseRules: [],
    planningRelations: [],
    studentConflictWeights: [],
    seed: 991,
    enableLns: false,
  } as const;
  return [
    {
      case_id: "workshop-pool-simultaneous-capacity-exceeded",
      problem: {
        ...common,
        assignments: [a("a", "t1", "c1", 16), a("b", "t2", "c2", 16)],
        rooms: [room],
        roomRequirements: {
          a: { required_classroom_ids: ["WPOOL"] },
          b: { required_classroom_ids: ["WPOOL"] },
        },
      },
    },
    {
      case_id: "coordination-teacher-single-slot-collision",
      problem: {
        ...common,
        assignments: [a("a", "coordinator", "c1", 12), a("b", "coordinator", "c2", 12)],
      },
    },
  ];
}

export async function runVocationalMaxCorpus(seedCount = manifest.seed_count): Promise<Report> {
  const seeds = Array.from({ length: seedCount }, (_, i) => 4211 + i * 7919),
    results: Result[] = [];
  for (const profile of manifest.profiles) {
    const times: number[] = [],
      audits: Audit[] = [];
    let feasible = 0,
      deterministic = true,
      lastRows = 0,
      assignmentCount = 0;
    for (let i = 0; i < seeds.length; i++) {
      const p = makeVocationalMaxProblem(profile, seeds[i]!);
      assignmentCount = p.assignments.length;
      const t = performance.now(),
        r = solveIncrementalSchedule(p),
        ms = performance.now() - t,
        a = auditVocationalMax(p, r.rows);
      times.push(ms);
      audits.push(a);
      lastRows = r.rows.length;
      if (r.complete && r.failed === 0 && a.hard === 0 && a.unplaced === 0) feasible++;
      if (i === 0) {
        const replay = solveIncrementalSchedule(makeVocationalMaxProblem(profile, seeds[i]!));
        deterministic =
          JSON.stringify(stable(r.rows)) === JSON.stringify(stable(replay.rows)) &&
          JSON.stringify(r.score) === JSON.stringify(replay.score);
      }
    }
    results.push({
      profile_id: profile.id,
      runs: seedCount,
      assignments: assignmentCount,
      scheduled_rows: lastRows,
      feasible_rate: feasible / seedCount,
      hard_max: Math.max(...audits.map((a) => a.hard)),
      unplaced_max: Math.max(...audits.map((a) => a.unplaced)),
      amp_atp_mesem_identity: audits.every((a) => a.program_identity),
      general_and_vocational_mix: audits.every((a) => a.general_and_vocational),
      split_and_unsplit: audits.every((a) => a.split_and_unsplit),
      split_synchronization: audits.every((a) => a.split_sync),
      workshop_pool_capacity: audits.every((a) => a.workshop_pool_capacity),
      pooled_parallel_use: audits.every((a) => a.pooled_parallel_use),
      maintenance_exclusion: audits.every((a) => a.maintenance_exclusion),
      coordination_area_eligibility: audits.every((a) => a.coordination_area_eligibility),
      coordination_enterprise_alignment: audits.every((a) => a.coordination_enterprise_alignment),
      coordination_exclusion: audits.every((a) => a.coordination_exclusion),
      workplace_day_exclusion: audits.every((a) => a.workplace_day_exclusion),
      locked_edge_slots: audits.every((a) => a.locked_edge_slots),
      music_monday_first: audits.every((a) => a.music_monday_first),
      physical_education_friday_last: audits.every((a) => a.physical_education_friday_last),
      cross_program_teacher: audits.every((a) => a.cross_program_teacher),
      general_culture_soft_preferences: audits.every(
        (a) => a.soft_policy_count >= profile.classes * 2,
      ),
      atomic_blocks: audits.every((a) => a.atomic),
      deterministic_replay: deterministic,
      runtime_p50_ms: Math.round(pct(times, 0.5)),
      runtime_p95_ms: Math.round(pct(times, 0.95)),
      runtime_max_ms: Math.round(Math.max(...times)),
      budget_pass: times.every((ms) => ms <= manifest.wall_clock_budget_ms),
    });
  }
  const impossible_cases = makeVocationalImpossibleCases().map((x) => {
    const r = solveIncrementalSchedule(x.problem);
    return {
      case_id: x.case_id,
      failed: r.failed,
      complete: r.complete,
      fail_closed: !r.complete && r.failed > 0,
    };
  });
  return {
    schema: manifest.schema,
    generated_at: new Date().toISOString(),
    seed_count: seedCount,
    provenance: manifest.provenance,
    institution_code: manifest.institution_code,
    wall_clock_budget_ms: manifest.wall_clock_budget_ms,
    hardware: {
      platform: process.platform,
      arch: process.arch,
      cpu: os.cpus()[0]?.model ?? "unknown",
      logical_cpus: os.cpus().length,
      runtime: typeof Bun !== "undefined" ? `bun-${Bun.version}` : `node-${process.version}`,
    },
    impossible_cases,
    results,
  };
}

export function assertVocationalMaxGate(r: Report, minSeeds = manifest.seed_count) {
  if (
    r.seed_count < minSeeds ||
    r.results.length !== manifest.profiles.length ||
    r.impossible_cases.length !== manifest.impossible_cases.length ||
    !r.impossible_cases.every((x) => x.fail_closed)
  )
    throw new Error("VOCATIONAL_MAX_CORPUS_SHAPE_OR_IMPOSSIBLE_GATE_FAILED");
  for (const x of r.results)
    if (
      x.runs < minSeeds ||
      x.assignments < 144 ||
      x.feasible_rate !== 1 ||
      x.hard_max !== 0 ||
      x.unplaced_max !== 0 ||
      !x.amp_atp_mesem_identity ||
      !x.general_and_vocational_mix ||
      !x.split_and_unsplit ||
      !x.split_synchronization ||
      !x.workshop_pool_capacity ||
      !x.pooled_parallel_use ||
      !x.maintenance_exclusion ||
      !x.coordination_area_eligibility ||
      !x.coordination_enterprise_alignment ||
      !x.coordination_exclusion ||
      !x.workplace_day_exclusion ||
      !x.locked_edge_slots ||
      !x.music_monday_first ||
      !x.physical_education_friday_last ||
      !x.cross_program_teacher ||
      !x.general_culture_soft_preferences ||
      !x.atomic_blocks ||
      !x.deterministic_replay ||
      !x.budget_pass
    )
      throw new Error(`VOCATIONAL_MAX_CORPUS_GATE_FAILED:${x.profile_id}`);
}

if (import.meta.main) {
  const args = process.argv.slice(2),
    oi = args.indexOf("--out"),
    si = args.indexOf("--seeds"),
    out = oi >= 0 ? args[oi + 1] : null,
    seeds = si >= 0 ? Number(args[si + 1]) : manifest.seed_count;
  if (!Number.isInteger(seeds) || seeds < 1) throw new Error("--seeds must be a positive integer");
  const report = await runVocationalMaxCorpus(seeds);
  console.log("SCHEDULE_VOCATIONAL_MAX_COMPLEX", JSON.stringify(report));
  if (out) await writeFile(out, JSON.stringify(report, null, 2));
  assertVocationalMaxGate(report, manifest.seed_count);
}
