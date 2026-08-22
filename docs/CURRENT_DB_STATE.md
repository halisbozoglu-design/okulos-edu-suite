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

## Framework applicability
- MTAL grade 9 portal: 2026 programs; program names are not force-mapped when they differ from the 2025 field catalog.
- MTAL grades 10-11 portal: primarily 2024-41 living transition programs.
- MTAL grade 12 portal: living transition programs can differ (e.g. 2023-40); resolve from the portal per field.
- MESEM programs are resolved per field and grade from the MTEGM portal; decision years differ by field.

## Pilot parsed programs
- MTAL Bilişim Teknolojileri: AMP / ATP / AMP enterprise-from-11 profiles seeded with current-vs-transition applicability.
- MESEM Bilişim Teknolojileri: Bilgisayar Teknik Servisi and Yazılım Geliştirme profiles seeded for grades 9-12.
- MESEM schedule variants are separate: `USTALIK` and `DIPLOMA`; parenthetical hours are diploma additional difference courses, not generic hour alternatives.

## Scheduling rules already in DB
- Class identity includes education unit/program/field/branch context.
- Vocational practical group planning stores legal suggested vs applied group count separately.
- Coordination blocks are movable and capacity-aware; metropolitan province rules are automatic.
- AMP enterprise days are class-level movable full-day blocks derived from enterprise hours.
- Workshop/practical lessons use resource-aware, minimum-fragmentation block generation; daily class capacity is the upper bound.
- Field lead: 10 h; workshop lead: 6 h; same teacher cannot hold both role types simultaneously.

## Next
1. Complete grade-specific MTAL framework source index and parse current living schedules.
2. Complete MESEM framework source index and parse schedules/explanations.
3. Populate course rows into `official_course_schedule_catalog`.
4. Build teacher teaching-area ↔ course eligibility mapping from official sources.
