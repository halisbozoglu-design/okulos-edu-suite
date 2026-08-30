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
İkincil mevzuat/hukuk/okul siteleri exact doğrulama kaynağı değildir. Resmî rehber/el kitabı L2 destek olabilir; yönetmelik maddesinin yerine geçmez.
Yüklenmiş/eski mevzuat kopyası güncel resmî konsolide metinle çatışırsa current legal effect için resmî güncel metin esas alınır.
Yıllık teknik şartname/sözleşme tasarısı durable ulusal master parentı değildir; current-year/tenant instance üzerinde `YEAR_PARAMETER` veya legal snapshot olarak tutulur.

## Integrity guards
- `SAME_TOPIC != SAME_SCOPE`: kapsam maddesi hedef kurumu dışlıyorsa isim/konu benzerliği parent yapmaz.
- `L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED`: current MEB denetim kriteri eylemin yaşadığını kanıtlayabilir; exact bağlayıcı madde kilitlenmeden sayaç artmaz.
- Vergi/işçi/SGK gibi farklı hukuk türlerini tek master cümlesinde birleştiren kayıtlar exact olmadan önce tax-type/workforce/provision bazında ayrılır.
- Sonraki yürürlükteki oran/onay mevcut numeric uygulamayı değiştiriyorsa legacy master parametresi sessizce korunmaz; rewrite gerekir.
- broad ALL scope school-type-specific hükmü miras alamaz; compound split edilir; historical completed instances immutable; duplicate count yasaktır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **15.535**
- Son batch: **V67**
- Sonraki batch: **V68**

## V67 — 410 atom
- Integrity: `docs/legal-school-dose-accounting-integrity-v67.md` — `b37ec6c3e459e513a53c218a8fccab2e3813907a`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v67.md` — `5818cfb61264ad22d5a5a25fa9b1ea9f2d243fa0`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v67.md` — `fa63045b2ac9306a9ee631852fae1ef5a3af4c95`
- Progress: `docs/legal-verification-progress-v67-delta.json` — `1d69cd153b6b4cc8df62f578ff29f30c057b9856`
- Support atoms: **410**; pool **15.125 -> 15.535**.
- ARTICLE_VERIFIED: **468 -> 468**, delta 0.

### V67 DÖSE reconciliation
- HB-1587: technical assistant principal + accountant handover is compound; whole-row exact parent not locked. `COMPOUND_ACTOR_SPLIT + WITHHELD`.
- HB-1588: current official MEB DÖSE inspection guidance explicitly continues previous-year balance/opening accounting records and points to Döner Sermayeli İşletmeler Bütçe ve Muhasebe Yönetmeliği/HMB system, but exact binding article number was not locked. `L2_CURRENT_OPERATIONAL_EXACT + ARTICLE_NUMBER_NOT_LOCKED`.
- HB-1589: current MEB guide continues tax-declaration/timely-payment criterion, but master merges multiple tax duties. `TAX_TYPE_PROVISION_SPLIT_REQUIRED`.
- HB-1590: legacy `peşin gelir beyannamesi` terminology; current legal object/transfer mechanism must be rewritten before exact promotion.
- HB-1591/HB-1592: worker wage and SGK rows require actual workforce/employer applicability and general labour/social-security routing; not universal DÖSE-school duties.
- HB-1593: master actor list/semantics do not cleanly match current official parça-başı formulation; rewrite required.
- HB-1594: master says min %5 kâr + %25 faaliyet gideri. Current official MEB inspection guidance cites Regulation Md8/2 but notes %25 activity-expense rule is applied as **%11** after Treasury/gross-revenue transfer fell from %15 to %1 by 20.12.2018/24650793 Minister Approval. `LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED`.

### Current school-DÖSE scope
DHGM current official pages continue to expose 3423 school-DÖSE as a separate legal/operational chain, including 02.01.2026 opening/closing/accountant processes. The 2021 MEB Döner Sermaye İşletmeleri Yönetmeliği cannot be inherited into 3423 school DÖSE where its own scope excludes them.

### PDF handling note
Current MEB TKB DÖSE guide PDF was opened. Screenshot calls for relevant pages were attempted but returned cache-miss internal errors; screenshot success is not claimed.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

## Açık kritik kayıtlar
- HB-1594 -> rewrite current effective %11 activity-expense parameter/approval chain.
- HB-1593 -> current actor-list semantics rewrite.
- HB-1590 -> legacy peşin-gelir terminology/current legal-object resolution.
- HB-1587/HB-1588/HB-1589 -> exact binding provision decomposition.
- HB-1585 -> split technical assistant principal vs accountant legal chain.
- HB-1586 -> current exact school-DÖSE kefalet parent unresolved.
- HB-1574 -> current 2026-2027 technical-spec exact clause remains year-specific/recheck.
- HB-1575 -> current-year operational/YEAR_PARAMETER; durable parent unresolved.
- HB-1579..1584 -> project/contract/program dependent.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1655..1665 and HB-1645..1647/HB-1667 -> school-type split publication staging.
- HB-1666 -> universal duty-book authority unresolved.
- HB-2138/HB-2139 -> semantics rewrite/split.
- HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 -> existing unresolved exact-parent/split chains.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope.

## V68 önceliği — 300+ atom
1. Continue HB-1595 onward school-DÖSE production/profit/inventory/sales rows using current official 3423 + OÖKY + current incentive/parça-başı regulation + DHGM/TKB evidence.
2. Search current official exact provisions for HB-1594 parameter chain and determine publishable rewrite semantics.
3. Resolve HB-1590 peşin-gelir terminology against current gross-revenue/Treasury transfer mechanism.
4. Continue HB-1587/1588 exact binding article search; do not promote from inspection guide alone.
5. Retry HB-1483/HB-1484 official OAB source only when official current provision is accessible.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V68** başlat; minimum **300 atom** hedefle.
