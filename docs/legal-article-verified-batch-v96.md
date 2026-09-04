# Legal ARTICLE_VERIFIED Batch V96

Date: 2026-09-04
Status: CLOSED
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V96: 460
- Promotions: 0
- Rollbacks: 1 (HB-1868)
- ARTICLE_VERIFIED after V96: **459 / 2,229 = 20.5922%**
- Remaining exact: **1,770**
- Phase 1: 160 atoms
- Phase 2: 140 atoms
- V96 total: **300 support atoms**
- Closed pool: **25,505 -> 25,805**

## Canonical 3.4 set
- HB-1868 = 3.4.1 formation + chair selection + stale two-year parent text
- HB-1869 = 3.4.2 ordinary/interim meetings
- HB-1870 = 3.4.3 >=5-day notice
- HB-1871 = 3.4.4 decisions re-evaluated in class/area zümre
- HB-1872 = 3.4.5 outside lesson hours
- HB-1861 = 3.4.6 principal approval
- HB-1873 = 3.4.7 minutes/signature/retention
- HB-1874 = 3.4.8 year-end evaluation
HB-1875 starts 3.5.

## Current authority
Current official `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 consolidated chain, Art.13, official PDF:
`https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`

## Canonical result
1. **HB-1868 rolled back once.** Historical Batch01 proves it was counted ARTICLE_VERIFIED under Art13. Current Art13/1 says the board elects its chair at the first meeting **for that education and teaching year**; the master parent says **2 years**. Material claim mismatch is proven.
2. Correct Art13/1 runtime: first-meeting election, one education-year term, 2024 selection hierarchy, MEBBİS entry, no mid-year change absent compulsory reason.
3. Two-year terms remain valid in other role families (Art12 class/area zümre chair; Art14 district zümre chair) and must not leak into Art13 board-chair semantics.
4. HB-1869 remains counted after citation repair from historical Art12/4 to exact current Art13/2; claim itself remains current-correct.
5. HB-1871 remains counted after paragraph normalization to Art13/5; claim itself remains current-correct.
6. HB-1870 exact Art13/3 notice; compulsory-situation exception and channel semantics preserved.
7. HB-1872 exact Art13/4 outside-lesson-hours; no imported Art9 lesson-hour override.
8. HB-1861 exact principal-approval child in Art13/6; vote/tie/approval are distinct lifecycle states.
9. HB-1873 exact Art13/6 minutes/signature/retention; absentees included; SSDP controls duration.
10. HB-1874 exact year-end evaluation under Art13/2.
11. Art13/7 agenda additions are authority-versioned; Art13/8 vocational agenda is feature/school-type conditional; Art13/9 campus board is program scoped.
12. Art13/10, current 12.02.2025 addition/change, makes relevant zümre chair participate in principal's at-least-once-per-school-year teacher monitoring/evaluation/guidance work and cross-links V89.
13. Historical completed/signed instances remain immutable; current legal change is prospective.
14. No additional promotion/rollback without row-level ledger proof.

## Core guards
- BOARD_CHAIR_TERM_IS_ONE_EDUCATION_YEAR_NOT_TWO
- HB1868_ROLLBACK_ONCE
- TWO_YEAR_ZUMRE_TERM_MUST_NOT_LEAK_FROM_ART12_OR_ART14_TO_ART13
- ART13_BOARD_CHAIR_ELECTED_AT_FIRST_MEETING
- ART13_CHAIR_SELECTION_HIERARCHY_IS_2024_VERSIONED
- ART13_CHAIR_MEBBIS_ENTRY_REQUIRED
- ART13_CHAIR_CHANGE_REQUIRES_COMPULSORY_REASON
- HB1869_CITATION_REPAIR_TO_ART13_2_WITHOUT_COUNT_DELTA
- HB1871_PARAGRAPH_NORMALIZATION_TO_ART13_5_WITHOUT_COUNT_DELTA
- ART13_INTERIM_MEETING_HAS_EXACT_TRIGGERS
- FIVE_DAY_NOTICE_HAS_COMPULSORY_SITUATION_EXCEPTION
- ART9_LESSON_HOUR_EXCEPTION_DOES_NOT_LEAK_TO_ART13
- ART13_DECISIONS_RETURN_TO_CLASS_AREA_ZUMRE
- ART13_VOTE_PRECEDES_PRINCIPAL_APPROVAL
- ART13_MINUTES_INCLUDE_ABSENT_MEMBERS
- ART13_AGENDA_IS_VERSIONED
- ART13_VOCATIONAL_AGENDA_IS_FEATURE_CONDITIONAL
- ART13_CAMPUS_BOARD_IS_PROGRAM_SCOPED
- ART13_10_CROSSLINKS_TEACHER_MONITORING
- HISTORICAL_SIGNED_INSTANCES_IMMUTABLE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Canonical files
- `docs/legal-article-verified-focused-deepening-batch-v96-phase1.md`
- `docs/legal-article-verified-focused-deepening-batch-v96-phase2.md`
- `docs/legal-article-verified-batch-v96.md`
- `docs/legal-verification-progress-v96-delta.json`

## Next
V97 starts `3.5 ÜNİTELENDİRİLMİŞ YILLIK PLANLAR VE DERS PLANLARI`, beginning HB-1875. Current authority must pivot from board/zümre directive to the current `Eğitim Öğretim Çalışmalarının Planlı Yürütülmesine İlişkin Yönerge` and exact curriculum/model-specific planning rules.