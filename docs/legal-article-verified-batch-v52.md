# V52 — ARTICLE_VERIFIED result

Date: 2026-08-29
Master: 2,229
Before: 467
New unique exact promotions: 0
Rollbacks: 0
After: 467
Ratio: 20.9511%
Remaining: 1,762
Migration: 0

## Why no increment
The strongest exact matches discovered in V52 (`HB-2029`, `HB-2036`) were already present in historical ARTICLE_VERIFIED artifacts, though with incorrect/generic source mappings in one earlier batch. V52 corrects/stages those sources but does not double-count workflows.

## Source corrections
- HB-2029 -> MEB RPD Hizmetleri Yönetmeliği Md16/8.
- HB-2036 -> MEB RPD Hizmetleri Yönetmeliği Md21/4-a.

## Withheld
- HB-2030 -> compound/split.
- HB-2031 -> legacy plan/report-to-RAM formulation; exact whole-row current provision unresolved.
- HB-2035 -> partial multi-provision; audience mismatch.
- HB-0602 -> wrong scope + current RAM parent required.
- HB-0603 -> ambiguous single action; atomic rewrite required.

## Integrity review
- HB-2037 and HB-2038: prior generic OÖİKY source does not establish full exact action. Do not create duplicate increments; resolve/rollback only after full exact current-source audit.
