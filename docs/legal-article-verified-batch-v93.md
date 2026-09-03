# Legal ARTICLE_VERIFIED Batch V93

Date: 2026-09-03
Status: CLOSED
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V93: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after V93: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Phase 1: 160 support atoms
- Phase 2: 140 support atoms
- V93 total: **300 support atoms**
- Closed pool: **24,605 -> 24,905**

## Canonical 3.1 set — non-contiguous IDs
Teacher Board identity is determined by `kaynak_madde_kodu=3.1.x`, not numeric workflow adjacency:
- HB-1838 = 3.1.1
- HB-1839 = 3.1.2
- HB-1840 = 3.1.3
- HB-1841 = 3.1.4
- HB-1843 = 3.1.5
- HB-1845 = 3.1.6
- HB-1847 = 3.1.7

Explicitly excluded interleaved 3.2 records:
- HB-1842 = 3.2.4
- HB-1844 = 3.2.5
- HB-1846 = 3.2.7

## Current authority
Current official authority is the `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 approval/amendment chain, official MEB PDF:
`https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`

The older 25.08.2017 directive is marked repealed by the 12.02.2025 directive in MEB's official legislation listing.

## Art.9 exact locks
1. HB-1838 composition -> Art9/1 direct.
2. HB-1839 conditional invitees -> Art9/2 direct/strong; invitees depend on agenda + institution characteristics; acting-principal chair route also preserved.
3. HB-1840 ordinary meeting calendar -> Art9/4 direct; additional principal-need / written absolute-majority triggers are exact children omitted by master.
4. HB-1841 date/place/agenda >=5-day notice -> Art9/3 direct; extraordinary exception and teachers-room agenda copy are additional exact children.
5. HB-1843 outside lesson hours -> Art9/5 partial parent because current rule permits authorized exception with principal proposal + il/ilçe MEM approval; students are deemed on leave.
6. HB-1845 principal approval before implementation -> Art9/6 direct; majority voting and chair-side tie resolution are separate exact children.
7. HB-1847 minutes signed incl. absent relevant personnel + retained by administration -> Art9/6 direct.

## Ledger/accounting decision
Targeted repository searches for HB-1838, HB-1845 and HB-1847 did not recover direct historical ARTICLE_VERIFIED row-ledger entries. Therefore:
- no inferred promotion;
- no inferred rollback;
- derivative green/current/candidate metadata remains non-count evidence.

## Core guards
- BOARD_SECTION_IDENTITY_REQUIRES_SOURCE_CLAUSE_NOT_NUMERIC_CONTIGUITY
- SOURCE_CLAUSE_ORDER_PREVAILS_OVER_WORKFLOW_ID_ORDER_FOR_SECTION_RECOVERY
- DUPLICATE_WORDING_DOES_NOT_MERGE_DISTINCT_BOARD_ORGANS
- CURRENT_2025_BOARD_DIRECTIVE_OVERRIDES_STALE_2017_REFERENCE
- BOARD_AUTHORITY_VERSION_IS_EXPLICIT_RESOLVER_DIMENSION
- TEACHERS_BOARD_INVITEES_ARE_AGENDA_AND_INSTITUTION_CONDITIONAL
- BOARD_INVITEE_IS_NOT_STANDING_MEMBER
- ACTING_PRINCIPAL_CHAIR_ROUTE_REQUIRED_WHEN_PRINCIPAL_ABSENT
- FIVE_DAY_NOTICE_HAS_EXTRAORDINARY_EXCEPTION
- EMAIL_CHANNEL_DOES_NOT_REMOVE_FIVE_DAY_RULE
- TEACHERS_ROOM_AGENDA_COPY_IS_SEPARATE_DUTY
- OUTSIDE_LESSON_HOURS_HAS_AUTHORIZED_EXCEPTION
- LESSON_HOURS_EXCEPTION_REQUIRES_PRINCIPAL_PROPOSAL_AND_MEM_APPROVAL
- LESSON_HOURS_OVERRIDE_REQUIRES_MEM_APPROVAL_EVIDENCE
- LESSON_HOURS_EXCEPTION_MAKES_STUDENTS_LEAVE
- BOARD_VOTE_AND_PRINCIPAL_APPROVAL_ARE_DISTINCT_STATES
- PRINCIPAL_APPROVAL_PRECEDES_IMPLEMENTATION
- MINUTES_SIGNATURE_SCOPE_IS_RELEVANT_PERSONNEL_INCLUDING_ABSENTEES
- SIGNED_BOARD_MINUTES_ARE_IMMUTABLE_EVIDENCE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Canonical files
- `docs/legal-article-verified-focused-deepening-batch-v93-phase1.md`
- `docs/legal-article-verified-focused-deepening-batch-v93-phase2.md`
- `docs/legal-article-verified-batch-v93.md`
- `docs/legal-verification-progress-v93-delta.json`

## Next
V94 = `3.2 SINIF/ŞUBE ÖĞRETMENLER KURULU`. Its canonical IDs are also non-contiguous and must resolve by `3.2.x`, not numeric range.
