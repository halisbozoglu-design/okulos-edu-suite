# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-31
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. MEB rehberi/el kitabı L2 veya aday kanıt olabilir; current exact Resmî Gazete hükmünün yerine geçmez.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **475 / 2.229 = %21,3100**
- Kalan exact: **1.754**
- Atom havuzu: **19.225**
- Son batch: **V76**
- Sonraki batch: **V77**

## V76 — 410 atom
- Integrity: `docs/legal-student-registration-transfer-integrity-v76.md` — `bc3dc5dcc1c8ade9916e2759a4f143548ebf66cb`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v76.md` — `656228bd77e715ba77387ae2deee2b59c59fdb3c`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v76.md` — `c1d73181beef087a815bed257a7f24d6d2986906`
- Progress: `docs/legal-verification-progress-v76-delta.json` — `a826c4607fa15aad67ca31e8daef390683b0df7f`
- Support atoms: **410**, pool **18.815 -> 19.225**.
- ARTICLE_VERIFIED: **475 +2 -2 -> 475**, net **0**.

### V76 Student Registration / Transfer findings
- `HB-1668` ARTICLE_VERIFIED +1: current OÖKY Md25/1-a exactly supports Kontenjan Belirleme Komisyonu composition; scope = secondary education.
- `HB-1669` ARTICLE_VERIFIED +1: 08.09.2023 RG/32303 amendment, OÖKY Md25/1-b, annual prep/9th-grade intake + branch count by commission minutes considering physical capacity/equipment.
- `HB-1670`: age-condition row is school/program specific; broad ALL negative state withheld pending scope split.
- `HB-1671`: e-Okul OR equivalency-document source requires admission-route/object split.
- `HB-1672`: marriage registration/relationship-termination is secondary-school legal family; current parent recheck pending.
- `HB-1673`: legacy timing is stale. Current OÖKY Md41/1-a after 08.09.2023 allows open-high-school -> formal transfer in first term through end of October and second term first workday through end of February, subject to conditions and commission decision. Master rewrite required.
- `HB-1675`: legacy Batch02 used 28.07.2026 OÖİKY source for a secondary-school workflow. `WRONG_SOURCE_FAMILY + WITHHELD` pending exact current OÖKY parent.
- `HB-1679` ROLLBACK -1: old Batch02 linked generic secondary transfer workflow to OÖİKY Md11 and broad ALL metadata; wrong source family/scope.
- `HB-1680` ROLLBACK -1: old Batch02 used unrelated OÖİKY Md11 and master text conflicts with current OÖKY prep-class rule (`without prep` vs current `with prep` in grades 10-12 transfer clause).

## New integrity guards
- `PRIMARY_SCHOOL_REGISTRATION_ARTICLE_CANNOT_VALIDATE_SECONDARY_SCHOOL_TRANSFER`.
- `TRANSFER_TIMING_IS_EXACTNESS_FIELD`.
- `PREP_CLASS_PRESENCE_NEGATION_IS_EXACTNESS_FIELD`.
- `WRONG_SOURCE_FAMILY_REQUIRES_ROLLBACK_UNLESS_CURRENT_EXACT_PARENT_ALREADY_LOCKED`.
- `OLD_BATCH_ARTICLE_REFERENCE_MUST_MATCH_WORKFLOW_CONTENT`.

## Existing high-priority backlog
- HB-1670..1678 and HB-1681+ student registration/transfer current exact school-type audit.
- HB-1673 legacy timing rewrite; HB-1675 current OÖKY exact parent.
- HB-1642..1667 school-type split/rewrite staging; HB-1666 duty-book parent unresolved.
- HB-1634..1640 candidate-teacher rewrite/retire/historical snapshot; HB-1641 candidate civil servant source.
- HB-1611/1612/1617-1622 strategic-plan/service-standard split/rewrite.
- HB-1604..1608 and HB-1597..1603 DÖSE current-system/recipient/provision backlog.
- HB-1483/HB-1484 official OAB exact retry only.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 semantics/split/exact-parent chains.
- HB-0138/HB-0395 L2 operational only.
- HB-2218/HB-2229 School Health scope.

## V77 priority — 300+ atoms
1. Continue `HB-1681+` Student Registration / Transfers from exact master text.
2. Reconcile current OÖKY Md38 onward open-contingent, prep-class, e-Okul and transfer conditions with 08.09.2023 amendment chain.
3. Audit remaining old Batch02 rows in this block for OÖİKY/OÖKY source-family mismatches; rollback exactly once.
4. Resolve HB-1675 and, if exact current parent exists, decide source-correction vs rollback without double counting.
5. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V77** başlat; minimum **300 atom** hedefle.
