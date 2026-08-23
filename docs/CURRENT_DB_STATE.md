# Current DB State

Updated: 2026-08-24

## Cross-chat handoff rule
- This file is the authoritative continuation point for MTAL/MESEM curriculum work across all ChatGPT conversations in this project.
- Continue from `Current incompleteness focus` / `Next`; never restart or re-import a completed batch unless an audit proves it incorrect.
- Cloud state and official live MTEGM sources override conversational recollection.
- Preserve source provenance, field/branch lineage, protocol/regional variants and cohort applicability. Never fill a source gap from stale cached PDFs.
- DB migrations are applied directly to Lovable Cloud PostgreSQL and then committed to `supabase/migrations`; Lovable AI agent is not used.

## Vocational timetable core
- MTAL canonical catalog: 56 fields / 119 branches.
- MESEM canonical catalog: 39 fields / 193 branches.
- 2026-27: grade 9 current 2026 programs; grades 10-11 primarily living transition sources; grade 12 living transition sources with field-specific exceptions.
- Old/new field or branch names stay as lineage; no destructive normalization.

## Audit
- `audit_mtal_curriculum_v1()` active; current result: 0 findings.
- `audit_mtal_catalog_completeness_v1()` active; migration `20260824025500_mtal_catalog_completeness_audit.sql`.
- Canonical Cloud reference verified: exactly 56 active MTAL fields / 119 active MTAL branches.
- Current completeness result: only Gastronomi ve Mutfak Sanatları is missing; its three canonical branches are Mutfak Sanatları, Pastacılık ve Ekmekçilik, Servis ve Kahve Hazırlama.
- Active MTAL course rows with `needs_review=true`: 0.

## Current MTAL pull progress
- Cloud: 57 distinct persisted MTAL field-name lineages / 1011 active curriculum profiles / 11544 active course-schedule rows.
- `57` is intentionally above canonical 56 because transition aliases/lineages are preserved.
- Endüstriyel Kalite Kontrol grade 10 is complete from official 2025-49 living source: AMP STANDARD, AMP ENTERPRISE_FROM_11 and ATP STANDARD; each has 27 common + 13 vocational + 1 guidance fixed hours and 4 elective = 45. Migration `20260824022500_mtal_ekk_grade10.sql`; audit clean.
- Konaklama ve Seyahat Hizmetleri grades 11-12 are complete from official living sources. Grade 11: Konaklama Hizmetleri, Seyahat Acenteciliği, Animatörlük; AMP STANDARD / ATP STANDARD / AMP ENTERPRISE_FROM_11 represented exactly. Grade 12: AMP enterprise and ATP academic-support transition variants represented exactly. Migration `20260824024000_mtal_konaklama_grade11_12.sql`; audit clean.
- Konaklama grade-9 branch names (`Seyahat Acenteliği`, `Turizmde Etkinlik Hizmetleri`) are not overwritten by upper-grade living names (`Seyahat Acenteciliği`, `Animatörlük`); lineage review metadata is preserved.
- Ayakkabı ve Saraciye Teknolojisi (Protokol) living grades 10-12 complete; AMP only.
- Seramik ve Cam Teknolojisi (Protokol) living grades 10-12 complete; AMP only.
- Tekstil Teknolojisi living grades 10-12 complete for five branches.
- Gazetecilik standard living grades 10-12 complete and separate from protocol variant.
- Havacılık ve Uzay living grades 9-11 populated; no living grade-12 portal entry, so no fabricated row.
- Other previously completed living MTAL chains remain preserved and audit-clean.

## Current incompleteness focus
- Only canonical field without any active MTAL curriculum profile: `Gastronomi ve Mutfak Sanatları`.
- Missing canonical branches: `Mutfak Sanatları`, `Pastacılık ve Ekmekçilik`, `Servis ve Kahve Hazırlama`.
- Current official decisions: 2026-91 Marmara and 2026-92 Doğu Anadolu; withdrawn 2025-75 must not be used for 2026-27.
- Live grade-9 portal lists both regional 2026 programs, but portal targets `marmaragastro_9.pdf` and `dogugastro_9.pdf` currently return 404. Keep source-retry/manual-review; do not persist stale generic `gastro_9.pdf` as current regional data.
- Phased/special programs with no living upper-grade source are not completeness errors and must not be fabricated.

## Next
1. Retry only the two official regional Gastronomi 2026 grade-9 portal PDFs. If exact files recover, import their three canonical branches with regional/decision provenance and rerun both MTAL audits.
2. If Gastronomi PDFs remain unavailable, keep the four completeness findings (1 field + 3 branches) as the final MTAL manual-control list; do not backfill from 2025.
3. Once Gastronomi is resolved or formally left as source-unavailable manual control, freeze MTAL baseline and start MESEM full import with a separate 39/193 completeness audit.
