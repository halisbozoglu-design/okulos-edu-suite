# OkulOS World Benchmark Baseline — 2026-08-27

CI run: `33086715135`  
Head: `94368a072739d85cd6a59571948220610aabf6a1`  
Hardware: AMD EPYC 7763, 4 logical CPUs, Linux x64, Bun 1.4.0  
Budget: 8000 ms / solve  
Seeds: 30 per profile

| Profile | Runs | Feasible | HARD max | Unplaced max | p50 ms | p95 ms | Heap Δ MB | Replay |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| synthetic-small | 30 | 100% | 0 | 0 | 24 | 36 | 4 | PASS |
| synthetic-medium | 30 | 100% | 0 | 0 | 77 | 89 | 2 | PASS |
| synthetic-large | 30 | 100% | 0 | 0 | 462 | 498 | 0 | PASS |
| synthetic-dense | 30 | 100% | 0 | 0 | 315 | 329 | 5 | PASS |
| MTAL | 30 | 100% | 0 | 0 | 293 | 312 | 3 | PASS |
| MESEM | 30 | 100% | 0 | 0 | 109 | 116 | 0 | PASS |

Dense SOFT p50=24; MTAL SOFT p50=16; all other listed MEDIUM p50=0 and SOFT p50=0. All 180 OkulOS runs stayed inside the 8-second budget.

The same CI executes the real OR-Tools CP-SAT exact fixture: `OPTIMAL`, objective 0, bound 0, gap 0, deterministic replay PASS, Section-8 scope parity PASS, wall time 17 ms. CP-SAT is exact-oracle evidence, not a publishing authority.

## External competitor truth state
Timefold, UniTime, FET and aSc are `NOT_RUN` in this baseline because no compatible executable/licensed adapter was executed in this CI. No synthetic estimates or copied vendor claims are substituted for measurements. The adapter contract in `benchmarks/world/README.md` requires the same input SHA-256, wall-clock budget, hardware record and result schema before a row can enter a comparison.

An anonymized real-school or ITC fixture is not labeled as present unless a versioned source/provenance artifact exists. Synthetic MTAL/MESEM profiles are structural MEB profiles, not claims of being anonymized real data.

## Evidence artifact
The CI uploads `schedule-world-benchmark-<sha>.json` (30-day retention). The first evidence artifact for this gate is Actions artifact ID `9652532614`.

## Claim boundary
This baseline proves repeatable OkulOS benchmark infrastructure and its measured results above. It does **not** prove superiority over Timefold, UniTime, FET or aSc. Any superiority statement remains blocked until the final common-input competitor gate is satisfied.
