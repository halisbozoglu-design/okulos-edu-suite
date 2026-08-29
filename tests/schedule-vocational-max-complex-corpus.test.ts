import { describe, expect, test } from "bun:test";
import { solveIncrementalSchedule } from "../src/lib/schedule-local-solver-incremental-core";
import {
  assertVocationalMaxGate,
  auditVocationalMax,
  makeVocationalImpossibleCases,
  makeVocationalMaxProblem,
  runVocationalMaxCorpus,
} from "../tools/schedule_vocational_max_complex_corpus";
const manifest = await Bun.file("benchmarks/vocational-max-complex/manifest.json").json();
describe("maximum-complexity vocational-school corpus", () => {
  test("is synthetic, large and combines AMP ATP MESEM with whole-school lessons", () => {
    expect(manifest.provenance).toContain("Synthetic");
    expect(manifest.provenance).toContain("no real");
    expect(manifest.profiles).toHaveLength(3);
    for (const profile of manifest.profiles) {
      const p = makeVocationalMaxProblem(profile, 17),
        meta = Object.values(p.vocationalMeta.assignment) as any[];
      expect(p.assignments.length).toBeGreaterThanOrEqual(144);
      expect(new Set(meta.map((x) => x.program))).toEqual(new Set(["AMP", "ATP", "MESEM"]));
      expect(new Set(meta.map((x) => x.kind))).toEqual(new Set(["GENERAL", "VOCATIONAL"]));
      expect(p.assignments.some((a) => a.subgroup_id)).toBe(true);
      expect(p.assignments.some((a) => !a.subgroup_id)).toBe(true);
      const byProgram = new Map<"AMP" | "ATP" | "MESEM", Set<string>>();
      for (const [id, m] of Object.entries(p.vocationalMeta.assignment)) {
        const days = byProgram.get(m.program) ?? new Set<string>();
        days.add(m.workplace_days.join(","));
        byProgram.set(m.program, days);
      }
      expect([...(byProgram.get("MESEM") ?? [])].every((x) => x === "2,3,4,5")).toBe(true);
      expect([...(byProgram.get("ATP") ?? [])]).toEqual([""]);
      expect([...(byProgram.get("AMP") ?? [])]).toContain("1,2,3");
    }
  });
  test("compiles AMP ATP MESEM coordination, workplace, maintenance, pooled workshops, locks and general-culture SOFT wishes", () => {
    for (const profile of manifest.profiles) {
      const p = makeVocationalMaxProblem(profile, 17);
      expect(new Set(p.vocationalMeta.coordinatorDuties.map((x) => x.program))).toEqual(
        new Set(["AMP", "ATP", "MESEM"]),
      );
      for (const d of p.vocationalMeta.coordinatorDuties)
        expect(p.unavailable).toContainEqual({
          teacher_id: d.teacher_id,
          weekday: d.weekday,
          period: d.period,
        });
      for (const d of p.vocationalMeta.coordinatorDuties)
        expect(
          p.vocationalMeta.enterpriseWindows.some(
            (window) =>
              window.enterprise_unit_id === d.enterprise_unit_id &&
              window.program === d.program &&
              window.student_class_id === d.student_class_id &&
              window.weekday === d.weekday &&
              window.periods.includes(d.period),
          ),
        ).toBe(true);
      for (const d of p.vocationalMeta.coordinatorDuties) {
        expect(d.qualification).toBe("SAME_FIELD");
        expect(p.vocationalMeta.coordinatorFields[d.teacher_id]).toContain(d.field_id);
        expect(
          p.assignments.some(
            (assignment) =>
              assignment.class_id === d.student_class_id && assignment.teacher_id === d.teacher_id,
          ),
        ).toBe(false);
      }
      expect(
        p.vocationalMeta.enterpriseWindows.some(
          (window) => window.program === "ATP" && window.source === "EXPLICIT_ASSIGNMENT",
        ),
      ).toBe(true);
      expect(p.courseRules.some((x) => x.prohibited_days?.length)).toBe(true);
      expect(p.roomUnavailable?.length).toBeGreaterThan(0);
      expect(p.rooms?.some((x) => x.room_pool_id && x.max_simultaneous_activities === 2)).toBe(
        true,
      );
      expect(
        p.locked.some((x) => x.assignment_id === "C0-GEN-ART" && x.weekday === 1 && x.period === 1),
      ).toBe(true);
      expect(
        p.locked.some(
          (x) =>
            x.assignment_id === "C1-GEN-ART" && x.weekday === 5 && x.period === profile.periods,
        ),
      ).toBe(true);
      expect(p.assignments.filter((a) => a.preferred_periods?.length).length).toBe(
        profile.classes * 2,
      );
      expect(
        p.planningRelations?.some((x) => x.mode === "HARD" && x.relation_type === "SAME_TIME"),
      ).toBe(true);
    }
  });
  test("one seed per profile is feasible and every HARD family is independently audited", () => {
    for (const profile of manifest.profiles) {
      const p = makeVocationalMaxProblem(profile, 4211),
        r = solveIncrementalSchedule(p),
        a = auditVocationalMax(p, r.rows);
      expect(r.complete, `${profile.id}: failed=${r.failed}, hard=${r.score.hard}`).toBe(true);
      expect(
        {
          hard: a.hard,
          unplaced: a.unplaced,
          program: a.program_identity,
          mix: a.general_and_vocational,
          split: a.split_and_unsplit,
          sync: a.split_sync,
          pool: a.workshop_pool_capacity,
          parallel: a.pooled_parallel_use,
          maintenance: a.maintenance_exclusion,
          coordination_area: a.coordination_area_eligibility,
          coordination_alignment: a.coordination_enterprise_alignment,
          coordination: a.coordination_exclusion,
          workplace: a.workplace_day_exclusion,
          pinned: a.locked_edge_slots,
          music: a.music_monday_first,
          pe: a.physical_education_friday_last,
          cross_program_teacher: a.cross_program_teacher,
          atomic: a.atomic,
        },
        profile.id,
      ).toEqual({
        hard: 0,
        unplaced: 0,
        program: true,
        mix: true,
        split: true,
        sync: true,
        pool: true,
        parallel: true,
        maintenance: true,
        coordination_area: true,
        coordination_alignment: true,
        coordination: true,
        workplace: true,
        pinned: true,
        music: true,
        pe: true,
        cross_program_teacher: true,
        atomic: true,
      });
    }
  }, 60000);
  test("true workshop and coordinator impossibilities fail closed", () => {
    for (const x of makeVocationalImpossibleCases()) {
      const r = solveIncrementalSchedule(x.problem);
      expect(r.complete, x.case_id).toBe(false);
      expect(r.failed, x.case_id).toBeGreaterThan(0);
    }
  });
  test("smoke report is deterministic and gate semantics cannot weaken", async () => {
    const r = await runVocationalMaxCorpus(1);
    expect(r.results.every((x) => x.deterministic_replay)).toBe(true);
    expect(() => assertVocationalMaxGate(r, 1)).not.toThrow();
    expect(() =>
      assertVocationalMaxGate(
        {
          ...r,
          results: [{ ...r.results[0]!, coordination_exclusion: false }, ...r.results.slice(1)],
        },
        1,
      ),
    ).toThrow("VOCATIONAL_MAX_CORPUS_GATE_FAILED");
  }, 120000);
});
