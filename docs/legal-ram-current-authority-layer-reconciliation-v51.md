# RAM current-authority layer reconciliation — V51

Date: 2026-08-29
Migration: 0

## Why this exists
The 31.08.2020 RAM Directive cannot be used as current authority after judicial annulment/stay. At the same time, the 14.08.2020 RPD Regulation continues to have surviving provisions actively used by MEB in 2026 inspection criteria. The system therefore must not mark the entire subject family as dead.

## Layer model
### L1 CURRENT_STATUTORY_OR_REGULATORY
Law / CBK / current Regulation provision with current effect.
Eligible for ARTICLE_VERIFIED when exact.

### L2 CURRENT_MINISTRY_OPERATIONAL
Current inspection guide, official RAM Guide, e-Rehberlik guide, official annual implementation letter, current official form.
Can establish present operational expectation and evidence schema.
Not sufficient alone for ARTICLE_VERIFIED under the strict counter rule.

### L3 HISTORICAL_OPERATIONAL
Annulled RAM Directive and older handbooks/manuals.
Retained for provenance, diffing and historical instances only.

## Current 2026 MEB inspection anchors
Current RAM inspection guidance uses:
- RPD Regulation Md16/4 for participation/planning in schools without counsellors.
- RPD Regulation Md13/1-a for local-target/needs-analysis evaluation.
- RPD Regulation Md18/1-m for November school-risk-map/risk-data chain.
- current 2019 psychosocial directive for psychosocial support criteria.
- current counseling-measure rules for children subject to a counseling measure.
- RAM Guide for several operational details that are not exact Regulation duties.

## Workflow classification
| Workflow | Canonical semantics | Safe current layer | V51 status |
|---|---|---|---|
| HB-0602 | incoming school RPD programs examined, forms returned | L2 | WITHHELD — scope error + no exact surviving article |
| HB-0603 | school risk maps `uygulanması` | L1/L2 mixed | WITHHELD — actor/action ambiguous |
| HB-0138 | counsellor year-end meeting | L2 | CURRENT_OPERATIONAL_EVIDENCE |
| HB-0395 | counsellor year-start meeting | L2 | CURRENT_OPERATIONAL_EVIDENCE |
| HB-0516 | duplicate/alternate month first meeting | L2 | LEGACY_CALENDAR_INSTANCE |

## Risk-map durable chain
Current source-exact school chain:
`CLASS_COUNSELLOR_RISK_DATA -> SCHOOL_RPD_SERVICE_MERGE -> SCHOOL_RISK_MAP -> PRINCIPAL_SEND_TO_RAM -> RAM_RECEIVE/COLLECT_FOR_RESPONSIBILITY_AREA`

Current article anchors:
- Md23/1-d: class counsellor sends risk-at-student data to RPD service during November.
- Md21/4-b/3: RPD service merges data and creates institution risk map during November.
- Md18/1-m: principal sends that map to attached RAM during November.

2026 RAM inspection criterion describes the receiving/collection outcome on the RAM side. That inspection criterion is cross-evidence, not a license to rewrite Md18/1-m as if it directly assigns a RAM statutory duty.

## HB-0603 correction design
Never publish `Okul risk haritalarının uygulanması` as one national legal task.

Staging children:
1. `GUID_RISK_CLASS_DATA_NOVEMBER`
   - actor: class counsellor
   - source: RPD Regulation Md23/1-d
2. `GUID_RISK_SCHOOL_MAP_CREATE_NOVEMBER`
   - actor: school RPD service / counsellor
   - source: Md21/4-b/3
3. `GUID_RISK_SCHOOL_MAP_SEND_RAM_NOVEMBER`
   - actor: school principal
   - source: Md18/1-m
4. `RAM_RISK_DATA_COLLECT_NOVEMBER`
   - actor: RAM RPD services section
   - source class: current MEB inspection/operational evidence until exact durable RAM article is found

Legacy HB-0603 becomes `superseded_by_atomic_children` only after Super Admin approval; completed history remains immutable.

## HB-0602 correction design
The legacy source page proves the row was extracted under the wrong section boundary: the task is RAM guidance-program review, while its stored scope label says boarding-school operations.

Correction package:
- corrected_scope: `RAM`
- corrected_module: `GUID`
- legal_family: `REHBERLIK`
- authority_state: `CURRENT_OPERATIONAL_EVIDENCE`
- article_verification: `WITHHELD`
- publication condition: exact durable parent OR explicit policy allowing operational-only workflow publication.

## Counter rule preserved
No L2-only workflow contributes to ARTICLE_VERIFIED.
No current Regulation article is inferred from a guide sentence unless actor/action/scope maps exactly to the Regulation text.
