# V62 — Official-source OAB / transport / duty integrity

Date: 2026-08-29
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Source policy
ARTICLE_VERIFIED research is restricted to official sources supplied/approved by project policy: mevzuat.gov.tr, mevzuat.meb.gov.tr, MEB official units, and resmigazete.gov.tr. Secondary legal mirrors and school-site copies are not acceptable as final exact authority.

## OAB official-source retry
The canonical MEB OAB PDF path `mevzuat.meb.gov.tr/dosyalar/1532.pdf` currently returned 404 in the web retrieval path. No secondary source substitution was used. HB-1483/HB-1484 therefore remain WITHHELD_OFFICIAL_EXACT_RETRY despite strong prior candidate mapping. A current MEB circular may corroborate continued operational relevance but does not replace exact regulation-provision proof.

## Transport
HB-1573 canonical action: `Servis araçları öğrencileri zamanında kuruma getirmektedir.` Existing master metadata is conditional on HAS_SCHOOL_BUS. Current transport and school-bus official authorities were reviewed at the family level; an exact provision that creates this precise school-side punctual-arrival control was not locked in this pass. Status: WITHHELD_EXACT_PARENT_NOT_LOCKED. Do not infer from generic service-contract compliance.

## Duty-chain school-type split
Official consolidated sources inspected:
- MEB Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği, `mevzuat.meb.gov.tr/dosyalar/1703.pdf`, Md44.
- MEB Ortaöğretim Kurumları Yönetmeliği, `mevzuat.meb.gov.tr/dosyalar/1657.pdf`, Md91.

Master rows HB-1655..HB-1664 are stored with broad ALL applicability, while the two current regulations have different exact parameters and conditions. Therefore a similar concept across school types is not sufficient to make the broad master rows exact.

### Secondary-school exact text family
- HB-1655 -> OÖKY Md91/1: teachers perform duty according to duty roster.
- HB-1656 -> OÖKY Md91/2-a: duty on day(s) with least teaching load.
- HB-1657 -> OÖKY Md91/2-b: multiple-school duty location rule.
- HB-1658 -> OÖKY Md91/2-c: 15 minutes before first lesson to 15 minutes after last lesson; transport-school extension is conditional.
- HB-1661 -> OÖKY Md91/2-e: principles discussed in teachers board and notified in writing.
- HB-1662 -> OÖKY Md91/2-f: unjustified absence from duty treated like unjustified lesson absence.
- HB-1664 -> OÖKY Md91/2-h: duty teacher organizes class without teacher and study work.

These are not promoted under ALL scope. Status: SCHOOL_TYPE_SCOPE_SPLIT_REQUIRED.

### Primary/lower-secondary family
OÖİKY Md44 regulates duty separately. Examples: administration-issued roster, normal/dual education pattern, 30-minute baseline with possible teacher-board reduction, pregnancy exemption and written duty instructions. These differences prove the ALL-profile cannot simply inherit OÖKY Md91.

## HB-1659 critical legacy parameter
Canonical master: `Bayan öğretmenlere, doğumuna on iki hafta kala ve doğumdan sonra iki yıl nöbet görevi verilmemektedir.`
Current OÖKY Md91/2-ç says 12 weeks before birth and one year after birth. Current OÖİKY Md44/7 likewise uses one year after birth. The master two-year parameter is no longer exact.
Status: LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED.
No ARTICLE_VERIFIED promotion.

## HB-1660
The service-year exemption rules differ by school type and include request/need conditions. Broad unconditional wording cannot be promoted without scope/condition rewrite.
Status: WITHHELD_SCOPE_AND_CONDITION_SEMANTICS.

## HB-1665/HB-1666
HB-1665 combines special-education-class and kindergarten duty behavior; current exact applicability must be resolved against the special-education and school-type rules atomically. HB-1666 says `Nöbet defteri tutulmaktadır`; no exact current parent was established from OÖKY Md91 or OÖİKY Md44 in this pass. Both remain withheld.

## Counter
No new promotion and no newly established rollback from the currently counted set in this V62 pass. ARTICLE_VERIFIED remains 467/2229.
