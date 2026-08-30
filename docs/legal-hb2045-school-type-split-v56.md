# V56 — HB-2045 School-Type Split Staging

Legacy master: `e-Okul sistemindeki öğrenci gelişim dosyaları doldurulmaktadır.`

## Integrity problem
The legacy statement is universal, but the current electronic reporting/file constructs are not identical across school types. A former primary-education article created a direct `öğrenci gelişim dosyası` duty; that wording cannot be carried forward universally without checking the current school-type regulation and current MEB information-system implementation.

## Publication strategy
Do not mutate HB-2045 in place as a universal duty. Stage school-type children:

### A. Secondary institutions
Code: `STUDENT_DEVELOPMENT_FILE_SECONDARY`
Scope: only school types where current OÖKY/current e-School rules explicitly retain an electronic student development file and actor/action fields are exact.
Status: `CURRENT_PARENT_EXACT_TEXT_REQUIRED_BEFORE_PUBLISH`.

### B. Pre-primary / primary / lower-secondary
Code: `DEVELOPMENT_REPORT_PRIMARY_LOWER_SECONDARY`
Scope: current development-report/e-Report construct, not automatically the legacy student-development-file terminology.
Status: `CURRENT_REPORTING_MODEL_EXACT_TEXT_REQUIRED_BEFORE_PUBLISH`.

### C. Other institution families
Open education, HEM, RAM, BİLSEM and special institution types are not inherited automatically. Apply school-type/feature filters from their own current legislation.

## Transition
`HB-2045 -> SPLIT_STAGED`
No denominator change until durable children are Super Admin approved and assigned master IDs.
Historical completed records remain immutable and retain source snapshot/version.
No ARTICLE_VERIFIED counter delta in V56.
