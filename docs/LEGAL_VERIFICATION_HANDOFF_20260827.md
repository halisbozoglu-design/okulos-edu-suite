# Okulos Legal Verification — Conversation Handoff

Date: 2026-08-27
Repository: halisbozoglu-design/okulos-edu-suite
Mode: ARTICLE_VERIFIED_PRIORITY
Migration policy: keep migrations at 0 unless structurally unavoidable.

## Current canonical working state
- Master workflow total: 2,229
- ARTICLE_VERIFIED: 453
- Verification ratio: 20.32%
- Remaining exact verification: 1,776
- Large atom pool: 4,155
- Latest completed batch: V36
- Latest progress file: docs/legal-verification-progress-v36-delta.json
- Latest verification file: docs/legal-article-verified-batch-v36.md
- Latest coverage file: docs/legal-article-verified-focused-deepening-batch-100plus-v36.md
- V36 coverage commit: f30bc4f2e261bf37bc72db12dcf0b88c72c1279e
- V36 verification commit: d028010fb7988d84d6544a3de2ed2e63582068ea
- V36 progress commit: 2a3f4ec5faead29c0d3b85688ff96c6dbdf7f378

## Working rule
ARTICLE_VERIFIED must increase only when all three are exact:
1. durable master workflow_id,
2. current official source,
3. exact article/paragraph supporting the same operational entity/action.

Never double-count an already verified workflow. Never promote a row merely because handbook wording is similar. Old/mülga sources and legacy month/hour hardcodings are withheld until reconciled.

## Source hierarchy
Law / Presidential Decree > current Regulation > Directive/Procedure > Circular > annual guide > annual calendar > province/district letter > handbook/guidance.
Handbooks are discovery/support only, never final authority.

## Current direction
Do not open new legal families unless required. Prioritize conversion of existing master workflows into exact ARTICLE_VERIFIED bindings.
Continue producing >=100 support atoms per batch where useful, but verification quality is the primary metric.

## Immediate next batch — V37
Focus:
- BILSEM boards/commissions,
- special talent identification/exam commissions,
- special education commissions,
- remaining OOKY/MTAL named commissions,
- other high-confidence master rows already covered by existing atom pool.

Candidate handling:
- exact name + scope + article = ARTICLE_VERIFIED,
- name/scope mismatch = WITHHELD,
- compound row = SPLIT candidate,
- legacy timing not present in current law = WITHHELD / parameterize timing,
- already verified = DUPLICATE_GUARD.

Recommended V37 files:
- docs/legal-article-verified-focused-deepening-batch-100plus-v37.md
- docs/legal-article-verified-batch-v37.md
- docs/legal-verification-progress-v37-delta.json

## Important known guards / unresolved items
- V11 BOARD-001..030 came from old https://mevzuat.meb.gov.tr/dosyalar/716.pdf and must not be treated as current authority. Current boarding regulation family is the 25/11/2016 RG 29899 framework and later amendments.
- HB-0465: IYEP + child club combined in one row; split required.
- HB-0431: OAB general assembly + management/audit organs combined; split preferred.
- HB-0716: legacy January timing conflicts with current term-based OAB disclosure rule.
- HB-2222: HEM board title does not one-to-one match current organ names.
- HB-2229: Okul Sagligi Yonetim Ekibi exact current statutory formation clause unresolved.
- RAM rows with fixed 'every day 13:30' timing are institutional/handbook timing unless current legal text proves otherwise.
- HB-2204: AÖIHL face-to-face equivalency commission title does not exactly match 2024 Open Education Regulation Md25/2-a MAOL equivalency commission scope.
- HB-2205: 'Alan/Dal Kontenjan Belirleme Komisyonu' naming is broader/different from current OOKY quota commission wording; do not verify by inference.
- HB-2206: coordinator teacher-related commission requires exact current article binding.
- HB-2209 was verified in V36 under OOKY Md84/B/3.
- HB-2201 was verified in V35 under current boarding/scholarship regulation Md8/1-2.

## Recent verification milestones
- V32: 430 -> 435
- V33: 435 -> 446
- V34: 446 -> 451
- V35: 451 -> 452
- V36: 452 -> 453

## Final audit is still deferred
After broad exact verification, run one global audit over all 2,229 workflows with labels:
- DOGRU
- EKSIK
- ESKI KAYNAK
- CAKISMA
- YANLIS MADDE
- TAMAM

Also perform:
- global duplicate audit,
- repealed/outdated source audit,
- missing legal-family audit,
- source conflict reconciliation,
- canonical progress consolidation.

## New conversation startup instruction
In a new conversation, user can say:

"Okulos projesindeki docs/LEGAL_VERIFICATION_HANDOFF_20260827.md dosyasini oku. Sadece halisbozoglu-design/okulos-edu-suite reposunda calis. V36'dan sonra V37 olarak kaldigimiz yerden ARTICLE_VERIFIED_PRIORITY modunda devam et. Once mevcut progress dosyasini kontrol et, sonra en az 100 destek atomu ve exact workflow_id + guncel resmi kaynak + madde/fikra ile guvenli ARTICLE_VERIFIED artisi yap. Migrations 0 kalsin."

The next assistant should first read this handoff and the latest V36 progress file before writing anything.
