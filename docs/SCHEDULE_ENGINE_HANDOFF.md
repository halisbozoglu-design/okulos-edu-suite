# Schedule Engine Handoff

Updated: 2026-08-26

## Purpose
Cross-chat continuation file for Okulos weekly timetable work. Read this before changing the timetable module.

## Product target
- Bilsa-like manual ease with official/automatic data first.
- HARD / SOFT / OFF constraints; HARD/mevzuat rules are never silently weakened.
- Multiple candidate schedules, repair/rescore, reasons and safe suggestions.
- Manual actions are reversible and validated by the same DB constraint path.
- CPU/GPU capability is shown only when a real worker exists.

## Verified core
Existing DB/UI includes preparation, `generate_schedule_scenarios_v2`, `repair_schedule_scenario_v2`, `rescore_schedule_scenario_v2`, hard/room/stale audits, `apply_schedule_scenario`, restore points, `upsert_schedule_slot_v2`, scenario comparison and reports.

## Manual schedule UX — completed
`src/routes/schedule.tsx` now has:
- safe drag/drop with live DB preview and translated hard-block reason;
- atomic safe swap with confirmation;
- one-click undo + history;
- mobile agenda cards and desktop grid;
- teacher / class / subject-branch / room filters;
- General / Teacher / Class / Room / Branch view modes;
- missing-hour pool from `schedule_assignment_options.remaining_hours`;
- multi-select + bulk lock/unlock;
- manual/voice/import source labels;
- shortcuts: Ctrl/Cmd+Z undo, Esc clear, Ctrl/Cmd+L lock selected;
- memoized day-period map instead of per-cell `filtered.filter`.

## Solver UX
`src/routes/schedule-solver.tsx` supports:
- quick 4-candidate and advanced 4/8/12 candidate runs;
- Cloud + local compute orchestration;
- parallel repair/rescore where safe;
- restore point before applying a scenario;
- unplaced diagnostics + repair suggestions;
- external worker type/health/load/latency display;
- stale heartbeat shown as offline/stale;
- no fake GPU indication.

## Compute/worker backend
Core orchestration migration/commit:
- `20260825055000_schedule_hybrid_compute_orchestration.sql`
- `0955efa5219a353c1d3fc5539ba2171c44566742`

Real default worker only:
- `db-native` / DB / HEALTHY / max_parallel=4.

External-worker heartbeat exists as `heartbeat_schedule_compute_worker_v1`; only service-role CPU/GPU workers may report HEALTHY/DEGRADED state.

Execution/failover contract added:
- migration: `20260826092500_schedule_worker_execution_failover.sql`
- commit: `ae70bfe06617cb25c152ffb548db7008a2f64281`
- `claim_schedule_worker_attempt_v1` atomically claims a PLANNED attempt with capacity/heartbeat checks;
- `complete_schedule_worker_attempt_v1` completes only the owning worker's RUNNING attempt and closes the job COMPLETED/PARTIAL/FAILED;
- `fail_schedule_worker_attempt_v1` requeues the same attempt to another healthy same-type worker, then GPU→CPU→DB-native fallback; if no fallback exists it closes safely.

Do not register fake CPU/GPU workers. A real external process must register + heartbeat before planner/runner can use it.

## Repair suggestions
Current safe action codes generated from diagnostics:
- `EXPAND_TEACHER_WINDOW`
- `REBALANCE_DAILY_LOAD`
- `RELAX_SOFT_CONSECUTIVE`
- `REVIEW_COURSE_TIME_SOFT`
- `MANUAL_REVIEW`

Do not auto-apply a suggestion that changes a constraint unless the target is proven SOFT. `REBALANCE_DAILY_LOAD` can use existing repair/rescore. `MANUAL_REVIEW` should route to safe manual placement. The other three must open the appropriate SOFT settings unless/until a dedicated guarded RPC exists.

## CI
Migration duplicate legacy exceptions remain exact-pair only; applied migrations are never renamed/edited. Latest worker-failover push CI run is `32952872104`; verify its final result before claiming this exact commit fully green.

## DB connection note
The direct Supabase management connector currently returns PostgreSQL `28P01 password authentication failed`. Do not work around this with Lovable AI. Keep forward migrations faithful in GitHub; apply to production only through direct Supabase once the connector credential is healthy.

## Non-negotiable engineering rules
- No Lovable AI/chat token use for code or migration work.
- Code and migrations are written directly by this assistant through GitHub/Supabase tools.
- Forward-only migrations; never edit applied migrations.
- Minimal migration count and compact/idempotent SQL.
- No fake hardware capability.
- HARD/mevzuat constraints are never silently weakened.
- Manual intervention stays easy, reversible and DB-validated.

## Immediate continuation order
1. Verify CI for `ae70bfe` and fix any current blocker.
2. Add safe suggestion action UX: repair/rescore for `REBALANCE_DAILY_LOAD`, manual route for `MANUAL_REVIEW`, settings route for SOFT-relax suggestions.
3. Connect a real external CPU worker only when an actual worker process/host is available; use register→heartbeat→claim→complete/fail contract.
4. Add large-school virtualization/performance polish after functional closure.
5. Re-run final timetable guards, production build and TypeScript checks.