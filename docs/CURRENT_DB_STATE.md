# Current DB State

Updated: 2026-08-24

## Cross-chat handoff rule
- This file is the authoritative continuation point for MTAL/MESEM curriculum work across all ChatGPT conversations in this project.
- Continue from `Current incompleteness focus` / `Next`; never restart or re-import a completed batch unless an audit proves it incorrect.
- Cloud state and official live MTEGM sources override conversational recollection.
- Preserve source provenance, field/branch lineage, protocol/regional variants and cohort applicability. Never fill a source gap from stale cached PDFs.
- DB migrations are applied directly to Lovable Cloud PostgreSQL and then committed to `supabase/migrations`; Lovable AI agent is not used.

## Vocational timetable core
- MTAL canonical catalog: 56 fields / 119 branches.
- MESEM canonical catalog: 39 fields / 193 branches.
- MTAL 2026-27: grade 9 current 2026 programs; grades 10-11 primarily living transition sources; grade 12 living transition sources with field-specific exceptions.
- MESEM live portal remains field-versioned (2021-33, 2022-5, 2022-6, 2022-33, 2023-* etc.); do not force all fields to a synthetic 2026 version.
- Old/new field or branch names stay as lineage; no destructive normalization.

## MTAL audit and progress
- `audit_mtal_curriculum_v1()` active; current result: 0 findings.
- `audit_mtal_catalog_completeness_v1()` active; migration `20260824025500_mtal_catalog_completeness_audit.sql`.
- Canonical Cloud reference verified: exactly 56 active MTAL fields / 119 active MTAL branches.
- Cloud: 57 distinct persisted MTAL field-name lineages / 1011 active curriculum profiles / 11544 active course-schedule rows.
- Active MTAL course rows with `needs_review=true`: 0.
- Endüstriyel Kalite Kontrol grade 10 complete from official 2025-49 source. Migration `20260824022500_mtal_ekk_grade10.sql`; audit clean.
- Konaklama ve Seyahat Hizmetleri grades 11-12 complete. Grade-9 branch names are not overwritten by upper-grade living names; lineage metadata is preserved. Migration `20260824024000_mtal_konaklama_grade11_12.sql`; audit clean.
- Ayakkabı ve Saraciye (Protokol), Seramik ve Cam (Protokol), Tekstil, Gazetecilik and previously completed living MTAL chains remain preserved/audit-clean.
- Havacılık ve Uzay has no living grade-12 portal entry; no fabricated row.

## MTAL manual control
- Only canonical field without active MTAL profile: `Gastronomi ve Mutfak Sanatları`.
- Missing branches: `Mutfak Sanatları`, `Pastacılık ve Ekmekçilik`, `Servis ve Kahve Hazırlama`.
- Official current decisions are 2026-91 Marmara and 2026-92 Doğu Anadolu; 2025-75 is withdrawn for 2026-27.
- Live portal lists both regional 2026 programs, but `marmaragastro_9.pdf` and `dogugastro_9.pdf` currently return 404. Do not backfill from stale generic 2025 `gastro_9.pdf`.
- This source-unavailable case is the final MTAL manual-control item until MTEGM restores the files.

## MESEM audit and progress
- `audit_mesem_catalog_completeness_v1()` active; migration `20260824031000_mesem_catalog_completeness_audit.sql`.
- Canonical Cloud reference verified: 39 active MESEM fields / 193 active MESEM branches.
- Starting state had only `Bilişim Teknolojileri` populated: 2 branches / 16 profiles (grades 9-12, USTALIK + DIPLOMA) from live portal decision 2022-5. These profiles are current portal-compatible and must not be deleted as stale.
- Existing Bilişim profiles currently have no MESEM rows in `official_course_schedule_catalog`; later repair must populate their exact course rows.
- `Ayakkabı ve Saraciye Teknolojisi` 2021-33 is now fully imported for four branches: `Ayakkabı Üretimi`, `Ayakkabı Modelistliği`, `Saraciye Üretimi`, `Saraciye Modelistliği`.
- Ayakkabı import includes grades 9-12, separate USTALIK/DIPLOMA profiles, 32-hour İşletmelerde Mesleki Eğitim, parenthetical diploma difference courses and real field/branch course rows. 32 profiles were validated against fixed-hour totals. Migration `20260824032500_mesem_ayakkabi_2021_33.sql`.
- MESEM completeness after Ayakkabı: 37 missing fields / 187 missing branches.

## Current incompleteness focus
- MTAL: only regional Gastronomi source-unavailable manual control remains.
- MESEM: 37 fields / 187 branches remain unpopulated; Bilişim course-row repair also remains.

## Next
1. Continue MESEM live portal order without re-importing Bilişim or Ayakkabı: next standard field is `Büro Yönetimi` (2021-33), then Denizcilik (2022-6), El Sanatları Teknolojisi (2021-33), etc.
2. Each MESEM batch must persist both curriculum profiles and real `official_course_schedule_catalog` rows, with USTALIK/DIPLOMA distinction and exact parenthetical difference-course semantics.
3. Repair Bilişim 2022-5 course rows from its official source while preserving its existing 16 profiles.
4. After each batch run `audit_mesem_catalog_completeness_v1()` and validate each profile fixed-hour sum against `required_hour_total`.
5. Retry the two current Gastronomi regional PDFs opportunistically; never substitute the withdrawn 2025 source.
