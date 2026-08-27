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
13. World benchmark package — **NEXT**
14. Release/explainability
15. Final parity + superiority gate

## 1 — Student conflict — CLOSED
MEDIUM objective; PRIMARY > ALTERNATIVE > SUBSTITUTE. Canonical Cloud report/summary/score; local/server parity. Migrations `20260826124000`, `20260826124100`.

## 2 — Block + LNS — CLOSED
Atomic `[2]`, `[2,2]`, `[3]`, `[2,1]`; move/swap/LNS blocks cannot split. Neighborhoods teacher-day, class-day, course-block, hotspot, low-quality, random-small. Lexicographic acceptance. Migrations `20260826164500`, `20260826165500`, `20260826170500`.

## 3 — Deep ejection-chain — CLOSED
Depth 3–5, bounded expansion/cycle prevention, resource-aware blockers, atomic batch preview/apply, restore point. UI `/schedule-ejection-chain`; CI `32993983161`.

## 4 — Generic constraint parity — CLOSED
26 canonical relation types; HARD/MEDIUM/SOFT/OFF; unary/binary/set. Objective HARD → unplaced → MEDIUM → SOFT → legacy. UI `/schedule-rules-relations`; migrations `20260826231000`, `20260826233000`, `20260826234000`; CI `33010428054`.

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

### Architecture
Adaptive/elite is outer orchestration only. Canonical inner worker remains `schedule-local-solver-worker.ts` → `solveIncrementalSchedule`; there is no second constraint/score engine. Sections 8–9 semantics stay authoritative. A duplicate worker-level adaptive wrapper created during development was removed before closure so adaptive choice has one authority only: `schedule-local-solver.ts` + `schedule-adaptive-elite.ts`.

### Contextual operator learning
Arms: LATE_ACCEPTANCE, TABU, SIMULATED_ANNEALING, GREAT_DELUGE, VND. `adaptiveContextKey` classifies SMALL/MEDIUM/LARGE × SPARSE/MIXED/DENSE. `chooseAdaptiveStrategies` applies UCB exploration/exploitation over persisted attempts/reward instead of fixed AUTO ordering. Telemetry learns candidate performance only; it cannot alter HARD rules.

### Elite / diversity / relinking / restart
`selectElite` admits only complete HARD=0 candidates and prevents near-duplicate pool collapse with assignment-placement Jaccard diversity. `mostDiverseGuide` selects a distant elite. `buildRelinkProblem` transfers whole assignment genes using deterministic seed; original manually locked assignments cannot become relink genes. `normalizeRelinkCandidate` removes synthetic relink locks so only true manual locks remain. Low elite/score diversity triggers a higher-exploration deterministic restart.

### Reproducibility
`runLocalScheduleSolve` accepts optional explicit base seed. Attempt seeds are deterministically derived, parallel results are stored by attempt index rather than worker completion order, UCB planning is deterministic for the same priors/context, and the same relink seed reproduces the same relink problem and canonical solve result.

### Lovable Cloud telemetry
Forward migration `20260827013000_schedule_adaptive_solver_v1.sql`. `schedule_solver_operator_telemetry` stores tenant/context/strategy attempts, wins and reward sum. RPCs: `get_schedule_solver_operator_priors_v1(text)` and `record_schedule_solver_operator_telemetry_v1(text,jsonb)`. Production smoke confirms table + both RPCs. No fake learning data was inserted.

### UI / regression / benchmark
UI `/schedule-adaptive-health` belongs to `/schedule` feature family and displays context, strategy, attempts, wins, win-rate, average reward and update time, with visible HARD-safety explanation. `tests/schedule-adaptive-elite.test.ts` covers UCB learning, elite diversity, deterministic relink replay, manual-lock normalization, telemetry aggregation, UI contract and feasibility across all five arms. `tests/schedule-adaptive-elite-benchmark.test.ts` benchmarks the same canonical helper/orchestrator semantics rather than a second solver.

Final canonical benchmark: 32 classes / 64 assignments / 3 runs, adaptive source pool feasible and baseline-safe, p95 878 ms (<12000 ms gate). Same CI reran Section 9 large-school gate: 120 classes / 240 assignments / 5 seeds, 5/5 feasible, p50 1972 ms, p95 2129 ms, heap delta 0 MB. Final code head `047225888d65f40cc97855c8839bd15a5f628683`; CI `33057237956` SUCCESS including regression, migration/replay, tenant/route/authority guards, production build, route tree, TypeScript and forward migration policy.

