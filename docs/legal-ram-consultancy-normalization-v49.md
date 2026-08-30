# V49 — RAM consultancy normalization manifest

Date: 2026-08-29
Migration: 0

## Durable legal parents
RAM Yönergesi Md.5/4-a is decomposed into atomic operational parents rather than one generic `MUSAVIRLIK` bucket:

- RAM_SCHOOL_PROGRAM_PREP_CONSULTANCY -> Md.5/4-a/1
- RAM_SCHOOL_PROGRAM_REVIEW_FEEDBACK -> Md.5/4-a/2
- RAM_NO_COUNSELOR_GENERAL_LOCAL_TARGET_WORK -> Md.5/4-a/3
- RAM_SCHOOL_VISIT_CONSULTANCY -> Md.5/4-a/4
- RAM_STAKEHOLDER_TRAINING_ACTIVITY -> Md.5/4-a/5
- RAM_NEEDS_ANALYSIS_LOCAL_TARGET_EVALUATION -> Md.5/4-a/6
- RAM_COUNSELOR_YEAR_START_END_MEETINGS -> Md.5/4-a/7
- RAM_YEAR_START_MEETING_PLANNING_GROUPS -> Md.5/4-a/8

## Legacy mapping rules
1. Generic `Resmi/özel okul ve kurumlara yönelik müşavirlik` is never auto-mapped to a/1 or a/4.
2. Visit-only wording is a partial match to a/4; evidence must establish the consultancy action before exact promotion.
3. Program-review wording maps to a/2 only when it includes review/evaluation/feedback semantics and the RAM scope is correct.
4. Calendar month in handbook is not national legal timing unless the current provision itself names that period.
5. Md.5/4-a/7 itself creates two annual phase instances: YEAR_START and YEAR_END.
6. Additional mid-year meetings are allowed operationally but are not a separate nationally mandated event under a/7.
7. Historical completed instances are immutable; corrections apply to future/pending generated work.
8. Wrong scope correction requires staging/Super Admin/publication before a legacy workflow is promoted.

## Correction queue
- HB-0602: PANSİYONLU scope -> RAM/RPD scope; legal parent -> RAM_SCHOOL_PROGRAM_REVIEW_FEEDBACK; exact source -> Md.5/4-a/2; `READY_FOR_SUPERADMIN_CORRECTION`.
- HB-0603: risk-map action remains `ACTION_SCOPE_REWRITE_REQUIRED`; do not infer RAM implementation duty from vague handbook wording.
- HB-0517 / HB-0601: split compound program-review + generic-consultancy actions before binding.

## Duplicate/calendar-instance queue
- HB-0516 -> same first-meeting family as HB-0395; no second ARTICLE_VERIFIED count.
- monthly generic consultancy rows -> calendar instances/legacy aliases pending atomic action recovery.
- visit family -> calendar instances under RAM_SCHOOL_VISIT_CONSULTANCY only after evidence proves consultancy was part of the action.

No schema migration is needed. Implement as catalog/config/versioned legal bindings.
