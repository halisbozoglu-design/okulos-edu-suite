# Current DB State

Updated: 2026-08-23

## Vocational timetable core
- MTAL official current catalog: 56 fields / 119 branches.
- MESEM official current catalog: 39 fields / 193 branches.
- Source: user-supplied MTEGM `alan_dal_listesi_08092025.pdf`.
- Every MTAL pull is cross-checked against this user-supplied field/branch catalog as well as the live class-specific MTEGM framework source.
- Name changes are not force-normalized: old catalog name <-> new live name is kept as lineage/manual-review where needed.
- MESEM telafi catalog excluded from normal live catalog.
- Finalization rule: MTAL is NOT complete until automated audit verifies field -> branch -> grade -> program/schedule variant -> profile -> row-level courses -> hours -> exact source chain. Unresolved source/name issues are listed for manual review; pulling continues around them.

## Framework applicability/source index
- MTAL source index complete: grade 9 = 63, grade 10 = 61, grade 11 = 59, grade 12 = 59 active portal programs.
- Grade 9 uses 2026 programs; grades 10-11 primarily living 2024-41; grade 12 living 2023-40, with field-specific exceptions resolved from portal.
- MESEM source index complete: 38 active portal programs for each grade 9-12.
- Exact PDF URLs are pinned as each framework is parsed.
- If live portal says 2026 but PDF fetch times out or stale cache returns older schedule, do not persist inferred data; keep manual-review/source-retry item.

## Audit
- `audit_mtal_curriculum_v1()` is active in Cloud and persisted by migration `20260823130500_mtal_curriculum_audit.sql`.
- Audit key includes field + branch + grade + program + schedule variant.
- Current persisted profiles pass row/fixed-hour/total/source validation after repairs.
- Current Cloud audit result: zero findings on persisted profiles.
- Manual completeness review separately covers missing field/branch/grade/source-lineage cases and user-supplied 56/119 catalog reconciliation.

