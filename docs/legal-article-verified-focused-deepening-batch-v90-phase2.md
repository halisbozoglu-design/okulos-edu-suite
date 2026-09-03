# Legal ARTICLE_VERIFIED Focused Deepening — V90 Phase 2

Date: 2026-09-03
Status: COMPLETE / V90 READY TO CLOSE
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
- Closed pool through V89: 23,705
- V90 Phase 1: 160 active support atoms
- V90 Phase 2: 140 active support atoms
- V90 total: 300
- Closed pool on V90 close: 24,005

## Historical ledger audit
Targeted repository searches did not recover direct row-level ARTICLE_VERIFIED ledger entries for HB-1803..HB-1825. Existing queue/derivative artifacts classify these rows as conditional MTAL/MESEM candidates and cite broad `3308 + ilgili ortaöğretim/mesleki mevzuat + yıllık kılavuzlar` / Md84-85 families; that classification is not proof of counted ARTICLE_VERIFIED status. Therefore no inferred rollback is booked.

## Current-rule integrity locks
### 1. Chiefship creation is conditional, not vacancy-driven
The current 84-family must resolve whether a chiefship legally exists before an appointment task is generated. Relevant conditions include number/equipment/use of workshops/labs, same-management program structure, educational use, sharing arrangements and current amendments.

The 22.02.2025 / 32821 change is a hard override: where a school simultaneously uses another school's workshop/lab belonging to the same area/branch, no chief is appointed for that workshop/lab; existing appointment is cancelled by governorate. HB-1805 is therefore prohibited as a blanket rule.

### 2. Md85 common-duty children
Strong direct-text children retained for future strict promotion:
- maintenance/repair/protection/storage/readiness;
- conditional movable records and count readiness;
- e-Taşınır consumption entries;
- equipment maintenance and write-off proposal route;
- cleanliness habit;
- area/workshop/lab records;
- basic practical operations + student guidance;
- teaching-tool production/repair where applicable;
- machine card/manual/warning/use-instruction controls;
- incident/near-miss reporting to principal;
- graduate tracking placement work;
- shared-equipment responsibility;
- protocol-based shared use;
- school-defined working-principle duties;
- monthly report to school administration.

### 3. Area-chief-only children
- annual personnel work division + principal approval;
- cooperation with other areas/departments;
- program-aligned equipment/donatım needs + proposal;
- revolving-fund production under its special law;
- chairing area/department zümre and meeting with relevant personnel;
- material/library development;
- external cooperation + graduate workplace success + program-development proposals;
- sector information/technology exchange + participation encouragement.

### 4. Workshop/lab-chief-only children
- inquiry/research-based applied education and tool availability/enrichment;
- ensuring student practice/production/service develops program outcomes and proceeds toward defined aims;
- contextual equipment responsibility with technician in continuously used units.

## Row outcomes
- HB-1803: STRONG / WITHHELD pending strict live-current official clause + applicability resolver.
- HB-1804: STRONG / WITHHELD; equipment/count conditions required.
- HB-1805: OVERBROAD / WITHHELD; current exceptions can require no appointment.
- HB-1806: STRONG conditional candidate.
- HB-1807: DIRECT-TEXT strong candidate.
- HB-1808: STRONG but actor normalization required.
- HB-1809: strong family match; exact current clause text to be locked before promotion.
- HB-1810: SPLIT; chief duty + OSH + special-needs dimension.
- HB-1811: DIRECT-TEXT strong candidate.
- HB-1812: DIRECT-TEXT strong candidate.
- HB-1813: DIRECT-TEXT strong candidate; machine-card/manual/warning components remain separable executable children.
- HB-1814: DIRECT-TEXT area-chief candidate.
- HB-1815: DIRECT-TEXT area-chief candidate.
- HB-1816: DIRECT-TEXT but REVOLVING_FUND conditional.
- HB-1817: DIRECT-TEXT area-chief candidate; zümre engine cross-link required.
- HB-1818: DIRECT-TEXT area-chief candidate.
- HB-1819: DIRECT-TEXT area-chief candidate.
- HB-1820: DIRECT-TEXT area-chief candidate.
- HB-1821: DIRECT-TEXT workshop/lab-chief candidate.
- HB-1822: DIRECT-TEXT workshop/lab-chief candidate; source master truncation in derivative files must not truncate executable rule.
- HB-1823: STRONG but current actor wording must replace legacy awkward grammar.
- HB-1824: DIRECT-TEXT protocol conditional candidate.
- HB-1825: PARTIAL-EXACT: current Md85 monthly report is strong, but legacy report scope explicitly tied to weekly schedule `planlama bakım ve onarım` requires separate workload/extra-course authority lock.

## System design guards
- Generate `chiefship_required` before `chief_assignment_due`.
- `vacancy=true` does not imply `assignment_required=true`.
- Chiefship applicability snapshot includes school, program, area/branch, workshop/lab, equipment, usage, shared-use institution, academic year and legal version.
- Area chief and workshop/lab chief roles use separate duty matrices.
- A chief may hold common-duty children plus only role-specific children applicable to that chief type.
- Revolving-fund children activate only where a legally applicable revolving-fund operation exists.
- Protocol-shared-use children activate only with an active protocol and covered facility.
- e-Taşınır actions preserve authorization identity and do not infer legal power from application access alone.
- OSH tasks preserve special OSH authority and do not collapse into Md85 only.
- Monthly reporting has separate `md85_monthly_activity_report` and `planning_maintenance_repair_workload_report` concepts until exact legal identity is proven.
- Completed historical task instances retain their legal snapshot when future chiefship rules change.

## Phase 2 guards
- CHIEFSHIP_EXISTENCE_PRECEDES_ASSIGNMENT
- VACANCY_DOES_NOT_IMPLY_ASSIGNMENT_DUE
- 2025_SHARED_WORKSHOP_EXCEPTION_IS_HARD_OVERRIDE
- AREA_CHIEF_ROLE_MATRIX_IS_DISTINCT
- WORKSHOP_LAB_CHIEF_ROLE_MATRIX_IS_DISTINCT
- COMMON_CHIEF_DUTIES_DO_NOT_ERASE_ROLE_SCOPE
- E_TASINIR_ACCESS_IS_NOT_AUTHORITY
- REVOLVING_FUND_CHILDREN_REQUIRE_FEATURE_APPLICABILITY
- ACTIVE_PROTOCOL_REQUIRED_FOR_SHARED_USE_TASK
- OSH_SPECIAL_AUTHORITY_REMAINS_SEPARATE
- MD85_MONTHLY_REPORT_AND_PBO_REPORT_STAY_SEPARATE_UNTIL_EXACT_LOCK
- DERIVATIVE_GREEN_STATUS_IS_NOT_ARTICLE_VERIFIED
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Atom registry
V90-A161..A300: current 84-family applicability (28), common-duty exactness (37), area-chief role matrix (24), workshop/lab role matrix (16), special authority intersections e-Taşınır/OSH/revolving fund/protocol/reporting (22), historical ledger + versioning + execution guards (13) = 140 atoms.

## Decision
V90 closes with no count change. This is deliberate: strong semantic/direct-text matches are staged, but strict project policy requires current official live source + exact clause/version + actor/action/scope + row-level dedupe before ARTICLE_VERIFIED promotion.