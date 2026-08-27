# OkulOS World Benchmark V1

This package is evidence, not marketing. A solver is compared only when it consumes the same normalized instance hash, receives the same wall-clock budget, runs on the recorded hardware class, and returns the same result schema. Missing external binaries/licenses are reported as `NOT_RUN`; they are never replaced by estimates.

## Project-native evidence
The benchmark result is stored in the repository instead of relying on chat output.

- Canonical manifest: `benchmarks/world/manifest.json`
- Current frozen OkulOS baseline: `benchmarks/world/baseline-20260827.json`
- Frozen external same-runner evidence: `benchmarks/world/external-same-runner-20260827.json`
- Capability/parity truth matrix: `benchmarks/world/capability-matrix.json`
- Runner: `tools/schedule_world_benchmark.ts`
- Regression contract: `tests/schedule-world-benchmark-package.test.ts`
- CI also uploads per-commit benchmark artifacts.

A new benchmark run must create a new versioned evidence file; historical evidence is not overwritten.

## Required external adapter input
JSON: `{schema,input_hash,profile_id,seed,wall_clock_budget_ms,problem}`. `problem` is the normalized OkulOS timetable instance. Adapters must not relax HARD rules or invent missing qualification/capacity/time data.

## Required result JSON
`{solver_id,input_hash,profile_id,seed,status,feasible,hard,unplaced,medium,soft,runtime_ms,time_to_first_feasible_ms,time_to_best_ms,peak_memory_mb,rows,diagnostics}`.

`status` is one of `COMPLETED`, `TIMEOUT`, `UNSUPPORTED`, `ERROR`, `NOT_RUN`. Unsupported semantics must be listed in `diagnostics.unsupported`; an `UNSUPPORTED` run cannot be counted as a feasible full-model comparison.

## External same-runner evidence
Workflow `33102654560`, head `c9413f02b5f9e3ad0e56a9c7132876de37e9d141`, artifact `9659256457` executed FET 6.8.5, Timefold 2.5.0 and official UniTime CPSolver `3abbcaaf26d739d25e45c8e191b7ef94bc15cc26` on the same AMD EPYC 9V74 / 4 logical CPU Linux runner. Each executable ran six profiles × 30 seeds = 180 runs. All 540 external runs were feasible with canonical independent HARD audit `hard=0`, `unplaced=0`, deterministic replay and budget pass.

This evidence is deliberately `COMMON_HARD_ONLY`. External adapters are not proven to optimize the identical canonical MEDIUM/SOFT objective, so `objective_comparable=false` and runtime/objective values are not a superiority ranking. aSc remains `NOT_RUN`: official XML import/export exists, but no verified repeatable headless/CLI generation entrypoint is recorded. Manual GUI generation is not accepted as same-runner evidence.

## Fairness rules
- Same input SHA-256 per profile/seed.
- Same wall-clock budget.
- Record OS/runtime/CPU and solver version.
- At least 30 deterministic seeds for stochastic solvers.
- CP-SAT exact/bound evidence is reported separately from heuristic runtime rankings.
- Report feasible rate, HARD, unplaced, objective vector, runtime p50/p95, time-to-first-feasible, time-to-best, memory and replay.
- `RUN_COMMON_HARD` means the executable really ran but does not imply objective comparability.
- `RUN_COMPARABLE` is required before an external engine can satisfy the superiority gate.
- No parity/superiority claim is allowed from `NOT_RUN`, incompatible, unsupported or objective-incomparable evidence.

## Profiles
The manifest includes synthetic small/medium/large/dense plus MEB-oriented MTAL and MESEM structural profiles. Anonymized real/ITC inputs can be added only as versioned fixtures with provenance and privacy review; absence of such a fixture must remain explicit rather than synthesized and labeled “real”.
