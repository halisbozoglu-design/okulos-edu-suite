# ARTICLE_VERIFIED Focused Deepening V86 — Phase 1

Date: 2026-09-02
Status: ACTIVE / SOURCE-VERSION LOCK
Migration: 0
Lovable: 0
ARTICLE_VERIFIED counter: 463 / 2,229 (unchanged in Phase 1)

## Focus
MTAL elective vocational-course rules, legacy Batch02 source-family audit, and 2026-2027 TTKB transition semantics.

## Official source locks
1. MTEGM Kurul Kararları portal: https://meslek.meb.gov.tr/kararlar
2. TTKB Decision 2026-62: Mesleki ve Teknik Okul/Kurumlarda Uygulanacak Seçmeli Dersler Tablosu; 2026-2027 education year, beginning with preparatory and Grade 9, gradual implementation.
3. TTKB Decision 2026-85: Anadolu Meslek ve Anadolu Teknik Programı framework curricula for 52 fields; 2026-2027 education year, beginning with preparatory and Grade 9, gradual implementation.
4. MTEGM portal explicitly states that 2024-41 framework curricula are removed gradually beginning with preparatory and Grade 9 in 2026-2027; therefore 2024-41 cannot be globally disabled for all cohorts on that date.
5. OÖKY Article 138 official MEB-hosted text: elective vocational-course education may be carried out in enterprises; when necessary it may be intensified on weekend holiday, interim break, semester break and summer vacation.

## Canonical resolver
An MTAL elective-vocational eligibility result MUST be resolved using all applicable dimensions:

`education_year + grade/cohort + school/program + field + branch + TTKB_decision_version`

A newest-document-only resolver is forbidden.

## Phase-1 atomic locks
- V86-A001: `OÖİKY` is not a valid generic parent for MTAL elective-vocational eligibility.
- V86-A002: broad `ALL` scope cannot validate a school/program-specific MTAL rule without an exact common parent provision.
- V86-A003: general elective selection semantics and MTAL elective-vocational eligibility are separate legal objects.
- V86-A004: OÖKY Article 138 proves a delivery-location possibility; it does not by itself prove that a named field/branch course is eligible to be selected.
- V86-A005: OÖKY Article 138 allows elective vocational-course education in enterprises.
- V86-A006: OÖKY Article 138 permits weekend intensive implementation when needed.
- V86-A007: OÖKY Article 138 permits interim-break intensive implementation when needed.
- V86-A008: OÖKY Article 138 permits semester-break intensive implementation when needed.
- V86-A009: OÖKY Article 138 permits summer-vacation intensive implementation when needed.
- V86-A010: field/branch course eligibility requires the applicable TTKB/MTEGM curriculum/schedule authority.
- V86-A011: TTKB 2026-62 is a versioned authority for the MTAL elective-course table.
- V86-A012: TTKB 2026-62 starts in the 2026-2027 education year.
- V86-A013: 2026-62 applies first to preparatory classes where relevant.
- V86-A014: 2026-62 applies first to Grade 9.
- V86-A015: 2026-62 implementation is gradual, not an immediate all-grade replacement.
- V86-A016: TTKB 2026-85 is a versioned authority for 52 Anadolu Meslek/Anadolu Teknik field framework curricula.
- V86-A017: 2026-85 starts in the 2026-2027 education year.
- V86-A018: 2026-85 applies first to preparatory classes where relevant.
- V86-A019: 2026-85 applies first to Grade 9.
- V86-A020: 2026-85 implementation is gradual.
- V86-A021: 2024-41 is not globally obsolete for every grade on the first day of 2026-2027.
- V86-A022: a legacy upper-grade cohort may continue to require the prior decision/program version until the gradual transition reaches that grade.
- V86-A023: `latest decision wins` is forbidden for phased TTKB transitions.
- V86-A024: decision applicability must be computed from education year and grade/cohort before course eligibility is evaluated.
- V86-A025: program must be resolved before field/branch course eligibility is evaluated.
- V86-A026: field and branch must be resolved before a named vocational elective is exposed as selectable.
- V86-A027: source metadata must retain decision number and effective/transition semantics, not only a URL.
- V86-A028: a later framework-program decision and a later elective-table decision are distinct authorities and must not be collapsed into one source record.
- V86-A029: 2026-85 cannot substitute for 2026-62 when the legal question is the elective-course table itself.
- V86-A030: 2026-62 cannot substitute for 2026-85 when the legal question is field framework-program structure/content.
- V86-A031: a course must not be offered merely because it exists in another field/branch or another decision version.
- V86-A032: a course removed for the active cohort/version must not survive through stale cached catalog metadata.
- V86-A033: a course valid for a legacy cohort must not be removed merely because a newer Grade-9 cohort uses a newer decision.
- V86-A034: transition resolution is student/cohort sensitive, not only school sensitive.
- V86-A035: HB-1768..1770 remain program-specific candidates until each exact master claim is matched to the applicable current/transition source.
- V86-A036: HB-1771+ legacy Batch02 rows attached to OÖİKY/ALL must be audited by claim text and scope before any promotion.
- V86-A037: rollback is once-only and requires proof that the old verified parent/scope was materially wrong for the exact claim.
- V86-A038: no Phase-1 atom changes the ARTICLE_VERIFIED numerator merely for having a correct architecture/source-family lock.
- V86-A039: denominator remains unchanged until normal Super Admin publish semantics are satisfied.
- V86-A040: migrations are not required for this source/version lock; canonical documentation-first correction is sufficient at this phase.

## Guards added
- MTAL_ELECTIVE_ELIGIBILITY_REQUIRES_TTKB_PROGRAM_LOCK
- LATEST_TTKB_DECISION_DOES_NOT_AUTOMATICALLY_WIN
- PHASED_TTKB_TRANSITION_REQUIRES_COHORT_RESOLUTION
- DELIVERY_PERMISSION_DOES_NOT_PROVE_COURSE_ELIGIBILITY
- ELECTIVE_TABLE_AND_FRAMEWORK_PROGRAM_ARE_DISTINCT_AUTHORITIES
- LEGACY_COHORT_MAY_RETAIN_PRIOR_TTKB_VERSION
- ALL_SCOPE_CANNOT_INHERIT_PROGRAM_SPECIFIC_MTAL_RULE
- OÖİKY_CANNOT_VALIDATE_MTAL_SPECIFIC_RULE_BY_THEME

## Promotion/rollback status
Phase 1 performs source-family/version locking only. No new ARTICLE_VERIFIED promotions and no additional rollbacks are booked yet. Counter stays **463 / 2,229** until HB-1771+ exact claim rows are individually matched and the once-only rollback/promote conditions are met.

## Next V86 phase
1. Extract HB-1771+ exact master claim text rather than relying on GitHub full-text indexing of HB IDs.
2. Match each MTAL claim to OÖKY provision + applicable TTKB decision/table/program authority.
3. Split mixed ALL rows by school/program family.
4. Book only proven once-only rollback/promote deltas.
5. Continue toward the V86 300+ support-atom target without inflating ARTICLE_VERIFIED counts.
