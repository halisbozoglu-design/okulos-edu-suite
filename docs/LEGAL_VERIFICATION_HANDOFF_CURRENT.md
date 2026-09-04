# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-04
Durum: AKTİF — V94 CLOSED / V95 NEXT
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
- Closed support-atom pool: **25,205**
- Last closed batch: **V94**
- Next batch: **V95**
- Migration: **0**
- Lovable: **0**

## Carry-forward locks
- V86: HB-1771/1772/1773 wrong `ALL + OÖİKY Md5/A` mappings rolled back once; MTAL grade/cohort resolver versioned.
- V87: SSDP, CB2646, 3071, 4982, CB5529, conditional certified-copy guards.
- V88: Teacher Practice Md28 family; detailed directive queue open.
- V89: teacher monitoring minimum once per school year; development plan = report receipt -> one month -> relevant MEM.
- V90: chiefship existence precedes assignment; 2025 shared-workshop exception; Md85 role matrices separate.
- V91: school-health protocol/guide versioned; health data separated; pandemic tasks trigger-based.
- V92: OÖKY Md19 general school-family-environment cooperation; vocational sector/workplace rules not ALL.
- V93: Teacher Board = non-contiguous source-clause identity; current 2025 Art9; notice/invitee/lesson-hours/vote/minutes guards locked.

## V94 CLOSED — 3.2 SINIF/ŞUBE ÖĞRETMENLER KURULU
Canonical:
- `docs/legal-article-verified-focused-deepening-batch-v94-phase1.md` — 160 atoms
- `docs/legal-article-verified-focused-deepening-batch-v94-phase2.md` — 140 atoms
- `docs/legal-article-verified-batch-v94.md`
- `docs/legal-verification-progress-v94-delta.json`

Accounting: **300 atoms**; promotions **0**; rollbacks **0**; ARTICLE_VERIFIED **460**; pool **24,905 -> 25,205**.

### Canonical 3.2 identity
- HB-1848 = 3.2.1 composition/applicability
- HB-1849 = 3.2.2 chair
- HB-1850 = 3.2.3 schedule
- HB-1842 = 3.2.4 notice
- HB-1844 = 3.2.5 outside lesson hours
- HB-1851 = 3.2.6 optional invitees
- HB-1846 = 3.2.7 decision/principal approval
- HB-1852 = 3.2.8 minutes/signature/retention
HB-1853 starts 3.3.

