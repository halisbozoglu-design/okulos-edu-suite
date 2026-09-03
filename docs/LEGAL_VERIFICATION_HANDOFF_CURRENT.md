# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V93 CLOSED / V94 NEXT
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kanonik politika
ARTICLE_VERIFIED yalnız exact master claim + güncel/uygulanabilir resmî otorite + exact article/paragraph/directive clause + actor/action/scope + row-ledger/dedupe ile değişir. Current authority chain stale handbook/checklist üstündedir. Broad `ALL`, `YESIL`, `GUNCEL` metadata legal proof değildir. Rollback yalnız row-level material mismatch + historical count proof ile ve bir kez yapılır. Historical completed instances immutable; legal changes prospective.

## Güncel kesin durum
- Master workflow: **2,229**
- ARTICLE_VERIFIED: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Closed support-atom pool: **24,905**
- Last closed batch: **V93**
- Next batch: **V94**
- Migration: **0**
- Lovable: **0**

## Carry-forward locks
- V86: HB-1771/1772/1773 wrong `ALL + OÖİKY Md5/A` mappings rolled back once; MTAL 2026-2027 grade/cohort resolver versioned.
- V87: SSDP, CB2646 official correspondence, 3071, 4982, CB5529, conditional certified-copy guards.
- V88: teacher-practice family; Md28 current family locked, detailed directive exact queue open.
- V89: teacher monitoring minimum once per school year; development plan = report receipt -> one month -> relevant MEM.
- V90: chiefship existence precedes assignment; 2025 shared-workshop exception hard override; Md85 role matrices separate.
- V91: school-health protocol/guide versioned; health data separated; Covid task requires current public-health trigger.
- V92: OÖKY Md19 general school-family-environment cooperation; parent-meeting exact frequency withheld; vocational sector/workplace rules not ALL.

## V93 CLOSED — 3.1 ÖĞRETMENLER KURULU
Canonical files:
- `docs/legal-article-verified-focused-deepening-batch-v93-phase1.md` — 160 atoms
- `docs/legal-article-verified-focused-deepening-batch-v93-phase2.md` — 140 atoms
- `docs/legal-article-verified-batch-v93.md`
- `docs/legal-verification-progress-v93-delta.json`

Accounting: **300 support atoms**, promotions **0**, rollbacks **0**, ARTICLE_VERIFIED **460**, closed pool **24,605 -> 24,905**.

### Critical master integrity correction
`3.1 Öğretmenler Kurulu` is NOT a contiguous workflow-id range. Canonical identity resolves by `kaynak_madde_kodu + board_type`:
- HB-1838 = 3.1.1 composition
- HB-1839 = 3.1.2 conditional invitees
- HB-1840 = 3.1.3 meeting calendar
- HB-1841 = 3.1.4 date/place/agenda >=5-day notice
- HB-1843 = 3.1.5 outside lesson hours
- HB-1845 = 3.1.6 decisions after principal approval
- HB-1847 = 3.1.7 minutes signature/retention

Interleaved records HB-1842, HB-1844 and HB-1846 are **3.2 Sınıf/Şube Öğretmenler Kurulu**, not 3.1. Numeric adjacency can never determine board identity.

### Current authority lock
Current official authority: **Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi**, 12.02.2025 / E-83203306-010.04-126419167 current chain, official PDF:
`https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`
The official MEB listing marks the 25.08.2017 predecessor as repealed by the 12.02.2025 directive.

### Current Art.9 locks
1. HB-1838 -> Art9/1 direct composition match.
2. HB-1839 -> Art9/2 strong/direct: invitees are agenda + institution-characteristic conditional; acting principal chairs if principal absent.
3. HB-1840 -> Art9/4 direct ordinary calendar: before school year + second-term start + year end; current exact children also include principal-need and/or written absolute-majority request additional meetings.
4. HB-1841 -> Art9/3 direct >=5-day date/place/agenda notice except extraordinary situations; written + where needed e-mail/other communication; teachers-room agenda-copy posting is a separate exact child.
5. HB-1843 -> Art9/5 master is partial if absolute: default outside lesson hours, but necessity + principal proposal + il/ilçe MEM approval permits lesson-hours meeting and students are deemed on leave.
6. HB-1845 -> Art9/6 direct principal approval before implementation; majority vote and chair-side tie rule remain separate exact children.
7. HB-1847 -> Art9/6 direct relevant-personnel signatures including absentees + administration retention.
8. Signed historical minutes keep their original legal snapshot and are immutable evidence.
9. Targeted repository searches for HB-1838/HB-1845/HB-1847 did not recover direct historical ARTICLE_VERIFIED row-ledger proof; no inferred promotion/rollback.

### V93 guards
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

## Open exact-source recovery queue
- HB-1787..1794 current Teacher Practice Directive exact clauses.
- V90 direct OÖKY 84/85 rows live consolidated clause/version + dedupe.
- HB-1825 workload/report identity.
- V91 post-2025 school-health implementation guide transition; HB-1828 exact live clause/dedupe.
- HB-1832/HB-1833 strict row dedupe before later promotion.
- HB-1834 parent-meeting frequency exact-source recovery.
- V93 seven strong/direct Art9 rows remain count-pending only because row-ledger/dedupe gate is unresolved.

## V94 — 3.2 SINIF/ŞUBE ÖĞRETMENLER KURULU
Canonical IDs are again non-contiguous and must resolve by `3.2.x`:
- HB-1848 = 3.2.1 composition
- HB-1849 = 3.2.2 chair
- HB-1850 = 3.2.3 school-type-specific schedule
- HB-1842 = 3.2.4 >=5-day notice
- HB-1844 = 3.2.5 outside lesson hours
- HB-1851 = 3.2.6 conditional parent/trainer invitees
- HB-1846 = 3.2.7 principal approval
- HB-1852 = 3.2.8 minutes signature/retention
- HB-1853 starts `3.3.1 EĞİTİM KURUMU SINIF/ALAN ZÜMRELERİ`.

### V94 priority
1. Lock current 2025 directive Art.10 exact clauses and reconcile middle-school/IH-middle vs secondary schedules.
2. Preserve institution-level applicability; no blind ALL inheritance.
3. Resolve chair, conditional invitees, notice exceptions, lesson-hours exceptions, voting/approval/minutes semantics.
4. Continue enforcing source-clause identity rather than workflow numeric order.
5. Audit historical ARTICLE_VERIFIED ledger before count change.
6. Build >=300 support atoms.
7. Migration **0**, Lovable **0**.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** remains active tenant requirement; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` => immediately execute **V94 / 3.2 SINIF/ŞUBE ÖĞRETMENLER KURULU**. Work mode remains deferred until all legal verification is complete.