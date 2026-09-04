# Legal ARTICLE_VERIFIED Batch V94

Date: 2026-09-04
Status: CLOSED
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V94: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after V94: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Phase 1: 160 atoms
- Phase 2: 140 atoms
- V94 total: **300 support atoms**
- Closed pool: **24,905 -> 25,205**

## Canonical 3.2 set
- HB-1848 = 3.2.1 composition/applicability
- HB-1849 = 3.2.2 chair
- HB-1850 = 3.2.3 school-type schedule
- HB-1842 = 3.2.4 notice
- HB-1844 = 3.2.5 outside lesson hours
- HB-1851 = 3.2.6 optional invitees
- HB-1846 = 3.2.7 decision/principal approval
- HB-1852 = 3.2.8 minutes/signature/retention
HB-1853 starts 3.3.

## Current authority locks
Primary: current `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, 12.02.2025 chain, Art.10 + Art.7/EK-1, official `https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`.

1. Current Art10/1 composition is exact, but HB-1848 parenthetical school-creation exception is not a universal Art10/1 statement and must be school-type split; current Art10/1 explicitly includes studentless HEM/olgunlaşma exception while OÖİKY Md36 separately governs middle/IH-middle/preschool/primary scope.
2. HB-1849 chair direct/strong.
3. HB-1850 schedule direct: middle/IH-middle October-February-June; secondary November-April.
4. Art10/2 also allows needs-based meetings on specified actors' request + principal approval, separate/combined meetings according to need, and year-end decision/result evaluation.
5. HB-1842 five-day notice retains Art7 extraordinary exception.
6. HB-1844 outside-lesson-hours is board-specific; Teacher Board Art9 MEM-approved lesson-hours exception is not inherited automatically.
7. HB-1851 invitees are optional/topic-conditional, not members.
8. HB-1846 includes majority vote + chair-side tie + principal approval before implementation.
9. HB-1852 minutes include absent relevant members' signatures and administration retention; SSDP separately controls duration.
10. HB-2142 scheduling workflow overlaps HB-1850 family and requires child-level dedupe without losing provenance.
11. Historical targeted repo search recovered no direct ARTICLE_VERIFIED ledger proof for HB-1848/HB-1850; no inferred count change.
12. Wrong derivative legal-family mapping around HB-1849 is prohibited from propagation.

## Core guards
- CLASS_BRANCH_BOARD_IDENTITY_REQUIRES_SOURCE_CLAUSE
- CLASS_BRANCH_BOARD_REQUIRES_INSTITUTION_APPLICABILITY_RESOLVER
- CLASS_BRANCH_BOARD_SCHEDULE_IS_SCHOOL_TYPE_SPECIFIC
- HB1848_PARENT_SCOPE_REQUIRES_SPECIAL_AUTHORITY_SPLIT
- HEM_STUDENTLESS_DIVISION_EXCEPTION_IS_CURRENT_ART10_1
- OOIY_MD36_SPECIAL_SCOPE_OVERRIDES_GENERIC_PARENT
- HB1850_AND_HB2142_REQUIRE_SCHEDULE_DEDUPE_WITH_PROVENANCE
- SECONDARY_BOARD_MUST_NOT_INHERIT_MIDDLE_JUNE_MEETING
- MIDDLE_BOARD_MUST_NOT_INHERIT_SECONDARY_NOVEMBER_APRIL_PAIR
- NEEDS_BASED_MEETING_IS_SEPARATE_CHILD
- CLASS_BRANCH_MEETINGS_MAY_BE_COMBINED_BY_NEED
- YEAR_END_EVALUATION_DOES_NOT_CREATE_UNSTATED_SECONDARY_MEETING
- FIVE_DAY_NOTICE_RETAINS_EXTRAORDINARY_EXCEPTION
- ART9_LESSON_HOUR_EXCEPTION_MUST_NOT_LEAK_TO_ART10
- CLASS_BRANCH_INVITEES_ARE_OPTIONAL_AND_TOPIC_CONDITIONAL
- OPTIONAL_INVITEE_CANNOT_BECOME_STANDING_MEMBER
- BOARD_VOTE_PRECEDES_PRINCIPAL_APPROVAL
- MINUTES_SIGNATURE_INCLUDES_ABSENT_RELEVANT_MEMBERS
- SIGNED_CLASS_BRANCH_MINUTES_ARE_IMMUTABLE_EVIDENCE
- WRONG_DERIVATIVE_SOCIAL_ACTIVITY_FAMILY_IS_NOT_EVIDENCE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Canonical files
- `docs/legal-article-verified-focused-deepening-batch-v94-phase1.md`
- `docs/legal-article-verified-focused-deepening-batch-v94-phase2.md`
- `docs/legal-article-verified-batch-v94.md`
- `docs/legal-verification-progress-v94-delta.json`

## Next
V95 = `3.3 EĞİTİM KURUMU SINIF/ALAN ZÜMRELERİ`, beginning HB-1853. Current authority family Art.11-12 + EK-2 must be locked, especially the 2024 zümre-president selection hierarchy and MEBBİS entry rule.