## Current MTAL pull progress
- Current Cloud coverage: 38 distinct populated MTAL field names / 722 active curriculum profiles / 8441 active course-schedule rows.
- Bilişim 9-12 rebuilt/validated; wrong legacy grade-12 enterprise-from-11 profiles removed and living grade-12 source structure restored.
- Elektrik-Elektronik 9-12 populated; grade-12 AMP enterprise vs ATP academic-support separation.
- Uçak Bakım 9-12 populated.
- Gıda Teknolojisi 9-12 populated.
- İnşaat Teknolojisi 9-12 profile chain; grade 10-11 row-level data complete; 2026-vs-transition branch lineage preserved.
- Sağlık Hizmetleri field name remains; 2026 grade 9 uses Diş Protez Teknisyenliği + Sağlık Bakım Teknisyenliği; living 10-11 keeps Ebe Yardımcılığı / Hemşire Yardımcılığı / Sağlık Bakım Teknisyenliği. Grade 11 row-level complete.
- Metal Teknolojisi 9-12 populated.
- Mobilya ve İç Mekân Tasarımı 9-12 populated; old/new branch-name lineage preserved.
- Moda Tasarım Teknolojileri 9-12 populated. User-supplied field/branch catalog matches live branches exactly: Giysi Kalıp Tasarımı ve Üretimi + Terzilik.
- Muhasebe ve Finansman living grades 10-12 populated with real row-level courses. User-supplied catalog matches live branches exactly: Muhasebe + Dış Ticaret. Grade 9 current-2026 remains to be pulled separately.
- Raylı Sistemler Teknolojisi living grades 10-12 populated for all three user-supplied branches: Raylı Sistem Araçları, Raylı Sistemler Elektrik-Elektronik, Raylı Sistemler Yol.
- Motorlu Araçlar Teknolojisi living grades 10-12 populated for all five user-supplied branches; 2026 grade 9 remains under new live field name `Otomotiv Teknolojileri`, preserved as lineage/manual-review rather than destructive rename.
- Plastik Teknolojisi living grades 10-12 populated and audit clean; grade 12 verified as source-specific 43-hour 2023-40 structure.
- Radyo-Televizyon living grades 10-12 populated and audit clean; grade 12 uses verified 43-hour 2023-40 structure.
- Metalürji Teknolojisi living grades 10-12 populated for `Döküm` and `İzabe ve Haddecilik`; audit clean.
- Yiyecek İçecek Hizmetleri: 2026 grade 9 Aşçılık/Pastacılık structure retained; living 10-12 transition uses single `Yiyecek İçecek Hizmetleri` branch and is populated.
- Aile ve Tüketici Hizmetleri: living grades 10-12 populated for Sosyal Destek Hizmetleri + Tüketici Hizmetleri. 2026 grade-9 portal name `Sosyal Hizmetler` remains manual-review lineage; not force-normalized.
- Siber Güvenlik grade 9 populated from current 2026 source: ATP-only, 28 common + 11 vocational + 5 elective = 44 hours.
- Denizcilik grade 9 populated: three branches, AMP/ATP only.
- Konaklama ve Seyahat Hizmetleri grade 9 populated with current 2026 branch structure.
- Havacılık ve Uzay Teknolojisi grade 9 populated as ATP-only/protocol structure.
- Additional 2026 grade-9 profiles already populated include Adalet, Basım Teknolojileri, Büro Yönetimi, Çocuk Gelişimi, Endüstriyel Kalite Kontrol, Endüstriyel Otomasyon, Grafik ve Fotoğraf, Hasta ve Yaşlı Hizmetleri, İtfaiyecilik ve Yangın Güvenliği, Pazarlama ve Perakende, Ulaştırma Hizmetleri and Yapay Zekâ.
- Kimya Teknolojisi living grades 10-12 populated for all three supplied branches `Kimya Laboratuvarı`, `Petrol Endüstrisi`, `Proses`; audit clean.
- Biyomedikal Cihaz Teknolojileri living grades 10-12 populated for all four supplied branches; audit clean.
- Makine ve Tasarım Teknolojisi is populated across 9-12. Grade 9 = 19 profiles / 266 rows. Grade 10 = 25 profiles / 377 rows. Grade 11 = 25 profiles / 265 rows. Grade 12 = 17 profiles / 76 rows. Eight regular branches have AMP/ATP/enterprise variants where supported; Savunma Mekanik Sistemleri is ATP-only. Field audit clean.
- Hasta ve Yaşlı Hizmetleri is populated across 9-12 for supplied branch `Hasta ve Yaşlı Bakımı`. Living grade 10-11 2024-41 rows and grade 12 2023-40 AMP enterprise / ATP academic-support split are complete; field audit clean.
- Ulaştırma Hizmetleri: grade 9 current-2026 and living grades 10-11 were already populated; grade 12 living 2023-40 is now complete for `Lojistik` and `Sivil Havacılık`, with AMP = 10 common + 24 enterprise + 7 elective-vocational + 4 elective and ATP = 10 common + 31 academic-support + 4 elective. Exact `ulastirma_12.pdf` provenance pinned. Audit clean.
- Yenilenebilir Enerji Teknolojileri: grade 9 current-2026 and living grades 10-11 were already populated; grade 12 living 2023-40 is now complete for the single branch, with the same verified AMP enterprise / ATP academic-support split. Exact `yenilenebilir_12.pdf` provenance pinned. Audit clean.
- Pazarlama ve Perakende: grade 9 current-2026 was already populated; grade 12 living 2023-40 is now complete for supplied branches `Sigortacılık` and `Satış Danışmanlığı`, with exact `pazarlama_12.pdf` provenance pinned. Living grades 10-11 remain to be imported from 2024-41.
- Tesisat/Tarım/Tekstil and other 2026 source-fetch problem fields remain source-retry/manual-review; no stale rows are accepted.

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
- Validate fixed row-hour sum against `required_hour_total`.
- Validate fixed + elective/elective-vocational/academic-support totals against official `total_hour_target`.
- Validate enterprise-hour pattern and source condition annotations.
- Validate exact PDF/decision provenance and unresolved source retries.
- Validate 2026-vs-transition branch/field name lineage and no accidental normalization.
- Detect stale-cache or source-year mismatches.
- Final unresolved items will be listed field -> branch -> grade -> reason for manual verification before MESEM import.

## Next
1. Complete Pazarlama ve Perakende living 10-11 2024-41 rows.
2. Continue remaining MTAL chains and current-2026 grade-9 fields without waiting for user prompts.
3. Prioritize supplied-catalog fields with existing grade-9 profiles but missing living 10-12 chains, then source-accessible empty fields.
4. Keep unresolved/renamed/404/timeout items in manual-review queue while pulling continues.
5. Complete branch-scoped elective-vocational and academic-support eligibility.
6. Run final MTAL completeness audit and produce manual-control list.
7. Then begin MESEM full import and equivalent audit.
