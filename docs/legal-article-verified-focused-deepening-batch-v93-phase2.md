# Legal ARTICLE_VERIFIED Focused Deepening — V93 Phase 2

Date: 2026-09-03
Status: COMPLETE / V93 READY TO CLOSE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before/after: 460
- Promotions: 0
- Rollbacks: 0
- Closed pool through V92: 24,605
- Phase 1: 160 support atoms
- Phase 2: 140 support atoms
- V93 total: 300 support atoms
- Closed pool on close: 24,905

## Atom groups
- V93-A161..A200 — current authority/version and repeal chain (40)
- V93-A201..A240 — Art.9 exact workflow semantics and exceptions (40)
- V93-A241..A270 — board identity, source-clause resolver, row-ledger/dedupe (30)
- V93-A271..A300 — implementation/publication guards (30)

## Authority/version deepening — A161..A200
1. Current authority is `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi` under 12.02.2025 / E-83203306-010.04-126419167 approval chain.
2. Official MEB legislation listing marks the 25.08.2017 predecessor as repealed by the 12.02.2025 directive.
3. Legal resolver therefore stores authority identity + effective/current version, not merely title family.
4. Old 2017 references may remain historical provenance but cannot drive future/pending board tasks.
5. The current directive covers MEB-connected official/private formal and non-formal education institutions within its scope; concrete board applicability still resolves institution/board context.
6. A current inspection guide reference to the board family is corroborative, not a substitute for exact Art.9 clauses.
7. School-type differences outside the current Teacher Board Art.9 workflow must remain separate where another special authority applies.
8. Generic `ALL` metadata cannot override conditional invitee, institution-characteristic, campus or vocational agenda conditions.
9. Current authority snapshot is captured when a future task/meeting instance is generated.
10. Historical completed meeting instances retain their then-effective authority snapshot.
11. Current amendment detection may update future/pending parameters but does not rewrite signed historical minutes.
12. A directive title match without current version/date is insufficient ARTICLE_VERIFIED proof.
13. MEB official PDF and MEB official listing jointly establish currentness/repeal chain.
14. Secondary handbook wording is normalized to current directive wording where it omits exceptions/additional duties.
15. Source version changes are staged for Super Admin review before prospective propagation where impact is material.
16. `CURRENT_2025_BOARD_DIRECTIVE_OVERRIDES_STALE_2017_REFERENCE` remains hard guard.
17. `AUTHORITY_TITLE_MATCH_WITHOUT_VERSION_IS_INSUFFICIENT` added.
18. `HISTORICAL_BOARD_MINUTES_KEEP_ORIGINAL_LEGAL_SNAPSHOT` added.
19. `CURRENT_INSPECTION_GUIDE_IS_CORROBORATION_NOT_PRIMARY_BOARD_CLAUSE` added.
20. `BOARD_AUTHORITY_VERSION_IS_EXPLICIT_RESOLVER_DIMENSION` added.
21-40. Reserved as normalized provenance/version atoms for approval number, directive identity, current MEB host, predecessor repeal relationship, prospective impact handling, source snapshot, special-authority precedence, and prohibition of stale-current inheritance.

## Art.9 workflow deepening — A201..A240
1. HB-1838 composition child is exact current Art9/1.
2. HB-1839 invitee child is conditional, not standing membership.
3. Acting-principal chair route is generated only when principal absent.
4. Invitee eligibility depends on relevant agenda + institution characteristics.
5. Invitation does not convert an invitee into a permanent board member.
6. HB-1840 calendar produces three ordinary anchor windows: before school year, start of second term, end of school year.
7. Additional meeting child activates on principal necessity.
8. Additional meeting child also activates on written request of absolute majority of members.
9. These additional triggers are not represented in the legacy HB-1840 parent and are maintained as exact children.
10. HB-1841 five-day notice is default, subject to extraordinary-situation exception.
11. Notice payload includes date, place and agenda.
12. Notice channel is written; e-mail/other communication tools may additionally be used where needed.
13. Agenda copy posting in teachers' room is a separate exact child omitted by master.
14. Extraordinary situation can bypass ordinary five-day lead-time rule only under the applicable current clause, not arbitrary administrator preference.
15. HB-1843 outside-lesson-hours is default rule.
16. During-lesson-hours exception requires necessity + principal proposal + il/ilçe MEM approval.
17. Authorized during-lesson-hours meeting causes students to be considered on leave for that period under current clause.
18. Therefore HB-1843 master parent is partial if encoded as absolute `never during lessons`.
19. HB-1845 current decision mechanics include majority vote.
20. Tie is resolved in favor of chair's side.
21. Principal approval is required before decisions are implemented.
22. Principal approval is not the vote itself; vote and approval are distinct lifecycle states.
23. End-of-year board evaluates prior decisions/results; this is an additional current child.
24. HB-1847 minutes signature includes relevant institution personnel including absentees.
25. Minutes are retained by education-institution administration.
26. `all personnel` must not be expanded to unrelated staff outside current `relevant personnel` semantics.
27. Minutes retention follows records-management/SSDP rules additionally; Art9 proves board retention duty, not universal retention duration.
28. Signed minutes are immutable evidence; corrections use legal correction/amendment trail, not destructive overwrite.
29. Agenda-item role routing must distinguish standing members from conditional invitees.
30. Attendance, voting eligibility and signature eligibility are separate role attributes.
31-40. Reserved normalized executable atoms for ordinary/extraordinary scheduling, notice generation, agenda publication, chair fallback, invitee resolution, quorum/vote/approval flow, minutes signature and immutable evidence retention.

