# Timefold World Benchmark Evidence — 2026-08-27

Status: VERIFIED RUN / NOT A SUPERIORITY CLAIM

Run: `33100079055`
Commit: `415720732821816caa68bdc31bc779210826232b`
Timefold Solver: `2.5.0`
Schema: `OKULOS_WORLD_BENCHMARK_V1`
Mapping: `HARD_COMMON_CORE_CANONICAL_POSTSCORE`
Objective comparable: **false**
Hardware: AMD EPYC 7763, 4 logical CPUs
Seeds: 30/profile, 6 profiles = 180 runs

The adapter consumes the canonical external-case NDJSON generated from the same OkulOS world benchmark problem builder. Timefold solves the mapped common HARD core and terminates at the first hard-feasible score (subject to the same 8000 ms per-case budget). Its output is then independently post-scored by the canonical OkulOS incremental scorer.

| profile | feasible | hard max | unplaced max | medium p50 | soft p50 | runtime p50 ms | runtime p95 ms | replay | budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| synthetic-small | 100% | 0 | 0 | 0 | 0 | 39 | 76 | PASS | PASS |
| synthetic-medium | 100% | 0 | 0 | 0 | 32 | 199 | 209 | PASS | PASS |
| synthetic-large | 100% | 0 | 0 | 2 | 32 | 2224 | 2248 | PASS | PASS |
| synthetic-dense | 100% | 0 | 0 | 60 | 240 | 683 | 708 | PASS | PASS |
| mtal | 100% | 0 | 0 | 2 | 144 | 847 | 854 | PASS | PASS |
| mesem | 100% | 0 | 0 | 0 | 32 | 322 | 329 | PASS | PASS |

## Interpretation
- Real Timefold executable evidence exists: PASS.
- Common HARD feasibility is verified across all 180 runs.
- Deterministic replay is verified for the replay sample of every profile.
- Runtime budget passes for every run.
- Medium/soft values are canonical OkulOS post-scores of Timefold output. Timefold was not configured to optimize the complete OkulOS MEDIUM/SOFT objective in this evidence run.
- Therefore this evidence proves external common-HARD parity coverage, **not** OkulOS superiority over Timefold.
- Runtime values must not be directly ranked against FET evidence from a different GitHub runner CPU. A same-runner comparison is required before any runtime statement.

## Next gate
Run OkulOS, FET, and Timefold on the same GitHub Actions runner and same canonical corpus, then add equivalent MEDIUM/SOFT objective mappings before any quality-superiority claim. UniTime remains the next open-source executable adapter candidate.
