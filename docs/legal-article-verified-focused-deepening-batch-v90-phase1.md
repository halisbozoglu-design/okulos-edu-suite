# Legal ARTICLE_VERIFIED Focused Deepening — V90 Phase 1

Date: 2026-09-03
Status: COMPLETE / V90 ACTIVE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master workflow: 2,229
- ARTICLE_VERIFIED before: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after: 460 / 2,229 = 20.6371%
- Remaining exact: 1,769
- Closed support pool through V89: 23,705
- V90 Phase 1 active support atoms: 160
- Closed pool remains 23,705 until V90 closes.

## Exact boundary
Canonical File Library master confirms section `2.15 ALAN/DAL/LABORATUVAR ŞEFLERİNİN ÇALIŞMALARI` is exactly HB-1803..HB-1825 (23 rows). HB-1826 starts `2.16 OKUL SAĞLIĞI`.

## Phase 1 row locks
- HB-1803: every area/department has one area/department chiefship assigned.
- HB-1804: workshop/laboratory chiefship for multiple equipped workshops/laboratories.
- HB-1805: vacant chiefships are assigned.
- HB-1806: when several areas/branches share one workshop/lab because of physical/equipment insufficiency, only equipped area gets the workshop/lab chiefship.
- HB-1807: chief ensures maintenance, repair, protection, storage and readiness of buildings, equipment, machinery and movables.
- HB-1808: consumable expenditure is entered in e-Taşınır by the authorized person.
- HB-1809: chief coordinates advance preparation of tools/materials for student workshop/lab practice and keeps records.
- HB-1810: chief ensures OSH measures against accident, occupational disease, fire and other hazards, also considering students with special education needs.
- HB-1811: chief works to make workplace cleanliness a student habit.
- HB-1812: chief ensures practical performance of basic operations and guides students to verify correct understanding.
- HB-1813: chief maintains machine card/manual information and ensures warnings/use instructions are posted.
- HB-1814: area chief makes annual division of work among personnel and submits it to principal for approval; cooperation with other areas is included.
- HB-1815: area chief determines program-based tool/equipment needs for buildings/workshops/labs/classrooms and proposes procurement.
- HB-1816: area chief plans and runs revolving-fund goods/services production under applicable law.
- HB-1817: area chief chairs area/department teachers board and holds meetings with workshop/lab chiefs, teachers, experts, master instructors and technicians.
- HB-1818: area chief cooperates to obtain scientific/technological materials and enables use of area/department library.
- HB-1819: area chief cooperates externally, follows graduates' workplace success, proposes program development when needed.
- HB-1820: area chief exchanges information/technology with sector and encourages participation in fairs/exhibitions/seminars.
- HB-1821: workshop/lab chief ensures applied education is inquiry/research based and uses/enriches teaching tools.
- HB-1822: workshop/lab chief ensures practice/production/service develops program-prescribed knowledge, skills, attitudes and behaviors and proceeds toward objectives.
- HB-1823: in same-management different-program continuously used units, equipment responsibility is shared with unit technician when present/assigned under the applicable rule.
- HB-1824: shared use with other institutions follows protocol provisions.
- HB-1825: area/workshop chiefs submit month-end report to principal on planning-maintenance-repair work shown in weekly course distribution schedule.

## Current authority-family reconstruction
Current consolidated OÖKY family:
- Md84/84A/84B/84C: creation, eligibility, appointment, end/invalidity of chiefships.
- Md85/1: common chief duties.
- Md85/2: area/department chief duties.
- Md85/3: workshop/laboratory chief duties.
- Md85/4: shared-use protocol duty.
- Md85/5: other duties assigned by principal.

Current-text reconstruction from the latest consolidated source family shows Md85 directly contains, among others: maintenance/readiness; conditional movable-record authority; e-Taşınır consumables; cleanliness; basic practical operations/student guidance; machine cards/manuals/warnings; incident reporting; graduate tracking; shared equipment responsibility; protocol use; annual work division; equipment-needs proposal; revolving fund; zümre chairmanship; scientific/technological materials; graduate/employer cooperation; sector exchange; applied education quality; and monthly reporting.

