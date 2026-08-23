# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official catalog: 56 fields / 119 branches.
- MESEM official catalog: 39 fields / 193 branches.
- Source: user-supplied MTEGM `alan_dal_listesi_08092025.pdf` plus live MTEGM class-specific framework portal.
- Old/new field or branch names are preserved as lineage; no destructive normalization.
- MTAL is not complete until completeness audit + manual-review list are closed.

## Applicability
- MTAL source index: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- 2026-27: grade 9 current 2026 programs; grade 10-11 primarily living 2024-41; grade 12 living transition sources, with field-specific exceptions.
- 404/timeout/stale PDFs are never used to infer current rows; those items stay source-retry/manual-review.

## Audit
- `audit_mtal_curriculum_v1()` active in Cloud; migration `20260823130500_mtal_curriculum_audit.sql`.
- Current persisted-profile audit result: 0 findings.
- Final completeness review separately checks missing field/branch/grade/source-lineage against 56/119 catalog and live portal.

## Current MTAL pull progress
- Cloud: 57 distinct persisted MTAL field-name lineages / 993 active curriculum profiles / 11366 active course-schedule rows.
- `57` is intentionally greater than the canonical 56-field catalog count because current-vs-transition aliases/lineages such as Motorlu Araçlar/Otomotiv, Matbaa/Basım and similar names are preserved rather than destructively merged.
- Major living chains already populated/audit-clean include Bilişim, Elektrik-Elektronik, Uçak Bakım, Gıda, İnşaat, Sağlık, Metal, Mobilya, Moda, Makine ve Tasarım, Denizcilik, İtfaiyecilik, Hasta ve Yaşlı, Yiyecek İçecek, Kimya, Biyomedikal, Pazarlama, Hayvan Yetiştiriciliği, Güzellik, Harita-Tapu-Kadastro, Gemi Yapımı, Halkla İlişkiler, Kuyumculuk, Laboratuvar Hizmetleri, Maden, Mikromekanik, Geleneksel Türk Sanatları, El Sanatları, Tarım, Plastik Sanatlar, Tesisat, Matbaa/Basım lineage, Tekstil and Gazetecilik.
- Ayakkabı ve Saraciye Teknolojisi (Protokol Kapsamında) living grades 10-12 complete for `Ayakkabı Tasarımı ve Üretimi` + `Saraciye Tasarımı ve Üretimi`. Program is protocol-scoped AMP only; no ATP profile is fabricated. Grade 10=27 common+13 vocational+1 guidance+4 elective; grade 11=15 common+26 vocational/enterprise-application+4 elective; grade 12=10 common+24 enterprise+7 elective-vocational+4 elective. Audit clean. Current 2026 grade 9 remains source-retry.
- Seramik ve Cam Teknolojisi (Protokol Kapsamında) living grades 10-12 complete for `Seramik` + `Cam`, protocol-scoped AMP only. Source explicitly states İstanbul Sanayi Odası protocol scope. Seramik grade 12 includes additional 2h Bilgisayarda Desen Tasarımı, so its fixed/elective split differs from Cam. Audit clean. Current 2026 grade 9 remains source-retry/lineage review because portal label omits the catalog protocol suffix.
- Gastronomi ve Mutfak Sanatları is now a regional current-program case: 2026-91 Marmara and 2026-92 Doğu Anadolu replace withdrawn 2025-75. Portal lists both current grade-9 programs, but direct `marmaragastro_9.pdf` and `dogugastro_9.pdf` currently return 404. No stale 2025 generic `gastro_9.pdf` rows are persisted. Item remains source-retry/manual-review.
- Havacılık ve Uzay living grades 9-11 populated, protocol-scoped and ATP-only; no living grade-12 portal entry.
- Endüstriyel Kalite Kontrol grade 9 populated; living grade 10 confirmed under 2025-49 but exact file access remains source-retry/manual-review.
- Konaklama grade 9 populated; standard upper-grade source access remains source-retry; protocol source is not substituted.
- Current-2026 grade-9 source-retry/manual-review remains for many fields whose direct PDFs are stale/404/timeout; living upper-grade chains are imported independently.

## Current incompleteness focus
- Fully unresolved canonical field: Gastronomi ve Mutfak Sanatları (regional 2026 grade-9 PDFs 404; no living upper grades yet in portal).
- Phased/special programs with no current upper-grade source: Siber Güvenlik, Yapay Zekâ, Havacılık ve Uzay grade 12; do not fabricate rows.
- Endüstriyel Kalite Kontrol grade 10 uses 2025-49 and remains source-retry.
- Konaklama ve Seyahat Hizmetleri upper grades remain source-retry.
- Current 2026 grade-9 retry queue includes Ayakkabı-Protokol, Seramik/Cam, Gazetecilik, Geleneksel Türk Sanatları, Güzellik, Halkla İlişkiler, Hayvan, Kuyumculuk, Laboratuvar, Maden, Mikromekanik, Plastik Sanatlar, Tarım, Tekstil and other fields already complete in living upper grades.

## Final MTAL audit requirements
- Reconcile expected fields/branches against user-supplied 56/119 catalog and live portal.
- Validate living grade coverage and exact AMP/ATP/enterprise/academic-support/protocol/regional variants.
- Detect profile-without-rows and rows-without-profile.
- Validate fixed row-hour sums, official total targets, enterprise-hour patterns and source conditions.
- Validate exact PDF/decision provenance, stale-cache/year mismatches and old/new field/branch lineage.
- Final unresolved list format: field -> branch -> grade -> reason.

## Next
1. Retry current-2026 grade-9 source files directly from portal links; never use stale old 44-hour PDFs as 2026.
2. Resolve Endüstriyel Kalite Kontrol grade 10 (2025-49) and Konaklama upper grades if exact files recover.
3. Build explicit 56/119 catalog + live-portal completeness audit and generate manual-control list.
4. Only after MTAL closure, begin MESEM full import and equivalent audit.
