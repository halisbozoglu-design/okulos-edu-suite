# V75 — Focused Deepening 410+ Support Atoms

Date: 2026-08-30
Start pool: 18,405
Added support atoms: 410
End pool: 18,815
ARTICLE_VERIFIED start/end: 475 -> 475
Migration: 0
Lovable: 0

## Coverage
410 support atoms were assigned across HB-1642..HB-1667 with emphasis on:
- workflow identity and exact master wording
- section boundary
- school type applicability
- actor
- action
- object
- timing/default/minimum semantics
- conditionality/optionality
- notice/evidence semantics
- pregnancy trigger and duration reference point
- disabled-teacher/disabled-child scope
- classroom supervision object
- old verification rollback deduplication
- current official amendment chain

## High confidence findings
1. HB-1658 fixed 15-minute wording is not a current universal default. Current relevant regulations use a 30-minute default in major school families, with limited reduction rules where provided.
2. HB-1659 is not current-exact for secondary education: current trigger is pregnancy week 24, duration runs through the end of two years following completion of post-birth maternity leave, and no-duty is conditional on the teacher not requesting duty.
3. HB-1663 conflates distinct school-type rules. Primary/lower-secondary rule contains exemption plus requested-duty preference; special-education rule has a different actor/scope formulation.
4. HB-1664 broadens 'maintain class order' into 'maintain class order and make students do study work'. Exact object mismatch blocks promotion.
5. HB-1665 merges preschool and special-education classroom-supervision models.
6. HB-1645 and HB-1667 old Batch02 ARTICLE_VERIFIED entries had content-mismatched source mapping. Their canonical rollbacks were already booked in V60/V61 and are not subtracted again.

## Guard applications
- BROAD_ALL cannot inherit one school type's exact provision.
- A minimum allowable time is not the same as the default time.
- '12 weeks before birth' cannot normalize to 'from pregnancy week 24'.
- 'two years after birth' cannot normalize to 'until end of two years after maternity-leave completion'.
- 'no duty' cannot normalize to 'no duty if teacher does not request it'.
- preference priority cannot replace an exemption rule.
- an old ARTICLE_VERIFIED row with unrelated provision content is historical audit evidence, not current truth.

## Promotion decision
No workflow in this batch crossed the complete current exact gate without school-type split/master rewrite. Delta 0.
