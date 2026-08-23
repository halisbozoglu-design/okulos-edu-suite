# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official current catalog: 56 fields / 119 branches.
- MESEM official current catalog: 39 fields / 193 branches.
- Source: MTEGM `alan_dal_listesi_08092025.pdf`.
- MESEM telafi catalog excluded from normal live catalog.
- Idempotent catalog/source-index batch importers are active.
- Finalization rule: MTAL is NOT complete until an automated audit verifies field -> branch -> grade -> program/schedule variant -> profile -> row-level courses -> hours -> exact source chain with zero unresolved gaps. Only after MTAL audit passes do we proceed to MESEM, then run the same MESEM audit.

## Framework applicability/source index
- MTAL source index complete: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- Grade 9 uses 2026 programs; grades 10-11 primarily living 2024-41; grade 12 living 2023-40, with field-specific exceptions resolved from portal.
- MESEM source index complete: 38 active portal programs for each grade 9-12.
- Exact PDF URLs are pinned as each framework is parsed.
- If the live portal says 2026 but the PDF fetch times out or a stale cached PDF returns an older schedule, do not persist inferred data; mark for source retry/audit.

## Parsed/seeded highlights
- MTAL Bilişim: AMP / ATP / enterprise-from-11 profiles with current-vs-transition applicability.
- MESEM Bilişim: grades 9-12; USTALIK/DIPLOMA variants separate.
- Elektrik-Elektronik: grades 9-12 populated; grade-12 AMP enterprise vs ATP academic-support separation.
- Uçak Bakım: grades 9-12 populated; grade 10 = 4 profiles/60 rows, grade 11 = 4 profiles/58 rows, grade 12 = 4 profiles with AMP enterprise vs ATP academic support.
- Gıda Teknolojisi: grades 9-12 populated; grade 12 AMP = 10 common + 24 enterprise + 7 elective-vocational + 4 elective = 45; ATP = 10 common + 31 academic support + 4 elective = 45.
- İnşaat Teknolojisi: grade 9 = 6 profiles/90 rows using 2026 Yapı Teknolojisi + Yapı Teknik Ressamlığı. Living transition retains six older branches. Grade 10 = 18 profiles and row-level data COMPLETE: each profile 41 fixed + 4 elective = 45. Grade 11 = 18 profiles and row-level data COMPLETE: AMP standard 33 fixed + 12 elective-vocational, ATP 25 fixed + 20 elective, enterprise-from-11 41 fixed + 4 elective. Grade 12 = 12 profiles (2023-40), AMP enterprise vs ATP academic-support structure present.
- Sağlık Hizmetleri field name remains unchanged. Grade 9 = 6 profiles/96 rows using 2026 Diş Protez Teknisyenliği + Sağlık Bakım Teknisyenliği. Living grade 10-11 transition retains Ebe Yardımcılığı, Hemşire Yardımcılığı, Sağlık Bakım Teknisyenliği. Grade 11 row-level data COMPLETE for all 9 profiles; grade 12 AMP/ATP fixed rows present.
- Makine ve Tasarım grade 9: 19 profiles / 266 rows.
- Metal Teknolojisi: grades 9-12 now populated. Grade 10 = 6 profiles with 41 fixed + 4 elective = 45. Grade 11 = 6 profiles with AMP standard 33, ATP 25, enterprise-from-11 41 fixed hours. Grade 12 = 4 profiles: AMP 34 fixed (10 common + 24 enterprise) plus 7 elective-vocational + 4 elective = 45; ATP 10 fixed + 31 academic support + 4 elective = 45.
- Otomotiv grade 9: 15 profiles / 195 rows; lineage to old Motorlu Araçlar Teknolojisi remains review-required.
- Mobilya ve İç Mekân Tasarımı: grades 9-12 now populated. 2026 grade 9 uses `İç Mekân Ressamlığı`; living 2024/2023 transition source uses `Mobilya İç Mekân Ressamlığı`, preserved for lineage. Grade 10 = 6 profiles with 41 fixed + 4 elective. Grade 11 = 6 profiles validated after detecting/fixing an omitted 2h `Tasarım ve Malzeme Bilgisi` row in ATP/enterprise variants; final fixed hours are 33 / 25 / 41. Grade 12 = 4 profiles: AMP 34 fixed + 7 elective-vocational + 4 elective = 45; ATP 10 fixed + 31 academic support + 4 elective = 45.
- Moda grade 9: 6 profiles / 84 rows.
- Yiyecek İçecek grade 9: 6 profiles / 90 rows.
- Yenilenebilir Enerji grade 9: 3 profiles / 42 rows.
- Tesisat 9 live portal is 2026, but current live PDF fetch can time out while search cache returns an older 44-hour schedule; no stale/inferred 2026 rows persisted.
- `academic_support_hours` exists from migration `20260823023500_academic_support_hours.sql`.
- 2023-40 validation rule: table visual + row arithmetic + explanation text; extracted text alone is not authoritative where columns shift.

## Scheduling rules already in DB
- Class identity includes education unit/program/field/branch context.
- Practical grouping stores legal suggested vs applied group count separately.
- Coordination blocks are movable/capacity-aware; metropolitan province rules automatic.
- AMP enterprise days are class-level movable full-day blocks derived from official enterprise hours.
- Workshop/practical lessons are resource-aware with minimum fragmentation and daily class capacity as upper bound.
- 2023-40 ATP grade-12 academic support is a separate package requirement, not generic elective hours.
- Field lead: 10 h; workshop lead: 6 h; same teacher cannot hold both role types simultaneously.

## Final MTAL audit requirements
- Expected MTAL fields/branches against official catalog and live portal.
- Grade 9/10/11/12 coverage per living source.
- Exact AMP/ATP/enterprise-from-11/academic-support variants only when source supports them.
- Detect profile-without-course-rows and rows-without-profile.
- Validate fixed row-hour sum against `required_hour_total`.
- Validate fixed + elective/elective-vocational/academic-support totals against official `total_hour_target`.
- Validate enterprise-hour pattern and source condition annotations.
- Validate exact PDF/decision provenance and unresolved source retries.
- Validate 2026-vs-transition branch/field name lineage and no accidental normalization.
- Detect stale-cache or source-year mismatches.
- MTAL completion requires zero unresolved ERROR findings; warnings must be explicitly reviewed.

## Next
1. Continue MTAL field-by-field; prefer reliable living transition PDFs while retrying 2026 sources that are stale/timeout.
2. Continue branch-scoped elective-vocational and academic-support package eligibility.
3. Complete remaining 2026 grade-9 fields and all living 10-12 transition rows.
4. Run final MTAL audit and repair every finding.
5. Only then begin MESEM full import and equivalent MESEM audit.
