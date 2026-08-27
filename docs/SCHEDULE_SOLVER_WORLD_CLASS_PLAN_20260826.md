# OkulOS Ders Programı Motoru — World-Class Execution Plan

Tarih: 2026-08-26  
Durum: authoritative

## Çalışma kuralı
Bir bölüm Cloud/veri, solver, canonical validator/score, UI/rapor, test/benchmark, CI ve handoff tamamlanmadan CLOSED değildir. Uygulanmış migration değiştirilmez; küçük forward-only migration eklenir. Production DB Lovable Cloud PostgreSQL'dir; Lovable AI/chat kullanılmaz. HARD kural sessiz gevşetilmez; bilinmeyen veri tahmin edilmez.

## Bölüm sırası
1. Student conflict — **CLOSED 2026-08-26**
2. Block + LNS — **CLOSED 2026-08-26**
3. Deep ejection-chain — **CLOSED 2026-08-26**
4. Generic constraint parity — **CLOSED 2026-08-26**
5. Room/building parity — **CLOSED 2026-08-26**
6. Student sectioning — **CLOSED 2026-08-27**
7. Substitution — **CLOSED 2026-08-27**
8. Canonical time model — **CLOSED 2026-08-27**
9. Incremental score & large-school performance — **CLOSED 2026-08-27**
10. Adaptive/elite solver — **CLOSED 2026-08-27**
11. Hybrid compute closure — **CLOSED 2026-08-27**
12. CP-SAT exact oracle — **CLOSED 2026-08-27**
13. World benchmark package — **CLOSED 2026-08-27**
14. Release/explainability — **CLOSED 2026-08-27**
15. Final parity + superiority gate — **ACTIVE / PARTIAL 2026-08-28**

## 1 — Student conflict — CLOSED
MEDIUM objective; PRIMARY > ALTERNATIVE > SUBSTITUTE. Canonical Cloud report/summary/score; local/server parity. Migrations `20260826124000`, `20260826124100`.

## 2 — Block + LNS — CLOSED
Atomic `[2]`, `[2,2]`, `[3]`, `[2,1]`; move/swap/LNS blocks cannot split. Neighborhoods teacher-day, class-day, course-block, hotspot, low-quality, random-small. Lexicographic acceptance. Migrations `20260826164500`, `20260826165500`, `20260826170500`.

## 3 — Deep ejection-chain — CLOSED
Depth 3–5, bounded expansion/cycle prevention, resource-aware blockers, atomic batch preview/apply, restore point. UI `/schedule-ejection-chain`; CI `32993983161`.

## 4 — Generic constraint parity — CLOSED
İlk closure 26 canonical relation type ile tamamlandı; Section 15 parity genişletmesiyle ontology 40 native relation type + `activity_tag` selector seviyesine çıktı. HARD/MEDIUM/SOFT/OFF; unary/binary/set. Objective HARD → unplaced → MEDIUM → SOFT → legacy. UI `/schedule-rules-relations`; migrations `20260826231000`, `20260826233000`, `20260826234000`; CI `33010428054`.

## 5 — Room/building parity — CLOSED
Building/floor, break/travel, room pools; pool is shared/virtual-room authority. HARD capacity/features/collision/pool/transfer; SOFT room/building preference/capacity waste. Migrations `20260826235000`, `20260826235500`; CI `33014655258`.

## 6 — Student sectioning — CLOSED
PRIMARY/ALTERNATIVE/SUBSTITUTE; HOME_CLASS/OFFERING/CROSS_CLASS. Single candidate authority, online sectioning, fail-first batch, conflict repair, capacity lock, explanations. UI `/student-sectioning`; migration `20260827000500`; CI `33015602242`, docs `33019041990`.

