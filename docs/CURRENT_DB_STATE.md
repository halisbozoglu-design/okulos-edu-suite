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
- Current live Cloud: 200 active curriculum profiles / 1223 active real course-schedule rows / 7 fields with profiles / 25 canonical branches with profiles.
- Current completeness open by canonical difference: 32 fields / 168 branches.
- Profiled fields now: `Ayakkabı ve Saraciye Teknolojisi`, `Bilişim Teknolojileri`, `Büro Yönetimi`, `Denizcilik`, `El Sanatları Teknolojisi`, `Elektrik-Elektronik Teknolojisi`, `Endüstriyel Otomasyon Teknolojileri`.
- Bilişim profiles exist but its exact MESEM `official_course_schedule_catalog` course-row repair is still pending and must preserve the existing profiles.

### Elektrik-Elektronik Teknolojisi
- Living official source: decision 2021-33, official PDF `https://meslek.meb.gov.tr/upload/cop10_mem/2021_elektrik_mem_cop.pdf`.
- All 10 canonical branches now exist in live Cloud, each with grades 9-12 and separate USTALIK/DIPLOMA variants: 80 active profiles total.
- Verified official pattern: USTALIK total 42 hours at grades 9-12; DIPLOMA totals 44 / 44 / 46 / 48 for grades 9 / 10 / 11 / 12; every profile carries 32 hours `İşletmelerde Mesleki Eğitim`.
- Completed branches:
  - `Asansör Sistemleri`
  - `Bobinaj`
  - `Büro Makineleri Teknik Servisi`
  - `Elektrik Tesisatları ve Pano Montörlüğü`
  - `Elektrikli Ev Aletleri Teknik Servisi`
  - `Endüstriyel Bakım Onarım`
  - `Görüntü ve Ses Sistemleri`
  - `Güvenlik Sistemleri`
  - `Haberleşme Sistemleri`
  - `Yüksek Gerilim Sistemleri`
- Migration batch 01: `20260824215000_mesem_elektrik_elektronik_batch01_asansor_bobinaj.sql` — 16 profiles / 102 course rows.
- Migration batch 02: `20260824215800_mesem_elektrik_elektronik_batch02_buro_tesisat.sql` — 16 profiles / 110 course rows.
- Migration batch 03: `20260824224000_mesem_elektrik_elektronik_batch03_ev_aletleri_endustriyel_bakim.sql` — this run added 16 profiles / 108 real course rows (`Elektrikli Ev Aletleri Teknik Servisi` 53 rows; `Endüstriyel Bakım Onarım` 55 rows).
- Batch 03 official source pages: PDF pages 13-14. Electric-home-appliances branch rows: grade 11 `Temizleyici ve Yıkayıcı Ev Aletleri 4 + Elektrik Motorları 2 + Endüstriyel Kontrol ve Arıza Analizi 1`; grade 12 `Isıtıcı ve Pişirici Ev Aletleri 3 + Soğutucular ve Klimalar 2 + Bilgisayar Destekli Uygulamalar 2`. Industrial-maintenance branch rows: grade 11 `Elektrik Makineleri ve Kontrol Sistemleri 4 + Dijital Elektronik 2 + Endüstriyel Kontrol ve Arıza Analizi 1`; grade 12 `Endüstriyel Elektrik Sistemleri 1 + Endüstriyel Kontrol Sistemleri 2 + Mikrokontrol Devreleri 2 + Bilgisayar Destekli Uygulamalar 2`.
- Live Cloud also contains the remaining four Elektrik-Elektronik branches; do not re-import them on the next run. Their repository migration provenance should be reconciled if not already committed.
- Batch-03 validation: 8 profiles per branch; enterprise-hours sum 256 per branch; 53 and 55 real course rows respectively; fixed-hour aggregate 346 for each branch; `audit_mtal_curriculum_v1()` remained 0.

## Current incompleteness focus
- MTAL: only 2026 regional Gastronomi source-unavailable manual review remains (1 field / 3 branches).
- MESEM: 32 fields / 168 branches remain open by canonical difference.
- `Endüstriyel Otomasyon Teknolojileri` is already present in live Cloud with 1 branch / 8 profiles; do not re-import without an audit finding.
- Bilişim course-row repair remains separate from catalog completeness because its profiles already exist.

## Next
1. At the next run, re-read live Cloud first. Treat all 10 Elektrik-Elektronik branches as completed and do not rewrite them.
2. Reconcile GitHub migration provenance for the four Elektrik-Elektronik branches that were already present in live Cloud outside batch 03; if migration files already exist, leave them untouched; if Cloud has rows but repo migration is missing, generate repo-sync migration without reapplying to Cloud.
3. Continue to the next wholly open MESEM field that is not already present in Cloud, using its living official MTEGM source and safe sub-batches.
4. Separately repair Bilişim real course rows from its official MESEM source while preserving existing profiles.
5. After every Cloud batch run per-profile fixed-hour validation, `audit_mesem_catalog_completeness_v1()`, and verify `audit_mtal_curriculum_v1()` remains clean.
6. Retry current 2026 Gastronomi regional PDFs opportunistically; never substitute the withdrawn/stale 2025 source.