Reopen only for replay drift, telemetry tenant leak, elite diversity collapse, relink HARD/manual-lock leakage, restart nondeterminism, duplicate adaptive authority or Section 9 gate regression.

---

## 11 — Hybrid compute closure — CLOSED

### V2 job / resource authority
Forward-only migration `20260827014000_schedule_hybrid_compute_v2.sql` adds explicit `budget_ms`, `deadline_at`, `base_seed` and cancellation reason to solve jobs plus result fingerprint/audit state to attempts. `get_schedule_compute_capabilities_v2` routes by health, heartbeat freshness, free parallel slots, load ratio, latency and priority. `plan_schedule_solve_job_v2` enforces a 5s–300s budget and deterministically derives attempt seeds from the supplied base seed.

### Lease / heartbeat / failover
External CPU/GPU attempts use a real `lease_until`. `heartbeat_schedule_worker_attempt_v2` can renew a lease only up to the job deadline. `reap_stale_schedule_worker_attempts_v2` handles expired deadlines, expired leases and stale worker heartbeats; it prefers the same worker type and supports GPU→CPU fallback without silently extending the job budget. Client timeout explicitly invokes `cancel_schedule_solve_job_v2`, so abandoned jobs are not left running.

### Canonical external problem parity
`worker_claim_schedule_attempt_v2` exports the same scheduling semantics used by Sections 4/6/8: ALL/ODD/EVEN, date/term/session and allowed canonical periods, planning relations, student-conflict weights, locked rows, unavailability, teacher constraints and course rules. External compute is therefore no longer optimizing a legacy subset of the timetable problem.

### Raw-result acceptance authority
External workers submit only raw `rows`; a worker-provided scenario ID is not an authority. `worker_complete_schedule_attempt_v2` rejects expired submissions, fingerprints results and marks duplicates. `accept_schedule_worker_result_v2` is tenant-scoped and idempotent; it imports the raw candidate through `import_local_schedule_candidate_v1`, then requires canonical server `schedule_scenario_status_v2` to report applicable=true, HARD=0, unplaced=0 and room issues=0 before marking the attempt ACCEPTED. Late, duplicate and rejected results keep explicit audit state and diagnostics.

### Client / UI / health
`src/lib/schedule-remote-accelerator.ts` uses only V2 capability, planning, status, acceptance and cancellation RPCs; it no longer reads attempt tables directly or calls V1 result acceptance. UI `/schedule-hybrid-health` belongs to `/schedule` and exposes heartbeat freshness, available slots, load, lease, latency and tenant health counters with the canonical acceptance chain shown to the operator.

### Regression / production smoke / CI
Regression `tests/schedule-hybrid-compute-v2.test.ts` locks budget/seed, load-aware routing, lease/failover, Section 4/6/8 payload parity, fingerprint/dedup, canonical audit, V2-only client and health UI. Production Lovable Cloud smoke: solve-job V2 columns 4/4, attempt audit columns 3/3, V2 functions 10/10; no fake V2 jobs were created. Final code head `7dba12fd8240c3782398ae056e66b1e45139e71e`; CI `33076987315` SUCCESS including regression, migration/replay, tenant/route/authority guards, production build, generated route tree, TypeScript and forward migration policy.

Reopen only for tenant leakage, expired lease acceptance, timeout jobs left active, duplicate raw results accepted twice, external payload losing canonical Section 4/6/8 semantics, worker result bypassing server HARD/room/unplaced audit, or Section 9 performance/replay regression.

---

## 12 — CP-SAT exact oracle — CLOSED

### Role and authority
CP-SAT is a verification oracle, not a second publishing authority. `tools/schedule_cpsat_oracle.py` uses Google OR-Tools CP-SAT to solve the supported normalized submodel exactly/bounded. Any candidate intended for product use still requires OkulOS canonical server audit. The oracle never silently approximates an unsupported HARD rule.

