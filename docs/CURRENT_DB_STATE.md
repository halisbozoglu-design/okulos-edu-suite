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
- Cloud: 42 distinct populated MTAL field names / 821 active curriculum profiles / 9530 active course-schedule rows.
- Bilişim, Elektrik-Elektronik, Uçak Bakım, Gıda, Metal, Mobilya, Moda, Makine ve Tasarım, Denizcilik, İtfaiyecilik, Hasta ve Yaşlı, Yiyecek İçecek and several other chains are populated across their living grade ranges and audit-clean.
- İnşaat and Sağlık retain current-vs-transition branch lineage rather than destructive normalization.
- Motorlu Araçlar 10-12 is populated; 2026 grade 9 remains under new live name `Otomotiv Teknolojileri` as lineage/manual-review.
- Aile ve Tüketici 10-12 is populated; 2026 portal `Sosyal Hizmetler` lineage remains review-required.
- Kimya Teknolojisi 10-12 complete for Kimya Laboratuvarı / Petrol Endüstrisi / Proses.
- Biyomedikal Cihaz Teknolojileri 10-12 complete for all four supplied branches.
- Pazarlama ve Perakende is now complete across 9-12; Satış Danışmanlığı + Sigortacılık, including conditional enterprise-from-11 and grade-12 academic-support split.
- Hayvan Yetiştiriciliği ve Sağlığı 10-12 complete; enterprise-from-11 condition and grade-12 AMP/ATP split persisted.
- Güzellik Hizmetleri 10-12 complete from `guzellik_10.pdf` / `guzellik_12.pdf`; 10=13 vocational, 11 AMP=17, ATP/enterprise core=9, grade-12 AMP enterprise / ATP academic support; audit clean.
- Harita-Tapu-Kadastro 10-12 complete for `Tapu` + `Harita Kadastro`; branch-specific 10/11 courses, enterprise-from-11 condition and 2023-40 grade-12 split persisted; audit clean.
- Gemi Yapımı 10-12 complete for `Gemi İnşa` + `Yat İnşa` + `Gemi Donatım`; branch-specific 10/11 rows, conditional enterprise-from-11 and 2023-40 grade-12 AMP/ATP split persisted; audit clean.
- Havacılık ve Uzay living grades 9-11 populated, protocol-scoped and ATP-only; portal has no living grade-12 entry.
- Endüstriyel Kalite Kontrol grade 9 populated; living grade 10 confirmed under 2025-49 but exact file access remains source-retry/manual-review.
- Konaklama grade 9 populated; standard upper-grade source access currently unstable and remains source-retry (protocol source is not substituted).
- Tesisat / Tarım / Tekstil and other current-2026 source-fetch problem fields remain source-retry/manual-review; stale cached rows are not accepted.

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
1. Continue source-accessible empty MTAL fields first.
2. Retry current-2026 grade-9 sources separately; never use stale old 44-hour PDFs as 2026.
3. Keep unresolved 404/timeout/name-lineage cases in manual-review while pulling continues.
4. Run final completeness audit and produce manual-control list.
5. Only after MTAL closure, begin MESEM full import and equivalent audit.
