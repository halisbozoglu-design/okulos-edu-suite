# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-04
Durum: AKTİF — V95 CLOSED / V96 NEXT
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
- Closed support-atom pool: **25,505**
- Last closed batch: **V95**
- Next batch: **V96**
- Migration: **0**
- Lovable: **0**

## Carry-forward locks
- V86: HB-1771/1772/1773 wrong ALL mappings rolled back once; MTAL grade/cohort resolver versioned.
- V87: SSDP, CB2646, 3071, 4982, CB5529, conditional certified-copy guards.
- V88: Teacher Practice Md28 family; detailed directive queue open.
- V89: teacher monitoring once per school year; development plan report receipt -> one month -> relevant MEM.
- V90: chiefship existence precedes assignment; 2025 shared-workshop exception; Md85 role matrices separate.
- V91: school-health protocol/guide versioned; health data separated; pandemic tasks trigger-based.
- V92: OÖKY Md19 general school-family-environment cooperation; vocational sector/workplace rules not ALL.
- V93: Teacher Board source-clause identity; current Art9 locks.
- V94: Class/Branch Teacher Board source-clause identity; current Art10 locks; Art9 lesson-hour exception does not leak.

## V95 CLOSED — 3.3 EĞİTİM KURUMU SINIF/ALAN ZÜMRELERİ
Canonical:
- `docs/legal-article-verified-focused-deepening-batch-v95-phase1.md` — 160 atoms
- `docs/legal-article-verified-focused-deepening-batch-v95-phase2.md` — 140 atoms
- `docs/legal-article-verified-batch-v95.md`
- `docs/legal-verification-progress-v95-delta.json`

Accounting: **300 atoms**; promotions **0**; rollbacks **0**; ARTICLE_VERIFIED **460**; pool **25,205 -> 25,505**.

### Canonical 3.3 identity
The source section is non-contiguous in workflow IDs:
- HB-1853 = 3.3.1
- HB-1854 = 3.3.2
- HB-1855 = 3.3.3
- HB-1856 = 3.3.4
- HB-1857 = 3.3.5
- HB-1858 = 3.3.6
- HB-1859 = 3.3.7
- HB-1860 = 3.3.8
- HB-1862 = 3.3.9
- HB-1863 = 3.3.10
- HB-1864 = 3.3.11
- HB-1865 = 3.3.12
- HB-1866 = 3.3.13
- HB-1867 = 3.3.14
- HB-1861 is **3.4.6** and is excluded from 3.3.

### Current authority lock
Current official `Millî Eğitim Bakanlığı Eğitim Kurulları ve Zümreleri Yönergesi`, current 12.02.2025 consolidated chain, Art.11-12 + EK-2; official PDF `https://mevzuat.meb.gov.tr/dosyalar/2260.pdf`.

### V95 exact locks
1. HB-1853 composition is Art12/1 direct/strong, with primary-school special composition preserved.
2. HB-1854 single-teacher area meeting with principal/designated deputy is exact Art12/1.
3. HB-1855 `2 years` is **current, not stale**: chair selected in June, effective from September for two years.
4. 02.01.2024 amendment adds chair selection hierarchy: willing candidates first; otherwise doctorate -> head teacher -> master's -> expert teacher -> previous chair -> senior teacher.
5. Selected chair is entered in **MEBBİS**; substitute chair and forced mid-year replacement route are explicit children.
6. HB-1856 and HB-1858 were already historical ARTICLE_VERIFIED and were live-current retested. Both remain exact under Art12/4 and Art12/5; **no rollback**.
7. HB-1857 secondary schools: November and April, administration-planned date, one business day.
8. HB-1859 date/place/agenda >=5 days before, except compulsory situations; email/IT is additional channel, not deadline waiver.
9. HB-1860 decisions after majority vote/tie rule and principal approval; lifecycle states stay separate.
10. HB-1862 relevant members including absentees sign minutes; administration retains; SSDP controls retention duration.
11. HB-1864 year-end decision/result evaluation is exact Art12/4.
12. HB-1865 vocational institutions may include expert/master trainer/trainer/technician actors only when needed and relevant to area.
13. HB-1866 vocational area/department chief is area zümre chair while chief duty continues; role-bound special rule.
14. HB-1867 EK-2 exact MTAL rule: area zümre teachers meet one business day in last week of May to determine students for internship/workplace vocational training. This is MTAL/feature conditional, not ALL.
15. Current Art12/8 agenda catalog includes 2024/2025 additions; agenda semantics are authority-versioned and propagated prospectively.

