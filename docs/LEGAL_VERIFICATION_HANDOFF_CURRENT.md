# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, `meb.gov.tr` resmî birimleri ve `resmigazete.gov.tr`. Resmî MEB rehberi L2 operational evidence olabilir; primary exact provision yerine geçmez. Current-period MEB Genelge/Hazırlık Programı, exact okul/kurum actor-action-scope içeriyorsa yalnız ilgili plan dönemi legal snapshotı ile doğrulama parentı olabilir.

## Integrity guards
- SAME_TOPIC != SAME_SCOPE.
- L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED.
- CURRENT_GUIDE_CAN_CONFIRM_OPERATION_BUT_NOT_REPLACE_PRIMARY_PROVISION.
- PERIODIC_STRATEGIC_PLAN_SOURCE_REQUIRES_PERIOD_SNAPSHOT.
- NAMED_TEAM_MUST_EXIST_IN_CURRENT_SOURCE: `sorumlu birim/kişiler` ayrı zorunlu `ekip` adı olarak normalize edilemez.
- STRATEGIC_PLAN_CONTENT_ATOMS may share one period program but separately executable compound rows still split before count.
- SECTION_PLACEMENT_DOES_NOT_DEFINE_LEGAL_FAMILY.
- LEGACY_INSTITUTION_NAME_OR_RECIPIENT_REQUIRES_CURRENT_RECIPIENT_RECHECK.
- ACCOUNTING_REPORT_OBJECT_AND_SUBMISSION_CHANNEL_ARE_EXACTNESS_FIELDS.
- PROCUREMENT_AND_SALES_MUST_NOT_BE_COLLAPSED_UNDER_ONE_GENERIC_IHALE_PARENT.
- SYSTEM_NAME_MATCH_REQUIRES_FUNCTION_MATCH.
- EMPLOYEE_SHARE_AND_EMPLOYER_SHARE_ARE_NOT_SAME_DEDUCTION.
- broad ALL school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **470 / 2.229 = %21,0857**
- Kalan exact: **1.759**
- Atom havuzu: **17.175**
- Son batch: **V71**
- Sonraki batch: **V72**

## V71 — 410 atom
- Integrity: `docs/legal-strategic-planning-integrity-v71.md` — `667886d20d1158670eb56f2e8545816a740bc5be`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v71.md` — `017695dd2560e29e1a914b93b41ad49643fa61ba`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v71.md` — `15f3f6240ccf505d304c16cd7c1fea2d0265b30c`
- Progress: `docs/legal-verification-progress-v71-delta.json` — `9e31229f7926eed2bbc241778aa02aa5aadc980d`
- Support atoms: **410**; pool **16.765 -> 17.175**.
- ARTICLE_VERIFIED: **468 -> 470**, delta **+2**.

### V71 Strategic Planning findings
- `HB-1609` ARTICLE_VERIFIED +1. MEB 2024-2028 Stratejik Plan Hazırlık Programı 6.1.2.4 school/institution Strategy Development Board + Strategic Planning Team exact current-period named organs. Must carry `2024-2028` period/legal snapshot.
- `HB-1610` ARTICLE_VERIFIED +1. Current MEB Preparation Program/EK-3 requires school/institution Strategic Plan Preparation Program; preparation activities, timetable and training-need family are current-period exact. Must carry period/legal snapshot.
- `HB-1611`: stakeholder participation + GZFT combined; `COMPOUND_ANALYSIS_SPLIT_REQUIRED`.
- `HB-1612`: current situation/internal analysis family but school-template detail lock pending.
- `HB-1614..1616`: current-period exact candidates (mission/vision/values; goals/targets/indicators/strategies; activities/projects), kept in recheck queue to avoid premature/duplicate count before atomic current-school-guide lock.
- `HB-1617`: detailed action-plan responsibility/time/resource fields need current school-template exactness.
- `HB-1618`: school plan alignment is current, but master `ilçe/İl` hierarchy connector requires exact source check.
- `HB-1619`: current MEB source requires monitoring/evaluation responsible units/persons, not a separately named mandatory `İzleme ve Değerlendirme Ekibi`. `LEGACY_OR_LOCAL_ORGAN_NAME + MASTER_REWRITE_REQUIRED`.
- `HB-1620..1621`: current 2026 school/institution annual monitoring/evaluation is operationally alive; central current school-guide report-name/period exact lock pending.
- `HB-1622`: service standards table is a different legal family despite handbook section placement; no strategic-plan inheritance.

### PDF handling
MEB 2024-2028 Stratejik Plan Hazırlık Programı PDF opened and text was parsed. Screenshot calls for relevant pages were attempted but returned cache-miss errors; screenshot success is not claimed.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1611 -> stakeholder/GZFT atomic split.
- HB-1612 -> current school guide internal-analysis detail lock.
- HB-1614..1616 -> current school guide atomic exact + duplicate check.
- HB-1617 -> action-plan template exact fields.
- HB-1618 -> ilçe/il hierarchy connector exactness.
- HB-1619 -> named-team rewrite; current source only responsible units/persons.
- HB-1620/HB-1621 -> central current school-guide annual report/review semantics lock.
- HB-1622 -> service standards separate legal family.
- HB-1604..1608 -> prior DÖSE primary-source/system/SGK rewrite backlog.
- HB-1597..1603 -> prior DÖSE accounting/procurement backlog.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1655..1665, HB-1645..1647/HB-1667 -> school-type split publication staging.
- HB-1666 -> universal duty-book authority unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 -> existing semantics/split/exact-parent chains.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope.

## V72 önceliği — 300+ atom
1. Finish strategic planning HB-1611..HB-1622 against the current 2024-2028 school/institution strategic-plan guide and current 2026 SGB materials.
2. Promote HB-1614..1616 only after exact current school-guide atomic and duplicate-count lock.
3. Resolve HB-1620/HB-1621 report name, periodicity, actor and publication/retention semantics; distinguish central ministry model from school-level implementation.
4. Route HB-1622 into current service-standards/public-service legal family rather than strategic planning.
5. Then start HB-1623+ Human Resources only after exact master boundary extraction.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V72** başlat; minimum **300 atom** hedefle.
