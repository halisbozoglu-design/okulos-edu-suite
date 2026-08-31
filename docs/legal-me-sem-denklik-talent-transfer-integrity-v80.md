# V80 — MESEM / Denklik / Yetenek Nakil Integrity

Date: 2026-08-31
Migration: 0
Lovable: 0
Support atoms: 410

## Scope
HB-1711..HB-1722 audit against current official MEB/RG sources only.

## Findings
- HB-1711: current OÖKY Md26/5 preserves the low-count MESEM routing logic, but current metadata is wrongly broad (`AOL|HS`) and the master ties the threshold to legacy 9th-grade/repeater wording. WITHHELD_SCOPE_AND_TEXT_RECHECK.
- HB-1712: foreign-study equivalency -> appropriate programme/class is a current denklik/placement family, but exact current Denklik Yönetmeliği provision and actor lock remain pending.
- HB-1713: legacy Anadolu meslek -> Anadolu teknik transition rule (9th direct pass + YBP>=70) depended on OÖKY Md30. Current consolidated OÖKY marks Md30 repealed by RG 08.09.2023/32303. MASTER_RETIRE_OR_HISTORICAL_SNAPSHOT.
- HB-1714: legacy subject-average/tie-break transition formula belonged to the repealed Md30 model. MASTER_RETIRE_OR_HISTORICAL_SNAPSHOT.
- HB-1715: `Anadolu sağlık meslek lisesi` legacy school-type wording and fixed 34 cap cannot be promoted under current programme/scope without current health-services-specific rule lock.
- HB-1716: text maps to current OÖKY Md31/4 for special-needs students in vocational field/branch choice, but old ARTICLE_VERIFIED used OÖİKY Md11 with ALL scope. Current master metadata is still too broad. ROLLBACK_ARTICLE_VERIFIED (-1), then stage MTAL/mesleki-specific scope correction.
- HB-1717: OÖKY Md31/6 exactly says MESEM student's field/branch is determined by signed contract and entered into e-Mesem. Master text exact, but current metadata is ALL + special-ed condition and therefore wrong. WITHHELD_SCOPE_CORRECTION; no promotion.
- HB-1718: old ARTICLE_VERIFIED used OÖİKY Md11/ALL. Master says monthly applications except December and May; current talent-school transfer regime is September/October last-week / annual-guide based. ROLLBACK_ARTICLE_VERIFIED (-1) + TIMING_MODEL_CHANGED.
- HB-1719: durable OÖKY + annual guide family confirms talent-score-based admissions, but exact admission/registration details are annual/program scoped. YEAR_PARAMETER / SCHOOL_PROGRAM_SCOPE.
- HB-1720: current 2025 MEB talent guide confirms open-contingent transfers from prep/9/10/11 via talent exam in September/October last weeks and school-directorate application handling. Treat as annual/current-program child; do not make eternal hard-coded rule.
- HB-1721: current OÖKY Md21/1 applies lower-age threshold 14 for MESEM and removes most upper-age provisions for independent MESEM; `18 yaşını bitirmiş olanların kayıtları da yapılır` is an eligibility-state summary, not the exact normative sentence. WITHHELD_SEMANTIC_REWRITE.
- HB-1722: master demands a specific `işe giriş sağlık raporu` at MESEM registration. Current OÖKY Md21/3 requires health suitability for vocational education and report only when required by programme; the specific employment-entry health report object needs 6331/3308 exact actor/object chain. WITHHELD_OBJECT_AND_SOURCE_SPLIT.

## Guards
- REPEALED_ARTICLE_CANNOT_SUPPORT_CURRENT_WORKFLOW.
- HISTORICAL_TRANSITION_FORMULA_MUST_NOT_BE_GRANDFATHERED.
- TEXT_EXACT_BUT_SCOPE_METADATA_WRONG_REQUIRES_WITHHOLD_OR_ROLLBACK.
- TALENT_TRANSFER_MONTH_WINDOW_IS_ANNUAL/CURRENT_MODEL_FIELD.
- ELIGIBILITY_STATE_IS_NOT_IDENTICAL_TO_NORMATIVE_REGISTRATION_DUTY.
- HEALTH_SUITABILITY_REPORT_AND_EMPLOYMENT_ENTRY_REPORT_ARE_DISTINCT_OBJECTS.

## Counter
ARTICLE_VERIFIED: 468 -> 466 (net -2).
Atom pool: 20,045 -> 20,455.