## Critical 2025 chiefship change
Current chain includes RG 22.02.2025 / 32821 addition to the chiefship-creation regime: a school simultaneously using another school's workshop/laboratory belonging to the same area/branch does not appoint a chief for that workshop/lab; any such appointment is cancelled by the governorate. Therefore HB-1805 cannot be implemented as a blanket `fill every vacancy` rule.

## Phase 1 exactness decisions
1. HB-1803/HB-1804/HB-1806 are strong current-rule candidates but appointment/creation applicability must resolve current 84-family conditions before execution.
2. HB-1805 is OVERBROAD / WITHHELD: some apparent vacancies legally must remain without a chiefship.
3. HB-1807, HB-1811, HB-1812, HB-1813, HB-1815..HB-1824 align strongly with current Md85 text.
4. HB-1808 needs actor normalization: Md85 places the e-Taşınır duty in the chief duty family, while movable-record authority itself may depend on principal designation; `authorized person` must not erase the chief/authorization relationship.
5. HB-1810 combines OÖKY chief duty + general OSH/special-needs safeguards; exact child clauses should preserve both authority families.
6. HB-1814 is an area-chief-only duty, not a generic workshop/lab-chief duty.
7. HB-1816 is conditional on existence/operation of revolving fund.
8. HB-1817 is area-chief-only and should cross-link the zümre engine rather than duplicate it.
9. HB-1823 legacy wording is awkward; executable rule must follow current Md85 actor/condition wording instead of literal grammar.
10. HB-1825 strongly corresponds to current monthly-report duty in Md85/1-o, but the legacy phrase tying the report to `weekly course distribution schedule / planning maintenance repair` must be checked against the current extra-course/workload layer before parent promotion.

## Phase 1 guards
- CHIEFSHIP_CREATION_REQUIRES_CURRENT_84_FAMILY_CONDITIONS
- VACANT_CHIEFSHIP_IS_NOT_AUTOMATICALLY_FILLABLE
- SHARED_OTHER_SCHOOL_WORKSHOP_CAN_PROHIBIT_CHIEF_APPOINTMENT
- AREA_CHIEF_AND_WORKSHOP_LAB_CHIEF_DUTIES_MUST_NOT_MERGE
- MOVABLE_RECORD_AUTHORITY_REQUIRES_PRINCIPAL_DESIGNATION_WHERE_APPLICABLE
- E_TASINIR_SYSTEM_NAME_DOES_NOT_REPLACE_LEGAL_ACTOR_RULE
- REVOLVING_FUND_DUTY_REQUIRES_REVOLVING_FUND_APPLICABILITY
- AREA_CHIEF_ZUMRE_ROLE_CROSSLINKS_BOARD_ENGINE
- PROTOCOL_SHARED_USE_RULE_REQUIRES_ACTIVE_PROTOCOL_CONTEXT
- MONTHLY_MD85_REPORT_IS_NOT_AUTOMATICALLY_IDENTICAL_TO_LEGACY_PBO_WORKLOAD_REPORT
- SPECIAL_EDUCATION_OSH_DETAIL_REQUIRES_DUAL_AUTHORITY_CHECK
- CURRENT_2025_CHIEFSHIP_EXCEPTION_OVERRIDES_OLDER_HANDBOOK_DEFAULT

## Atom registry
V90-A001..A160 cover: master identity/boundary (23), chiefship creation/applicability (29), Md85 common duties (42), area-chief duties (31), workshop/lab duties (21), cross-authority/actor guards (14) = 160 active support atoms.

## Next
V90 Phase 2: historical ARTICLE_VERIFIED ledger audit; exact current-version authority locks for 84/85 and 2025 exception; HB-1808 movable authorization; HB-1810 OSH; HB-1816 revolving fund; HB-1825 monthly reporting; close V90 at >=300 atoms without count inflation.