## 7 — Substitution — CLOSED
Weekly schedule immutable; daily COVER/MOVE/SWAP/CANCEL/CREATE/SPLIT/JOIN overlay. Exact absence IDs, qualification/availability/fairness/building checks, direct+chain cover, atomic HARD audit/revert, delegated `substitutes.manage`. UI `/substitutes`; migrations `20260827002000`, `20260827002500`, `20260827003000`; CI `33020382676`, docs `33020566641`.

## 8 — Canonical time model — CLOSED
Sessions + period definitions, 1–24 canonical slots + local period; ALL/ODD/EVEN + term/date + parity anchor; academic calendar and slot overrides. Current/scenario/generator/local solver/student conflict/room/substitution share temporal semantics. Unknown clocks are never invented. UI `/schedule-time-model`, `/schedule-time-overrides`; migrations `20260827010000`, `20260827010500`, `20260827011000`; CI `33027244816`, docs `33027372638`.

## 9 — Incremental score & large-school performance — CLOSED
Single incremental worker. `ScheduleHotspotIndex` covers slot/resource/activity/student adjacency. `IncrementalScheduleScore` maintains student conflict, teacher/class gap and late-period deltas; relation dirty-cache still delegates semantics to canonical evaluator. Migration `20260827012000_schedule_performance_indexes_v1.sql`; Lovable Cloud 4/4 performance indexes present. Timetable uses O(1) slot map + offscreen containment.

Benchmark: 120 classes / 240 assignments / 5 seeds, 5/5 feasible. Closure p50 1802 ms, p95 1914 ms; latest Section 10 regression p50 1972 ms, p95 2129 ms, heap delta 0 MB. Gates: p95 <8000 ms, heap <256 MB, deterministic replay and linear index memory. CI `33032437412`, docs `33032882894`.

## 10 — Adaptive/elite solver — CLOSED
Adaptive/elite is outer orchestration only; canonical inner worker remains `solveIncrementalSchedule`. UCB strategy selection, elite diversity, deterministic path relinking/restart, persisted tenant telemetry and replay-safe base seeds are closed. Migration `20260827013000_schedule_adaptive_solver_v1.sql`; UI `/schedule-adaptive-health`; final code CI `33057237956`.

## 11 — Hybrid compute closure — CLOSED
V2 jobs carry budget/deadline/base seed; worker routing is heartbeat/load/capacity aware; leases, stale reaping, GPU→CPU fallback, duplicate/stale raw result handling and canonical server audit are closed. External worker payload preserves Sections 4/6/8 semantics. Migration `20260827014000_schedule_hybrid_compute_v2.sql`; UI `/schedule-hybrid-health`; CI `33076987315`.

## 12 — CP-SAT exact oracle — CLOSED
`tools/schedule_cpsat_oracle.py` uses pinned OR-Tools CP-SAT as a verification oracle, never as publishing authority. Normalized export preserves time scope, locks, HARD unavailability, relations and student-conflict weights; unsupported HARD semantics are explicit `UNSUPPORTED`. Migrations `20260827015000_schedule_cpsat_oracle_v1.sql`, `20260827015100_schedule_cpsat_oracle_health_v1.sql`; UI `/schedule-exact-oracle`; CI `33082890598`.

## 13 — World benchmark package — CLOSED

### Fair benchmark contract
`benchmarks/world/manifest.json` defines `OKULOS_WORLD_BENCHMARK_V1`, 30 seeds, an 8000 ms per-solve wall-clock budget and six structural profiles: synthetic small/medium/large/dense plus MEB-oriented MTAL and MESEM. `benchmarks/world/README.md` defines one adapter/result contract for all engines: same normalized input SHA-256, same budget, recorded hardware/runtime, explicit solver status and common feasibility/objective/runtime/memory/replay fields. Unsupported or unavailable engines are never replaced with estimates.

### Project-native evidence
Benchmark evidence is versioned inside the project. Canonical frozen baseline: `benchmarks/world/baseline-20260827.json`. CI additionally uploads `schedule-world-benchmark-<sha>.json`; CI artifacts are supplemental, not the sole source of truth. Historical baseline files are immutable evidence and new measurements receive a new versioned file.

