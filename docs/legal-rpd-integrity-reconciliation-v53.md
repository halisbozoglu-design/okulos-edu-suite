# V53 — RPD integrity reconciliation

Date: 2026-08-29
Migration: 0

## Scope
V53 rechecks HB-2037/HB-2038 and school-side RPD workflow mappings against the current surviving provisions of the 14.08.2020 RPD Regulation. The annulled 31.08.2020 RAM Directive is not used as current authority.

## HB-2037 — RETAIN ARTICLE_VERIFIED, CORRECT SOURCE
Canonical action: school RPD service keeps records of work and archives documents.

Current exact parent: RPD Regulation Md21/4-b/4.
The provision requires the counsellor/psychological counsellor to enter work performed under the school RPD program into e-Rehberlik; keep necessary records via the client file during counselling; and file/store work that cannot be entered electronically in accordance with procedure.

Decision:
- ARTICLE_VERIFIED retained.
- Previous generic OÖİKY 2026 Md9 mapping is replaced.
- No counter increment because same workflow was already counted.
- Normalized evidence: E_REHBERLIK_ACTIVITY_RECORD | CLIENT_FILE | OFFLINE_DOCUMENT_ARCHIVE.
- Confidentiality/data-access rules remain separately enforced.

## HB-2038 — EXPLICIT ARTICLE_VERIFIED ROLLBACK
Canonical action: school RPD service follows and evaluates data about student parents' family integrity, education status and economic status.

The prior Batch02 mapping to OÖİKY 28.07.2026 change Md9/1-3 is not action-exact. Current RPD Regulation contains needs analysis, individual-recognition techniques, risk-map/program-evaluation inputs and cooperation duties, but V53 did not establish a current exact binding provision requiring the RPD service to continuously track the three named parent attributes as a generic standing dataset.

Decision:
- ARTICLE_VERIFIED -> WITHHELD_EXACT_PARENT_NOT_FOUND.
- Counter -1.
- Do not infer authority from broad needs-analysis/individual-recognition clauses.
- Do not convert this into a default personal-data collection obligation.
- Any future implementation must be purpose-bound, necessary and source-specific; KVKK minimization/access/retention rules apply.

## Risk-map exact chain
- RPD counsellor/psychological counsellor combines November risk-student data and builds school risk map -> Md21/4-b/3.
- Education institution principal sends school risk map to relevant RAM in November -> Md18/1-m.
- Class guidance teacher supplies the underlying class risk data -> Md23 duty chain/current official implementation evidence.

HB-0603 remains an ambiguous legacy umbrella and is not promoted whole.

## Program/e-Rehberlik exact chain
- School RPD program prepared through e-Rehberlik by first week of October -> Md21/4-b/1.
- Counsellor weekly program prepared in e-Rehberlik -> Md21/4-b/2.
- Activities entered / client-file records kept / non-electronic work filed and stored -> Md21/4-b/4.
- Program applied collaboratively and effectiveness evaluated at year end -> Md21/4-b/5.

Only canonical master rows with exact actor/action/scope may consume these provisions. Compound rows remain split-required.

## Guard added
A broad inspection checklist sentence may not be ARTICLE_VERIFIED merely because a Regulation contains adjacent concepts. Exact named data fields, actor, action, timing and scope must be supported. Sensitive/personal-data collection language receives a heightened exactness gate.