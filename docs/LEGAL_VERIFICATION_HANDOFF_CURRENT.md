# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF — V86 Phase 2 tamamlandı / Phase 3 sırada
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. School-type/program-specific current provisions cannot be inherited by broad ALL metadata. Thematic/adjacent article is not exact provision proof.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **463 / 2.229 = %20,7716**
- Kalan exact: **1.766**
- Atom havuzu kapanmış V85 itibarıyla: **22.505**
- Son kapanmış batch: **V85**
- Aktif batch: **V86**
- V86 Phase 1: **40** active support atom.
- V86 Phase 2: **80** active support atom.
- V86 active total: **120** support atom; closed pool'a henüz eklenmez.

## V85 — course-selection integrity
Canonical: `docs/legal-course-selection-integrity-v85.md`.
- ARTICLE_VERIFIED **466 -> 463**, delta **-3**.
- HB-1762 rollback: secondary February-only claim was incorrectly backed by current OÖİKY Jan-Feb middle/IH-middle rule under ALL.
- HB-1763 rollback: unformed-course redirect exists for middle/IH-middle but old ALL scope is broader.
- HB-1766 rollback: cited OÖİKY provision contains no 10-student threshold.
- HB-1761/1764/1765/1767 remain school-family/current-source candidates.
- HB-1768..1770 remain MTAL/program-specific.
- HB-1760 remains AİHL-specific pending exact current parent.

## V86 Phase 1 — MTAL source/version lock
Canonical: `docs/legal-article-verified-focused-deepening-batch-v86-phase1.md`.
Official registry: `https://meslek.meb.gov.tr/kararlar`.
- TTKB **2026-62**: 2026-2027, prep/9 first, gradual MTAL elective-course table.
- TTKB **2026-85**: 2026-2027, prep/9 first, gradual framework curricula.
- 2024-41 retirement is gradual; legacy upper grades cannot be globally switched to the newest decision on day one.
- OÖKY Md138 is delivery/location/intensification authority only; it does not prove named-course eligibility.

## V86 Phase 2 — course/MTAL exactness lock
Canonical: `docs/legal-article-verified-focused-deepening-batch-v86-phase2.md`.
- Added **80** support atoms V86-A041..A120.
- ARTICLE_VERIFIED delta: **0**; remains **463 / 2.229**.
- No additional rollback booked without exact row-level mismatch.
- Official OÖKY consolidation locked as an authority-family source, but official-yet-stale consolidation alone cannot establish current exactness.
- OÖKY Md11 course-selection actions were decomposed into timing, actor, e-Okul, Kitap Seçim Modülü, unopened-course redirect, first-week 9th-grade and threshold/continuation atoms.
- OÖKY Md31 MTAL field/branch placement was separated from named elective-course eligibility.
- OÖKY Md138 enterprise/intensified delivery was separated from TTKB course eligibility.
- 2026-62 elective table and 2026-85 framework program remain distinct versioned authorities.
- HB-1768..1770 cannot be promoted from a range-level shorthand; exact three master sentences must be recovered and mapped individually.

## V86 canonical resolver
`education_year + grade/cohort + school/program + field + branch + TTKB_decision_version`

Forbidden: `latest decision wins` during phased transitions.

## Active guards
- JANUARY_FEBRUARY_IS_NOT_FEBRUARY_ONLY
- FIFTH_GRADE_FIRST_WEEK_CANNOT_VALIDATE_NINTH_GRADE_FIRST_WEEK
- COURSE_SELECTION_SAME_ACTION_ACROSS_LEVELS_REQUIRES_SCHOOL_FAMILY_SPLIT
- THEMATIC_ARTICLE_DOES_NOT_PROVE_NUMERIC_COURSE_OPENING_THRESHOLD
- ELECTIVE_GENERAL_AND_ELECTIVE_VOCATIONAL_THRESHOLDS_ARE_DISTINCT
- COURSE_OPENING_THRESHOLD_EXCEPTIONS_ARE_EXACTNESS_FIELDS
- AİHL_PROFESSIONAL_PRACTICE_IS_PROGRAM_SPECIFIC
- TTK_WEEKLY_SCHEDULE_RULE_IS_VERSIONED_PROGRAM_AUTHORITY
- MTAL_ELECTIVE_ELIGIBILITY_REQUIRES_TTKB_PROGRAM_LOCK
- LATEST_TTKB_DECISION_DOES_NOT_AUTOMATICALLY_WIN
- PHASED_TTKB_TRANSITION_REQUIRES_COHORT_RESOLUTION
- DELIVERY_PERMISSION_DOES_NOT_PROVE_COURSE_ELIGIBILITY
- ELECTIVE_TABLE_AND_FRAMEWORK_PROGRAM_ARE_DISTINCT_AUTHORITIES
- LEGACY_COHORT_MAY_RETAIN_PRIOR_TTKB_VERSION
- ALL_SCOPE_CANNOT_INHERIT_PROGRAM_SPECIFIC_MTAL_RULE
- OÖİKY_CANNOT_VALIDATE_MTAL_SPECIFIC_RULE_BY_THEME
- OFFICIAL_BUT_STALE_CONSOLIDATION_IS_NOT_CURRENT_EXACT_PROOF
- MTAL_NAMED_COURSE_REQUIRES_DECISION_NUMBER_LOCK
- EDUCATION_YEAR_ALONE_CANNOT_RESOLVE_PHASED_TTKB_VERSION
- PROGRAM_STRUCTURE_AND_COURSE_ELIGIBILITY_REQUIRE_DISTINCT_AUTHORITIES
- RANGE_LEVEL_MASTER_DESCRIPTION_CANNOT_PROMOTE_INDIVIDUAL_HB_ROWS
- PORTAL_PUBLICATION_DATE_AND_DECISION_DATE_ARE_DISTINCT
- INITIAL_THRESHOLD_AND_CONTINUATION_RULE_ARE_DISTINCT
- STUDENT_PREFERENCE_DOES_NOT_CREATE_COURSE_ELIGIBILITY
- SCHOOL_CAPACITY_AND_LEGAL_ELIGIBILITY_ARE_DISTINCT_GATES

## Tenant requirement
**Sosyal Sorumluluk Kulübü** tenant requirement remains active and does not increment ARTICLE_VERIFIED. Canonical: `docs/tenant-required-social-responsibility-club.md`.

## V86 Phase 3 priority
1. Recover exact HB-1768, HB-1769, HB-1770 master sentences individually from canonical master/crosswalk.
2. Audit HB-1771+ legacy Batch02 rows with OÖİKY/ALL ancestry row-by-row.
3. Resolve secondary Md11 against the latest RG amendment chain; only then recover eligible HB-1761/1764/1765/1766/1767.
4. Map named MTAL electives to cohort-applicable 2026-62 table + applicable framework decision.
5. Split all mixed ALL rows by school/program family.
6. Continue HB-1760 AİHL exact-current parent search.
7. Continue toward **>=300 V86 active support atoms** before closing V86.
8. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V86 Phase 3**'e geç; ARTICLE_VERIFIED yalnız exact claim + exact current/applicable official authority eşleşmesiyle değişir. Work modu, mevzuat doğrulaması bittikten sonra işleyiş/uygulama düzenlemesi aşamasında kullanılacak.