### Current authority lock
Current `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, 12.02.2025 chain, official PDF `https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`, Art.10 + Art.7/EK-1.

### V94 exact locks
1. Art10/1 current composition = same-class-level teachers / same-branch teachers + guidance teachers.
2. HB-1848 parenthetical `preschool/primary not formed` cannot be treated as universal Art10/1 text; current Art10/1 explicitly has HEM/olgunlaşma studentless-division exception while current OÖİKY Md36 separately governs middle/IH-middle/preschool/primary scope. Applicability must be school-type resolved.
3. HB-1849 chair = principal or designated deputy principal.
4. HB-1850 calendar exact split: middle/IH-middle October-February-June; secondary November-April.
5. Art10/2 also has needs-based meeting triggers (principal/relevant deputy/guidance/class-branch guidance request + principal approval), separate/combined meetings by need, and year-end prior-decision/result evaluation.
6. HB-2142 overlaps the same schedule family and must be child-deduped against HB-1850 without losing provenance.
7. HB-1842 five-day notice retains Art7 extraordinary exception. Communication channel is not a deadline waiver.
8. HB-1844 outside-lesson-hours is Art10/6 board-specific. Teacher Board Art9/5 MEM-approved lesson-hours exception MUST NOT auto-inherit into this board.
9. HB-1851 parent/trainer invitees are optional/topic-conditional, not standing members; data access is agenda-minimized.
10. HB-1846 = majority vote + chair-side tie + principal approval before implementation.
11. HB-1852 = relevant members including absentees sign; administration retains. SSDP controls retention duration separately.
12. Wrong derivative `SOSYAL_ETKINLIK` mapping around HB-1849 is prohibited from propagation.
13. Targeted repo searches recovered no direct historical ARTICLE_VERIFIED ledger proof for HB-1848/HB-1850; no inferred count change.

### V94 guards
- CLASS_BRANCH_BOARD_IDENTITY_REQUIRES_SOURCE_CLAUSE
- CLASS_BRANCH_BOARD_REQUIRES_INSTITUTION_APPLICABILITY_RESOLVER
- CLASS_BRANCH_BOARD_SCHEDULE_IS_SCHOOL_TYPE_SPECIFIC
- HB1848_PARENT_SCOPE_REQUIRES_SPECIAL_AUTHORITY_SPLIT
- HEM_STUDENTLESS_DIVISION_EXCEPTION_IS_CURRENT_ART10_1
- OOIY_MD36_SPECIAL_SCOPE_OVERRIDES_GENERIC_PARENT
- HB1850_AND_HB2142_REQUIRE_SCHEDULE_DEDUPE_WITH_PROVENANCE
- SECONDARY_BOARD_MUST_NOT_INHERIT_MIDDLE_JUNE_MEETING
- MIDDLE_BOARD_MUST_NOT_INHERIT_SECONDARY_NOVEMBER_APRIL_PAIR
- NEEDS_BASED_MEETING_IS_SEPARATE_CHILD
- CLASS_BRANCH_MEETINGS_MAY_BE_COMBINED_BY_NEED
- YEAR_END_EVALUATION_DOES_NOT_CREATE_UNSTATED_SECONDARY_MEETING
- FIVE_DAY_NOTICE_RETAINS_EXTRAORDINARY_EXCEPTION
- ART9_LESSON_HOUR_EXCEPTION_MUST_NOT_LEAK_TO_ART10
- CLASS_BRANCH_INVITEES_ARE_OPTIONAL_AND_TOPIC_CONDITIONAL
- OPTIONAL_INVITEE_CANNOT_BECOME_STANDING_MEMBER
- BOARD_VOTE_PRECEDES_PRINCIPAL_APPROVAL
- SIGNED_CLASS_BRANCH_MINUTES_ARE_IMMUTABLE_EVIDENCE
- WRONG_DERIVATIVE_SOCIAL_ACTIVITY_FAMILY_IS_NOT_EVIDENCE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Open exact-source recovery queue
- HB-1787..1794 Teacher Practice Directive exact clauses.
- V90 OÖKY 84/85 live consolidated row dedupe.
- HB-1825 workload/report identity.
- V91 post-2025 school-health guide transition; HB-1828 exact dedupe.
- HB-1832/HB-1833 row dedupe.
- HB-1834 parent-meeting frequency exact-source recovery.
- V93 Art9 strong rows count-pending due row-ledger/dedupe.
- V94 Art10 strong rows count-pending due row-ledger/dedupe.

## V95 — 3.3 EĞİTİM KURUMU SINIF/ALAN ZÜMRELERİ
Starts HB-1853. Current authority family is Art.11-12 + EK-2 of the same current directive.

Known master start:
- HB-1853 = 3.3.1 same-class/course teachers form class/area zümre.
- HB-1854 = 3.3.2 single-teacher area/class meeting with principal or designated deputy.
- HB-1855 = 3.3.3 zümre president selection + legacy `2-year` claim; MUST verify against current 2024 selection hierarchy and current term rule.
- HB-1856 = 3.3.4 school-year/second-term/year-end + needs-based interim meetings.
- HB-1857 = 3.3.5 secondary November/April one-business-day meetings.
- HB-1858 = 3.3.6 outside lesson hours (boundary continuation to recover).

### V95 priority
1. Recover full exact 3.3.x boundary and IDs.
2. Lock current Art11-12 + EK-2.
3. Verify 02.01.2024 zümre-president hierarchy: willing candidates first, then doctorate/head teacher/master's/expert teacher/previous chair/seniority sequence, and MEBBİS entry.
4. Test master `selected chair serves 2 years` against current text; do not preserve stale term if current directive differs.
5. Preserve primary-school, middle/IH-middle, secondary, MTAL/IHL, special-education and non-formal zümre scope distinctions.
6. Resolve additional secondary November/April schedule and MTAL May internship-selection meeting separately.
7. Audit five-day notice, lesson-hours, approval, minutes, year-end evaluation.
8. Historical ARTICLE_VERIFIED ledger audit before count change.
9. Build >=300 atoms; Migration 0 / Lovable 0.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** remains active tenant requirement; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` => immediately execute **V95 / 3.3 EĞİTİM KURUMU SINIF/ALAN ZÜMRELERİ**. Work mode remains deferred until all legal verification is complete.
