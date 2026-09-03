# Legal ARTICLE_VERIFIED Focused Deepening — V91 Phase 1

Date: 2026-09-03
Status: COMPLETE / V91 ACTIVE
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
- Closed pool through V90: 24,005
- V91 Phase 1 support atoms: 160
- Closed pool remains 24,005 until V91 closes.

## Exact master boundary
Section `2.16 OKUL SAĞLIĞI` is exactly HB-1826..HB-1831 (6 rows). HB-1832 starts `2.17 OKUL/KURUM ÇEVRE İLİŞKİSİ`.

- HB-1826: school has an Okul Sağlığı Yönetim Ekibi composed of one administrator, one teacher and one school-family-association member; guidance counselor is stated as natural member.
- HB-1827: school-specific Okul Sağlığı Planı exists.
- HB-1828: students' annual periodic examination/follow-up by family physicians is ensured.
- HB-1829: numerical data of student examination, vaccination and screening results are kept.
- HB-1830: school-health file is created.
- HB-1831: necessary Covid-19 pandemic measures are taken.

## Current authority/version findings
1. The 2017 `Okulda Sağlığın Korunması ve Geliştirilmesi Programı Uygulama Kılavuzu` remains officially hosted by MEB/Sağlık sources and is still referenced in current health-system materials.
2. A new MEB–Sağlık Bakanlığı `Sağlıklı Çocuk, Sağlıklı Gelecek Okul Sağlığı Hizmetleri İş Birliği Protokolü` was signed on 18.04.2025.
3. Current 2025 Ministry of Health material expressly says the 2017 application guide will be updated under the new protocol. Therefore the system must model a protocol/guide transition rather than assume the 2017 guide is the final permanent version.
4. Current Ministry of Health school-health material states the school-health management team as: 1 administrator + 1 teacher + 1 student + 1 school-family-association member; where present, guidance counselor and health worker are natural members.
5. Therefore HB-1826 is materially incomplete: it omits the student member and omits the health-worker natural-member condition. It cannot be ARTICLE_VERIFIED as written.
6. Current application-guide material states that the annual school-health plan is prepared by the Okul Sağlığı Yönetim Ekibi and is school-specific. HB-1827 is strong but held because the 2025 protocol explicitly initiates guide updating/version transition.
7. The 2025 Aile Hekimliği Rehberi confirms annual periodic school-age-child examination/follow-up by family physicians and entry into the family-health information system. HB-1828 is a strong current candidate, but row-level dedupe/live-clause lock is still required before count change.
8. HB-1829 must distinguish health-provider source records from school-held aggregate statistics. The school must not infer authority to store individual health data merely because screening exists; KVKK/sensitive-health-data scope remains separate.
9. HB-1830 `school-health file` is a program-document construct and must follow the applicable current guide/protocol version and retention/data-protection rules.
10. HB-1831 is a stale pandemic-era universalization. The 2021 Covid school measures were emergency/pandemic-specific. In 2026 no generic always-on `Covid-19 measures` task is generated unless a current public-health trigger/authority reactivates it.

## Phase 1 guards
- SCHOOL_HEALTH_PROTOCOL_AND_GUIDE_ARE_VERSIONED
- 2025_PROTOCOL_TRANSITION_OVERRIDES_BLIND_2017_GUIDE_INHERITANCE
- SCHOOL_HEALTH_TEAM_REQUIRES_STUDENT_MEMBER
- GUIDANCE_COUNSELOR_NATURAL_MEMBER_IS_IF_PRESENT
- HEALTH_WORKER_NATURAL_MEMBER_IS_IF_PRESENT
- SCHOOL_HEALTH_PLAN_IS_ANNUAL_AND_TEAM_PREPARED
- FAMILY_PHYSICIAN_ANNUAL_FOLLOWUP_IS_HEALTH_SYSTEM_DUTY
- SCHOOL_DOES_NOT_INHERIT_RAW_HEALTH_DATA_AUTHORITY
- AGGREGATE_HEALTH_STATISTICS_AND_INDIVIDUAL_HEALTH_RECORDS_ARE_DISTINCT
- COVID_2021_EMERGENCY_RULE_IS_NOT_2026_ALWAYS_ON_TASK
- PUBLIC_HEALTH_TRIGGER_REQUIRED_FOR_PANDEMIC_SPECIFIC_TASK
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Sources locked for V91
- MEB school-health portal / 2017 application guide.
- Ministry of Health HSGM current school-health training material.
- Ministry of Health 2025 Aile Hekimliği Rehberi.
- 18.04.2025 MEB–Sağlık Bakanlığı `Sağlıklı Çocuk, Sağlıklı Gelecek` protocol/program materials.

## Next
V91 Phase 2: deepen version-transition, health-data/privacy, exact workflow-child model, ledger integrity and closure to >=300 support atoms.