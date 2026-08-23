# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official current catalog: 56 fields / 119 branches.
- MESEM official current catalog: 39 fields / 193 branches.
- Source: user-supplied MTEGM `alan_dal_listesi_08092025.pdf`.
- Every MTAL pull is cross-checked against this user-supplied field/branch catalog and the live class-specific MTEGM framework source.
- Name changes are not force-normalized; old catalog name <-> new live name stays as lineage/manual-review where needed.
- MESEM telafi catalog excluded from normal live catalog.
- MTAL is not complete until completeness audit + manual-review list are closed.

## Framework applicability/source index
- MTAL source index: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- Grade 9 uses 2026 programs; grades 10-11 primarily living 2024-41; grade 12 living 2023-40, with field-specific exceptions.
- If portal says 2026 but PDF fetch is timeout/stale, inferred rows are not persisted; item stays source-retry/manual-review.

## Audit
- `audit_mtal_curriculum_v1()` active in Cloud; migration `20260823130500_mtal_curriculum_audit.sql`.
- Current persisted-profile audit result: 0 findings.
- Final completeness review separately checks missing field/branch/grade/source-lineage against 56/119 catalog and live portal.

## Current MTAL pull progress
- Cloud: 53 distinct populated MTAL field names / 933 active curriculum profiles / 10737 active course-schedule rows.
- Core completed/clean chains include Bilişim, Elektrik-Elektronik, Uçak Bakım, Gıda, Metal, Mobilya, Moda, Makine ve Tasarım, Denizcilik, İtfaiyecilik, Hasta ve Yaşlı, Yiyecek İçecek, Kimya, Biyomedikal, Pazarlama, Hayvan Yetiştiriciliği, Güzellik, Harita-Tapu-Kadastro, Gemi Yapımı, Halkla İlişkiler, Kuyumculuk, Laboratuvar Hizmetleri, Maden, Mikromekanik, Geleneksel Türk Sanatları and El Sanatları across their imported living grade ranges.
- İnşaat and Sağlık retain current-vs-transition branch lineage rather than destructive normalization.
- Motorlu Araçlar 10-12 is populated; 2026 grade 9 remains under new live name `Otomotiv Teknolojileri` as lineage/manual-review.
- Aile ve Tüketici 10-12 is populated; 2026 portal `Sosyal Hizmetler` lineage remains review-required.
- Havacılık ve Uzay living grades 9-11 populated, protocol-scoped and ATP-only; portal has no living grade-12 entry.
- Tarım: living 10-11 2024-41 rows now complete; grade 12 living 2023-40 complete with AMP 10 common + 24 enterprise + 7 elective-vocational + 4 elective and ATP 10 common + 31 academic-support + 4 elective. Audit clean. Current 2026 grade 9 remains separate source-retry/manual-review.
- Plastik Sanatlar: living 10-11 2024-41 and grade 12 2023-40 complete; conditional enterprise-from-11 and academic-support split persisted. Audit clean. Current 2026 grade 9 remains separate source-retry/manual-review.
- Tesisat Teknolojisi ve İklimlendirme: living 10-11 complete for `Tesisat ve Enerji Sistemleri` + `Soğutma ve İklimlendirme Sistemleri`; grade 12 living 2023-40 complete for both branches. Audit clean. Current 2026 grade 9 remains separate source-retry/manual-review.
- Matbaa Teknolojisi: living 10-11 complete for `Baskı Öncesi` + `Ofset Baskı Sistemleri`; grade 12 living 2023-40 complete. Audit clean. 2026 grade 9 is under new live name `Basım Teknolojileri`; lineage is preserved and not force-normalized.
- Endüstriyel Kalite Kontrol grade 9 populated; living grade 10 confirmed under 2025-49 but exact file access remains source-retry/manual-review.
- Konaklama grade 9 populated; standard upper-grade source access remains source-retry (protocol source is not substituted).
- Tekstil and remaining current-2026 grade-9 source-fetch problem fields remain source-retry/manual-review; stale cached rows are not accepted.

## Scheduling rules already in DB
- Class identity includes education unit/program/field/branch context.
- Practical grouping stores legal suggested vs applied group count separately.
- Coordination blocks are movable/capacity-aware; metropolitan province rules automatic.
- AMP enterprise days are class-level movable full-day blocks derived from official enterprise hours.
- Workshop/practical lessons are resource-aware with minimum fragmentation and daily class capacity as upper bound.
- 2023-40 ATP grade-12 academic support is a separate package requirement, not generic elective hours.
- Field lead: 10 h; workshop lead: 6 h; same teacher cannot hold both role types simultaneously.

## Final MTAL audit requirements
- Reconcile expected MTAL fields/branches against user-supplied 56-field/119-branch catalog and live portal.
- Grade 9/10/11/12 coverage per living source.
- Exact AMP/ATP/enterprise-from-11/academic-support variants only when source supports them.
- Detect profile-without-course-rows and rows-without-profile.
- Validate fixed row-hour sum and official total-hour target.
- Validate enterprise-hour pattern, source conditions, PDF/decision provenance and stale-cache/year mismatches.
- Validate old/new field and branch lineage without accidental normalization.
- Final unresolved items listed as field -> branch -> grade -> reason for manual verification.

## Next
1. Complete Tekstil Teknolojisi living 10-12 branch-by-branch.
2. Continue remaining source-accessible MTAL fields and protocol/special programs.
3. Retry current-2026 grade-9 sources separately; never use stale old 44-hour PDFs as 2026.
4. Keep unresolved 404/timeout/name-lineage cases in manual-review while pulling continues.
5. Run final completeness audit and produce manual-control list.
6. Only after MTAL closure, begin MESEM full import and equivalent audit.
