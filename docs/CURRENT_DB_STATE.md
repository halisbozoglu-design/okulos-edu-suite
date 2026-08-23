# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official current catalog: 56 fields / 119 branches
- MESEM official current catalog: 39 fields / 193 branches
- Source: MTEGM `alan_dal_listesi_08092025.pdf`
- MESEM telafi catalog excluded from normal live catalog.
- Idempotent catalog/source-index batch importers are active.

## Framework applicability/source index
- MTAL source index complete: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- Grade 9 uses 2026 programs; grades 10-11 primarily living 2024-41; grade 12 living 2023-40, with field-specific exceptions resolved from portal.
- MESEM source index complete: 38 active portal programs for each grade 9-12.
- Exact PDF URLs are pinned as each framework is parsed.

## Parsed/seeded highlights
- MTAL Bilişim: AMP / ATP / enterprise-from-11 profiles with current-vs-transition applicability.
- MESEM Bilişim: grades 9-12; USTALIK/DIPLOMA variants separate.
- Elektrik-Elektronik: grades 9-12 populated; grade-12 AMP enterprise vs ATP academic-support separation.
- Uçak Bakım: grades 9-12 populated; grade 10 = 4 profiles/60 rows, grade 11 = 4 profiles/58 rows, grade 12 = 4 profiles with AMP enterprise vs ATP academic support.
- Gıda Teknolojisi: grade 9 = 3 profiles/45 rows; grade 10 = 3 profiles/48 rows; grade 11 = 3 profiles/30 rows; grade 12 parsed from `gida_12.pdf` as AMP 10 common + 24 enterprise + 7 elective-vocational + 4 elective = 45 and ATP 10 common + 31 academic support + 4 elective = 45.
- İnşaat Teknolojisi: grade 9 = 6 profiles/90 rows using 2026 Yapı Teknolojisi + Yapı Teknik Ressamlığı. Living transition retains six older branches. Grade 10 = 18 profiles (2024-41), grade 11 = 18 profiles (2024-41), grade 12 = 12 profiles (2023-40). Grade-12 common/enterprise rows seeded; ATP academic-support remains package-based. Exact `insaat_10/11/12.pdf` URLs pinned. Grade 10-11 row-level course data is still pending.
- Sağlık Hizmetleri field name remains unchanged. 2026 grade 9 changes the branch structure to Diş Protez Teknisyenliği + Sağlık Bakım Teknisyenliği. Grade 9 = 6 profiles/96 rows from `saglik_9.pdf` (2026-85). Living grade 10-11 transition under 2024-41 retains Ebe Yardımcılığı, Hemşire Yardımcılığı, Sağlık Bakım Teknisyenliği.
- Sağlık grade 10 = 9 profiles plus real row-level core. Sağlık grade 11 = 9 profiles and row-level course data now COMPLETE from `saglik_11.pdf`: per branch AMP standard = 13 rows/33 fixed h + 12 elective-vocational; ATP = 10 rows/25 fixed h + 20 elective; AMP enterprise-from-11 = 11 rows/41 fixed h + 4 elective. Grade 12 = 6 profiles with AMP enterprise vs ATP academic support; fixed common/enterprise rows already present.
- Makine ve Tasarım grade 9: 19 profiles / 266 rows.
- Metal grade 9: 9 profiles / 135 rows.
- Otomotiv grade 9: 15 profiles / 195 rows; lineage to old Motorlu Araçlar Teknolojisi remains review-required.
- Mobilya grade 9: 6 profiles / 90 rows.
- Moda grade 9: 6 profiles / 84 rows.
- Yiyecek İçecek grade 9: 6 profiles / 90 rows.
- Yenilenebilir Enerji grade 9: 3 profiles / 42 rows.
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

## Next
1. Complete row-level 10-11 details for İnşaat (profiles already complete).
2. Complete branch-scoped elective-vocational and academic-support package eligibility for Sağlık/İnşaat/other parsed fields.
3. Continue accessible 2026 grade-9 MTAL fields; retry Tesisat/Tarım/Tekstil without inference.
4. Continue MESEM field-by-field with USTALIK/DIPLOMA semantics.
5. Resolve source-name lineage changes, then build teaching-area ↔ course eligibility mapping.
