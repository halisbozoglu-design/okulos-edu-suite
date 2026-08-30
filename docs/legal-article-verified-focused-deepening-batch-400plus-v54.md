# V54 — Focused Legal Deepening Batch

Date: 2026-08-29
Support atoms added: 440
Atom pool: 9,695 -> 10,135
Migration: 0
Lovable usage: 0

## Coverage families
This batch adds 440 support atoms across:
- current RPD Regulation provision parsing and actor/action decomposition;
- school RPD service physical-condition exact clauses;
- commission governance timing/agenda clauses;
- program-management e-Rehberlik chain;
- class-guidance teacher duties;
- BTT application/evaluation duties;
- student direction duties;
- report recipient/timing mismatch detection;
- legacy 2001-vs-current 2020 RPD wording comparison;
- e-Okul student-development-file legacy-duty detection;
- risk-data -> risk-map -> RAM transmission chain;
- evidence semantics;
- privacy/data-object guard fields;
- duplicate and historical-count reconciliation;
- source-level/current-effect metadata.

## Key integrity outputs
1. HB-2023/2024/2025 retain ARTICLE_VERIFIED but their old generic OÖİKY source is replaced by current RPD Regulation Md15/2-a,b,c.
2. HB-2046 is rolled back because the stored legacy action says year-end -> RPD service while current Md23/1-ı says each term end -> principal.
3. HB-2049 is rolled back because its e-Okul student-development-file action tracks the repealed 2001 RPD Regulation and no current exact equivalent was established.
4. HB-2048 is newly ARTICLE_VERIFIED to current Md21/2-b.
5. HB-2050 is newly ARTICLE_VERIFIED to current Md23/1-g.
6. HB-0603 child C is finalized to current Md23/1-d.

## Counter impact
Start ARTICLE_VERIFIED: 466
Rollbacks: -2
New exact promotions: +2
Final ARTICLE_VERIFIED: 466
Master denominator: 2,229
Remaining exact: 1,763
Ratio: 20.9062%

## Important discovery
The source handbook still contains operational rows copied from the former RPD legal model. Therefore `CURRENT_FAMILY_MATCH` is insufficient. The verifier must detect whether a row reflects a superseded actor/action version even when the topic remains valid under current law.

New comparison fingerprint:
`LEGAL_FAMILY + ACTOR + ACTION + OBJECT + RECIPIENT + TIMING + SYSTEM + APPLICABILITY`
A mismatch in recipient or timing can invalidate ARTICLE_VERIFIED even if all other concepts look similar.

## System behavior
- historical evidence remains immutable;
- current master verification status may be rolled back without rewriting historical completed instances;
- future task generation follows current exact provisions only;
- source correction on an already counted workflow adds zero to the counter;
- rollback and new promotion are separately auditable events;
- no database migration required; use catalog/config/verification artifacts.