### Runner / baseline
`tools/schedule_world_benchmark.ts` runs the canonical incremental OkulOS solver on every profile. CI `33086715135`, head `94368a072739d85cd6a59571948220610aabf6a1`, executed six profiles × 30 seeds = 180 real OkulOS solves on AMD EPYC 7763 / 4 logical CPUs / Linux x64 / Bun 1.4.0. All runs were feasible with HARD=0, unplaced=0 and deterministic replay; runtime p95: small 36 ms, medium 89 ms, large 498 ms, dense 329 ms, MTAL 312 ms, MESEM 116 ms. Same CI ran the real CP-SAT gate: OPTIMAL, objective=bound=0, gap=0, 17 ms. Artifact ID `9652532614`; structured baseline is `benchmarks/world/baseline-20260827.json`.

### Competitor truth boundary — updated 2026-08-28
External execution is no longer entirely `NOT_RUN`. Real same-runner workflow `33102654560`, artifact `9659256457`, executed FET 6.8.5, Timefold 2.5.0 and official UniTime CPSolver pinned at `3abbcaaf26d739d25e45c8e191b7ef94bc15cc26` on the same GitHub runner over six profiles × 30 seeds each = 540 external solves. All three common-HARD adapters produced feasible_rate=1, HARD=0, unplaced=0, deterministic replay and budget pass after independent canonical HARD audit/post-score. Timefold `allowed_periods` HARD mapping was subsequently fixed and same-runner workflow `33104802601` passed fully. Frozen evidence: `benchmarks/world/external-same-runner-20260827.json`.

These three competitors remain `RUN_COMMON_HARD`, not `RUN_COMPARABLE`: their external objective mappings are not identical to OkulOS HARD → unplaced → MEDIUM → SOFT optimization, so runtime/post-score evidence is not a superiority result. aSc remains `NOT_RUN`; no documented repeatable headless/CLI generation entrypoint has been verified. A conservative aSc 2012 XML input adapter now exports benchmark periods/teachers/classes/subjects/lessons, ALL/ODD/EVEN week codes and documented unscoped teacher time-off, but reports `INPUT_PARTIAL` because teacher daily/consecutive XML mapping, scoped time-off/generic relations and actual executable generation remain unverified. Synthetic MTAL/MESEM are structural profiles, not anonymized real-school data.

Therefore Section 13 remains closed as the reproducible benchmark package; Section 15 alone owns parity/superiority closure. No superiority claim is permitted from common-HARD evidence.

Reopen for seed count <30, input-hash drift, budget mismatch, missing hardware provenance, replay failure, project baseline loss, fabricated competitor rows, or a claimed real/ITC row without provenance.

## 14 — Release/explainability — CLOSED
Canonical explainability yeni bir solver/constraint authority oluşturmaz. `/schedule-scenario-comparison` objective vektörünü `get_schedule_scenario_objective_vector_v1`, nedenleri `schedule_scenario_explanations`, müdahaleleri `schedule_repair_suggestions` üzerinden tüketir; Why here, Why not, HARD/unplaced/MEDIUM/SOFT objective delta, root cause ve intervention count operatöre görünürdür. `/schedule-archive` canonical `get_schedule_integrity_report` + `publish_current_schedule` yayın kapısını korur; publication history hash/revision/zaman kanıtı ve restore-point zinciri audit/geri dönüşü sağlar. Frozen world benchmark baseline ve CI artifact kimliği release yüzünde görünür; çalıştırılmamış rakipler NOT_RUN kalır.

Regression guard: `tests/schedule-release-explainability.test.ts`. Kod CI `33094479926`: unit/regression, CP-SAT, 30-seed world benchmark, artifact upload, migration/authority guards, production build, route tree, TypeScript ve forward migration policy SUCCESS. Section 14 yeni migration gerektirmedi; mevcut canonical Lovable Cloud veri/validator otoritesi yeniden kullanıldı. Handoff: `docs/SCHEDULE_RELEASE_EXPLAINABILITY_HANDOFF_20260827.md`.

