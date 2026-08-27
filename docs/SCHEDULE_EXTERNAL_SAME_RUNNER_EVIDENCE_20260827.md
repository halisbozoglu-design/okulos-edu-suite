# Schedule external same-runner evidence — 2026-08-27

Status: EVIDENCE, NOT SUPERIORITY CLAIM

Workflow: `33100523623`
Head: `fa3d9e227a802094c55da7cd32ed40fc16bdfa30`
Artifact: `9658357544` (`schedule-external-same-runner-fa3d9e227a802094c55da7cd32ed40fc16bdfa30`)

Hardware for all three solvers: Intel Xeon Platinum 8573C, 4 logical CPUs, Linux GitHub runner. Okulos used Bun 1.4.0. External versions: FET 6.8.5, Timefold Solver 2.5.0.

All six profiles (`synthetic-small`, `synthetic-medium`, `synthetic-large`, `synthetic-dense`, `mtal`, `mesem`) ran 30 seeds per solver. Okulos, FET and Timefold each achieved feasible_rate=1, hard_max=0, unplaced_max=0, deterministic replay=true and budget_pass=true on the mapped common HARD core.

Same-runner p95 runtime (ms):

| profile | Okulos | FET | Timefold |
|---|---:|---:|---:|
| synthetic-small | 35 | 15 | 82 |
| synthetic-medium | 82 | 32 | 189 |
| synthetic-large | 423 | 76 | 1823 |
| synthetic-dense | 286 | 47 | 544 |
| mtal | 278 | 54 | 680 |
| mesem | 109 | 37 | 272 |

Canonical post-score p50 (`medium`, `soft`):

| profile | Okulos | FET | Timefold |
|---|---|---|---|
| synthetic-small | 0, 0 | 0, 52 | 0, 0 |
| synthetic-medium | 0, 0 | 0, 234 | 0, 32 |
| synthetic-large | 0, 8 | 0, 680 | 2, 32 |
| synthetic-dense | 0, 32 | 2, 608 | 60, 240 |
| mtal | 0, 16 | 0, 828 | 2, 144 |
| mesem | 0, 0 | 0, 308 | 0, 32 |

## Claim boundary

`objective_comparable=false` and `superiority_claim_allowed=false` are intentional. FET and Timefold adapters currently optimize the mapped common HARD core and their outputs are then evaluated by the canonical Okulos post-scorer. This proves executable common-HARD parity on the tested profiles, not apples-to-apples full MEDIUM/SOFT optimization superiority. Runtime ranking is also not a superiority claim because Okulos executes its native optimization path while external adapters stop at hard-feasible conditions.

UniTime and aSc remain `NOT_RUN` until a real executable adapter is run. No estimated or fabricated competitor result is permitted.
