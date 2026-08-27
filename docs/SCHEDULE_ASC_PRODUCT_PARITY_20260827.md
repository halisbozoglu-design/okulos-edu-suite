# aSc TimeTables → Okulos product parity map — 2026-08-27

Purpose: capture product/workflow capabilities visible in aSc TimeTables help and map them to Okulos without creating duplicate solver authority. This document is a product parity checklist, not a performance claim.

Primary official references:
- https://help.asctimetables.com/index.php?id=947&lang_id=1
- https://help.asctimetables.com/text.php?id=803&lang_id=10
- https://help.asctimetables.com/text.php?id=162&lang_id=1
- https://help.asctimetables.com/text.php?id=930&lang=en
- https://help.asctimetables.com/text.php?id=1183
- https://help.asctimetables.com/text.php?id=1185
- https://help.asctimetables.com/pdf/asc_timetables_en_P1.pdf
- https://help.asctimetables.com/pdf/asc_timetables_en_P2.pdf

Status vocabulary: `PASS` = verified native capability, `ADDED` = added in this aSc review wave, `PARTIAL` = capability exists but operator flow/parity is incomplete, `OPEN` = not yet verified/implemented.

| aSc screen / capability | Okulos status | Current authority / evidence | Product action |
|---|---|---|---|
| Data readiness / Test timetable | PASS | `/schedule-preparation`, `get_schedule_preparation_readiness` | Keep canonical fail-closed preflight. |
| Advisor / Extended tests | ADDED | `schedule-constraint-pressure-advisor.ts`, preparation Advisor panel | Never relax HARD automatically; rank pressure families. |
| Analyze by Generation | ADDED | `schedule-generation-bottleneck-analyzer.ts`, `/schedule-analysis` | Aggregate repeated diagnostics across candidates instead of one card only. |
| Draft generation | PARTIAL | preparation + multi-candidate diagnostics | Do not copy unsafe “disable all constraints”. Add explicit diagnostic profiles only if HARD authority stays intact. |
| Normal / Large / Huge generation complexity | PARTIAL | adaptive portfolio, candidate count, CPU/GPU/Cloud routing | Add operator-facing effort profiles mapped to real budgets/candidate portfolios, not magic labels. |
| Strict generation | PASS | canonical HARD validator + applicable gate | HARD cannot be relaxed for publish/apply. |
| Constraint relaxation | PARTIAL | HARD/MEDIUM/SOFT/OFF ontology and repair suggestions | Okulos should expose only explicit MEDIUM/SOFT relaxation experiments; HARD stays immutable unless user edits rule source. |
| Verification of broken/relaxed constraints | PASS | integrity report, scenario explanations, objective vector, repair suggestions | Improve click-to-focus UI where useful. |
| Subjects | PASS | curriculum/course catalog + course schedule rules | Preserve official MEB source authority. |
| Classes | PASS | classes + canonical assignments | — |
| Teachers | PASS | profiles + teacher assignments + constraints | — |
| Lessons/cards | PASS | `schedule_assignment_options`, teacher_schedule, block patterns | — |
| Multiple teachers on one lesson | PASS/PARTIAL | sync/join/group model exists; verify every UI path | Keep as atomic activity relation, not duplicate lesson rows. |
| Classrooms | PASS | canonical room/building model + joint time-room solver | — |
| Automatic classroom assignment | PASS | joint time-room solver and server room audit | Manual UI should surface missing-room state clearly. |
| Room capacity/type/features | PASS | room parity closure | — |
| Buildings / transfers | PASS | building transfer parity closure | Verify operator visualization by building remains intuitive. |
| Groups & joined classes | PASS | sync groups, subgroups, split/join substitution model | — |
| Bells / breaks | PASS | canonical Section 8 time profile | Never invent clock times. |
| Days / weeks / terms | PASS | canonical ALL/ODD/EVEN/date/term semantics | — |
| Time-off: allowed / question-marked / blocked | PARTIAL | hard `teacher_unavailability` + soft `teacher_schedule_preferences` prefer/avoid | Add aSc-like visible soft time-map colors to manual grid. No new table needed. |
| Advanced card relationships | PASS | canonical planning relation ontology | Continue semantic parity, avoid marketing aliases. |
| Apply relationship to selected teachers/classes/subjects | PASS | scoped rules / relation selectors | Verify per-student scope UI separately. |
| Relationship importance | PASS | HARD/MEDIUM/SOFT/OFF + weights | — |
| Test one card relationship | OPEN | ontology tests exist, no verified operator “test this rule only” flow | Add rule-isolation diagnostic using canonical evaluator, no alternate solver. |
| Locked cards | PASS | manual lock + solver preserve + restore point | Keep warning that unnecessary locks shrink feasibility. |
| Manual drag/drop | PASS | server preview move/swap + HARD validation | Stronger than local-only coloring because server authority decides. |
| Green/blue/red manual placement hints | PARTIAL | blocked/preview green/red exists | Add soft prefer/avoid “blue/question-marked” visualization. |
| Unplaced cards panel | PASS | remaining assignment pool + scenario unplaced items | — |
| Student/course sections | PASS | student sectioning closure | Surface master-only / students-only workflow more explicitly. |
| Generate whole timetable + students | PARTIAL | timetable + sectioning engines both exist | Add explicit orchestration mode after verifying canonical transaction boundary. |
| Generate master timetable only | PASS | current solver | Label clearly in operator flow. |
| Generate students only | PASS/PARTIAL | sectioning engine exists | Add direct route/action from timetable workflow if UI lacks it. |
| Student choices / importance / free time | PASS | sectioning v2 contract | — |
| Substitutions | PASS | substitution v4 closure | Separate daily overlay remains correct architecture. |
| Supervision/duties | OPEN/PARTIAL | separate duty features exist in repo | Do not conflate with timetable until constraint/use-case audit is complete. |
| Import | PASS | CSV/XLSX/e-Okul import regression | XML/aSc import can be added only with explicit schema/provenance. |
| Export / publishing | PASS | publish gate, archive/history, outputs | aSc XML export is useful for competitor interoperability, not canonical storage. |
| Restore/history | PASS | restore points + publication history | Stronger auditability than simple `.roz` workflow. |
| Multi-core CPU generator | PASS | local worker/adaptive portfolio + remote workers | Continue CPU as primary search; GPU as candidate/ranking accelerator. |
| GPU acceleration | Okulos advantage | hybrid compute supports optional GPU reranking/acceleration | Do not imply GPU replaces branch-heavy CPU search. |
| Explain why / why not | Okulos advantage | release explainability closure | Keep canonical server explanations. |
| MEB / MTAL / MESEM native model | Okulos advantage | native curriculum/profile pipeline | Preserve as product/domain advantage, separate from benchmark performance. |

## Immediate implementation queue from this review

1. `ADDED` Constraint Pressure Advisor — done.
2. `ADDED` Generation Bottleneck Analyzer — done.
3. Soft time-map visualization in manual timetable (`prefer / avoid / blocked`).
4. Rule-isolation test action for one planning relation or selected scope.
5. Operator generation effort profiles backed by real candidate/time budgets.
6. Explicit timetable-vs-student-sectioning generation mode orchestration.
7. Missing-room/manual placement visual warning parity.
8. aSc XML interoperability only after schema contract is versioned and tested.

## Safety/authority boundary

- No aSc-inspired diagnostic may silently turn a canonical HARD rule into SOFT/OFF.
- Draft/relaxation experiments, if implemented, must be explicit, non-publishable diagnostic scenarios and must never alter source rules.
- Apply/publish always re-runs canonical server validation.
- No new migration is justified by the first two additions; they consume existing canonical data.
