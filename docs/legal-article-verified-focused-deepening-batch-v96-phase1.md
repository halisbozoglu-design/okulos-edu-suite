# Legal ARTICLE_VERIFIED Focused Deepening — V96 Phase 1

Date: 2026-09-04
Status: COMPLETE / V96 ACTIVE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V96: 460
- Confirmed rollback in phase 1: HB-1868 (-1)
- ARTICLE_VERIFIED interim: 459
- Closed pool through V95: 25,505
- V96 Phase 1 support atoms: 160

## Canonical 3.4 identity
Section `3.4 EĞİTİM KURUMU SINIF/ALAN ZÜMRE BAŞKANLAR KURULU` resolves by source clause, not numeric adjacency:
- HB-1868 = 3.4.1 formation + chair selection + legacy two-year claim
- HB-1869 = 3.4.2 ordinary/interim meetings
- HB-1870 = 3.4.3 >=5-day notice
- HB-1871 = 3.4.4 decisions re-evaluated in class/area zümre
- HB-1872 = 3.4.5 outside lesson hours
- HB-1861 = 3.4.6 principal approval
- HB-1873 = 3.4.7 minutes/signature/retention
- HB-1874 = 3.4.8 year-end evaluation
HB-1875 starts 3.5.

## Current official authority
Current official `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 consolidated chain, official PDF:
`https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`
Primary exact clauses: Art.13/1-10, with general Art.7 where applicable.

## High-confidence live clause locks
1. Art13/1: board consists of education-institution class/area zümre presidents.
2. Art13/1: at its first meeting, the board elects one of its members as chair **for that education and teaching year**.
3. Art13/1 selection hierarchy (2024 amendment): willing candidates first; if none, doctorate -> head teacher -> master's -> expert teacher -> prior zümre chair -> senior teacher.
4. Selected chair is entered in MEBBİS.
5. Unless compulsory, board chair cannot be changed during the education and teaching year.
6. Therefore HB-1868 master phrase `Seçilen zümre başkanı 2 yıl süre ile görev yapar` is materially wrong for the 3.4 board chair.
7. The two-year rule belongs to other role families (e.g. education-institution class/area zümre chair under Art12 and district zümre chair under Art14), not this board chair.
8. Art13/2: ordinary meetings before school year, start of second term and end of school year.
9. Art13/2: interim meeting when needed by principal/board-chair call or written request of absolute majority.
10. Art13/2: year-end meeting evaluates decisions/results across the year.
11. Art13/3: date/place/agenda at least five days before except compulsory situations; written notice, and when needed email/IT tools.
12. Art13/4: board meetings are outside lesson hours.
13. Art13/5: decisions are re-evaluated in class/area zümre meetings and necessary measures are taken.
14. Art13/6: decisions by majority; tie follows board chair's view; implementation after principal approval.
15. Art13/6: minutes signed by all board members including absentees and retained by education-institution administration.
16. Art13/7-10 add agenda, vocational, campus and teacher-monitoring responsibilities; these are exact children beyond legacy 3.4.1-3.4.8 checklist wording.

## Historical ledger integrity
Historical `Mimaros_Article_Verified_Batch01_Zumre_Planlama.csv` proves:
- HB-1868 was counted ARTICLE_VERIFIED using Art13.
- HB-1869 was counted ARTICLE_VERIFIED but cited Art12/4; the master claim itself remains current-exact under Art13/2, so this is a **citation/provision repair**, not a rollback.
- HB-1871 was counted ARTICLE_VERIFIED under broad Art13 and remains current-exact under Art13/5; retain count and normalize paragraph.
- HB-1870, HB-1872, HB-1861, HB-1873, HB-1874 were not counted there.

## HB-1868 rollback decision
Historical row-level count proof exists and current exact claim materially conflicts with the current official clause. Therefore:
- rollback HB-1868 exactly once;
- ARTICLE_VERIFIED 460 -> 459;
- master parent stays WITHHELD until corrected/split;
- exact current child is `board elects chair at first meeting for that education and teaching year`;
- historical signed/completed instances remain immutable;
- future/pending board-chair duration becomes one education-and-teaching year after prospective impact review.

## Phase 1 guards
- BOARD_CHAIR_TERM_IS_ONE_EDUCATION_YEAR_NOT_TWO
- TWO_YEAR_ZUMRE_TERM_MUST_NOT_LEAK_FROM_ART12_OR_ART14_TO_ART13
- HB1868_ROLLBACK_ONCE
- CURRENT_ART13_1_OVERRIDES_LEGACY_TWO_YEAR_MASTER_TEXT
- BOARD_CHAIR_SELECTION_HIERARCHY_IS_2024_VERSIONED
- BOARD_CHAIR_MEBBIS_ENTRY_REQUIRED
- BOARD_CHAIR_CHANGE_DURING_YEAR_REQUIRES_COMPULSORY_REASON
- HB1869_CITATION_REPAIR_TO_ART13_2_WITHOUT_COUNT_DELTA
- HB1871_PARAGRAPH_NORMALIZATION_TO_ART13_5_WITHOUT_COUNT_DELTA
- FIVE_DAY_NOTICE_HAS_COMPULSORY_SITUATION_EXCEPTION
- BOARD_MEETINGS_OUTSIDE_LESSON_HOURS
- BOARD_DECISIONS_RETURN_TO_CLASS_AREA_ZUMRE
- VOTE_AND_PRINCIPAL_APPROVAL_ARE_DISTINCT_STATES
- MINUTES_INCLUDE_ABSENT_BOARD_MEMBERS
- HISTORICAL_SIGNED_INSTANCES_IMMUTABLE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_ANY_FURTHER_COUNT_CHANGE

## Next
V96 Phase 2: deepen Art13 agenda/vocational/campus/current-2025 monitoring additions, exact child lifecycle, count reconciliation and close at >=300 support atoms.