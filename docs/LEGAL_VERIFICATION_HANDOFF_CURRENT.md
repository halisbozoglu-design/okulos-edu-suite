# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V87 CLOSED / V88 NEXT
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED yalnız exact master claim + güncel/uygulanabilir resmî otorite + exact article/paragraph + actor/action/scope + row-ledger/dedupe ile değişir. Kaynaklar: `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri, `resmigazete.gov.tr`; arşiv/dosya planında Devlet Arşivleri Başkanlığı. Current RG chain stale consolidation/handbook üstündedir. Broad `ALL` metadata school/program/system-specific hükümleri miras alamaz. Thematic/adjacent hüküm exact proof değildir. Rollback yalnız row-level material mismatch kanıtlandığında ve bir kez yapılır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **460 / 2.229 = %20,6371**
- Kalan exact: **1.769**
- Kapanmış support-atom pool: **23.105**
- Son kapanmış batch: **V87**
- Sıradaki batch: **V88**
- Migration: **0**
- Lovable: **0**

## V86 lock
V86 300 atomla kapandı. HB-1771/1772/1773 eski `ALL + OÖİKY Md5/A` yanlış otorite eşleşmeleri birer kez rollback edildi; ARTICLE_VERIFIED 463 -> 460.
MTAL 2026-2027 resolver:
- 12 -> TTKB 2023-40
- 10-11 -> TTKB 2024-41
- hazırlık/9 -> TTKB 2026-62
- framework authority ayrıca versioned; `latest decision wins` yasak.

## V87 CLOSED — HB-1774..HB-1786
Canonical files:
- `docs/legal-article-verified-focused-deepening-batch-v87-phase1.md` — 130 atoms
- `docs/legal-article-verified-focused-deepening-batch-v87-phase2.md` — 170 atoms
- `docs/legal-article-verified-batch-v87.md`
- `docs/legal-verification-progress-v87-delta.json`

V87 total **300** atom. ARTICLE_VERIFIED delta **0**, rollback **0**. Closed pool 22,805 -> **23,105**.

### Exact master boundary
- HB-1774 physical evrak delivery / zimmet defteri.
- HB-1775 Standart/Saklama Süreli Standart Dosya Planı filing.
- HB-1776 Belgenet/EBYS official correspondence.
- HB-1777 petition OR information-access application + timely response.
- HB-1778 upper-authority information-access response.
- HB-1779 current official-correspondence regulation compliance.
- HB-1780 confidential/classified-document handling.
- HB-1781 `ASLI GİBİDİR` certified copy.
- HB-1782 electronic user groups/authorizations.
- HB-1783 information-system prevention/detection/correction controls.
- HB-1784 MEBBİS timely/accurate/current data.
- HB-1785 mixed teacher system applications approval/rejection.
- HB-1786 three-copy physical output/distribution.
- HB-1787 starts `2.13 ÖĞRETMENLİK UYGULAMASI`.

### V87 current-law locks
1. Devlet Arşivleri Başkanlığı current Saklama Süreli Standart Dosya Planı is applicable from **02.01.2024**. Publication/version lock exists; broad HB-1775 parent remains withheld until exact actor/action row binding.
2. `Belgenet` is an implementation/product, not a legal authority. Legal rule layer is electronic official correspondence; provider/product stays configuration.
3. Current official-correspondence authority: `Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik`, CB Decision **2646**.
4. Art.29/2 certified-copy route matches HB-1781 semantics (`ASLI GİBİDİR` + authorized official identity/title/date/signature) but is conditional; generic master parent omits applicability conditions, so parent remains withheld and an exact conditional child is canonical.
5. Official-correspondence Art.33 clocks are distinct: requested **document = 5 business days**; requested **information/opinion = 15 business days**. These are not petition or information-access clocks.
6. 3071 Art.7 petition route: process status/result -> reasoned response within **30 days**; if only status is notified while pending, result is additionally notified.
7. 4982 Art.11 information-access route: default **15 business days**; statutory cross-unit/cross-institution/multi-institution cases **30 business days**, with extension + reason notified in writing before initial 15-business-day expiry. Art.12 governs response/rejection form.
8. Therefore HB-1777 compound parent cannot be ARTICLE_VERIFIED as one static `timely` rule; executable children must split 3071 and 4982.
9. HB-1778 cannot infer its clock merely from an upper-authority cover letter; application type, receipt/transfer event and authority must resolve first.
10. HB-1780 specialized current authority: CB Decision **5529**, `Gizlilik Dereceli Belgelerde Uygulanacak Usul ve Esaslar Hakkında Yönetmelik`, RG **26.04.2022/31821**. Classification precedes handling; preparation/sending/receipt/storage/copying/declassification routes are class-specific.
11. HB-1774 generic `zimmet defteri` default remains withheld; electronic and physical delivery routes are separate.
12. HB-1782..1784 require exact system/module/actor authority. `MEBBİS exists` does not prove every update/security/authorization duty.
13. HB-1785 must split by application subtype. HB-1786 three physical copies is not treated as a universal current digital-process rule without a current special authority.

### Ledger integrity
`docs/legal-batch02-generic-source-integrity-v55.md` establishes that Batch02 is a historical candidate set because broad OÖİKY buckets were reused across semantically unrelated workflows. It does **not** prove that HB-1774..1786 individually entered the ARTICLE_VERIFIED count. Therefore V87 books no inferred rollback. Absence of ledger proof is not permission to infer a promotion either.

### Active V87 guards
- ASLI_GIBIDIR_REQUIRES_ART29_2_APPLICABILITY_CONDITION
- CERTIFIED_COPY_IS_NOT_UNIVERSAL_COPY_RULE
- OFFICIAL_CORRESPONDENCE_5_15_DAY_RULE_IS_NOT_4982_DEADLINE
- PETITION_3071_AND_INFO_ACCESS_4982_REQUIRE_SEPARATE_CHILDREN
- INFO_ACCESS_EXTENSION_REQUIRES_STATUTORY_CONDITION_AND_NOTICE
- BELGENET_PRODUCT_NAME_IS_NOT_LEGAL_AUTHORITY
- ELECTRONIC_DISPATCH_PRIMARY_DOES_NOT_ABOLISH_PHYSICAL_EXCEPTION
- CONFIDENTIALITY_REQUIRES_5529_CLASSIFICATION_SCOPE
- STANDARD_FILE_PLAN_PUBLICATION_ALONE_DOES_NOT_PROVE_EVERY_MASTER_ACTOR
- MEBBIS_MODULE_NAME_DOES_NOT_PROVE_ACTOR_DUTY
- THREE_COPY_LEGACY_OUTPUT_REQUIRES_CURRENT_SPECIAL_PROCESS_AUTHORITY
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_ROLLBACK_OR_PROMOTION
- EXACT_CHILD_MAY_EXIST_WHILE_PARENT_WITHHELD

## V88 priority — HB-1787+ Öğretmenlik Uygulaması
1. Recover exact master sentences starting HB-1787 and determine full family boundary.
2. Lock current official authority for teacher-practice / teaching-practicum workflow, including school, university/faculty, practice teacher, coordinator and trainee roles.
3. Separate legal authority from protocol/software/manual practice.
4. Audit any Batch02 or legacy broad mappings row-by-row before promotion/rollback.
5. Build a large >=300 support-atom batch where the family supports it; do not inflate ARTICLE_VERIFIED.
6. Continue with the next master family after Öğretmenlik Uygulaması if needed to reach a meaningful batch.
7. Migration **0**, Lovable **0**.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** tenant requirement remains active; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` dediğinde soru sormadan **V88 / HB-1787+ Öğretmenlik Uygulaması** ile devam et. Work mode all mevzuat verification tamamlandıktan sonra işleyiş/uygulama düzenleme aşamasında kullanılacak.
