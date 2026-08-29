# V54 — Current RPD Program-Management Crosswalk

Date: 2026-08-29
Migration: 0

## Current binding provision family
RPD Regulation Md21/4-b establishes five program-management atoms for guidance teacher/psychological counsellor:
1. prepare school RPD program in e-Rehberlik by first week of October for RAM transmission;
2. prepare own weekly program in e-Rehberlik;
3. combine November class risk data and create school risk map;
4. enter program work into e-Rehberlik, keep client records, file/store work that cannot be entered electronically;
5. implement school RPD program collaboratively through the school year and evaluate effectiveness at year end.

Md18/1-g, ğ, h, ı and m establish corresponding principal-side controls:
- ensure program preparation;
- approve/send program via e-Rehberlik by first week October;
- monitor school and weekly programs in e-Rehberlik;
- follow regular e-Rehberlik entry of work;
- send November school risk map to relevant RAM.

Md23/1-d establishes the class-guidance source atom for the risk chain: each November the class guidance teacher sends a copy of data on students at risk to the school RPD service.

## HB-0603 publication payload completion
The previously unresolved third child is now source-locked:
- `CLASS_RISK_DATA_TO_RPD_SERVICE`
- actor: `CLASS_GUIDANCE_TEACHER`
- action: send one copy of risk-student data to school RPD service
- timing: every year in November
- legal parent: RPD Regulation Md23/1-d
- evidence: risk-data transmission record / e-Rehberlik-compatible evidence where applicable

The other two staged children remain:
- `SCHOOL_RISK_MAP_BUILD` -> guidance teacher/psychological counsellor -> Md21/4-b/3
- `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal -> Md18/1-m

Transition rule:
`HB-0603 legacy -> SUPERADMIN_APPROVAL -> atomic durable IDs assigned -> publish -> future instances generated from children; historical completed legacy instances immutable.`
No denominator change occurs before new durable IDs are approved and published.

## Master exact-search result in this batch
No existing durable master row was safely counted merely because it resembled the complete Md21/4-b/1-5 chain. Existing records must be checked against actor, object, timing and target system individually. HB-2037 already covers the record/archive atom and remains counted; HB-0603 is not counted as a whole because its wording does not identify the actor/action.

## Publish guards
- do not combine counsellor preparation with principal approval/send into one exact workflow;
- do not combine risk-map build with risk-map send;
- do not convert handbook dates into a legal date unless the current regulation itself fixes that date;
- e-Rehberlik is a legally named system in the relevant current provisions and is therefore not a tenant-replaceable generic system label for these exact workflows;
- local evidence form design may be tenant-configurable, but legal evidence semantics must stay linked to the immutable parent provision.
