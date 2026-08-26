# Schedule Engine Handoff

Updated: 2026-08-26

## Purpose
This is the cross-chat continuation file for Okulos weekly timetable work. Read this before making timetable changes in another project conversation.

## Product target
- Bilsa-like manual ease.
- Official/automatic data first; manual intervention only when needed.
- HARD / SOFT / OFF constraints.
- Hybrid AI + deterministic solver behavior.
- Multiple candidate distributions instead of one opaque result.
- When distribution gets stuck: explain why, propose the smallest safe relaxation/action, never silently violate HARD/mevzuat rules.
- Manual drag/drop remains flexible but every move is checked by the same DB constraint path.
- Fast by default; advanced controls hidden/collapsible.

## Existing solver capability verified
Current DB/functions/UI already support:
- preparation readiness checks;
- multi-scenario generation (`generate_schedule_scenarios_v2`);
- repair/backtracking (`repair_schedule_scenario_v2`);
- rescore (`rescore_schedule_scenario_v2`);
- hard integrity/room/staleness applicability checks;
- scenario application (`apply_schedule_scenario`);
- restore points (`create_schedule_restore_point`);
- manual slot upsert (`upsert_schedule_slot_v2`);
- schedule integrity report;
- room assignment and scenario comparison screens.

## UX changes made
`src/routes/schedule-solver.tsx` was changed so the default user path is operational rather than technical:
1. Hazırlık
2. Kurallar
3. Hızlı Dağıt
4. Karşılaştır
5. Elle Düzelt

Behavior:
- default fast run: 4 candidates;
- advanced run: 4 / 8 / 12 candidates;
- repair + rescore run concurrently where safe;
- compute source/status surfaced;
- unplaced items can show repair suggestions;
- scenario apply creates restore point first;
- technical quality weights remain available under advanced settings instead of dominating the page.

Commit: `af24967bfc65b6b8d71a8bcbeb47ba67148754cd`.

## Hybrid compute orchestration
Cloud migration: `supabase/migrations/20260826001000_schedule_hybrid_compute_orchestration.sql`.
GitHub commit: `0955efa5219a353c1d3fc5539ba2171c44566742`.

Tables/functions introduced for compute orchestration and repair suggestions include:
- worker registry with DB / CPU / GPU type;
- health, heartbeat, capabilities, max parallelism, current load, latency;
- compute policy/preferences;
- run/job bookkeeping;
- scenario repair suggestion storage;
- worker selection/capability status RPC;
- deterministic repair suggestion generation from `schedule_unplaced_items` diagnostics.

Important truthfulness rule:
- Only the real `db-native` worker is registered by default.
- Do NOT create fake CPU/GPU workers.
- External CPU/GPU becomes selectable only after a real worker connects and heartbeat/capability is confirmed.
- AUTO/HYBRID must always be able to fall back to DB-native.

Verified DB-native state at implementation time:
- display name: Yerleşik DB Çözücü
- health: HEALTHY
- max_parallel: 4
- current_load: 0
- recommended: true

## Safe manual move backend
Cloud migration applied and committed:
`supabase/migrations/20260826002000_schedule_safe_manual_move.sql`
Commit: `396b680b3a1e12c050683adc2b57a3c41589a742`.

Intent:
- preview a manual move through the same underlying timetable constraint path;
- rollback preview transaction;
- return allowed/blocked + reason;
- on apply, create restore point first;
- then perform move with `source_kind='manual_drag'`;
- never bypass locked-row protection or DB hard constraints.

Next required frontend work:
- wire `src/routes/schedule.tsx` cards/cells to drag/drop;
- target cell hover should preview allowed/blocked;
- green/valid target vs red/blocked target and translated reason;
- apply safe move on drop;
- link to history/undo;
- later add safe swap/multi-move only after deterministic backend preview is verified.

## CI work performed
CI first failed due pre-existing migration duplicate versions, not the solver changes:
- `20260825011500`: two legacy files;
- `20260825013000`: two legacy files.

Applied/legacy migration files were not renamed or edited. Instead `scripts/check-migrations.mjs` got an exact-pair legacy allowlist. New duplicate versions still fail.
Commit: `ad20232f95a1f1d8786af2e8d5e95e4bc3d5516d`.

Next CI blocker was a new/unclassified `/super-admin-course-pool` route. It was classified as inheriting existing `/super-admin` feature family; no applied migration changed.
Commit: `0031fa63a7cbf60e8a9e49c1ab3ecbcc9ba38ea4`.

At the moment this handoff was written, the latest CI after this classification had not yet been confirmed fully green. Always check Actions before claiming green.

## Non-negotiable engineering rules
- Lovable Cloud is production DB.
- Do not spend Lovable AI tokens for code/migration work.
- Cloud first, then commit faithful SQL to GitHub.
- Forward-only migrations; do not edit applied migrations.
- Prefer compact/idempotent migrations and minimal token SQL.
- Do not fake hardware capability.
- HARD/mevzuat constraints are never silently weakened by AI.
- AI/solution engine may suggest SOFT relaxations or operational fixes but should explain impact.
- Manual intervention must remain easy and reversible.

## Immediate continuation order
1. Check latest CI run and fix only current blockers until full green.
2. Finish drag/drop UI in `schedule.tsx` using safe preview/apply RPCs.
3. Verify build + TypeScript + timetable guards again.
4. Test manual move against teacher clash, class clash, unavailable time, daily limits, room clash, locked rows and subgroup conflicts.
5. Add safe swap/multi-move only if tests prove reliable.
6. Improve comparison/solution UI after manual workflow is stable.
