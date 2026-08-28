# RAM Counseling Parent Manifest — V48

Date: 2026-08-29
Migration: 0

## Canonical split
`LEGACY_MONTH_ROW -> [GENERAL_RAM_INTERVIEW] + [COUNSELING_MEASURE_CASE] + optional [VIOLENCE_ACTION_PLAN]`

### General RAM interview
Legal family: current MEB Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği + RAM Yönergesi.
Trigger: direct application / referral to RAM.
Artifacts: appointment, client file, interview/service record, referral if needed.
Never requires a court order merely because the same legacy row also mentions counseling measure.

### Counseling measure
Legal family: 5395 + current 2026 Counseling Measure Tebliğ + current RPD regulation.
Trigger: court/judge counseling-measure decision.
State machine:
`DECISION_RECEIVED -> ASSIGNEE_RESOLVED -> FAMILY_CONTACTED -> PROCESS_STARTED -> FIRST_INTERVIEW -> IMPLEMENTATION_PLAN -> COURT_SUBMISSION -> SESSIONS -> 3_MONTH_EVALUATION -> CONTINUE/MODIFY/END -> FINAL_RECORD`

### Legacy families
- HB-0278: compound general interview + counseling measure; calendar instance.
- HB-0680: compound general interview + counseling measure; calendar instance.
- HB-0943: compound; March; same source lines/text as HB-0944.
- HB-0944: duplicate-extraction review against HB-0943.
- HB-0206/HB-0600/HB-0763/HB-1040: compound counseling/general interview + violence action plan.
- HB-0514: compound counseling plus local-manager-meeting action.

## Dedup key
`normalized_source_doc + source_page + source_line_start + source_line_end + normalized_text + month/context`
If same key exists under two workflow IDs, flag `DUPLICATE_EXTRACTION_REVIEW`; do not auto-delete historical IDs.

## Deadline engine
Store every deadline as legal parameter with source-version validity rather than hard-coded UI text:
- ASSIGNMENT: 5 business days
- START: 3 business days
- FAMILY_APPLICATION: 10 days
- IMPLEMENTATION_PLAN_TO_COURT: 5 business days after first interview
- SESSION_INTERVAL: 15 days
- MIN_SESSION_COUNT: 8
- PERIODIC_REVIEW: 3 months
- MAX_ACTIVE_FILES_PER_COUNSELOR: 15

The engine must preserve source-effective dates, calculate business-day deadlines independently of calendar-instance month, and record extensions/exceptions only if the current legal source permits them.

## Evidence model
Required evidence types are routed by state: COURT_DECISION, ASSIGNMENT_RECORD, CONTACT_LOG, APPLICATION/ATTENDANCE, FIRST_INTERVIEW_RECORD, IMPLEMENTATION_PLAN, COURT_TRANSMITTAL, SESSION_RECORD, PERIODIC_EVALUATION, CONTINUATION/MODIFICATION/TERMINATION_DECISION, FINAL_REPORT.

## Privacy
Counseling-measure files inherit child-protection/privacy restrictions. Access is role- and case-scoped; notification payloads must not expose sensitive case content beyond authorized roles.
