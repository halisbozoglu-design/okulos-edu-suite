# Legal ARTICLE_VERIFIED Focused Deepening — V48

Date: 2026-08-29
Migration: 0
Support atoms added: 540

## Scope
V48 normalizes the RAM counseling-measure family, current 2026 counseling-measure parameters, RAM guidance-program review, risk-map semantics, and scope/legal-family correction candidates.

## Current authorities
- 5395 Çocuk Koruma Kanunu Md5/1-a: counseling measure legal type.
- 2026 Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ, published 24.04.2026. Resmî Gazete daily issue is 33233; ORGM listing metadata says 33223 and is treated as a source-metadata typo.
- MEB Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği, 14.08.2020 / RG 31213.
- MEB Rehberlik ve Araştırma Merkezi Yönergesi, 31.08.2020, current ORGM guidance-legislation family.

## Counseling-measure durable parent
Legacy monthly rows that contain `Merkezimize başvuran ve yönlendirilen öğrenci ve velileriyle görüşmelerin yapılması ve danışmanlık tedbiri görüşmelerinin sürdürülmesi` are not one atomic legal workflow. They split into:
1. GENERAL_RAM_INTAKE_INTERVIEW
2. COUNSELING_MEASURE_CASE
3. ASSIGNEE_RESOLUTION
4. START_DEADLINE
5. FAMILY_APPLICATION_DEADLINE
6. FIRST_INTERVIEW
7. IMPLEMENTATION_PLAN
8. COURT_SUBMISSION
9. SESSION_EXECUTION
10. PERIODIC_EVALUATION
11. CONTINUE_MODIFY_TERMINATE_BRANCH
12. FINAL_REPORT
13. EVIDENCE_ARCHIVE
14. PRIVACY_ACCESS_CONTROL

Known legacy instances include HB-0278, HB-0680, HB-0943, HB-0944 and analogous monthly copies. HB-0943/HB-0944 are duplicate extraction candidates because page/line/month/text are the same.

Rows HB-0206, HB-0600, HB-0763, HB-1040 combine counseling/general RAM work with Şiddet İl Eylem Planı and remain SPLIT_REQUIRED. HB-0514 additionally combines local manager meeting semantics.

## 2026 counseling parameters
Current parameter engine fields staged:
- legal_type = DANISMANLIK_TEDBIRI
- trigger = COURT/JUDGE_PROTECTIVE_SUPPORTIVE_MEASURE
- assignee_resolution = school guidance service / RAM or district-provincial assignment according to child-school relation and staffing
- assignment_due_business_days = 5
- process_start_due_business_days = 3
- family_application_due_days = 10
- implementation_plan_court_due_business_days_after_first_interview = 5
- session_interval_days = 15
- minimum_session_count = 8
- periodic_evaluation = 3_MONTH
- online_session_allowed = conditional/current-tebliğ rules
- max_active_files_per_counselor = 15
- evidence = assignment, contact/application log, first interview, implementation plan, session notes, periodic evaluation, court submission, final/continuation decision

No handbook month label is promoted into national timing.

## RAM program-review / risk-map correction
HB-0602 canonical text is `Okullardan gelen okul rehberlik programlarının incelenmesi ve inceleme formlarının okullara ulaştırılması`, but canonical scope is incorrectly tagged PANSİYONLU OKULLAR. Current RAM Yönergesi Md5/4-a includes examining/evaluating school RPD programs and giving feedback. HB-0602 becomes SCOPE_CORRECTION_READY but is not counted ARTICLE_VERIFIED until corrected scope is published.

HB-0603 `Okul risk haritalarının uygulanması` is too ambiguous to bind as a RAM execution duty. Current RPD Yönetmeliği separates: school guidance service creates risk map (Md21/4-b/3) and education institution director ensures delivery to RAM (Md18/1-m). Therefore HB-0603 = ACTION_SCOPE_REWRITE_REQUIRED; no invented RAM duty.

## Guard results
- No new ARTICLE_VERIFIED count in V48.
- Existing count remains 467/2229.
- Wrong-scope or ambiguous-action rows must be corrected and published before exact count.
- Duplicate calendar instances never increase exact counter.
- Completed historical instances remain immutable; corrections apply to durable definitions/future instances.
