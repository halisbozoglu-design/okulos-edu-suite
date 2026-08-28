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
| Draft generation | PARTIAL | preparation + multi-candidate diagnostics + diagnostic ladder | Do not copy unsafe “disable all constraints”. Any relaxation experiment must stay explicit and non-publishable. |
| Normal / Large / Huge generation complexity | PASS | `schedule-generation-effort.ts`, solver effort-profile UI, adaptive portfolio | QUICK/BALANCED/DEEP map to real candidate/LNS/compute settings rather than marketing labels. |
| Strict generation | PASS | canonical HARD validator + applicable gate | HARD cannot be relaxed for publish/apply. |
| Constraint relaxation | PARTIAL | HARD/MEDIUM/SOFT/OFF ontology and repair suggestions | Only explicit MEDIUM/SOFT experiments are acceptable; HARD changes require editing the source rule. |
| Verification of broken/relaxed constraints | PASS | integrity report, scenario explanations, objective vector, repair suggestions | Improve click-to-focus UI where useful. |
| Subjects | PASS | curriculum/course catalog + course schedule rules | Preserve official MEB source authority. |
| Classes | PASS | classes + canonical assignments | — |
| Teachers | PASS | profiles + teacher assignments + constraints | — |
| Lessons/cards | PASS | `schedule_assignment_options`, teacher_schedule, block patterns | — |
| Multiple teachers on one lesson | PASS/PARTIAL | sync/join/group model exists; canonical activity model supports grouped semantics | Continue verifying every operator path; do not duplicate a logical lesson into conflicting rows. |
| Classrooms | PASS | canonical room/building model + joint time-room solver | — |
| Automatic classroom assignment | PASS | joint time-room solver and server room audit | Missing-room reasons are translated for operators without changing server authority. |
| Room capacity/type/features | PASS | room parity closure | — |
| Buildings / transfers | PASS | building transfer parity closure | Verify operator visualization by building remains intuitive. |
| Groups & joined classes | PASS | sync groups, subgroups, split/join substitution model | — |
| Bells / breaks | PASS | canonical Section 8 time profile | Never invent clock times. |
| Days / weeks / terms | PASS | canonical ALL/ODD/EVEN/date/term semantics | — |
| Time-off: allowed / question-marked / blocked | PASS | hard `teacher_unavailability` + soft `teacher_schedule_preferences`; `/schedule` soft time-map | Manual grid shows prefer / avoid / HARD-blocked states; server preview remains decisive. |
| Advanced card relationships | PASS | canonical planning relation ontology + compiled candidate dispatch | Compiled dispatch only pre-filters candidate-relevant rules; canonical evaluator remains final scorer. |
| Apply relationship to selected teachers/classes/subjects | PASS | scoped rules / relation selectors | Verify per-student scope UI separately. |
| Relationship importance | PASS | HARD/MEDIUM/SOFT/OFF + weights | — |
| Test one card relationship | PASS | `schedule-rule-isolation.ts`, `/schedule-rules-relations` isolation action | Isolation is diagnostic only and uses the canonical relation evaluator. |
| Locked cards | PASS | manual lock + solver preserve + restore point | Keep warning that unnecessary locks shrink feasibility. |
| Manual drag/drop | PASS | server preview move/swap + HARD validation + relation quality preview | HARD preview executes first; MEDIUM/SOFT delta is informational. |
| Green/blue/red manual placement hints | PASS | `/schedule` soft time-map plus server HARD preview | Prefer / avoid / blocked / neutral states are visible without weakening HARD. |
| Unplaced cards panel | PASS | remaining assignment pool + scenario unplaced items | — |
| Student/course sections | PASS | student sectioning closure | Keep timetable and student sectioning authority boundaries explicit. |
| Generate whole timetable + students | PARTIAL | explicit `TIMETABLE_AND_SECTIONING` operator mode | Truthfully TWO_PHASE, not a joint solver; do not market as simultaneous optimization. |
| Generate master timetable only | PASS | current solver + `TIMETABLE_ONLY` mode | — |
| Generate students only | PASS | sectioning engine + `SECTIONING_ONLY` mode in student-sectioning UI | — |
| Student choices / importance / free time | PASS | sectioning v2 contract | — |
| Substitutions | PASS | substitution v4 closure | Separate daily overlay remains correct architecture. |
| Supervision/duties | OPEN/PARTIAL | separate duty features exist in repo | Do not conflate with timetable until constraint/use-case audit is complete. |
| Import | PASS | CSV/XLSX/e-Okul import regression | aSc XML import should be added only with explicit schema/provenance if needed. |
| Export / publishing | PASS | publish gate, archive/history, outputs | Conservative aSc XML exporter exists for interoperability; unsupported mappings remain fail-closed. |
| Restore/history | PASS | restore points + publication history | Stronger auditability than simple `.roz` workflow. |
| Multi-core CPU generator | PASS | local worker/adaptive portfolio + remote workers | CPU remains primary branch/search engine; GPU is accelerator only. |
| GPU acceleration | Okulos advantage | optional GPU reranking/acceleration with CPU canonical tie-break | Do not imply GPU replaces branch-heavy CPU search or objective authority. |
| Explain why / why not | Okulos advantage | release explainability closure + pressure/bottleneck/rule-isolation/room explainers | Keep canonical server explanations. |
| MEB / MTAL / MESEM native model | Okulos advantage | native curriculum/profile pipeline | Preserve as product/domain advantage, separate from benchmark performance. |

## Immediate implementation queue from this review

1. `ADDED` Constraint Pressure Advisor — done.
2. `ADDED` Generation Bottleneck Analyzer — done.
3. Soft time-map visualization in manual timetable (`prefer / avoid / blocked`) — done.
4. Rule-isolation test action for one planning relation or selected scope — done.
5. Operator generation effort profiles backed by real candidate/LNS/compute settings — done.
6. Explicit timetable-vs-student-sectioning operation modes — done as truthful two-phase orchestration; joint solving is intentionally not claimed.
7. Missing-room explanation in room-assignment flow — done; any additional manual-grid room warning remains a separate UX improvement, not a parity claim.
8. aSc XML interoperability — conservative exporter exists; teacher daily/consecutive, scoped time-off and generic-relation XML mappings remain unverified and therefore fail-closed.
9. Production relation candidate hot-loop now uses compiled dispatch with canonical-score invariance regression; no runtime speedup percentage is claimed without a dedicated benchmark.

## Remaining product-parity work

- Draft/relaxation UX remains intentionally constrained: no diagnostic may silently relax HARD and no relaxed diagnostic result may be published.
- Timetable + student sectioning remains a truthful two-phase flow, not a joint optimization claim.
- Supervision/duty parity remains unverified and must be audited before any timetable coupling.
- aSc XML mappings listed as unverified remain unsupported until real schema/runtime evidence exists.
- aSc executable benchmark remains separate from this product parity map; without a real executable run it stays `NOT_RUN` in benchmark truth state.

## Safety/authority boundary

- No aSc-inspired diagnostic may silently turn a canonical HARD rule into SOFT/OFF.
- Draft/relaxation experiments, if implemented, must be explicit, non-publishable diagnostic scenarios and must never alter source rules.
- Apply/publish always re-runs canonical server validation.
- Compiled dispatch, GPU acceleration and UI explainers cannot replace or override canonical scoring/server validation.
- No migration is justified by this documentation sync.
