# Legal ARTICLE_VERIFIED Batch V95

Date: 2026-09-04
Status: CLOSED
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V95: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after V95: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Phase 1: 160 atoms
- Phase 2: 140 atoms
- V95 total: **300 support atoms**
- Closed pool: **25,205 -> 25,505**

## Canonical 3.3 set
HB-1853, HB-1854, HB-1855, HB-1856, HB-1857, HB-1858, HB-1859, HB-1860, HB-1862, HB-1863, HB-1864, HB-1865, HB-1866, HB-1867.
HB-1861 is explicitly excluded because it is 3.4.6.

## Current authority
Current official `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 consolidated chain, Art.11-12 + EK-2.
Official PDF: https://mevzuat.meb.gov.tr/dosyalar/2260.pdf

## Canonical result
1. HB-1855 `2 years` is current, not stale: June selection, effective September, two-year term.
2. 02.01.2024 amendment adds mandatory chair-selection resolver and MEBBİS entry.
3. Selection priority when no willing candidate: doctorate -> head teacher -> master's -> expert teacher -> previous chair -> senior teacher.
4. HB-1856 and HB-1858 were already ARTICLE_VERIFIED in historical row ledger and remain exact under current Art12/4 and Art12/5; no rollback.
5. HB-1857 secondary November/April one-business-day schedule is exact and school-type specific.
6. HB-1859 five-day notice is exact subject to compulsory-situation exception.
7. HB-1860 vote/principal-approval implementation lifecycle and HB-1862 minutes/signature/retention are exact current clause families.
8. HB-1865 and HB-1866 are vocational-specific conditional role rules.
9. HB-1867 is exact EK-2 MTAL May-last-week one-business-day internship/workplace-training student determination; it is not an ALL-school zümre event.
10. 2025 agenda additions are authority-versioned and must update prospectively.
11. No new promotion booked without explicit count/dedupe ledger proof.

## Core guards
- ZUMRE_IDENTITY_REQUIRES_SOURCE_CLAUSE
- HB1861_IS_3_4_NOT_3_3
- CURRENT_TWO_YEAR_ZUMRE_CHAIR_TERM_CONFIRMED
- JUNE_SELECTION_SEPTEMBER_EFFECTIVE_DATE_REQUIRED
- ZUMRE_CHAIR_SELECTION_HIERARCHY_IS_2024_VERSIONED
- MEBBIS_CHAIR_ENTRY_IS_EXACT_CHILD
- SUBSTITUTE_CHAIR_REPLACEMENT_ROUTE_REQUIRED
- AREA_CHIEF_ZUMRE_CHAIR_IS_ROLE_BOUND
- SECONDARY_NOVEMBER_APRIL_IS_SCHOOL_TYPE_SPECIFIC
- ZUMRE_MEETINGS_OUTSIDE_LESSON_HOURS
- FIVE_DAY_NOTICE_HAS_FORCED_SITUATION_EXCEPTION
- PRINCIPAL_APPROVAL_FOLLOWS_VOTE
- ZUMRE_MINUTES_INCLUDE_ABSENT_RELEVANT_MEMBERS
- MTAL_MAY_INTERNSHIP_MEETING_IS_FEATURE_AND_SCHOOL_TYPE_CONDITIONAL
- HISTORICAL_VERIFIED_ROWS_ARE_RETESTED_NOT_BLINDLY_ROLLED_BACK
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_NEW_PROMOTION

## Canonical files
- `docs/legal-article-verified-focused-deepening-batch-v95-phase1.md`
- `docs/legal-article-verified-focused-deepening-batch-v95-phase2.md`
- `docs/legal-article-verified-batch-v95.md`
- `docs/legal-verification-progress-v95-delta.json`

## Next
V96 = `3.4 EĞİTİM KURUMU SINIF/ALAN ZÜMRE BAŞKANLAR KURULU`, source-clause identity required because HB-1861 is interleaved before HB-1868+.
