# V58 — HB-2139 Atomic Split Staging

Legacy master: `HB-2139`
Status: already rolled back in V57 because two independent legal actions are combined.
Migration: 0

## Child A — decision writing
Staging key: `DISCIPLINE_DECISION_WRITE_TO_BOOK`
Actor: school student award and discipline board / board chair for execution
Action: write reasoned decision to board decision book or attach separately written decision to that book; record legal provisions and signatures.
Current parent: MEB Ortaöğretim Kurumları Yönetmeliği Md196/1; Md196/3 assigns post-writing/signature/submission/book-retention and correspondence responsibility to board chair.
Evidence: decision book entry, EK-1 compliant decision, signatures.

## Child B — sanction notification
Staging key: `DISCIPLINE_SANCTION_NOTIFY_AND_RETAIN_PROOF`
Actor: school administration/authorized notification workflow
Action: notify every disciplinary sanction to parent in accordance with notification regulation and retain proof of receipt in discipline file.
Current parent: OÖKY Md169/5.
Evidence: notification, proof of receipt, discipline file.

## Existing-master reuse search
File Library searches on exact phrases `karar defterine`, `velilerine yazılı olarak tebliğ`, `tebellüğ belgesi` and `disiplin dosyasında` returned the compound HB-2139 record but no clean standalone durable sibling that can replace Child A or Child B.
Therefore:
`MASTER_REUSE_NOT_FOUND -> NEW_CANDIDATE_STAGING -> SUPERADMIN_APPROVAL -> MASTER_ID_ASSIGN -> PUBLISH`.

Until publication:
- denominator remains 2,229;
- no child is counted separately;
- completed historical HB-2139 instances remain immutable;
- new future instances must not silently mutate legacy history.
