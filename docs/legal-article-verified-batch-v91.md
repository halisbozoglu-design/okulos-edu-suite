# Legal ARTICLE_VERIFIED Batch V91

Date: 2026-09-03
Status: CLOSED
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master: 2,229
- ARTICLE_VERIFIED before V91: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after V91: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Phase 1: 160 atoms
- Phase 2: 140 atoms
- V91 total: **300 support atoms**
- Closed pool: **24,005 -> 24,305**

## Boundary
V91 audited exactly **HB-1826..HB-1831 — 2.16 OKUL SAĞLIĞI**. HB-1832 starts `2.17 OKUL/KURUM ÇEVRE İLİŞKİSİ`.

## Canonical result
1. HB-1826 is materially incomplete against current official school-health team composition: current model includes one student; where present, guidance counselor and health worker are natural members. Parent withheld.
2. HB-1827 annual school-specific health plan is strongly supported but protocol/guide-version bound because the 18.04.2025 MEB–Health Ministry protocol initiates an update of the older application guide.
3. HB-1828 annual family-physician periodic follow-up remains current in the 2025 Aile Hekimliği Rehberi, but the health actor performs the medical action; school role is coordination/facilitation where required.
4. HB-1829 must split aggregate/statistical school monitoring from individual clinical health records. Health-data authority is separate and privacy constrained.
5. HB-1830 school-health file is a program document set, not a medical chart or blanket authority to retain raw health records.
6. HB-1831 generic recurring Covid-19 task is stale for 2026; pandemic-specific tasks require a current competent public-health trigger.
7. No direct historical ARTICLE_VERIFIED row was recovered for targeted HB-1826..1828 searches; no inferred rollback.

## Core guards
- SCHOOL_HEALTH_PROTOCOL_AND_GUIDE_ARE_VERSIONED
- 2025_SCHOOL_HEALTH_PROTOCOL_CREATES_TRANSITION_STATE
- SCHOOL_HEALTH_TEAM_REQUIRES_STUDENT_MEMBER
- HEALTH_WORKER_AND_GUIDANCE_NATURAL_MEMBERS_ARE_CONDITIONAL
- SCHOOL_HEALTH_PLAN_IS_ANNUAL_AND_TEAM_PREPARED
- FAMILY_PHYSICIAN_FOLLOWUP_IS_HEALTH_SERVICE_ACTION
- SCHOOL_ROLE_IS_COORDINATION_NOT_MEDICAL_PRACTICE
- HEALTH_DATA_IS_SPECIAL_CATEGORY_AND_REQUIRES_SEPARATE_AUTHORITY
- SCHOOL_HEALTH_STATISTICS_DO_NOT_AUTHORIZE_RAW_MEDICAL_RECORD_STORAGE
- SCHOOL_HEALTH_FILE_IS_NOT_A_MEDICAL_CHART
- PANDEMIC_TASK_REQUIRES_CURRENT_PUBLIC_HEALTH_TRIGGER
- HISTORICAL_PANDEMIC_TASKS_REMAIN_IMMUTABLE
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE COUNT CHANGE

## Canonical files
- `docs/legal-article-verified-focused-deepening-batch-v91-phase1.md`
- `docs/legal-article-verified-focused-deepening-batch-v91-phase2.md`
- `docs/legal-article-verified-batch-v91.md`
- `docs/legal-verification-progress-v91-delta.json`

## Next
V92 starts **HB-1832..HB-1837 — 2.17 OKUL/KURUM ÇEVRE İLİŞKİSİ**. HB-1838 begins `3.1 ÖĞRETMENLER KURULU`.