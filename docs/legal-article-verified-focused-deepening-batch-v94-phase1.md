# Legal ARTICLE_VERIFIED Focused Deepening — V94 Phase 1

Date: 2026-09-04
Status: COMPLETE / V94 ACTIVE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before/after phase: 460
- Promotions: 0
- Rollbacks: 0
- Closed pool through V93: 24,905
- V94 Phase 1: **160 support atoms**

## Canonical 3.2 identity
Numeric adjacency is not authoritative. `kaynak_madde_kodu + board_type` resolves the section:
- HB-1848 = 3.2.1 composition
- HB-1849 = 3.2.2 chair
- HB-1850 = 3.2.3 schedule
- HB-1842 = 3.2.4 >=5-day notice
- HB-1844 = 3.2.5 outside lesson hours
- HB-1851 = 3.2.6 conditional invitees
- HB-1846 = 3.2.7 principal approval
- HB-1852 = 3.2.8 minutes/signature/retention
HB-1853 starts 3.3.

## Current authority
Primary current family: `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 chain, official MEB PDF `https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`, Art.10 + general Art.7/EK-1.

## Phase-1 exact locks
1. Art10/1 current composition: class board = teachers teaching same class level; branch board = teachers teaching same branch + guidance teachers.
2. Current Art10/1 explicit general-directive exception concerns studentless divisions of HEM/olgunlaşma institutes; therefore HB-1848's parenthetical `preschool/primary school not formed` is not a universal Art10/1 sentence.
3. Middle/IH-middle special scope is additionally governed by current OÖİKY Md36; institution-specific authority must override broad parent wording.
4. HB-1849 chair = institution principal or designated deputy principal; direct/strong current match.
5. HB-1850 schedule = middle/IH-middle October, February, June; secondary November, April; direct current Art10/2 match.
6. Art10/2 adds needs-based meetings requested by principal, relevant deputy principal, guidance teacher or class/branch guidance teacher, subject to principal approval.
7. Art10/2 allows class/branch board meetings to be held separately or combined according to need.
8. Year-end meeting evaluates decisions and results across the education year.
9. HB-1842 five-day notice must preserve general Art7 extraordinary exception; delivery channel does not erase notice semantics.
10. HB-1844 outside-lesson-hours rule is current/direct for this board under Art10/6; unlike Teacher Board Art9/5, no equivalent lesson-hours/MEM-approval exception was recovered in Art10 text. Do not inherit Art9 exception across board types.
11. HB-1851 parent/trainer invitees are optional (`davet edilebilir`), conditional on topic; not standing members.
12. HB-1846 maps to Art10/7: decisions by majority; tie follows chair side; implementation after principal approval.
13. HB-1852 maps to Art10/7: minutes signed by all relevant members including absentees and retained by administration.
14. Signature/attendance/voting/invitee roles remain distinct attributes.
15. Targeted repo searches recovered no direct historical ARTICLE_VERIFIED ledger rows for HB-1848/HB-1850; no count change.
16. Derivative wrong mapping exists around HB-1849 (`SOSYAL_ETKINLIK`); it is prohibited as evidence.

## Phase-1 guards
- CLASS_BRANCH_BOARD_IDENTITY_REQUIRES_SOURCE_CLAUSE
- CLASS_BRANCH_BOARD_SCHEDULE_IS_SCHOOL_TYPE_SPECIFIC
- HB1848_PARENT_SCOPE_REQUIRES_SPECIAL_AUTHORITY_SPLIT
- HEM_STUDENTLESS_DIVISION_EXCEPTION_IS_CURRENT_ART10_1
- OOIY_MD36_SPECIAL_SCOPE_OVERRIDES_GENERIC_PARENT
- NEEDS_BASED_CLASS_BRANCH_BOARD_REQUIRES_PRINCIPAL_APPROVAL
- CLASS_BRANCH_MEETINGS_MAY_BE_COMBINED_BY_NEED
- YEAR_END_CLASS_BRANCH_BOARD_EVALUATES_PRIOR_DECISIONS
- FIVE_DAY_NOTICE_RETAINS_EXTRAORDINARY_EXCEPTION
- TEACHERS_BOARD_LESSON_HOURS_EXCEPTION_DOES_NOT_AUTO_INHERIT_TO_CLASS_BRANCH_BOARD
- CLASS_BRANCH_INVITEES_ARE_OPTIONAL_AND_TOPIC_CONDITIONAL
- BOARD_VOTE_AND_PRINCIPAL_APPROVAL_ARE_DISTINCT_STATES
- MINUTES_SIGNATURE_INCLUDES_ABSENT_RELEVANT_MEMBERS
- WRONG_DERIVATIVE_SOCIAL_ACTIVITY_FAMILY_IS_NOT_EVIDENCE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Support atom accounting
A001-A040 source/version/scope; A041-A080 composition/chair/schedule; A081-A120 notice/lesson-hours/invitee; A121-A160 vote/approval/minutes/integrity. Total 160.
