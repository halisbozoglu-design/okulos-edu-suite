# Legal ARTICLE_VERIFIED Focused Deepening — V95 Phase 1

Date: 2026-09-04
Status: COMPLETE / V95 ACTIVE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before: 460
- Phase 1 support atoms: 160
- Closed pool through V94: 25,205

## Canonical 3.3 identity
Source-clause identity is authoritative. `3.3 Eğitim Kurumu Sınıf/Alan Zümreleri` is:
HB-1853=3.3.1, HB-1854=3.3.2, HB-1855=3.3.3, HB-1856=3.3.4, HB-1857=3.3.5, HB-1858=3.3.6, HB-1859=3.3.7, HB-1860=3.3.8, HB-1862=3.3.9, HB-1863=3.3.10, HB-1864=3.3.11, HB-1865=3.3.12, HB-1866=3.3.13, HB-1867=3.3.14.
HB-1861 is 3.4.6 and is explicitly excluded.

## Current authority
Primary official authority: `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 consolidated chain, Art.11-12 + EK-2.
Official PDF: https://mevzuat.meb.gov.tr/dosyalar/2260.pdf

## Exact locks
1. Art12/1: education-institution class/area zümre consists of teachers teaching same class or same area, with primary-school special composition.
2. HB-1853 is direct/strong but school-stage child semantics must preserve primary-school special composition.
3. HB-1854 direct: if only one teacher in area, meeting is with principal or designated deputy principal.
4. HB-1855 current parent remains materially valid on two-year term: chair is selected at June meeting, effective from September for two years.
5. 02.01.2024 amendment adds exact selection resolver: willing candidates first; if none, doctorate, head teacher, master's, expert teacher, previous zümre chair, senior teacher priority sequence.
6. Selected zümre chair is entered in MEBBİS.
7. A substitute chair is also determined; forced mid-year replacement promotes the substitute and a new substitute is selected.
8. MTAL/other vocational-technical institutions have a special role rule: area/department chief is area zümre chair while continuing in chief duty.
9. HB-1856 current Art12/4 direct: before school year, start of second term, year end + interim meeting by principal/zümre-chair call or written request of absolute majority.
10. Historical ARTICLE_VERIFIED ledger already contains HB-1856 and the current live clause still supports it; no rollback.
11. HB-1857 direct current secondary-only calendar: November and April, school administration plans date, one business day.
12. HB-1858 current Art12/5 direct: meetings outside lesson hours. Historical ARTICLE_VERIFIED ledger already contains HB-1858 and remains valid; no rollback.
13. HB-1859 Art12/6: except compulsory/extraordinary conditions, date/place/agenda at least five days before, written, and where needed email/IT tools.
14. HB-1860 Art12/7 direct: decisions implemented after principal approval; vote-majority and chair-side tie are separate children.
15. HB-1862 Art12/7 direct: minutes signed by all relevant zümre members including absentees and retained by administration.
16. HB-1863 must bind agenda to current Art12/7-8 clause family, not generic school issues only.
17. HB-1864 year-end decision/result evaluation is direct Art12/4.
18. HB-1865 current Art12/1 vocational conditional invitees: expert, master trainer, trainer personnel, technicians participate with suitable areas when needed.
19. HB-1866 exact vocational special chair rule under Art12/1.
20. HB-1867 current EK-2 exact MTAL condition: area zümre teachers meet one business day in last week of May to determine students for internship/workplace vocational training.

## Guards
- ZUMRE_IDENTITY_REQUIRES_SOURCE_CLAUSE
- HB1861_IS_3_4_NOT_3_3
- ZUMRE_CHAIR_TERM_IS_TWO_YEARS_FROM_SEPTEMBER
- ZUMRE_CHAIR_SELECTION_HIERARCHY_IS_2024_VERSIONED
- ZUMRE_CHAIR_MEBBIS_ENTRY_REQUIRED
- VOCATIONAL_AREA_CHIEF_OVERRIDES_GENERIC_CHAIR_SELECTION_WHILE_ROLE_ACTIVE
- INTERIM_ZUMRE_MEETING_REQUIRES_CURRENT_TRIGGER
- SECONDARY_NOVEMBER_APRIL_IS_SCHOOL_TYPE_SPECIFIC
- ZUMRE_MEETINGS_OUTSIDE_LESSON_HOURS
- FIVE_DAY_NOTICE_HAS_FORCED_SITUATION_EXCEPTION
- PRINCIPAL_APPROVAL_FOLLOWS_VOTE
- ZUMRE_MINUTES_INCLUDE_ABSENT_RELEVANT_MEMBERS
- MTAL_MAY_INTERNSHIP_MEETING_IS_FEATURE_AND_SCHOOL_TYPE_CONDITIONAL
- HISTORICAL_VERIFIED_ROWS_ARE_RETESTED_NOT_BLINDLY_ROLLED_BACK
