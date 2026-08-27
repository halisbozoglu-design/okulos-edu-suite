# OkulOS World Benchmark V1

This package is evidence, not marketing. A solver is compared only when it consumes the same normalized instance hash, receives the same wall-clock budget, runs on the recorded hardware class, and returns the same result schema. Missing external binaries/licenses are reported as `NOT_RUN`; they are never replaced by estimates.

## Required external adapter input
JSON: `{schema,input_hash,profile_id,seed,wall_clock_budget_ms,problem}`. `problem` is the normalized OkulOS timetable instance. Adapters must not relax HARD rules or invent missing qualification/capacity/time data.

## Required result JSON
`{solver_id,input_hash,profile_id,seed,status,feasible,hard,unplaced,medium,soft,runtime_ms,time_to_first_feasible_ms,time_to_best_ms,peak_memory_mb,rows,diagnostics}`.

`status` is one of `COMPLETED`, `TIMEOUT`, `UNSUPPORTED`, `ERROR`, `NOT_RUN`. Unsupported semantics must be listed in `diagnostics.unsupported`; an `UNSUPPORTED` run cannot be counted as a feasible full-model comparison.

## Fairness rules
- Same input SHA-256 per profile/seed.
- Same wall-clock budget.
- Record OS/runtime/CPU and solver version.
- At least 30 deterministic seeds for stochastic solvers.
- CP-SAT exact/bound evidence is reported separately from heuristic runtime rankings.
- Report feasible rate, HARD, unplaced, objective vector, runtime p50/p95, time-to-first-feasible, time-to-best, memory and replay.
- No superiority claim is allowed from `NOT_RUN`, incompatible or unsupported rows.

## Profiles
The manifest includes synthetic small/medium/large/dense plus MEB-oriented MTAL and MESEM structural profiles. Anonymized real/ITC inputs can be added only as versioned fixtures with provenance and privacy review; absence of such a fixture must remain explicit rather than synthesized and labeled “real”.
