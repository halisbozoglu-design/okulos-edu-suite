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
- MESEM source index complete: 38 active portal programs for each grade 9-12; decisions are field-specific (2021/2022/2023 etc.).
- Listing URLs are used only for initial source discovery; exact PDF URLs replace them as each framework is parsed.

## Parsed/seeded programs
- MTAL Bilişim Teknolojileri: AMP / ATP / AMP enterprise-from-11 profiles seeded with current-vs-transition applicability.
- MESEM Bilişim Teknolojileri: Bilgisayar Teknik Servisi and Yazılım Geliştirme profiles seeded for grades 9-12.
- MESEM schedule variants are separate: `USTALIK` and `DIPLOMA`; parenthetical hours are diploma additional difference courses, not generic hour alternatives.
- MTAL Elektrik-Elektronik Teknolojisi 2026 grade-9 profiles seeded for the exact branch/program combinations present in `elektrik_9.pdf` (12 profile variants); 168 active required/application/guidance rows.
- MTAL Elektrik-Elektronik Teknolojisi living transition: grade 10 = 16 profiles + 240 real course rows from `elektrik_10.pdf` (2024-41); every profile has 41 fixed row-hours + 4 elective = 45. Grade 11 = 16 transition profiles from `elektrik_11.pdf`, preserving AMP/ATP/enterprise-from-11 differences. Grade 12 source pinned to `elektrik_12.pdf` (2023-40) and awaits separate parse because the older framework includes additional academic-support structure.
- MTAL Makine ve Tasarım Teknolojisi 2026 grade-9: 19 exact branch/program variants; 266 required/application/guidance rows. Fixed row-hours = 41, elective quota = 4, total = 45.
- MTAL Metal Teknolojisi 2026 grade-9: 9 exact branch/program variants; 135 required/application/guidance rows. Fixed row-hours = 41, elective quota = 4, total = 45.
- MTAL Otomotiv Teknolojileri 2026 grade-9: 15 exact branch/program variants; 195 required/application/guidance rows. Fixed row-hours = 41, elective quota = 4, total = 45.
- MTAL Mobilya ve İç Mekân Tasarımı 2026 grade-9: 6 profiles (Mobilya Üretim Teknolojisi / İç Mekân Ressamlığı × AMP/ATP/enterprise-from-11); 90 real course rows; fixed row-hours = 41 + 4 elective = 45. Exact source `mobilya_9.pdf`.
- MTAL Moda Tasarım Teknolojileri 2026 grade-9: 6 profiles (Giysi Kalıp Tasarımı ve Üretimi / Terzilik × AMP/ATP/enterprise-from-11); 84 real course rows; fixed row-hours = 41 + 4 elective = 45. Exact source `moda_9.pdf`.
- MTAL Yiyecek İçecek Hizmetleri 2026 grade-9: 6 profiles (Aşçılık / Pastacılık × AMP/ATP/enterprise-from-11); 90 real course rows; fixed row-hours = 41 + 4 elective = 45. Exact source `yiyecek_9.pdf`.
- Exact PDFs pinned for Makine, Metal, Otomotiv, Mobilya, Moda, Yiyecek-İçecek and Elektrik-Elektronik transition grades.
- `Otomotiv Teknolojileri` remains review-required against older live catalog name `Motorlu Araçlar Teknolojisi`; source names are not force-normalized.
- 2026 branch-name changes are source-preserved; older living branch names are not deleted because upper-grade transition programs may still use them.

## Scheduling rules already in DB
- Class identity includes education unit/program/field/branch context.
- Vocational practical group planning stores legal suggested vs applied group count separately.
- Coordination blocks are movable and capacity-aware; metropolitan province rules are automatic.
- AMP enterprise days are class-level movable full-day blocks derived from enterprise hours.
- Workshop/practical lessons use resource-aware, minimum-fragmentation block generation; daily class capacity is the upper bound.
- 2026 vocational framework rule: vocational lessons should be planned without breaking stated weekly-hour integrity or, where possible, in consecutive periods; stored as a strong solver constraint with provenance.
- Field lead: 10 h; workshop lead: 6 h; same teacher cannot hold both role types simultaneously.

## Next
1. Continue 2026 grade-9 MTAL fields field-by-field: exact PDF → exact variants → category totals → course rows → explanations.
2. Complete Elektrik-Elektronik grade-11 real course rows and separately parse grade-12 2023-40 academic-support variants.
3. Fill living transition rows for other grades 10-12 from their grade-specific portal sources instead of applying 2026 PDFs blindly.
4. Continue MESEM field-by-field: exact PDF → USTALIK/DIPLOMA semantics → rows/explanations.
5. Resolve source-name lineage where 2026 field/branch names differ from still-living transition names.
6. Build teacher teaching-area ↔ course eligibility mapping from official sources after curriculum rows are substantially complete.
