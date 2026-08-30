# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, `meb.gov.tr` resmî birimleri ve `resmigazete.gov.tr`. Resmî MEB rehberi L2 operational evidence olabilir; primary exact provision yerine geçmez. Current-period MEB Genelge/Hazırlık Programı exact okul/kurum actor-action-scope içeriyorsa yalnız ilgili plan dönemi legal snapshotı ile doğrulama parentı olabilir.

## Integrity guards
- SAME_TOPIC != SAME_SCOPE.
- L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED.
- CURRENT_GUIDE_CAN_CONFIRM_OPERATION_BUT_NOT_REPLACE_PRIMARY_PROVISION.
- PERIODIC_STRATEGIC_PLAN_SOURCE_REQUIRES_PERIOD_SNAPSHOT.
- PERIOD_PROGRAM_CAN_VALIDATE_ONLY_CURRENT_PERIOD_INSTANCE_OR_SNAPSHOT.
- NAMED_TEAM_MUST_EXIST_IN_CURRENT_SOURCE: `sorumlu birim/kişiler` ayrı zorunlu `ekip` adı olarak normalize edilemez.
- ANALYSIS_COMPONENTS_DO_NOT_MERGE_ONLY_BECAUSE_SAME_STRATEGIC_PLAN_SECTION.
- EXPLICIT_SCHOOL_INSTITUTION_SCOPE_REQUIRED_FOR_PERIOD_PLAN_PROMOTION.
- SECTION_PLACEMENT_DOES_NOT_DEFINE_LEGAL_FAMILY.
- STRATEGIC_PLAN_SECTION_ENDS_BEFORE_HUMAN_RESOURCES.
- LEGACY_INSTITUTION_NAME_OR_RECIPIENT_REQUIRES_CURRENT_RECIPIENT_RECHECK.
- ACCOUNTING_REPORT_OBJECT_AND_SUBMISSION_CHANNEL_ARE_EXACTNESS_FIELDS.
- PROCUREMENT_AND_SALES_MUST_NOT_BE_COLLAPSED_UNDER_ONE_GENERIC_IHALE_PARENT.
- SYSTEM_NAME_MATCH_REQUIRES_FUNCTION_MATCH.
- EMPLOYEE_SHARE_AND_EMPLOYER_SHARE_ARE_NOT_SAME_DEDUCTION.
- broad ALL school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **474 / 2.229 = %21,2651**
- Kalan exact: **1.755**
- Atom havuzu: **17.585**
- Son batch: **V72**
- Sonraki batch: **V73**

## V72 — 410 atom
- Integrity: `docs/legal-strategic-plan-current-period-integrity-v72.md` — `8a4610eb335643f27e59ed53c9e7af77d9df92b2`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v72.md` — `13d9512ee6543be5000b6efda1df7a3a481199d5`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v72.md` — `a197e639b262dc932cd9a2988dfa73d961713195`
- Progress: `docs/legal-verification-progress-v72-delta.json` — `9c7a1ba1bd3d436ceb2881cddcd85638ea9afdbd`
- Support atoms: **410**; pool **17.175 -> 17.585**.
- ARTICLE_VERIFIED: **470 -> 474**, delta **+4**.

### V72 Strategic Planning closure
- `HB-1613` ARTICLE_VERIFIED +1: current MEB Preparation Program 6.6.3 explicitly requires school/institution PESTLE analysis.
- `HB-1614` ARTICLE_VERIFIED +1: current Program 6.3 requires mission, vision and core values; 6.6.3 makes these school/institution steps.
- `HB-1615` ARTICLE_VERIFIED +1: current Program 6.4 + 6.6.3 requires aims, targets, performance indicators and strategies.
- `HB-1616` ARTICLE_VERIFIED +1: current Program 6.6.3 expressly requires school/institution activities/projects to be determined.
- All four promotions are `2024-2028` period/legal-snapshot constrained; they are not eternal hard-coded duties independent of the planning period.
- `HB-1611`: stakeholder participation + GZFT compound; split required.
- `HB-1612`: current `kuruluş içi analiz` family confirmed, exact component-list lock pending.
- `HB-1617`: detailed action-plan responsibility/timing/resource fields require current school-template exact lock.
- `HB-1618`: current hierarchy/alignment family exists but master `ilçe/İl` connector requires exact recheck.
- `HB-1619`: current Program requires responsible units/persons, not mandatory separately named monitoring/evaluation team; rewrite required.
- `HB-1620/HB-1621`: annual monitoring/evaluation operationally current; school-level report title, periodicity, actor and publication/retention exactness still pending.
- `HB-1622`: service standards table belongs to a different legal family; reclassify rather than inherit strategic-plan source.
- `HB-1623`: confirmed start of `2.2 İnsan Kaynakları Yönetimi`; strategic-plan inheritance stops before it.

### PDF handling
MEB 2024-2028 Stratejik Plan Hazırlık Programı PDF was opened and parsed. Screenshot calls for pages containing 6.3/6.4/6.6.3 were attempted but returned cache-miss errors; screenshot success is not claimed.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1611 -> stakeholder/GZFT atomic split.
- HB-1612 -> current school guide internal-analysis detail lock.
- HB-1617 -> action-plan template exact fields.
- HB-1618 -> ilçe/il hierarchy connector exactness.
- HB-1619 -> named-team rewrite; current source only responsible units/persons.
- HB-1620/HB-1621 -> central/current school-guide annual report/review semantics lock.
- HB-1622 -> service-standards/public-service legal family.
- HB-1623+ -> Human Resources current exact source audit; do not inherit strategic-plan source.
- HB-1604..1608 -> prior DÖSE primary-source/system/SGK rewrite backlog.
- HB-1597..1603 -> prior DÖSE accounting/procurement backlog.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1655..1665, HB-1645..1647/HB-1667 -> school-type split publication staging.
- HB-1666 -> universal duty-book authority unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 -> existing semantics/split/exact-parent chains.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope.

## V73 önceliği — 300+ atom
1. Start `HB-1623+` Human Resources from exact master text; audit current norm-cadre, personnel-file, discipline, attendance/leave and staff-development chains using only official current sources.
2. For `HB-1623`, distinguish `norm kadro calculation/assignment` from the audit-state wording `norm kadroya uygun sayıda öğretmen bulunmaktadır`; do not count a state statement unless current actor/action duty maps exactly.
3. For `HB-1624`, recheck 657 Md109 and current personnel-file implementation/actor/retention semantics before promotion.
4. Keep HB-1611/1612/1617-1622 backlog separate; no strategic-plan inheritance into HR.
5. Retry HB-1483/HB-1484 only through official OAB/RG source if room.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V73** başlat; minimum **300 atom** hedefle.
