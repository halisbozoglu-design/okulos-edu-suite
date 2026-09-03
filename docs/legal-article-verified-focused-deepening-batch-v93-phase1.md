# Legal ARTICLE_VERIFIED Focused Deepening — V93 Phase 1

Date: 2026-09-03
Status: COMPLETE / V93 ACTIVE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after: 460 / 2,229 = 20.6371%
- Remaining exact: 1,769
- Closed pool through V92: 24,605
- V93 Phase 1 support atoms: 160
- Closed pool remains 24,605 until V93 closes.

## Master integrity correction
Section `3.1 ÖĞRETMENLER KURULU` is NOT represented by one contiguous workflow-id interval. The canonical section members are resolved by `kaynak_madde_kodu=3.1.x`:
- HB-1838 = 3.1.1 composition
- HB-1839 = 3.1.2 conditional invitees
- HB-1840 = 3.1.3 meeting calendar
- HB-1841 = 3.1.4 date/place/agenda notice >=5 days
- HB-1843 = 3.1.5 meetings outside lesson hours
- HB-1845 = 3.1.6 principal approval before implementation
- HB-1847 = 3.1.7 minutes signed by relevant personnel incl. absentees + retained by administration

Interleaved IDs HB-1842, HB-1844 and HB-1846 belong to `3.2 SINIF/ŞUBE ÖĞRETMENLER KURULU` and MUST NOT inherit 3.1 identity merely due numeric adjacency.

Guard: `BOARD_SECTION_IDENTITY_REQUIRES_SOURCE_CLAUSE_NOT_NUMERIC_CONTIGUITY`.

## Current official authority lock
Current official source: `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current MEB Mevzuat PDF under 12.02.2025 amendment/approval chain, official source `https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`.

### Exact Art.9 mappings
- HB-1838 -> Md9/1 DIRECT TEXT MATCH.
- HB-1839 -> Md9/2 DIRECT/STRONG MATCH; invitees are conditional by agenda + institution characteristics. Principal absence route is additionally normalized to acting principal as chair.
- HB-1840 -> Md9/4 DIRECT TEXT MATCH. Additional meetings also exist when principal deems necessary and/or upon written request of absolute majority.
- HB-1841 -> Md9/3 DIRECT TEXT MATCH: except extraordinary situations, date/place/agenda at least 5 days before; written, and when necessary e-mail/other communication tools; agenda copy is also posted in teachers' room.
- HB-1843 -> Md9/5 PARTIAL MASTER MATCH because current rule contains an explicit exception: if necessary, on principal proposal + il/ilçe MEM approval, meeting may occur during lesson hours; students are deemed on leave.
- HB-1845 -> Md9/6 DIRECT TEXT MATCH: decisions by majority; tie follows chair's side; decisions implemented after principal approval.
- HB-1847 -> Md9/6 DIRECT TEXT MATCH: minutes signed by relevant institution personnel including absentees and retained by education institution administration.

## Current-rule additions omitted by master parents
1. HB-1839 omits acting-principal chair route.
2. HB-1840 omits additional meeting triggers (principal need and/or written absolute-majority request).
3. HB-1841 omits teachers-room agenda-posting rule and extraordinary-situation exception.
4. HB-1843 omits the authorized lesson-hours exception and student-leave consequence.
5. HB-1845 omits voting/tie mechanics in the same current paragraph.
6. HB-1847 is strong exact for signature/retention but source semantics use `ilgili tüm personel`, not arbitrary all staff outside relevance.

## 2025 amendment/currentness lock
MEB Mevzuat listing marks the older 25.08.2017 directive as repealed by the directive brought into force with 12.02.2025 / E-83203306-010.04-126419167 approval. The official 12.02.2025 PDF is therefore the current authority artifact for V93; stale 2017-only references are not sufficient current proof.

## Phase 1 guards
- BOARD_SECTION_IDENTITY_REQUIRES_SOURCE_CLAUSE_NOT_NUMERIC_CONTIGUITY
- CURRENT_2025_BOARD_DIRECTIVE_OVERRIDES_STALE_2017_REFERENCE
- TEACHERS_BOARD_INVITEES_ARE_AGENDA_AND_INSTITUTION_CONDITIONAL
- ACTING_PRINCIPAL_CHAIR_ROUTE_REQUIRED_WHEN_PRINCIPAL_ABSENT
- FIVE_DAY_NOTICE_HAS_EXTRAORDINARY_EXCEPTION
- TEACHERS_ROOM_AGENDA_COPY_IS_SEPARATE_DUTY
- OUTSIDE_LESSON_HOURS_HAS_AUTHORIZED_EXCEPTION
- LESSON_HOURS_EXCEPTION_REQUIRES_PRINCIPAL_PROPOSAL_AND_MEM_APPROVAL
- LESSON_HOURS_EXCEPTION_MAKES_STUDENTS_LEAVE
- PRINCIPAL_APPROVAL_PRECEDES_IMPLEMENTATION
- MINUTES_SIGNATURE_SCOPE_IS_RELEVANT_PERSONNEL_INCLUDING_ABSENTEES
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Phase 1 decision
All seven 3.1 source rows have strong/current exact support in Art.9, but ARTICLE_VERIFIED count remains unchanged until row-level historical ledger/dedupe integrity is proven. No semantic promotion and no inferred rollback.
