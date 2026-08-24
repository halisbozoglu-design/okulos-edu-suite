# Current DB State

Updated: 2026-08-24

## Cross-chat handoff rule
- This file is the authoritative continuation point for MTAL/MESEM curriculum work across all ChatGPT conversations in this project.
- At every run start, read this file and Lovable Cloud live state; never re-import completed field/branch/grade/program variants unless an audit proves them incorrect.
- Cloud state and official live MEB/MTEGM/TTKB sources override conversational recollection.
- Preserve source provenance, field/branch lineage, protocol/regional variants and cohort applicability. Never fill 404/timeout/stale source gaps from inferred or cached material.
- Safe batches are applied directly to Lovable Cloud PostgreSQL, audited, then the same migration is committed to `supabase/migrations`. Lovable AI agent/chat is not used.

## Vocational timetable core
- MTAL canonical catalog: 56 fields / 119 branches.
- MESEM canonical catalog: 39 fields / 193 branches.
- MTAL 2026-27: grade 9 current 2026 programs; grades 10-11 primarily living transition sources; grade 12 living transition sources with field-specific exceptions.
- MESEM portal is field-versioned; do not force every field to a synthetic 2026 source. Use the living official decision for each field.
- Old/new field or branch names stay as lineage; no destructive normalization.

## MTAL audit and progress
- `audit_mtal_curriculum_v1()` current result: 0 findings.
- `audit_mtal_catalog_completeness_v1()` current result: 1 missing field / 3 missing branches.
- Canonical reference: 56 fields / 119 branches; effectively 55 fields / 116 branches populated.
- Only unresolved canonical field: `Gastronomi ve Mutfak Sanatları`.
- Missing branches: `Mutfak Sanatları`, `Pastacılık ve Ekmekçilik`, `Servis ve Kahve Hazırlama`.
- Official current decisions are 2026-91 Marmara and 2026-92 Doğu Anadolu; 2025-75 is withdrawn for 2026-27.
- Live portal lists both regional 2026 programs, but `marmaragastro_9.pdf` and `dogugastro_9.pdf` return 404. Do not backfill from stale generic 2025 `gastro_9.pdf`.
- This is the sole MTAL manual-review/source-retry item unless a later audit finds another issue.

## MESEM audit and progress
- `audit_mesem_catalog_completeness_v1()` active; canonical reference verified at 39 fields / 193 branches.
- Current Cloud: 144 active curriculum profiles / 834 active real course-schedule rows / 6 fields with profiles / 18 canonical branches with profiles.
- Current completeness open: 33 fields / 175 branches.
- Completed/imported fields before the current Elektrik-Elektronik batch: `Bilişim Teknolojileri`, `Ayakkabı ve Saraciye Teknolojisi`, `Büro Yönetimi`, `Denizcilik`, `El Sanatları Teknolojisi`.
- Bilişim profiles exist but its exact MESEM `official_course_schedule_catalog` course-row repair is still pending and must preserve the existing profiles.
- `Elektrik-Elektronik Teknolojisi` living official source: decision 2021-33, official PDF `https://meslek.meb.gov.tr/upload/cop10_mem/2021_elektrik_mem_cop.pdf`.
- Elektrik-Elektronik has 10 canonical branches. Four are now fully imported across grades 9-12 with separate USTALIK/DIPLOMA variants, 32-hour İşletmelerde Mesleki Eğitim and parenthetical diploma difference courses:
  - `Asansör Sistemleri`
  - `Bobinaj`
  - `Büro Makineleri Teknik Servisi`
  - `Elektrik Tesisatları ve Pano Montörlüğü`
- Elektrik-Elektronik profile pattern verified directly from the official tables: USTALIK total 42 hours at grades 9-12; DIPLOMA totals 44 / 44 / 46 / 48 for grades 9 / 10 / 11 / 12. Grade-9 profile has 2 elective hours in the official 42-hour base table, so stored fixed course-row sum excludes those elective hours while total target includes them.
- Current Elektrik-Elektronik batch added 32 profiles and 212 real course rows in total.
- Migration batch 01: `20260824215000_mesem_elektrik_elektronik_batch01_asansor_bobinaj.sql` — 16 profiles / 102 course rows.
- Migration batch 02: `20260824215800_mesem_elektrik_elektronik_batch02_buro_tesisat.sql` — 16 profiles / 110 course rows (`Büro Makineleri` 57 rows; `Elektrik Tesisatları ve Pano Montörlüğü` 53 rows).
- Both batches passed per-profile hour validation; every imported MESEM profile has 32 enterprise hours as required by its official table.
- MTAL structural audit remained at 0 after these MESEM writes.

## Current incompleteness focus
- MTAL: only 2026 regional Gastronomi source-unavailable manual review remains (1 field / 3 branches).
- MESEM: 33 fields / 175 branches remain open.
- Elektrik-Elektronik itself has 6 remaining branches from the same 2021-33 official PDF:
  - `Elektrikli Ev Aletleri Teknik Servisi`
  - `Endüstriyel Bakım Onarım`
  - `Görüntü ve Ses Sistemleri`
  - `Güvenlik Sistemleri`
  - `Haberleşme Sistemleri`
  - `Yüksek Gerilim Sistemleri`
- Bilişim course-row repair remains separate from catalog completeness because its profiles already exist.

## Next
1. Continue `Elektrik-Elektronik Teknolojisi` in safe two-branch sub-batches from the same official 2021-33 PDF, starting with `Elektrikli Ev Aletleri Teknik Servisi` + `Endüstriyel Bakım Onarım`.
2. For every branch persist grades 9-12, USTALIK + DIPLOMA, exact real course rows, 32-hour İME and parenthetical diploma difference courses from the official table; do not infer field-specific rows from another branch.
3. After each Cloud batch run per-profile fixed-hour validation, `audit_mesem_catalog_completeness_v1()`, and verify `audit_mtal_curriculum_v1()` remains clean.
4. Commit every applied migration to `supabase/migrations` even if repository sync has to be retried later.
5. After Elektrik-Elektronik is complete, continue to the next wholly open MESEM field, while separately repairing Bilişim course rows from its official source.
6. Retry current 2026 Gastronomi regional PDFs opportunistically; never substitute the withdrawn/stale 2025 source.
