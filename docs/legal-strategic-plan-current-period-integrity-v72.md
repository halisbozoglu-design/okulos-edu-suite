# V72 — Strategic plan current-period integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete. Migration 0. Lovable 0.

## Current source
MEB 2024-2028 Stratejik Plan Hazırlık Programı, current-period school/institution scope. Program 6.6.3 explicitly applies to ilçe MEM plus okul/kurum and lists durum analizi; paydaş analizi; kuruluş içi analiz; PESTLE; GZFT; misyon; vizyon; temel değerler; amaçlar; hedefler; performans göstergeleri; stratejiler; faaliyet ve projeler. Period snapshot is mandatory.

## HB-1611
Master combines stakeholder identification/opinion collection with GZFT external analysis. Both families exist in the current program, but they are separately executable analysis atoms. Status: COMPOUND_ANALYSIS_SPLIT_REQUIRED. No whole-row count.

## HB-1612
Master names unit structure, technology infrastructure, institutional culture, physical resources and financial structure as internal-environment components. Current Program requires `kuruluş içi analiz`, but this exact component list must be locked against the current school/institution guide/template before exact promotion. Status: CURRENT_FAMILY_CONFIRMED + DETAIL_LOCK_PENDING.

## HB-1613
Master requires Political, Economic, Social, Technological, Legal and Environmental (PESTLE) analysis. Current Program 6.6.3 explicitly includes PESTLE analysis in school/institution situation analysis. Actor/scope/action/object match for the current 2024-2028 period. ARTICLE_VERIFIED +1 with period snapshot.

## HB-1614
Master requires mission, vision and core values. Current Program 6.3 states mission, vision and core values are determined; 6.6.3 explicitly applies these steps to schools/institutions. ARTICLE_VERIFIED +1 with period snapshot.

## HB-1615
Master requires aims, targets, performance indicators and strategies. Current Program 6.4 explicitly requires aims/targets and target-linked performance indicators and strategies; 6.6.3 expressly applies them to schools/institutions. ARTICLE_VERIFIED +1 with period snapshot.

## HB-1616
Master requires activities in line with strategic-plan targets. Current Program 6.6.3 expressly requires school/institution `faaliyet ve projeler` to be determined within the same planning chain. ARTICLE_VERIFIED +1 with period snapshot.

## HB-1617
Detailed action-plan row merges responsibility owner/unit, timing and resource fields. Current exact school-template field lock is still required. Status: MULTI_FIELD_TEMPLATE_LOCK_PENDING.

## HB-1618
Master says school plan is compatible with district/provincial MEM plan. Current MEB chain requires school/institution plans to be prepared in accordance with the Ministry plan and routed through district/provincial review, but the master `ilçe/İl` connector is not yet exact enough to count. WITHHELD_HIERARCHY_CONNECTOR_RECHECK.

## HB-1619
Current Program 6.5 requires responsible units/persons and a monitoring/evaluation timetable; it does not require a separate named `İzleme ve Değerlendirme Ekibi`. Status: LEGACY_OR_LOCAL_ORGAN_NAME + MASTER_REWRITE_REQUIRED.

## HB-1620 / HB-1621
Annual monitoring/evaluation and target-vs-realization comparison are operationally current. Exact school-level report title, periodicity, actor and publication/retention semantics remain central-guide/template recheck items. No count this batch.

## HB-1622
`Hizmet standartları tablosu` is not strategic planning merely because it appears under the same handbook subsection. Route to public-service/service-standards legal family. Status: LEGAL_FAMILY_RECLASSIFICATION_REQUIRED.

## Boundary
HB-1623 starts 2.2 Human Resources Management. No strategic-plan inheritance beyond HB-1622.

## Guards added
- PERIOD_PROGRAM_CAN_VALIDATE_ONLY_CURRENT_PERIOD_INSTANCE_OR_SNAPSHOT.
- ANALYSIS_COMPONENTS_DO_NOT_MERGE_ONLY_BECAUSE_SAME_STRATEGIC_PLAN_SECTION.
- EXPLICIT_SCHOOL_INSTITUTION_SCOPE_REQUIRED_FOR_PERIOD_PLAN_PROMOTION.
- STRATEGIC_PLAN_SECTION_ENDS_BEFORE_HUMAN_RESOURCES.

PDF screenshot calls for relevant pages were attempted and returned cache-miss errors; screenshot success is not claimed.
