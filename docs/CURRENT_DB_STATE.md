# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official current catalog: 56 fields / 119 branches
- MESEM official current catalog: 39 fields / 193 branches
- Source: MTEGM `alan_dal_listesi_08092025.pdf`
- MESEM telafi catalog is intentionally excluded from the normal live catalog.
- `upsert_official_vocational_catalog_batch(jsonb)` is the idempotent catalog importer.
- `official_vocational_framework_sources` stores grade-specific live framework source discovery and review state.
- `upsert_official_vocational_framework_sources_batch(jsonb)` is the source-index importer.

## Framework applicability/source index
- MTAL source index complete: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- MTAL grade 9 portal: 2026 programs; names are not force-mapped when they differ from the 2025 field catalog.
- MTAL grade 10: primarily 2024-41, with portal exceptions such as Endüstriyel Kalite Kontrol 2025-49 and Yapay Zekâ 2025-23.
- MTAL grade 11: living 2024-41 programs in the current portal set.
- MTAL grade 12: living 2023-40 transition programs in the current portal set.
- MESEM source index complete: 38 active portal programs for each grade 9-12; decisions are field-specific.
- Exact PDF URLs are pinned as each framework is parsed.

## Parsed/seeded programs
- MTAL Bilişim Teknolojileri: AMP / ATP / AMP enterprise-from-11 profiles seeded with current-vs-transition applicability.
- MESEM Bilişim Teknolojileri: Bilgisayar Teknik Servisi and Yazılım Geliştirme grades 9-12; `USTALIK` and `DIPLOMA` variants separate.
- MTAL Elektrik-Elektronik: grade 9 (2026) 12 profiles / 168 rows; grade 10 (2024-41) 16 profiles / 240 rows; grade 11 (2024-41) 16 profiles with real rows; grade 12 (2023-40) 11 profiles with AMP enterprise and ATP academic-support separation.
- `academic_support_hours` added by `20260823023500_academic_support_hours.sql`; 2023-40 ATP academic support is not stored as generic elective hours.
- 2023-40 validation requires table visual + row arithmetic + explanation text when extracted text shifts columns.
- MTAL Makine ve Tasarım grade 9: 19 profiles / 266 rows.
- MTAL Metal grade 9: 9 profiles / 135 rows.
- MTAL Otomotiv grade 9: 15 profiles / 195 rows; lineage to old `Motorlu Araçlar Teknolojisi` remains review-required.
- MTAL Mobilya ve İç Mekân Tasarımı grade 9: 6 profiles / 90 rows.
- MTAL Moda Tasarım Teknolojileri grade 9: 6 profiles / 84 rows.
- MTAL Yiyecek İçecek Hizmetleri grade 9: 6 profiles / 90 rows.
- MTAL Yenilenebilir Enerji Teknolojileri grade 9: 3 profiles / 42 rows.
- MTAL Uçak Bakım grade 9: 4 AMP/ATP profiles / 60 rows; no enterprise-from-11 variant in 2026 source.
- MTAL Uçak Bakım grade 10 (2024-41): 4 profiles / 60 real rows; each 43 fixed + 4 elective = 47.
- MTAL Uçak Bakım grade 11 (2024-41): 4 profiles / 58 real rows; AMP fixed 39 + 8 elective-vocational = 47, ATP fixed 30 + 17 elective = 47.
- MTAL Uçak Bakım grade 12 (2023-40): 4 profiles. AMP = 10 common + 24 enterprise + 7 elective-vocational + 4 elective = 45; ATP = 10 common + 31 academic support + 4 elective = 45. Exact `ucak_10/11/12.pdf` URLs pinned.
- MTAL Gıda Teknolojisi grade 9: 3 profiles / 45 rows.
- MTAL Gıda Teknolojisi grade 10 (2024-41): AMP/ATP/enterprise-from-11 = 3 profiles / 48 real rows; 41 fixed + 4 elective = 45.
- MTAL Gıda Teknolojisi grade 11 (2024-41): 3 profiles / 30 real rows; AMP fixed 33 + 12 elective-vocational = 45, ATP fixed 25 + 20 elective = 45, enterprise-from-11 fixed 41 + 4 elective = 45. Exact `gida_10/11/12.pdf` URLs pinned; grade 12 still to parse from 2023-40.
- MTAL İnşaat Teknolojisi grade 9: 6 profiles / 90 rows; 2026 uses Yapı Teknolojisi + Yapı Teknik Ressamlığı while older branches remain for transition lineage.
- MTAL Sağlık Hizmetleri grade 9: 6 profiles / 96 rows; 2026 uses Diş Protez Teknisyenliği + Sağlık Bakım Teknisyenliği while older branches remain for transition lineage.
- Tesisat 2026 PDF timed out in prior pass; Tarım/Tekstil 2026 source fetch returned 404. No inferred rows persisted.

## Scheduling rules already in DB
- Class identity includes education unit/program/field/branch context.
- Vocational practical group planning stores legal suggested vs applied group count separately.
- Coordination blocks are movable and capacity-aware; metropolitan province rules are automatic.
- AMP enterprise days are class-level movable full-day blocks derived from enterprise hours.
- Workshop/practical lessons use resource-aware, minimum-fragmentation block generation; daily class capacity is the upper bound.
- Vocational framework continuity rule is stored as a strong solver constraint with provenance.
- 2023-40 ATP grade-12 academic support is a separate package requirement.
- Field lead: 10 h; workshop lead: 6 h; same teacher cannot hold both role types simultaneously.

## Next
1. Parse Gıda grade 12 (2023-40), then İnşaat and Sağlık grades 10-12 from exact grade-specific sources.
2. Continue accessible 2026 grade-9 MTAL fields; retry Tesisat/Tarım/Tekstil without inference.
3. Parse academic-support package tables and branch-scoped elective-vocational eligibility.
4. Continue MESEM field-by-field with USTALIK/DIPLOMA semantics.
5. Resolve source-name lineage changes.
6. Build teacher teaching-area ↔ course eligibility mapping after curriculum rows are substantially complete.
