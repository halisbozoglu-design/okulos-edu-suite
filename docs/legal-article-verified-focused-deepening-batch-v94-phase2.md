# Legal ARTICLE_VERIFIED Focused Deepening — V94 Phase 2

Date: 2026-09-04
Status: COMPLETE / V94 READY TO CLOSE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before/after: 460
- Promotions: 0
- Rollbacks: 0
- Closed pool through V93: 24,905
- Phase 1: 160 atoms
- Phase 2: **140 atoms**
- V94 total on close: **300 atoms**
- Closed pool on close: **25,205**

## Deepening locks
1. Current authority is the 12.02.2025 MEB Education Boards/Zümre Directive chain; stale 2017 references cannot drive future tasks.
2. Art.7 supplies general education-board meeting semantics; Art.10 supplies class/branch-board-specific semantics. Specific Art10 prevails when the two differ.
3. HB-1848 must split `composition` from `institution applicability`; one broad sentence cannot encode all school-type creation/non-creation rules.
4. Current Art10/1 explicitly includes HEM/olgunlaşma studentless-division exception; current OÖİKY Md36 separately says middle/IH-middle boards are formed and preschool/primary are not under that regulation.
5. A school-type resolver is mandatory before generating a class/branch board.
6. HB-1850 calendar is not ALL: MID/IH-MID and secondary have different legal months.
7. HB-2142 is a duplicate/aggregate scheduling workflow for the same source family; it must be deduped against HB-1850 children without erasing source provenance.
8. Middle/IH-middle June meeting and secondary November/April meetings must not be cross-generated.
9. Needs-based meeting triggers are additional exact children omitted by HB-1850 parent.
10. Combined-vs-separate meeting is a legal configuration option based on need, not a user-created waiver.
11. Year-end evaluation child applies only where the applicable schedule includes a year-end meeting; do not infer a June ordinary meeting for secondary merely from the generic year-end-evaluation sentence.
12. HB-1842 uses five-day notice default with extraordinary exception inherited from Art7; e-mail/other tools are channels, not deadline waivers.
13. HB-1844 has a board-specific absolute outside-lesson-hours clause in Art10/6; Art9/5 Teacher Board MEM-approved lesson-hour exception must not leak into Art10.
14. Reusable rule atoms may be shared technically only if legal-organ/source binding is preserved.
15. HB-1851 invitees are conditional; `davet edilebilir` cannot become mandatory permanent membership.
16. Parent invitee access must use agenda/topic minimization; invitees should not automatically receive unrelated student information.
17. HB-1846 decision lifecycle: agenda -> discussion -> majority vote -> tie resolution if needed -> principal approval -> implementation.
18. Principal approval is not a substitute for board vote.
19. HB-1852 signed minutes are immutable evidence after finalization; later legal amendments affect future/pending templates prospectively.
20. Retention duration remains records/SSDP authority; Art10 establishes administrative retention, not a universal retention term.
21. Historical direct ARTICLE_VERIFIED searches for target rows returned no row-ledger proof; no inferred promotion/rollback.
22. Candidate/green/current metadata remains retrieval aid only.

## Hard guards
- ART10_SPECIFIC_RULE_PREVAILS_OVER_GENERIC_ART7_WHERE_DIFFERENT
- CLASS_BRANCH_BOARD_REQUIRES_INSTITUTION_APPLICABILITY_RESOLVER
- HB1850_AND_HB2142_REQUIRE_SCHEDULE_DEDUPE_WITH_PROVENANCE
- SECONDARY_BOARD_MUST_NOT_INHERIT_MIDDLE_JUNE_MEETING
- MIDDLE_BOARD_MUST_NOT_INHERIT_SECONDARY_NOVEMBER_APRIL_PAIR
- NEEDS_BASED_MEETING_IS_SEPARATE_CHILD
- COMBINED_MEETING_IS_NEED_BASED_LEGAL_OPTION
- YEAR_END_EVALUATION_DOES_NOT_CREATE_UNSTATED_SECONDARY_MEETING
- FIVE_DAY_NOTICE_CHANNEL_DOES_NOT_CHANGE_DEADLINE
- ART9_LESSON_HOUR_EXCEPTION_MUST_NOT_LEAK_TO_ART10
- OPTIONAL_INVITEE_CANNOT_BECOME_STANDING_MEMBER
- INVITEE_DATA_ACCESS_MUST_BE_AGENDA_MINIMIZED
- BOARD_VOTE_PRECEDES_PRINCIPAL_APPROVAL
- SIGNED_CLASS_BRANCH_MINUTES_ARE_IMMUTABLE_EVIDENCE
- SSDP_GOVERNS_RETENTION_DURATION_SEPARATELY
- DERIVATIVE_STATUS_IS_NOT_COUNT_EVIDENCE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Support atom accounting
A161-A195 authority/version/speciality (35); A196-A230 applicability/calendar/dedupe (35); A231-A265 notice/lesson/invitee/privacy (35); A266-A300 vote/approval/minutes/history (35). Total 140.
