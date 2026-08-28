# Okulos Desktop Compute + Sync Architecture — 2026-08-28

Status: ACTIVE / implementation in progress.

## Product boundary
- The same Okulos web application is packaged as a Windows Tauri/NSIS executable.
- Lovable Cloud remains the remote system of record and authenticated authorization boundary.
- Desktop carries no service-role/admin secret. Cloud reads/writes use the signed-in user's permissions.
- Desktop has an offline SQLite mirror/outbox and user+institution scoped sync policy.

## User commands
- **Web'i Güncelle** → local pending outbox is pushed to Lovable Cloud, server canonical validation remains final authority.
- **Veri Çek** → authorized Lovable Cloud data is pulled into the desktop SQLite mirror.
- **Senkronla** → user-defined `PULL_WEB_TO_DESKTOP`, `PUSH_DESKTOP_TO_WEB` or `BIDIRECTIONAL` policy.
- Conflict policy is explicit: `ASK_USER`, `KEEP_WEB`, or `KEEP_DESKTOP`; silent overwrite is prohibited.
- Trigger can be manual, application start, or an explicit interval.
- Scope is user selected by module: schedule, students, teachers, classes, rooms, rules, sectioning, calendar.

## Compute model
- CPU is the canonical branching/repair/search and final objective authority.
- Multi-core CPU workers run a heterogeneous portfolio: fail-first/backtracking, repair/ejection-chain, LNS, tabu, simulated annealing and VND families.
- Compiled constraint dispatch/compact indexes are used for hot-path evaluation.
- GPU/WebGPU is an accelerator for candidate batches/neighborhood evaluation only; it never replaces lexicographic canonical scoring.
- FAST/BALANCED/DEEP effort profiles select worker budgets without changing HARD/MEDIUM/SOFT rules.

## aSc contributions retained
Okulos deliberately incorporates the useful engineering lessons discussed from aSc without cloning its closed implementation:
- fast compiled/compact constraint evaluation,
- CPU-oriented backtracking/search heuristics,
- multi-core generation,
- strong time-off/time-map UX,
- generation bottleneck/extended diagnostic analysis,
- manual move/lock/verification workflow,
- relationship-rule operator language,
- room/building visibility,
- draft-like diagnostics without silently relaxing production HARD rules.

Okulos extends this with canonical MEB/MTAL/MESEM rules, explicit HARD→unplaced→MEDIUM→SOFT objective, safe server validation, GPU acceleration, explainability and web↔desktop synchronization.

## Runtime implementation
- `desktop/src-tauri/src/compute.rs`: CPU/GPU capabilities and compute-plan commands.
- `desktop/src-tauri/src/sync.rs`: SQLite policy, outbox and remote-mirror persistence.
- `src/lib/desktop-tauri-runtime.ts`: web/Tauri typed runtime bridge.
- `src/lib/desktop-sync-policy.ts`: direction/trigger/conflict semantics.
- `src/lib/desktop-command-contract.ts`: explicit user command semantics.
- `.github/workflows/desktop-windows-build.yml`: Windows NSIS executable build/evidence gate.

## Safety invariants
1. HARD rules are never weakened by desktop mode, GPU mode or synchronization.
2. GPU is not objective authority.
3. Push is not accepted as authoritative until canonical server validation succeeds.
4. No silent conflict overwrite.
5. Desktop data is tenant/user scoped.
6. Offline writes enter an outbox; they are not treated as synced until the authenticated web layer confirms Cloud success.
7. Normal browser mode must work without Tauri APIs.

## Remaining runtime work
- Bind concrete module-specific Lovable Cloud push/pull adapters to the Tauri outbox/mirror.
- Add sync settings UI and explicit conflict-resolution UI.
- Feed runtime WebGPU adapter detection into `desktop_compute_plan`.
- Benchmark desktop CPU/GPU profiles on the same world corpus before claiming performance gains.
