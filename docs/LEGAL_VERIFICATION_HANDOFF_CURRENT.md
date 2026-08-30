# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
ARTICLE_VERIFIED için yalnız:
- `mevzuat.gov.tr`
- `mevzuat.meb.gov.tr`
- `meb.gov.tr` ve resmî MEB birimleri
- `resmigazete.gov.tr`
İkincil mevzuat/hukuk/okul siteleri exact doğrulama kaynağı değildir. Resmî rehber/el kitabı L2 destek olabilir; primary exact provision'ın yerine geçmez.

## Integrity guards
- `SAME_TOPIC != SAME_SCOPE`.
- `L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED`.
- `CURRENT_GUIDE_CAN_CONFIRM_OPERATION_BUT_NOT_REPLACE_PRIMARY_PROVISION`.
- `COMPOUND_PERCENTAGE_RULES_SPLIT_BEFORE_COUNT`.
- `LEGACY_INSTITUTION_NAME_OR_RECIPIENT_REQUIRES_CURRENT_RECIPIENT_RECHECK`.
- Güncel resmî konsolide metin stale uploaded copy'yi current effect bakımından geçersiz kılar.
- Yıllık teknik şartname/sözleşme durable ulusal parent değildir; YEAR_PARAMETER/legal snapshot olur.
- broad ALL school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **15.945**
- Son batch: **V68**
- Sonraki batch: **V69**

## V68 — 410 atom
- Integrity: `docs/legal-dose-production-profit-integrity-v68.md` — `9ac88a82dfd943c7394c04d705fcb88c0217a977`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v68.md` — `69dafe1160074dae3e1601e7de9a69ade1bc51d8`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v68.md` — `00c041786805f31b656ea1bac62e2bddbbff87cb`
- Progress: `docs/legal-verification-progress-v68-delta.json` — `9e37bd0dd658bc187ae58f42c77c05ddb7a13dd0`
- Support atoms: **410**; pool **15.535 -> 15.945**.
- ARTICLE_VERIFIED: **468 -> 468**, delta 0.

### V68 DÖSE production/profit findings
- `HB-1594`: master `%5 kâr + %25 faaliyet gideri`; current MEB TKB operational evidence notes `%25` is implemented as **%11** under 20.12.2018 / 24650793 Minister Approval. `LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED`. Publishable durable wording should carry a current legal parameter/snapshot rather than hard-code stale %25.
- `HB-1595`: compound. Current operational source confirms personnel labour amount share of at least %30 for student right under cited Md8/3; master `asgari ücretin 1/3'ünden az olmama` clause is not exact same current parça-başı rule. `COMPOUND + PARTIAL_CURRENT_EXACT + SECOND_CLAUSE_PARENT_RECHECK`.
- `HB-1596`: current role-specific monthly parça-başı limits are differentiated (education-teaching 2 monthly minimum wages, technical 1.5, other services 1). Master broad `diğer personel için yasal sınır` loses actor/limit atoms. `ATOMIC_ROLE_LIMIT_SPLIT_REQUIRED`.
- `HB-1597`: current 09.10.2025 MEB TKB DÖSE guidance operationally matches year-end balance profit incentive rule and points to Regulation Md4, but strict gate still requires primary official provision lock. `L2_CURRENT_EXACT + PRIMARY_PROVISION_LOCK_PENDING`.
- `HB-1598..HB-1602`: monthly/year-end accounting, profit distribution and legacy recipient/institution names require current recipient and exact primary-provision reconciliation. No silent rename.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1597 -> primary official Regulation Md4 lock.
- HB-1598 -> monthly account closing/mizan exact current provision.
- HB-1599 -> year-end final trial balance/balance sheet and current recipient; legacy `Maliye Bakanlığına gönderme` recheck.
- HB-1600 -> profit distribution actor/limit/current parent.
- HB-1601 -> legacy `Sosyal Hizmetler Çocuk Esirgeme payı %1` current institution/legal status recheck.
- HB-1602 -> Sayıştay idare hesabı file current recipient/process/current accounting law recheck.
- HB-1594 -> %11 current parameter chain/master rewrite.
- HB-1595/HB-1596 -> atomic split/rewrite.
- HB-1590 -> legacy peşin-gelir terminology/current legal-object resolution.
- HB-1587/HB-1588/HB-1589 -> exact binding provision decomposition.
- HB-1585/HB-1586 -> technical assistant-principal/accountant split and surety parent.
- HB-1574/HB-1575 -> current-year transport/durable parent backlog.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1655..1665 and HB-1645..1647/HB-1667 -> school-type split publication staging.
- HB-1666 -> universal duty-book authority unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 -> existing semantics/split/exact-parent chains.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope.

## V69 önceliği — 300+ atom
1. Resolve `HB-1597` primary official provision, then audit `HB-1598..HB-1602` current accounting/reporting recipients and exact primary provisions.
2. Continue `HB-1603+` DÖSE inventory/sales/current-school-revolving rows using only current official 3423/OÖKY/current applicable regulation/official MEB sources.
3. Do not inherit the 2021 MEB Döner Sermaye İşletmeleri Yönetmeliği into 3423 school DÖSE where scope excludes it.
4. Preserve %11 as legal parameter/snapshot until exact primary approval/publication chain permits durable master rewrite.
5. Retry HB-1483/HB-1484 only through official OAB/RG source.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V69** başlat; minimum **300 atom** hedefle.
