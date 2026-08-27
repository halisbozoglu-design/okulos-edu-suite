# FET World Benchmark Evidence — 2026-08-27

Status: VERIFIED RUN / NOT A SUPERIORITY CLAIM

Run: `33099216980`
Commit: `e76847861d87e98397fc62e5ea10ab6be56a7cc1`
FET: `6.8.5` (`fet-cl`)
Schema: `OKULOS_WORLD_BENCHMARK_V1`
Mapping: `HARD_COMMON_CORE_CANONICAL_POSTSCORE`
Objective comparable: **false**
Hardware: AMD EPYC 9V74, 4 logical CPUs
Seeds: 30/profile, 6 profiles = 180 runs

The adapter exports the common hard core and teacher limits. FET requires 100% Basic Compulsory Space, so each activity receives access to a non-scarce pool of equivalent high-capacity dummy rooms. This makes the required space layer valid but intentionally non-binding for the time-only common-core benchmark.

| profile | feasible | hard max | unplaced max | medium p50 | soft p50 | runtime p50 ms | runtime p95 ms | replay | budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| synthetic-small | 100% | 0 | 0 | 0 | 52 | 16 | 27 | PASS | PASS |
| synthetic-medium | 100% | 0 | 0 | 0 | 234 | 33 | 35 | PASS | PASS |
| synthetic-large | 100% | 0 | 0 | 0 | 680 | 79 | 81 | PASS | PASS |
| synthetic-dense | 100% | 0 | 0 | 2 | 608 | 52 | 53 | PASS | PASS |
| mtal | 100% | 0 | 0 | 0 | 828 | 56 | 58 | PASS | PASS |
| mesem | 100% | 0 | 0 | 0 | 308 | 42 | 43 | PASS | PASS |

## Interpretation
- Real executable evidence exists: PASS.
- Common HARD feasibility is verified across all 180 runs.
- Deterministic replay is verified for the benchmark replay sample of every profile.
- Runtime budget passes for all runs.
- Medium/soft values are canonical OkulOS post-scores of FET output, not proof that FET optimizes the same objective.
- Therefore this evidence may be used for external parity coverage, but **must not** be used to claim OkulOS beats FET.

## Next external gate
Add another executable competitor adapter under the same fail-closed rules. A superiority statement remains prohibited until fair objective mapping and head-to-head evidence exist.
