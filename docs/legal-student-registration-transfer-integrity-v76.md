# V76 — Öğrenci Kayıt ve Nakilleri Integrity

- Batch: V76
- Atom: 410
- Migration: 0
- Lovable: 0

## Exact / correction findings

### HB-1668
Master: Kontenjan belirleme komisyonu; okul müdürü + müdür yardımcısı + rehber öğretmen + öğretmenler kurulunca seçilen öğretmen + varsa alan/bölüm şefi + OAB velisi.
Current authority: MEB Ortaöğretim Kurumları Yönetmeliği Md25/1-a; 2023 amendment Md119 also continues named commission family.
Status: ARTICLE_VERIFIED candidate exact, school-type = ORTAÖĞRETİM.

### HB-1669
Master: hazırlık ve 9. sınıfa alınacak öğrenci ve şube sayısı, fiziki imkan/donanım dikkate alınarak komisyonca tutanakla tespit.
Current authority: 08.09.2023 RG 32303 amendment, OÖKY Md25/1-b.
Status: ARTICLE_VERIFIED exact, ORTAÖĞRETİM.

### HB-1670
Generic age-condition negative state. OÖKY kayıt şartları school/program type specific; broad ALL master is not exact without scope split.
Status: WITHHELD_SCOPE_SPLIT.

### HB-1671
Master e-Okul OR denklik belgesi information source. Current registration source differs by admission route/school/program; exact connector/object review needed.
Status: WITHHELD_ROUTE_SPLIT.

### HB-1672
Marriage registration/relationship termination is secondary-school legal family; cannot inherit primary-school source.
Status: SECONDARY_ONLY_CURRENT_PARENT_RECHECK.

### HB-1673
Master open-high-school -> formal transfer timing says from end of classes to start of new school year. This timing is stale. 08.09.2023 RG amendment Md41/1-a now allows first term through end of October and second term first workday through end of February, subject to conditions and student transfer/placement commission decision.
Status: LEGACY_TIMING_MISMATCH + MASTER_REWRITE_REQUIRED.

### HB-1675
Legacy Batch02 linked this secondary-school workflow to 28.07.2026 OÖİKY amendment. Wrong legal family/source. Current OÖKY exact primary clause not locked in this batch.
Status: WRONG_SOURCE_FAMILY + WITHHELD.

### HB-1679
Master generic 'Nakiller sistem üzerinden mevzuata uygun'. Legacy Batch02 linked to 28.07.2026 OÖİKY Md11. Surrounding section and current OÖKY transfer rules are secondary-school specific; broad ALL metadata invalid.
Status: ROLLBACK_ARTICLE_VERIFIED + WRONG_SOURCE_FAMILY + SCHOOL_TYPE_SCOPE_CORRECTION.

### HB-1680
Master says transfers from 10-12 grades of schools WITHOUT prep class to same grades of schools WITH prep class via proficiency exam. Current OÖKY consolidated transfer provision states schools WITH prep class -> schools WITH prep class for 10-12, proficiency-exam dependent. Legacy Batch02 also cited OÖİKY Md11, an unrelated primary-school source.
Status: ROLLBACK_ARTICLE_VERIFIED + MASTER_TEXT_CONFLICT + WRONG_SOURCE_FAMILY.

## Count integrity
Promotions: HB-1668, HB-1669 = +2.
Rollbacks: HB-1679, HB-1680 = -2.
Net delta = 0.
ARTICLE_VERIFIED remains 475.

## Guards
- PRIMARY_SCHOOL_REGISTRATION_ARTICLE_CANNOT_VALIDATE_SECONDARY_SCHOOL_TRANSFER.
- SURROUNDING_SECTION_SCOPE_IS_EVIDENCE_BUT_CURRENT_ARTICLE_SCOPE_IS_REQUIRED.
- TRANSFER_TIMING_IS_EXACTNESS_FIELD.
- PREP_CLASS_PRESENCE_NEGATION_IS_EXACTNESS_FIELD.
- WRONG_SOURCE_FAMILY_REQUIRES_ROLLBACK_UNLESS_CURRENT_EXACT_PARENT_ALREADY_LOCKED.
