# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
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
- Atom havuzu: **18.815**
- Son batch: **V75**
- Sonraki batch: **V76**

## V75 — 410 atom
- Integrity: `docs/legal-course-schedule-duty-schooltype-integrity-v75.md` — `1d946354eb71519d8a61939771ae86688c10546b`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v75.md` — `8575c8e1969d4604ceee3ccaeeb4e54de5974c30`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v75.md` — `dacb43620d7103a3547cc05b1707206b6219678c`
- Progress: `docs/legal-verification-progress-v75-delta.json` — `7cc2baf93079d01964055d0222a50f83886e2ba0`
- Support atoms: **410**, pool **18.405 -> 18.815**.
- ARTICLE_VERIFIED: **475 -> 475**, delta **0**.

### V75 Ders Programları / Nöbet findings
- `HB-1642..1647`: broad ALL schedule rows require school-type exact parent or published split. `HB-1645` previous wrong Batch02 promotion was already rolled back in V60; do not subtract twice.
- `HB-1655`: same generic duty exists in OÖKY, OÖİKY and Special Education, but different exact parents; no single-source ALL promotion.
- `HB-1656`: OÖKY Md91/2-a exact for secondary schools; broad ALL still blocks whole-row promotion.
- `HB-1657`: OÖKY Md91/2-b exact secondary wording; OÖİKY uses different employment terminology (`aylığını aldığı okul`); split needed.
- `HB-1658`: master fixed 15 minutes is not current universal default. OÖKY current default is 30 minutes and may be shortened by teachers-board decision to not less than 15 minutes; special education current Md60/2 is 30 minutes. `FIXED_MINIMUM_CANNOT_BE_NORMALIZED_AS_DEFAULT_DURATION`.
- `HB-1659`: master `12 weeks before birth + two years after birth` is not current OÖKY exact. RG 08.09.2023/32303 current secondary chain uses pregnancy week 24, end of two years following completion of post-birth maternity leave, and `istememesi halinde` conditionality. `TIMING_TRIGGER + DURATION_REFERENCE + OPTIONALITY_MISMATCH`.
- `HB-1660`: service-year exemption needs optionality/need condition and school-type parent split.
- `HB-1661/1662`: comparable current provisions exist in OÖİKY/Special Education, but broad ALL common parent not established.
- `HB-1663`: OÖİKY exemption+requested-duty preference differs materially from Special Education preference rule; actor/scope/exemption semantics cannot be merged.
- `HB-1664`: current OÖİKY class-order clause does not prove added `etüt çalışması yaptırma` object.
- `HB-1665`: preschool and special-education classroom supervision models are distinct and must split.
- `HB-1666`: universal current exact parent for `nöbet defteri` remains unresolved.
- `HB-1667`: previous wrong Batch02 promotion already rolled back in V61. OÖİKY lunch-duty provision supports teacher rest/dönüşümlü-dengeli structure but master adds assistant-principal/basic-needs semantics and is broad ALL.

## New integrity guards
- `FIXED_MINIMUM_CANNOT_BE_NORMALIZED_AS_DEFAULT_DURATION`.
- `PREGNANCY_WEEK_AND_WEEKS_BEFORE_BIRTH_ARE_NOT_INTERCHANGEABLE`.
- `POSTPARTUM_DURATION_REFERENCE_POINT_IS_EXACTNESS_FIELD`.
- `OPTIONAL_NO_DUTY != ABSOLUTE_NO_DUTY`.
- `DISABLED_TEACHER_EXEMPTION != PREFERENCE_PRIORITY_ONLY`.
- `SAME_DUTY_NAME_ACROSS_SCHOOL_TYPES_DOES_NOT_CREATE_COMMON_PARENT`.
- `PRIOR_ROLLBACK_MUST_NOT_BE_COUNTED_TWICE`.
- `OLD_BATCH_ARTICLE_REFERENCE_MUST_MATCH_WORKFLOW_CONTENT`.

## Existing high-priority backlog
- HB-1642..1667 school-type split/rewrite staging; HB-1666 duty-book parent unresolved.
- HB-1634..1640 candidate-teacher rewrite/retire/historical snapshot; HB-1641 candidate civil servant source.
- HB-1611/1612/1617-1622 strategic-plan/service-standard split/rewrite.
- HB-1604..1608 and HB-1597..1603 DÖSE current-system/recipient/provision backlog.
- HB-1483/HB-1484 official OAB exact retry only.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 semantics/split/exact-parent chains.
- HB-0138/HB-0395 L2 operational only.
- HB-2218/HB-2229 School Health scope.

## V76 priority — 300+ atoms
1. Start `HB-1668+` Student Registration / Transfers from exact master boundary.
2. Reconcile current OÖİKY/OÖKY registration, transfer, e-Okul, address, age and school-type rules using current official amendment chain; do not reuse the suspicious Batch02 28.07.2026 generic mappings without content match.
3. Audit prior Article Verified Batch02 rows around HB-1569/HB-1645/HB-1667 for other content-mismatched article references and rollback only once when needed.
4. Continue HB-1641 candidate civil-servant exact source only if room.
5. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V76** başlat; minimum **300 atom** hedefle.
