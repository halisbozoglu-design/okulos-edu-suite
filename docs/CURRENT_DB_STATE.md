# Current DB State

Updated: 2026-08-26

## Cross-chat handoff rule
- This file is the authoritative continuation point for MTAL/MESEM curriculum and schedule-engine work.
- Read Cloud live state first; never re-import completed variants unless an audit proves them wrong.
- Preserve source provenance, field/branch lineage, protocol/regional variants and cohort applicability.
- Cloud-first, forward-only, idempotent migrations; commit the same SQL to `supabase/migrations`.
- For detailed timetable continuation, also read `docs/SCHEDULE_ENGINE_HANDOFF.md`.

## Curriculum phase status: CLOSED
- MTAL canonical catalog: 56 fields / 119 branches.
- MESEM canonical catalog: 39 fields / 193 branches.
- `audit_mtal_catalog_completeness_v1()`: 0 findings.
- `audit_mesem_catalog_completeness_v1()`: 0 findings.
- `audit_mtal_curriculum_v1()`: 0 findings.
- MTAL active profiles: 1083; active schedules: 12442; profile-without-schedule: 0; fixed-hour mismatch: 0; `needs_review=true`: 0; source URL blank: 0; decision no blank: 0.
- MESEM active profiles: 1520; active schedules: 9892; profile-without-schedule: 0; fixed-hour mismatch: 0; `needs_review=true`: 0; source URL blank: 0; decision no blank: 0.
- Remaining null `source_page`, `parser_confidence`, or empty `parsed_constraints` are metadata gaps only; do not invent values. Safe metadata normalization already ran.

## Managed catalog exceptions
These are known states, not forgotten completeness errors:
- MESEM `Ulaştırma Hizmetleri / Kargo ve Kurye Hizmetleri`: `MODULAR_PARTIAL`.
- MESEM `Ulaştırma Hizmetleri / Otopark ve Vale Hizmetleri`: `PROGRAM_PENDING`.
- MESEM protocol-only branches: Gazetecilik (Medya Yazılımı, Sosyal Medya, Web İçerik Editörü), Radyo-Televizyon (Video, Ses Üretim ve Kurgu), Uçak Bakım (Hava Aracı Montaj): `PROTOCOL_ONLY`.
- MTAL former 2025/75 generic Gastronomi branches (Mutfak Sanatları, Pastacılık ve Ekmekçilik, Servis ve Kahve Hazırlama): `SUPERSEDED_BY_REGIONAL_PROGRAM`.

## Gastronomi 2026 regional programs
- TTK 2025/75 is withdrawn from 2026-2027.
- Active regional programs:
  - 2026/91 Marmara Gastronomi ve Mutfak Sanatları: Saray Mutfağı; Helvacılık, Şerbet ve Tatlı Sanatları; Misafir Deneyimi ve Servis Yönetimi.
  - 2026/92 Doğu Anadolu Gastronomi ve Mutfak Sanatları: Süt ve Süt Ürünleri; Et ve Et Ürünleri; Misafir Deneyimi ve Servis Yönetimi.
- Stored separately with `school_subtype` regional lineage; AMP, ATP and `ENTERPRISE_FROM_11` variants preserved.
- Regional Gastronomi profiles: 72; profile-without-schedule: 0; fixed-hour mismatch: 0.
- Migration: `20260825050000_mtal_gastronomi_regional_2026_91_92.sql`, commit `ffdf9b40aa11094e59d628c9a5b7bcece421ef7b`.
- `audit_mtal_curriculum_v1()` was updated to include `school_subtype` in its grouping/join key so identical branch names across regional programs are not double-counted.

## Other closed repair work
- Bilişim MESEM schedule backfill completed: 16 profiles / 104 real schedule rows / 0 mismatch; commit `6466db6033ef8d6c181454830f101e3c5f7589f1`.
- Hayvan Yetiştiriciliği ve Sağlığı + İnşaat batch1 forward-only replay reconciliation completed and audited clean; commit `7cda4cfb4c80f2a0c605d25fc11d399fa5cc2be3`.
- Curriculum metadata normalization completed without changing course/profile content; commit `51f436a3d3f81f0ec60e8116734d83386e6b135e`.
- Catalog status/completeness exception layer completed; commit `8ee5065cd83aa399c52cf6b462dea8ad24ecdadf`.

## Weekly timetable / hybrid distribution engine — current state
- Goal: Bilsa-level manual ease + automatic official data + HARD/SOFT/OFF constraints + AI/solver hybrid optimization + manual override without silent rule violations.
- Existing engine already has multi-scenario generation, repair/backtracking, hard-rule audit, room assignment, scoring, restore points and scenario application.
- Solver UI was simplified to an operational flow: Preparation → Rules → Fast Distribution → Compare → Manual Edit.
- Fast mode generates 4 candidates; advanced mode supports 4/8/12 candidate runs. Repair/rescore is parallelized client-side with `Promise.all` where safe.
- Before applying a scenario, an automatic restore point is created.
- Unplaced items now receive deterministic repair suggestions: cause, recommended action, whether a HARD rule must remain protected, and estimated intervention category.
- Hybrid compute registry is live in Cloud. Only the real built-in `DB-native` worker is registered by default; no fake CPU/GPU worker entries are created.
- Worker model supports DB/CPU/GPU, capability metadata, health/heartbeat, max parallelism, load and latency. `AUTO/HYBRID` selection can use external workers later, with DB-native fallback.
- Current DB-native worker audit: HEALTHY, `max_parallel=4`, load 0, recommended=true.
- Compute/orchestration migration: `20260826001000_schedule_hybrid_compute_orchestration.sql`, commit `0955efa5219a353c1d3fc5539ba2171c44566742`.
- Solver UI commit: `af24967bfc65b6b8d71a8bcbeb47ba67148754cd`.
- Safe manual-move backend migration created: `20260826002000_schedule_safe_manual_move.sql`, commit `396b680b3a1e12c050683adc2b57a3c41589a742`.
- Manual move RPCs are designed to preview and apply moves through the same DB constraint path, with restore point before apply; next UI step is drag/drop wiring in `src/routes/schedule.tsx`.

## CI / repository guards — latest
- Historical duplicate migration versions already existed in repo: `20260825011500` and `20260825013000` each had two legacy files. Applied files were not renamed or edited.
- `scripts/check-migrations.mjs` now has a narrow exact-file legacy allowlist; any new duplicate migration version still fails CI. Commit: `ad20232f95a1f1d8786af2e8d5e95e4bc3d5516d`.
- `/super-admin-course-pool` was classified under the existing `/super-admin` feature family without changing applied migrations. Commit: `0031fa63a7cbf60e8a9e49c1ab3ecbcc9ba38ea4`.
- At handoff time, CI run after that classification was still in progress; check latest Actions status before claiming green.

## Next phase
1. Finish CI to full green including production build + TypeScript.
2. Wire `schedule.tsx` drag/drop to safe preview/apply RPCs; show allowed/blocked target feedback, reason text, and one-click undo/history.
3. Add safe swap/multi-move if preview proves deterministic under existing constraints.
4. Keep UI default simple; advanced optimization/compute controls remain collapsible.
5. Do not pretend Lovable Cloud exposes selectable physical GPU unless a real external GPU worker is connected and heartbeat-confirmed.
6. Do not reopen MTAL/MESEM curriculum ingestion unless a new official source or audit finding requires it.
