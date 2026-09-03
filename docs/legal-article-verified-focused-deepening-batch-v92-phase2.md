# Legal ARTICLE_VERIFIED Focused Deepening — V92 Phase 2

Date: 2026-09-03
Status: COMPLETE / V92 READY TO CLOSE
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
- V92 Phase 1: 160 support atoms
- V92 Phase 2: 140 support atoms
- V92 total: 300 support atoms
- Closed pool on close: 24,605

## Phase 2 decisions
### HB-1832
Current OÖKY Md19/1 is direct semantic/legal support. Parent is a strong exact candidate but count change remains gated by strict live-consolidated current clause/version plus row-ledger/dedupe.

### HB-1833
Current OÖKY Md19/2 directly supports school administrators promoting school activities and informing stakeholders. Strong exact candidate; same strict count gate applies.

### HB-1834
No current exact provision was recovered establishing a universal `at least one parent meeting per term` requirement for all covered schools. Current 2026 MEB inspection guidance audits school-family-environment cooperation but does not encode this frequency. Therefore parent stays WITHHELD and must not create an automatic semester deadline.

### HB-1835
`Nearby public/private/industry/trade organizations` wording is operationally plausible but broader/specialized compared with generic OÖKY Md19. Split universal community cooperation from vocational sector cooperation. Do not mark ALL.

### HB-1836
Institution-workplace relationship is vocational/enterprise-training conditional. Activate only for school/program/cohort configurations that actually have applicable workplace/enterprise education relations.

### HB-1837
Vocational framework/program sources use closely matching wording for guidance through universities, NGOs, sector firms, professional chambers and professionals. Resolver dimensions include school/program + field/branch + framework/program version. It is not universal across all schools.

## Ledger integrity
Targeted repository searches did not recover direct historical `ARTICLE_VERIFIED` rows for HB-1832 or HB-1833. Absence does not prove global nonexistence, but it prevents inferred rollback/promotion accounting. Derivative `ALL`, generic-family, green/current or handbook mappings remain non-counting evidence.

## Canonical runtime model
1. `community_cooperation_general` — OÖKY Md19 school/family/environment layer.
2. `school_activity_promotion` — OÖKY Md19/2 actor = school administrators.
3. `parent_meeting_frequency` — separate resolver; no fixed frequency until exact authority exists.
4. `vocational_sector_cooperation` — conditional vocational layer.
5. `workplace_relations` — enterprise/workplace applicability required.
6. `vocational_external_guidance` — program/field/version-bound university/NGO/chamber/sector cooperation.

## Guards
- GENERAL_COMMUNITY_COOPERATION_DOES_NOT_CREATE_PARENT_MEETING_FREQUENCY
- SCHOOL_PROMOTION_ACTOR_IS_SCHOOL_ADMINISTRATION
- PARENT_MEETING_DEADLINE_REQUIRES_EXACT_SOURCE
- GENERIC_MD19_DOES_NOT_PROVE_INDUSTRY_TRADE_DUTY
- WORKPLACE_RELATION_REQUIRES_ENTERPRISE_EDUCATION_APPLICABILITY
- VOCATIONAL_EXTERNAL_GUIDANCE_REQUIRES_PROGRAM_FIELD_VERSION
- OLD_HANDBOOK_MESLEK_TAG_MUST_BE_PRESERVED_AS_SCOPE_SIGNAL
- ALL_SCOPE_CANNOT_INHERIT_VOCATIONAL_PROGRAM_RULES
- DERIVATIVE_GREEN_CURRENT_STATUS_IS_NOT_ARTICLE_VERIFIED
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Next
Close V92 at 300 support atoms. V93 begins HB-1838 `3.1 ÖĞRETMENLER KURULU` and should audit composition, invited participants, statutory meeting times, notice lead time, meeting outside class hours, quorum/decision/minutes and current amendments.