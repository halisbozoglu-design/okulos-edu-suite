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
- Cloud: 55 distinct populated MTAL field names / 981 active curriculum profiles / 11246 active course-schedule rows.
- Major living chains already populated/audit-clean include Bilişim, Elektrik-Elektronik, Uçak Bakım, Gıda, İnşaat, Sağlık, Metal, Mobilya, Moda, Makine ve Tasarım, Motorlu Araçlar/Otomotiv lineage, Denizcilik, İtfaiyecilik, Hasta ve Yaşlı, Yiyecek İçecek, Kimya, Biyomedikal, Pazarlama, Hayvan Yetiştiriciliği, Güzellik, Harita-Tapu-Kadastro, Gemi Yapımı, Halkla İlişkiler, Kuyumculuk, Laboratuvar Hizmetleri, Maden, Mikromekanik, Geleneksel Türk Sanatları, El Sanatları, Tarım, Plastik Sanatlar, Tesisat, Matbaa/Basım lineage and others.
- Tekstil Teknolojisi living grades 10-12 now complete for all five supplied branches: İplik Üretim Teknolojisi, Dokuma Üretim Teknolojisi, Örme Üretim Teknolojisi, Tekstil Baskı ve Desenciliği, Tekstil Boya Apre ve Laborantlığı. Grade 10 uses branch-specific 13h vocational packages; grade 11 AMP standard=17 vocational, ATP core=9, conditional enterprise-from-11=9+16 enterprise; grade 12 uses living transition AMP enterprise / ATP academic-support split. Audit clean.
- Gazetecilik standard MTAL living grades 10-12 now complete and kept separate from Gazetecilik-Protokol. Grade 10 vocational=13 (Haber Fotoğrafçılığı 3 + Dijital Görsel Düzenleme 4 + Yayın Türüne Göre Gazetecilik 6); grade 11 AMP=17, ATP core=9, conditional enterprise-from-11=9+16 enterprise; grade 12 uses living transition AMP enterprise / ATP academic-support split. Audit clean.
- Havacılık ve Uzay living grades 9-11 populated, protocol-scoped and ATP-only; no living grade-12 portal entry.
- Endüstriyel Kalite Kontrol grade 9 populated; living grade 10 confirmed under 2025-49 but exact file access remains source-retry/manual-review.
- Konaklama grade 9 populated; standard upper-grade source access remains source-retry; protocol source is not substituted.
- Current-2026 grade-9 source-retry/manual-review remains for a number of fields whose direct PDFs are stale/404/timeout; living upper-grade chains continue to be imported independently.

## Final MTAL audit requirements
- Reconcile expected fields/branches against user-supplied 56/119 catalog and live portal.
- Validate living grade coverage and exact AMP/ATP/enterprise/academic-support variants.
- Detect profile-without-rows and rows-without-profile.
- Validate fixed row-hour sums, official total targets, enterprise-hour patterns and source conditions.
- Validate exact PDF/decision provenance, stale-cache/year mismatches and old/new field/branch lineage.
- Final unresolved list format: field -> branch -> grade -> reason.

## Next
1. Finish fully empty/protocol MTAL catalog areas: Ayakkabı ve Saraciye (Protokol), Gastronomi ve Mutfak Sanatları, Seramik ve Cam (Protokol), and remaining protocol/special variants where live sources support them.
2. Retry current-2026 grade-9 source files separately; never use stale old 44-hour PDFs as 2026.
3. Resolve Endüstriyel Kalite Kontrol grade 10 (2025-49), Konaklama upper grades and other source-retry items.
4. Extend final completeness audit to explicit 56/119 catalog + portal coverage and produce manual-control list.
5. Only after MTAL closure, begin MESEM full import and equivalent audit.