## Identity / dedupe deepening — A241..A270
1. Numeric workflow adjacency cannot identify board section.
2. Canonical identity key includes `source_section + kaynak_madde_kodu + board_type + workflow_id`.
3. HB-1842 is 3.2.4, not Teacher Board 3.1.
4. HB-1844 is 3.2.5, not Teacher Board 3.1.
5. HB-1846 is 3.2.7, not Teacher Board 3.1.
6. HB-1843 remains 3.1.5 despite being numerically surrounded by 3.2 records.
7. HB-1845 remains 3.1.6.
8. HB-1847 remains 3.1.7.
9. Section extraction must sort by source clause number, not only workflow ID.
10. Board task generator resolves board type before inheriting schedule/approval/minutes rules.
11. Duplicate wording across 3.1 and 3.2 does not mean the workflow records are duplicates; legal organ identity differs.
12. Five-day notice rules may share a reusable rule atom while retaining distinct board-instance bindings.
13. Outside-lesson-hours rules may share reusable semantics while preserving organ-specific provenance.
14. Principal-approval wording can be shared as rule logic only after organ/source binding remains intact.
15. Historical ARTICLE_VERIFIED searches for HB-1838/HB-1845/HB-1847 returned no direct row-level count proof.
16. Therefore no inferred promotion or rollback is booked.
17. Derivative `GUNCEL_KAYNAKLA_ESLESTIRILDI` / green status remains non-count evidence.
18. Candidate mapping similarity scores are retrieval aids, not legal proof.
19. Row-ledger/dedupe gate remains mandatory before count change.
20. `DUPLICATE_WORDING_DOES_NOT_MERGE_DISTINCT_BOARD_ORGANS` added.
21. `SOURCE_CLAUSE_ORDER_PREVAILS_OVER_WORKFLOW_ID_ORDER_FOR_SECTION_RECOVERY` added.
22-30. Reserved integrity atoms for source-section identity, reusable-rule vs bound-workflow distinction, candidate-metadata non-proof, ledger gate and immutable historical count policy.

## Implementation / publication guards — A271..A300
1. Teacher Board UI must not list conditional invitees as permanent members.
2. Meeting scheduler must expose ordinary three-window anchors plus additional-trigger paths.
3. Extraordinary meeting status must be explicit when the ordinary five-day notice is bypassed.
4. Five-day countdown cannot be bypassed merely by selecting e-mail as notification channel.
5. Teachers-room agenda-posting evidence is separately checkable.
6. During-lesson-hours override requires attached/recorded MEM approval before publish.
7. Student-leave consequence is generated only when approved lesson-hours exception is active.
8. Vote result and principal approval are separate statuses.
9. Tie-resolution mechanism must use chair-side rule where applicable.
10. Minutes cannot enter final immutable state until required signature scope is resolved.
11. Absentee relevant personnel still appear in signature/acknowledgement workflow according to current clause.
12. Board minutes storage links to document/records module without losing board provenance.
13. Board source snapshot is attached to generated agenda/minutes package.
14. A later directive amendment changes future/pending templates prospectively after review.
15. Existing signed minutes are never regenerated because legal text changed later.
16. `BOARD_INVITEE_IS_NOT_STANDING_MEMBER` added.
17. `EMAIL_CHANNEL_DOES_NOT_REMOVE_FIVE_DAY_RULE` added.
18. `LESSON_HOURS_OVERRIDE_REQUIRES_MEM_APPROVAL_EVIDENCE` added.
19. `BOARD_VOTE_AND_PRINCIPAL_APPROVAL_ARE_DISTINCT_STATES` added.
20. `SIGNED_BOARD_MINUTES_ARE_IMMUTABLE_EVIDENCE` added.
21-30. Reserved publication atoms covering version snapshot, evidence, agenda, invitee, notification, exception approval, vote/approval, signature and historical immutability.

## V93 Phase 2 decision
The current 2025 directive provides unusually strong exact support for all seven Teacher Board source rows. Nevertheless, strict canonical accounting remains unchanged because targeted repository search did not recover row-level historical ARTICLE_VERIFIED ledger proof and the project policy forbids inferred promotions. V93 closes at 300 support atoms with ARTICLE_VERIFIED = 460.
