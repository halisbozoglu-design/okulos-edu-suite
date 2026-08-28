# Schedule external solver final evidence — 2026-08-28

Status: VERIFIED RUNS / CLAIM BOUNDARY ENFORCED

This document supersedes `SCHEDULE_EXTERNAL_SAME_RUNNER_EVIDENCE_20260827.md` as the current external solver evidence summary. The machine-readable authority is `schedule-external-evidence-manifest-20260828.json`.

## Authority boundary

- Production solver: `OKULOS_NATIVE`
- Publication authority: server canonical validator
- Objective order: `HARD → unplaced → MEDIUM → SOFT`
- Timefold, UniTime, FET and OR-Tools remain benchmark/verification adapters, not production authorities.
- No external solver binary or JAR is stored in the database.

## UniTime full 180-run gate

- Workflow: [33166069959](https://github.com/halisbozoglu-design/okulos-edu-suite/actions/runs/33166069959)
- Head: `633353652c9130cab1bc11226d5929fab5378d2c`
- Artifact: `9684084314`
- Artifact digest: `sha256:cec4b9eb53d96bb89d835c4bee10580e197f389f87fa814a57ea98160ba57889`
- CPSolver pin: `3abbcaaf26d739d25e45c8e191b7ef94bc15cc26`
- Result: `RUN_COMPARABLE`
- Corpus: 6 profiles × 30 seeds = **180 real CPSolver runs**
- All profiles: feasible rate 100%, `hard_max=0`, `unplaced_max=0`, objective parity PASS, budget PASS.
- Fresh JVM A/B seed-101 signature and objective replay: PASS for every profile.

| Profile | Runs | Soft p50 | Runtime p50 ms | Runtime p95 ms |
|---|---:|---:|---:|---:|
| synthetic-small | 30 | 0 | 2,586 | 2,609 |
| synthetic-medium | 30 | 38 | 3,998 | 4,016 |
| synthetic-large | 30 | 282 | 6,464 | 6,598 |
| synthetic-dense | 30 | 302 | 6,981 | 7,044 |
| mtal | 30 | 348 | 6,866 | 6,896 |
| mesem | 30 | 78 | 4,916 | 4,944 |

## Okulos/FET/Timefold/UniTime same-runner gate

- Workflow: [33166069957](https://github.com/halisbozoglu-design/okulos-edu-suite/actions/runs/33166069957)
- Head: `633353652c9130cab1bc11226d5929fab5378d2c`
- Artifact: `9684775122`
- Artifact digest: `sha256:3b04206b422d673b0e5a99e4a6762b268e7ebb2763f412a03658d1dc02db1f40`
- Hardware: AMD EPYC 7763, 4 logical CPUs, same Linux GitHub runner.
- Statuses: Okulos `RUN`; FET `RUN_COMMON_HARD`; Timefold `RUN_COMPARABLE`; UniTime `RUN_COMPARABLE`.
- Every profile has common-HARD parity and zero unplaced assignments.

Same-runner p95 runtime evidence:

| Profile | Okulos | FET | Timefold | UniTime |
|---|---:|---:|---:|---:|
| synthetic-small | 44 | 23 | 8,026 | 2,797 |
| synthetic-medium | 103 | 41 | 8,010 | 4,267 |
| synthetic-large | 539 | 97 | 8,011 | 7,081 |
| synthetic-dense | 361 | 63 | 8,008 | 7,303 |
| mtal | 331 | 68 | 8,008 | 7,085 |
| mesem | 127 | 52 | 8,006 | 5,004 |

## Claim boundary

`objective_comparable=false` and `superiority_claim_allowed=false` remain intentional:

1. Timefold and UniTime independently match the canonical objective on this corpus.
2. FET is still a common-HARD mapping; it does not optimize the entire Okulos MEDIUM/SOFT objective in this run.
3. The external solvers have different stopping behavior, so runtime values alone are not a superiority proof.
4. aSc does not yet have a reproducible real GUI benchmark.
5. These runs prove executable parity coverage and deterministic evidence; they do not authorize a blanket “Okulos beats every solver” claim.

## Closed master nodes

- `15.06 UniTime full 180-run final gate` — CLOSED
- `15.07 Same-runner Okulos/FET/Timefold/UniTime final gate` — CLOSED
- `15.12 Freeze new evidence + truth-sync manifest/matrix` — CLOSED
