# V53 — HB-0603 atomic publication payload

Migration: 0
Status: SUPERADMIN_STAGING_ONLY

Legacy master:
- HB-0603: `Okul risk haritalarının uygulanması`
- Problem: actor/action is ambiguous and cannot be ARTICLE_VERIFIED as one durable workflow.

## Proposed durable children

### CHILD-A — SCHOOL_RISK_MAP_BUILD
Actor: REHBER_OGRETMEN_PSIKOLOJIK_DANISMAN
Action: Every November combine risk-at-student data received from class guidance teachers and create the education institution risk map.
Binding source: RPD Regulation Md21/4-b/3.
Timing: November (binding).
Evidence: source data receipt + generated school risk map + e-Rehberlik/form record where applicable.
Applicability: education institutions with RPD service/counsellor according to current operational routing.

### CHILD-B — SCHOOL_RISK_MAP_SEND_TO_RAM
Actor: EGITIM_KURUMU_MUDURU
Action: Every November transmit the school risk map prepared by the RPD service with class-guidance-teacher cooperation to the RAM to which the institution is attached.
Binding source: RPD Regulation Md18/1-m.
Timing: November (binding).
Evidence: approved risk map + official transmittal/electronic submission evidence.

### CHILD-C — CLASS_RISK_DATA_TO_RPD_SERVICE
Actor: SINIF_REHBER_OGRETMENI
Action: provide the class-level risk data/input required by the school risk-map process to the RPD service under the current class-guidance duty chain.
Publication rule: do not assign a fabricated subparagraph. Exact provision text must be captured in the approval packet before publication; current MEB implementation material may support but cannot replace binding article precision.

## Transition
- HB-0603 stays visible as LEGACY_AMBIGUOUS until Super Admin approval.
- On publication: HB-0603 -> SUPERSEDED_BY_ATOMIC_CHILDREN.
- Completed historical instances remain immutable.
- Open future instances may be migrated logically to children through catalog mapping; no DB migration.
- Denominator remains 2,229 until new durable IDs are formally approved/assigned/published.
- ARTICLE_VERIFIED counter does not increase merely from staging children.

## Privacy
Risk-map data is purpose-bound. UI should expose aggregated/need-to-know views and avoid turning the risk map into a broad profiling dataset. Retention/access must follow current legal and MEB rules.