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
- Canonical reference: 56 fields / 119 branches; effectively 55 fields / 116 branches populated.
- Only unresolved canonical field: `Gastronomi ve Mutfak Sanatları`.
- Missing branches: `Mutfak Sanatları`, `Pastacılık ve Ekmekçilik`, `Servis ve Kahve Hazırlama`.
- Official current decisions are 2026-91 Marmara and 2026-92 Doğu Anadolu; 2025-75 is withdrawn for 2026-27.
- Live portal lists both regional 2026 programs, but `marmaragastro_9.pdf` and `dogugastro_9.pdf` return 404. Do not backfill from stale generic 2025 `gastro_9.pdf`.
- This is the sole MTAL manual-review/source-retry item unless a later audit finds another issue.

## MESEM audit and progress
- Canonical reference verified from live catalog tables at 39 fields / 193 branches.
- There is currently no callable `audit_mesem_catalog_completeness_v1()` function in Cloud; completeness is computed directly by canonical catalog (`official_vocational_fields` + `official_vocational_branches`) minus active MESEM profiles. Do not report the function as executed until it actually exists.
- Current live Cloud: 200 active curriculum profiles / 1223 active real course-schedule rows / 7 fields with profiles / 25 canonical branches with profiles.
- Current completeness open by canonical difference: 32 fields / 168 branches.
- Profiled fields: `Ayakkabı ve Saraciye Teknolojisi`, `Bilişim Teknolojileri`, `Büro Yönetimi`, `Denizcilik`, `El Sanatları Teknolojisi`, `Elektrik-Elektronik Teknolojisi`, `Endüstriyel Otomasyon Teknolojileri`.
- Bilişim profiles exist but its exact MESEM `official_course_schedule_catalog` course-row repair is still pending and must preserve the existing profiles.

### Elektrik-Elektronik Teknolojisi
- Living official source: decision 2021-33, official PDF `https://meslek.meb.gov.tr/upload/cop9_mem/2021_elektrik_mem_cop.pdf`.
- All 10 canonical branches exist in live Cloud, each with grades 9-12 and separate USTALIK/DIPLOMA variants: 80 active profiles total.
- Verified official pattern for this source: USTALIK total 42 hours at grades 9-12; DIPLOMA totals 44 / 44 / 46 / 48 for grades 9 / 10 / 11 / 12; every profile carries 32 hours `İşletmelerde Mesleki Eğitim`.
- Completed branches: `Asansör Sistemleri`, `Bobinaj`, `Büro Makineleri Teknik Servisi`, `Elektrik Tesisatları ve Pano Montörlüğü`, `Elektrikli Ev Aletleri Teknik Servisi`, `Endüstriyel Bakım Onarım`, `Görüntü ve Ses Sistemleri`, `Güvenlik Sistemleri`, `Haberleşme Sistemleri`, `Yüksek Gerilim Sistemleri`.
- Existing data batch migrations include batch01/batch02/batch03 for the first six branches.
- Repository provenance for the final four pre-existing Cloud branches was reconciled with guard migration `20260824235500_mesem_elektrik_elektronik_repo_sync_final_four_guard.sql` (commit `53fae7af846c1669eb525ca41b90f3a1b89a2d2e`). This guard intentionally performs no duplicate data writes; it asserts the already-existing Cloud state.
- Final-four guard validation passed in Cloud: 32 profiles / 224 real course rows; branch row counts `Görüntü ve Ses Sistemleri=55`, `Güvenlik Sistemleri=57`, `Haberleşme Sistemleri=57`, `Yüksek Gerilim Sistemleri=55`; all profiles decision `2021-33`, source URL exact, source pages 15/16/17/18, USTALIK/DIPLOMA only, and every IME row exactly 32 hours.
- `audit_mtal_curriculum_v1()` remained 0 findings after validation.

### Gazetecilik (Protokol Kapsamında) source-retry
- This is the next canonical MESEM field targeted after Elektrik-Elektronik.
- Current official MTEGM MEM 9th-grade DBF listing does not expose Gazetecilik among the MEM field DBFs, while MTAL portal results do expose `Gazetecilik - Protokol`; the MTAL program must not be substituted for MESEM.
- A current official MESEM weekly course-table PDF for the protocol branches was not located in the official MEB/MTEGM search during the 2026-08-24 run. No profiles/course rows were invented or written.
- Keep `Gazetecilik (Protokol Kapsamında)` in source-retry/manual-review and continue to the next source-accessible canonical MESEM field.

## Current incompleteness focus
- MTAL: only 2026 regional Gastronomi source-unavailable manual review remains (1 field / 3 branches).
- MESEM: 32 fields / 168 branches remain open by canonical difference.
- `Endüstriyel Otomasyon Teknolojileri` is already present in live Cloud with 1 branch / 8 profiles; do not re-import without an audit finding.
- Bilişim course-row repair remains separate from catalog completeness because its profiles already exist.

## Next
1. Treat all 10 Elektrik-Elektronik branches and their repository provenance as completed; do not rewrite them.
2. Skip Gazetecilik protocol until a direct official MESEM weekly course-table source is accessible; retry opportunistically, never substitute MTAL.
3. Continue to the next wholly open, source-accessible canonical MESEM field from the official MEM portal/official PDF set.
4. Separately repair Bilişim real course rows from its official MESEM source while preserving existing profiles.
5. After every data batch run per-profile fixed-hour validation and canonical completeness difference; verify `audit_mtal_curriculum_v1()` remains clean.
6. Retry current 2026 MTAL Gastronomi regional PDFs opportunistically; never substitute the withdrawn/stale 2025 source.
