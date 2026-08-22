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
- Listing URLs are only discovery sources; exact PDF URLs replace them as each framework is parsed.

## Parsed/seeded programs
- MTAL Bilişim Teknolojileri: AMP / ATP / AMP enterprise-from-11 profiles seeded with current-vs-transition applicability.
- MESEM Bilişim Teknolojileri: Bilgisayar Teknik Servisi and Yazılım Geliştirme grades 9-12; `USTALIK` and `DIPLOMA` variants separate.
- MTAL Elektrik-Elektronik grade 9 (2026): 12 profiles / 168 real rows.
- MTAL Elektrik-Elektronik grade 10 (2024-41): 16 profiles / 240 real rows.
- MTAL Elektrik-Elektronik grade 11 (2024-41): 16 profiles; real rows complete. AMP standard fixed 33 h; ATP fixed 25 h; AMP enterprise-from-11 fixed 41 h; quotas complete to 45 h.
- MTAL Elektrik-Elektronik grade 12 (2023-40): 11 profiles. AMP = 11 common + 24 enterprise + 7 elective vocational + 1 guidance = 43 h. ATP = 11 common + 31 academic support + 1 guidance = 43 h. Savunma Elektronik Sistemleri ATP only.
- `academic_support_hours` added by `20260823023500_academic_support_hours.sql`; 2023-40 ATP academic support is not stored as generic elective hours.
- 2023-40 table validation requires visual table + row arithmetic + explanation text because extracted text may shift columns/totals.
- MTAL Makine ve Tasarım grade 9: 19 profiles / 266 rows; 41 fixed + 4 elective = 45.
- MTAL Metal grade 9: 9 profiles / 135 rows; 41 fixed + 4 elective = 45.
- MTAL Otomotiv grade 9: 15 profiles / 195 rows; 41 fixed + 4 elective = 45; name lineage to old `Motorlu Araçlar Teknolojisi` remains review-required.
- MTAL Mobilya ve İç Mekân Tasarımı grade 9: 6 profiles / 90 rows; 41 + 4 = 45.
- MTAL Moda Tasarım Teknolojileri grade 9: 6 profiles / 84 rows; 41 + 4 = 45.
- MTAL Yiyecek İçecek Hizmetleri grade 9: 6 profiles / 90 rows; 41 + 4 = 45.
- MTAL Yenilenebilir Enerji Teknolojileri grade 9 (2026): single branch, 3 profile variants (AMP / ATP / AMP enterprise-from-11), 42 real rows; 41 fixed + 4 elective = 45. Exact source `yenilenebilir_9.pdf`.
- Tesisat Teknolojisi ve İklimlendirme 2026 PDF fetch timed out in the latest pass; no inferred data was persisted.

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
1. Continue 2026 grade-9 MTAL fields with exact PDFs; retry Tesisat without inferring missing rows.
2. Parse 2023-40 academic-support packages and branch-scoped elective vocational tables.
3. Fill living transition rows for other grades 10-12 from grade-specific portal sources.
4. Continue MESEM field-by-field with USTALIK/DIPLOMA semantics.
5. Resolve source-name lineage changes.
6. Build teacher teaching-area ↔ course eligibility mapping after curriculum rows are substantially complete.
