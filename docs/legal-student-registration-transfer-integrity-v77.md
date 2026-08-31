# Legal Integrity V77 — Öğrenci Kayıt/Nakil

Tarih: 2026-08-31
Support atoms: 410

## Current official chain
Primary family: MEB Ortaöğretim Kurumları Yönetmeliği (OÖKY), especially Md38+; 08.09.2023 RG 32303 amendment chain is controlling where newer than stale consolidated copies.

## Batch02 integrity correction
Legacy `Mimaros_Article_Verified_Batch02_Ilkogretim_2026.csv` attached HB-1681..HB-1689 to 28.07.2026 OÖİKY Md11 while those master sentences are predominantly secondary-school/OÖKY transfer rules and are tagged `ALL`.

- HB-1681: ROLLBACK. Master says each branch open quota=34 and max 40/25/35. Current 08.09.2023 OÖKY Md38/2 differentiates central-exam programs (30 base/34 cap) and other schools (34 base/40 cap), while full-time inclusion distribution is max 2 special-needs students per branch; master 25/35 atoms no longer current exact.
- HB-1682: ROLLBACK. `open contingents announced in e-Okul` is an OÖKY Md38/3 secondary-school rule, but old verification used OÖİKY Md11 and `ALL`; publish secondary-school split before re-promotion.
- HB-1683: ROLLBACK. Current OÖKY Md38/4-a contains monthly first-workday/last-workday-before application, parent, school petition/e-Devlet and exclusion windows. Old source family and ALL scope are wrong.
- HB-1684: ROLLBACK. OÖKY Md38/4-a supports forwarding eligible application to destination school via e-Okul; old OÖİKY source + ALL scope invalid.
- HB-1685: ROLLBACK. OÖKY Md38/4-a supports destination-school approval/rejection timing; old source + ALL scope invalid.
- HB-1686: ROLLBACK. OÖKY Md38/5 contains timing exception for full-time inclusion and specified special-education students; old source + ALL scope invalid.
- HB-1687: ROLLBACK. Master wording is grammatically damaged and broad ALL; current OÖKY Md38/5 monthly-last-workday evaluation applies to secondary family, not universal.
- HB-1688: ROLLBACK. OÖKY Md38/5 supports last-workday evaluation and same-day notification chain, but old OÖİKY source + ALL scope invalid.
- HB-1689: ROLLBACK. Generic `muafiyet ve sorumluluklar mevzuata uygun` is semantically too broad and not atomically tied to one provision; old OÖİKY Md11 verification is invalid.

No row is re-promoted in V77 because school-type metadata/master rewrite must be published first. Historical instances remain immutable.

## Guards
- WRONG_SOURCE_BUT_SIMILAR_TEXT_IS_NOT_EXACT.
- SECONDARY_TRANSFER_RULE_CANNOT_REMAIN_ALL.
- CURRENT_QUOTA_NUMBERS_AND_SPECIAL_ED_DISTRIBUTION_ARE_EXACTNESS_FIELDS.
- SOURCE_CORRECTION_REQUIRES_SCOPE_CORRECTION_WHEN_METADATA_IS_BROADER_THAN_PROVISION.
- MALFORMED_MASTER_TEXT_REQUIRES_REWRITE_BEFORE_PROMOTION.
- GENERIC_LEGAL_COMPLIANCE_SENTENCE_IS_NOT_ATOMIC_PROVISION.

## Tenant side note
`Sosyal Sorumluluk Kulübü` is separately recorded as an active tenant-required club in `docs/tenant-required-social-responsibility-club.md`; it does not alter ARTICLE_VERIFIED counts.