### Canonical normalized export
Forward migrations `20260827015000_schedule_cpsat_oracle_v1.sql` and `20260827015100_schedule_cpsat_oracle_health_v1.sql`. `get_schedule_exact_oracle_problem_v1()` exports tenant-scoped `OKULOS_CP_SAT_ORACLE_V1`: active time profile, assignments with Section 8 time-domain fields, locked rows, HARD teacher unavailability, planning relations, student-conflict weights and canonical objective order. Export is permission-gated with `schedule.generate`.

### Exact supported model and objective
The CP-SAT runner enforces assignment hour count, teacher collision, class collision, allowed canonical periods/session-domain, HARD teacher unavailability and locked placements. It maps student-conflict weights to MEDIUM and supports unary `FORBIDDEN_SLOT` / `PREFERRED_SLOT` selectors over assignment/course/teacher/class. Supported objective is lexicographic MEDIUM → SOFT through a safe integer scale; HARD and placement completeness are constraints rather than penalties. Solver is deterministic for the same input/seed (`num_search_workers=1`).

### Unsupported-constraint truthfulness
Unsupported relation types, `activity_key` selectors, unsupported right selectors, empty slot domains and lock-outside-domain conditions are explicitly reported. If any unsupported item is HARD, public status is `UNSUPPORTED` even if CP-SAT can optimize the remaining submodel; therefore OkulOS never labels a partial HARD model as the full canonical optimum. `full_model_exact` is true only when the normalized instance has no unsupported items.

### Bound / gap / ledger
Runner emits SHA-256 input hash, CP-SAT status, public status, objective, `BestObjectiveBound`, relative gap, wall time, unsupported list, deterministic rows and diagnostics. `schedule_exact_oracle_runs` records tenant-scoped proof metadata through `record_schedule_exact_oracle_result_v1`; RLS is enabled and `/schedule-exact-oracle` reads only permission-gated health/export RPCs. Production smoke: table 1/1, oracle RPCs 3/3, fake production oracle runs 0.

### UI / exact regression / CI
UI `/schedule-exact-oracle` belongs to `/schedule`; it shows canonical export counts and latest status/objective/bound/gap/wall/unsupported evidence, with an explicit warning that CP-SAT is not publishing authority. `tests/fixtures/schedule-cpsat-oracle-small.json` is the supported exact fixture. `tools/test_schedule_cpsat_oracle.py` requires OPTIMAL, gap=0, full-model-exact=true, deterministic replay, exact assignment-hour counts, teacher/class collision freedom, lock preservation, forbidden-slot enforcement and an UNSUPPORTED result after injecting an unsupported HARD relation.

CI installs Python 3.12 + pinned `ortools==9.14.6206` and executes the real CP-SAT gate on every build. Final code head `4eef3f96a28e5e32a9fdaff919be93ea99db0816`; CI `33080513749` SUCCESS including real CP-SAT solve, migrations/replay, tenant/route/authority guards, production build, generated route tree, TypeScript and forward migration policy.

Reopen only for normalized-export drift, unsupported HARD rules being mislabeled exact, nondeterministic replay under the same seed, objective/bound/gap inconsistency, tenant leakage, direct CP-SAT publish bypass, or canonical Section 8/11 semantics disappearing from export.

---

## 13 — World benchmark package — NEXT
Synthetic small/medium/large/dense + MTAL + MESEM + anonymized real + compatible ITC. Compare OkulOS, Timefold, UniTime/ITC-compatible, CP-SAT and fair external FET/aSc where possible. Same input hash/hardware/wall-clock, >=30 seeds; feasible rate, HARD, unplaced, objective vector, conflicts, room/travel, gaps, runtime p50/p95, time-to-first-feasible/time-to-best, memory, replay.

## 14 — Release/explainability
Why here/why not, objective delta, root cause, intervention count, restore/audit, publish gate, benchmark artifact, release regression gate, operator/admin UX, mobile/large-grid.

## 15 — Final parity + superiority gate
Competitor capability matrix row-by-row PASS/PARTIAL/FAIL. Unresolved FAIL/PARTIAL prevents parity closure. “World's best” is allowed only after common benchmarks show 0 HARD, equal/higher feasible rate and Pareto superiority or statistical equivalence under equal budgets, plus independently demonstrated MEB/MTAL/MESEM product advantage.