Reopen if frontend invents an independent score/rule authority, server publish/integrity gate can be bypassed, restore/publication audit evidence is lost, objective order drifts, explainability stops consuming canonical server evidence, or release benchmark/regression gates are removed.

## 15 — Final parity + superiority gate — ACTIVE / PARTIAL
Competitor capability matrix row-by-row PASS/PARTIAL/FAIL. Unresolved FAIL/PARTIAL prevents parity closure. “World's best” is allowed only after common benchmarks show 0 HARD, equal/higher feasible rate and Pareto superiority or statistical equivalence under equal budgets, plus independently demonstrated MEB/MTAL/MESEM product advantage.

### Completed internal/product parity work
- Internal capability rows are PASS except the external competitor-benchmark row. Construction breadth includes first-fit/FFD/cheapest/regret/fail-first; relation ontology now covers 40 native long-tail types + `activity_tag`; time+room is solved jointly.
- aSc product/UX review is tracked in `docs/SCHEDULE_ASC_PRODUCT_PARITY_20260827.md`. Constraint Pressure Advisor, Generation Bottleneck Analyzer, Diagnostic Ladder, soft Time-map, Rule Isolation Test and operator-oriented relation language were added without weakening canonical HARD authority.
- Generation effort presets expose Hızlı / Dengeli / Derin search budgets while leaving the canonical constraint set unchanged.
- Student sectioning UX explicitly distinguishes timetable-only, sectioning-only and a truthful two-phase timetable+sectioning workflow; the two-phase path is not mislabeled as a joint optimizer.
- Manual move/swap relation-quality preview is server-side and advisory: existing HARD preview runs first, then canonical generic relation MEDIUM/SOFT before/after delta is measured inside a rollback-only subtransaction. Migration `20260828010000_schedule_manual_relation_quality_preview_v1.sql`; no HARD override is possible.
- aSc-inspired compiled relation dispatch has exact-score parity tests and only preselects potentially relevant canonical relations; `evaluateCandidateRelations` remains the final relation scorer. It is not yet production-integrated and no speedup claim is allowed before benchmark evidence.
- GPU candidate ranking was corrected so GPU cannot scalarize/override lexicographic authority; it only emits a monotonic MEDIUM key for complete HARD=0/unplaced=0 candidates, while canonical CPU `byScore` remains the final MEDIUM → SOFT authority.
- Room/building issue explainer and relation operator-language helpers are explanation-only layers, not feasibility authorities.
- Conservative aSc XML input export is `INPUT_PARTIAL`; executable benchmark status stays `NOT_RUN`.
- Latest source chain including these guards passed CI `33125340878`: unit/regression, CP-SAT, 30-seed world benchmark, parity truth gate, migration/replay/tenant/auth/route guards, production build, route tree, TypeScript and forward migration policy all SUCCESS.

### Remaining closure blockers
1. **aSc executable evidence:** actual reproducible generator execution is still `NOT_RUN`. Windows GUI automation / supported automation entrypoint must run the real aSc generator; XML input preparation alone is not execution evidence.
2. **Identical external objective:** FET/Timefold/UniTime remain `RUN_COMMON_HARD`; they must become `RUN_COMPARABLE` only if the same HARD → unplaced → MEDIUM → SOFT contract is genuinely mapped and optimized under equal budgets. Common-HARD post-score cannot unlock superiority.
3. **Final statistics:** after comparable execution, require 0 HARD, equal/higher feasible rate, deterministic/provenanced runs, and Pareto superiority or statistical equivalence. Product advantage for MEB/MTAL/MESEM must be independently demonstrated rather than inferred from benchmark runtime.

Until all three blockers close: `parity_pass=false`, `superiority_claim_allowed=false`, competitor-benchmark remains PARTIAL and Section 15 MUST NOT be marked CLOSED.