### V95 guards
- ZUMRE_IDENTITY_REQUIRES_SOURCE_CLAUSE
- HB1861_IS_3_4_NOT_3_3
- CURRENT_TWO_YEAR_ZUMRE_CHAIR_TERM_CONFIRMED
- JUNE_SELECTION_SEPTEMBER_EFFECTIVE_DATE_REQUIRED
- ZUMRE_CHAIR_SELECTION_HIERARCHY_IS_2024_VERSIONED
- MEBBIS_CHAIR_ENTRY_IS_EXACT_CHILD
- SUBSTITUTE_CHAIR_REPLACEMENT_ROUTE_REQUIRED
- PRIMARY_SCHOOL_ZUMRE_COMPOSITION_IS_SPECIAL
- AREA_CHIEF_ZUMRE_CHAIR_IS_ROLE_BOUND
- SECONDARY_NOVEMBER_APRIL_IS_SCHOOL_TYPE_SPECIFIC
- ZUMRE_MEETINGS_OUTSIDE_LESSON_HOURS
- FIVE_DAY_NOTICE_HAS_FORCED_SITUATION_EXCEPTION
- PRINCIPAL_APPROVAL_FOLLOWS_VOTE
- ZUMRE_MINUTES_INCLUDE_ABSENT_RELEVANT_MEMBERS
- MTAL_MAY_INTERNSHIP_MEETING_IS_FEATURE_AND_SCHOOL_TYPE_CONDITIONAL
- HISTORICAL_VERIFIED_ROWS_ARE_RETESTED_NOT_BLINDLY_ROLLED_BACK
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_NEW_PROMOTION

## Open exact-source recovery queue
- HB-1787..1794 Teacher Practice Directive exact clauses.
- V90 OÖKY 84/85 row dedupe.
- HB-1825 workload/report identity.
- V91 post-2025 school-health guide transition; HB-1828 exact dedupe.
- HB-1832/HB-1833 row dedupe.
- HB-1834 parent-meeting frequency exact-source recovery.
- V93/V94 strong rows count-pending due row-ledger/dedupe.
- V95 strong non-counted rows remain pending only where historical count/dedupe proof is absent.

## V96 — 3.4 EĞİTİM KURUMU SINIF/ALAN ZÜMRE BAŞKANLAR KURULU
Canonical source begins at HB-1868 but HB-1861=3.4.6 is interleaved earlier. Section identity must resolve by `3.4.x`, not numeric adjacency.

Known source rows:
- 3.4.1 formation + chair selection / legacy two-year wording.
- 3.4.2 ordinary + interim meetings.
- 3.4.3 >=5-day notice.
- 3.4.4 decisions re-evaluated in class/area zümre.
- 3.4.5 outside lesson hours.
- 3.4.6 HB-1861 principal approval.
- 3.4.7 minutes/signature/retention.
- 3.4.8 year-end evaluation.

### V96 priority
1. Recover every 3.4.x workflow ID exactly.
2. Lock current Art13 + EK-1/EK-2 as applicable.
3. Test master `chair serves 2 years` against current Art13/1 — current text appears to say chair chosen for **that education year**, so a material mismatch/possible rollback must be ledger-audited rather than assumed.
4. Lock 2024 selection hierarchy + MEBBİS entry if applicable to board chair.
5. Verify schedule as following class/area-zümre meeting workday + interim trigger.
6. Preserve re-evaluation-in-zümre child, outside-lesson-hours, vote/approval, minutes and year-end evaluation.
7. Audit historical ARTICLE_VERIFIED HB-1868 before any rollback; Batch01 shows it was previously ARTICLE_VERIFIED, so this is a high-priority row-level integrity test.
8. Build >=300 atoms; Migration 0 / Lovable 0.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** remains active tenant requirement; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` => immediately execute **V96 / 3.4 EĞİTİM KURUMU SINIF/ALAN ZÜMRE BAŞKANLAR KURULU**. Work mode remains deferred until all legal verification is complete.
