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
11. Hybrid compute closure — **NEXT**
12. CP-SAT exact oracle
13. World benchmark package
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

Benchmark: 120 classes / 240 assignments / 5 seeds, 5/5 feasible. Closure p50 1802 ms, p95 1914 ms; later adaptive regression p50 1935 ms, p95 2023 ms, heap delta 6 MB. Gates: p95 <8000 ms, heap <256 MB, deterministic replay and linear index memory. CI `33032437412`, docs `33032882894`.

## 10 — Adaptive/elite solver — CLOSED

### Architecture
Adaptive/elite is outer orchestration only. Canonical inner worker remains `schedule-local-solver-worker.ts` → `solveIncrementalSchedule`; there is no second constraint/score engine. Sections 8–9 semantics stay authoritative.

### Contextual operator learning
Arms: LATE_ACCEPTANCE, TABU, SIMULATED_ANNEALING, GREAT_DELUGE, VND. `adaptiveContextKey` classifies SMALL/MEDIUM/LARGE × SPARSE/MIXED/DENSE. `chooseAdaptiveStrategies` applies UCB exploration/exploitation over persisted attempts/reward instead of fixed AUTO ordering. Telemetry learns candidate performance only; it cannot alter HARD rules.

### Elite / diversity / relinking / restart
`selectElite` admits only complete HARD=0 candidates and prevents near-duplicate pool collapse with assignment-placement Jaccard diversity. `mostDiverseGuide` selects a distant elite. `buildRelinkProblem` transfers whole assignment genes using deterministic seed; original manually locked assignments cannot become relink genes. `normalizeRelinkCandidate` removes synthetic relink locks so only true manual locks remain. Low elite/score diversity triggers a higher-exploration deterministic restart.

### Reproducibility
`runLocalScheduleSolve` accepts optional explicit base seed. Attempt seeds are deterministically derived, parallel results are stored by attempt index rather than worker completion order, UCB planning is deterministic for the same priors/context, and the same relink seed reproduces the same relink problem and canonical solve result.

### Lovable Cloud telemetry
Forward migration `20260827013000_schedule_adaptive_solver_v1.sql`. `schedule_solver_operator_telemetry` stores tenant/context/strategy attempts, wins and reward sum. RPCs: `get_schedule_solver_operator_priors_v1(text)` and `record_schedule_solver_operator_telemetry_v1(text,jsonb)`. Production smoke confirms table + both RPCs. Closure row count is 0 because no fake learning data was inserted.

### UI / regression / benchmark
UI `/schedule-adaptive-health` belongs to `/schedule` feature family and displays context, strategy, attempts, wins, win-rate, average reward and update time, with visible HARD-safety explanation. `tests/schedule-adaptive-elite.test.ts` covers UCB learning, elite diversity, deterministic relink replay, manual-lock normalization, telemetry aggregation, UI contract and feasibility across all five arms.

Adaptive core CI `33037753900` SUCCESS. Final UI/replay code CI `33037909733` SUCCESS. The same suite reran the Section 9 large-school gate: 120 classes / 240 assignments / 5 seeds, 5/5 feasible, p50 1935 ms, p95 2023 ms, heap delta 6 MB. Adaptive orchestration did not regress HARD or performance gates.

Reopen only for replay drift, telemetry tenant leak, elite diversity collapse, relink HARD/manual-lock leakage, restart nondeterminism, or Section 9 gate regression.

---

## 11 — Hybrid compute closure — NEXT
DB/browser CPU/WebGPU/external CPU-GPU capability → job budget → candidate race → heartbeat/load → timeout/failover → canonical server audit → duplicate/stale result handling → UI health → tests → CI.

## 12 — CP-SAT exact oracle
Normalized export → same HARD semantics → objective mapping → exact/bound solve on small-medium → optimality gap → regression oracle → unsupported constraint reporting → CI.

## 13 — World benchmark package
Synthetic small/medium/large/dense + MTAL + MESEM + anonymized real + compatible ITC. Compare OkulOS, Timefold, UniTime/ITC-compatible, CP-SAT and fair external FET/aSc where possible. Same input hash/hardware/wall-clock, >=30 seeds; feasible rate, HARD, unplaced, objective vector, conflicts, room/travel, gaps, runtime p50/p95, time-to-first-feasible/time-to-best, memory, replay.

## 14 — Release/explainability
Why here/why not, objective delta, root cause, intervention count, restore/audit, publish gate, benchmark artifact, release regression gate, operator/admin UX, mobile/large-grid.

## 15 — Final parity + superiority gate
Competitor capability matrix row-by-row PASS/PARTIAL/FAIL. Unresolved FAIL/PARTIAL prevents parity closure. “World's best” is allowed only after common benchmarks show 0 HARD, equal/higher feasible rate and Pareto superiority or statistical equivalence under equal budgets, plus independently demonstrated MEB/MTAL/MESEM product advantage.
