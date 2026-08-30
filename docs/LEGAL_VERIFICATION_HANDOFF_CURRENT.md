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
- broad ALL school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **16.355**
- Son batch: **V69**
- Sonraki batch: **V70**

## V69 — 410 atom
- Integrity: `docs/legal-dose-accounting-procurement-integrity-v69.md` — `24c6ccffee63361b3de297e5c865ff2a63ffd5e5`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v69.md` — `b2614fb41b6539ff058e80b161f91c2027df7010`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v69.md` — `c4a7e692bb435b671a8a32a52e7469ed956ac1dc`
- Progress: `docs/legal-verification-progress-v69-delta.json` — `907aadb4e24cc5fe4ec5befd7dc92a9f22981483`
- Support atoms: **410**; pool **15.945 -> 16.355**.
- ARTICLE_VERIFIED: **468 -> 468**, delta 0.

### V69 DÖSE accounting/procurement findings
- HB-1597: L2 current-operational exact; primary binding provision lock pending. No promotion.
- HB-1598: monthly account closing + mizan requires current binding article and atomicity lock.
- HB-1599: final trial balance/balance sheet + legacy `Maliye Bakanlığı` recipient is compound; current recipient/channel exactness required and master rewrite needed.
- HB-1600: generic `profit distribution to personnel` is semantically broader than exact production-incentive beneficiary/rate/limit/timing rules.
- HB-1601: legacy `Sosyal Hizmetler Çocuk Esirgeme payı %1`; current institution/rate/statutory chain must be proven, not inferred.
- HB-1602: Sayıştay account-file submission needs current object/recipient/channel reconciliation.
- HB-1603: procurement and sales are collapsed into one generic public-procurement sentence; split legal families before count.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1597 -> primary official Regulation provision lock.
- HB-1598..HB-1602 -> current accounting/reporting/recipient exact provisions.
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

## V70 önceliği — 300+ atom
1. Continue HB-1604+ DÖSE purchasing/sales/stock/inventory chain and identify exact current legal-family boundaries.
2. Keep searching primary official provisions for HB-1597..HB-1602; no L2-only promotion.
3. Resolve current institution/recipient/rate for HB-1601 and current Sayıştay submission object/channel for HB-1602.
4. Audit HB-1603 split against current procurement/sales authorities before any durable rewrite.
5. Retry HB-1483/HB-1484 only through official OAB/RG source.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V70** başlat; minimum **300 atom** hedefle.
