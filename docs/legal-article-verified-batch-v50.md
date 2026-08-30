# ARTICLE_VERIFIED Batch V50

Date: 2026-08-29
Migration: 0

## Delta
- Starting ARTICLE_VERIFIED: 469
- Added: 0
- Rolled back: 2
- Ending ARTICLE_VERIFIED: 467 / 2229 = 20.9511%
- Remaining exact: 1762

## Rollbacks
### HB-0395
V49 basis: RAM Directive Md5/4-a/7.
V50 correction: 31.08.2020 RAM Directive is not a valid current authority due judicial suspension/annulment status. No independent current exact Regulation/Law parent established in V50.
Status: `WITHHELD_CURRENT_AUTHORITY`.

### HB-0138
V49 basis: RAM Directive Md5/4-a/7.
Same judicial-status correction.
Status: `WITHHELD_CURRENT_AUTHORITY`.

## No new promotions
School-visit, consultancy, school-program review and related RAM legacy rows remain useful workflow evidence but fail current-authority gate when exact mapping relies only on the annulled/stayed Directive.

## Integrity rule
A rollback is mandatory whenever a previous verification relied on a source later shown not to have current legal effect. Historical verification logs are retained; canonical current counter is corrected.
