# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, `meb.gov.tr` resmî birimleri ve `resmigazete.gov.tr`. Resmî MEB rehberi L2 operational evidence olabilir; primary exact provision yerine geçmez.

## Integrity guards
- SAME_TOPIC != SAME_SCOPE.
- L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED.
- CURRENT_GUIDE_CAN_CONFIRM_OPERATION_BUT_NOT_REPLACE_PRIMARY_PROVISION.
- LEGACY_INSTITUTION_NAME_OR_RECIPIENT_REQUIRES_CURRENT_RECIPIENT_RECHECK.
- ACCOUNTING_REPORT_OBJECT_AND_SUBMISSION_CHANNEL_ARE_EXACTNESS_FIELDS.
- PROCUREMENT_AND_SALES_MUST_NOT_BE_COLLAPSED_UNDER_ONE_GENERIC_IHALE_PARENT.
- PROFIT_DISTRIBUTION_REQUIRES_BENEFICIARY_RATE_LIMIT_TIMING_EXACTNESS.
- SYSTEM_NAME_MATCH_REQUIRES_FUNCTION_MATCH.
- EMPLOYEE_SHARE_AND_EMPLOYER_SHARE_ARE_NOT_SAME_DEDUCTION.
- LEGACY_SEND_RECIPIENT_CANNOT_SURVIVE_CURRENT_RETAIN_ON_REQUEST_RULE.
- SECTION_BOUNDARY_STOPS_DOMAIN_DRIFT.
- broad ALL school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **16.765**
- Son batch: **V70**
- Sonraki batch: **V71**

## V70 — 410 atom
- Integrity: `docs/legal-dose-ekap-bkmys-sgk-integrity-v70.md` — `90f3c4254f7c0a29a0961dae138b08b2be50c1af`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v70.md` — `d649fe12c71e7a26dcdeede183d2455579202a1e`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v70.md` — `5b8f468ea99f84607c39c3e75ca582c72cb5a0da`
- Progress: `docs/legal-verification-progress-v70-delta.json` — `cee50f36a67e97d139e6cf9e2b437a11602ba65e`
- Support atoms: **410**; pool **16.355 -> 16.765**.
- ARTICLE_VERIFIED: **468 -> 468**, delta 0.

### V70 DÖSE closure findings
- DÖSE source section ends at `HB-1608`; `HB-1609` starts Strategic Planning. Batch stops at the legal-family boundary.
- `HB-1604`: current MEB operational evidence confirms EKAP routing for procurement/direct procurement/contract processes from 01.08.2025, but master `record numbers obtained` atom is not primary-locked. No promotion.
- `HB-1605`: current DHGM still identifies DMİS for budget/additional-budget approval while current TKB records financial/accounting transaction migration to BKMYBS. Budget approval and accounting-entry functions must be routed separately.
- `HB-1606`: master incorrectly says worker and employer SGK shares are both deducted from piece-rate pay. 5510 Md80/86 semantics require insured-share deduction plus employer-share addition/tahakkuk/payment. `CONNECTOR_SEMANTIC_MISMATCH + MASTER_REWRITE_REQUIRED`.
- `HB-1607`: tax-base statement requires role, exemption and withholding decomposition before exact promotion.
- `HB-1608`: broad `DÖSE records regularly entered into DMİS` is legacy/overbroad after 2024 BKMYBS migration of financial/accounting operations. `LEGACY_SYSTEM_OBJECT + MASTER_REWRITE_REQUIRED + FUNCTION_LEVEL_SYSTEM_ROUTING`.
- Current TKB criteria also reinforce that monthly trial balance/year-end balance and year-end administration-account/Sayıştay documents are retained at institution and supplied on request rather than routinely sent to the legacy recipient. This strengthens HB-1599/HB-1602 rewrite status.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1604 -> primary electronic-procurement provision + record-number atom.
- HB-1605 -> exact budget-approval primary provision and DMİS/BKMYBS function split.
- HB-1606 -> SGK share semantics rewrite.
- HB-1607 -> tax-base role/exemption split.
- HB-1608 -> DMİS/BKMYBS current-system rewrite.
- HB-1597 -> primary official Regulation provision lock.
- HB-1598..HB-1602 -> current accounting/reporting/recipient exact provisions; HB-1599/HB-1602 legacy send semantics require rewrite.
- HB-1603 -> procurement-vs-sales split.
- HB-1594 -> %11 current parameter chain/master rewrite.
- HB-1595/HB-1596 -> atomic split/rewrite.
- HB-1590 -> legacy peşin-gelir terminology/current legal-object resolution.
- HB-1587/HB-1588/HB-1589 -> exact binding provision decomposition.
- HB-1585/HB-1586 -> actor split and surety parent.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1655..1665, HB-1645..1647/HB-1667 -> school-type split publication staging.
- HB-1666 -> universal duty-book authority unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 -> existing semantics/split/exact-parent chains.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope.

## V71 önceliği — 300+ atom
1. Start Strategic Planning at `HB-1609+` only after exact master extraction; do not inherit DÖSE legal family.
2. Audit current MEB strategic planning organ names, school-level applicability, planning period and approval/reporting chain using only official sources.
3. Distinguish Ministry/central-unit strategic-plan organs from school-level teams; similar names are not interchangeable.
4. Continue primary-source backlog for HB-1604..1608 only when exact official provisions are reachable; no L2-only promotion.
5. Retry HB-1483/HB-1484 only through official OAB/RG source if room.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V71** başlat; minimum **300 atom** hedefle.
