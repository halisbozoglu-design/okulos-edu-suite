# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — V61 sonrası zorunlu
ARTICLE_VERIFIED için yalnız projece kabul edilen resmî kaynaklar kullanılacaktır:
- `mevzuat.gov.tr`
- `mevzuat.meb.gov.tr`
- `meb.gov.tr` ve Bakanlığın resmî genel müdürlük/başkanlık alt alanları
- `resmigazete.gov.tr`
İkincil mevzuat siteleri, okul sitesi kopyaları ve hukuk agregatörleri exact doğrulama kaynağı değildir. Resmî el kitabı/denetim rehberi ancak L2 operasyonel destek olabilir; yönetmelik maddesinin yerine geçmez.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **13.075**
- Son tamamlanan batch: **V61**
- Sonraki batch: **V62**

## V61 — 420 atom
- Official-source integrity: `docs/legal-official-source-integrity-v61.md` — `41b67f9eb0a1baf43d6abba27a773e5dedbaf292`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v61.md` — `a354bdaaf265293f34b6d9b643861ead80c87eb8`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v61.md` — `f9d6a17ac4e00feab948e0e420115619b10db034`
- Progress: `docs/legal-verification-progress-v61-delta.json` — `200e12d25c1b2e9b884743c13347809cc740f6d7`
- Support atoms: **420**; pool **12.655 -> 13.075**.
- ARTICLE_VERIFIED: **467 -> 467** (+1 / -1).

### V61 new exact
`HB-1570` — taşımalı gelen öğrencilerin geliş ve gidiş saatine göre ders programının düzenlenmesi.
Official current source: Resmî Gazete 01.08.2024 / 32619, Taşıma Yoluyla Eğitime Erişim Yönetmeliği Md13/1-ç.
Delta +1.

### V61 rollback
`HB-1667` — öğle nöbetinin nöbetçi müdür yardımcısı ve öğretmenlerin temel ihtiyaçları gözetilerek dönüşümlü/dengeli düzenlenmesi.
Batch02 source OÖİKY Md90/2 was unrelated. Secondary-school exact semantics live in OÖKY Md91/2-i (RG 08.09.2023 amendment); primary/lower-secondary has a separate OÖİKY Md44 duty regime. Durable ALL scope cannot be treated as one universal exact provision.
Status: `ROLLBACK_ARTICLE_VERIFIED + SCHOOL_TYPE_SPLIT_REQUIRED`.
Delta -1.

### V61 retained
- HB-1571 -> current transport Md13/1-e.
- HB-1572 -> current transport Md13/1-h.
- HB-1577 -> current transport Md13/1-ğ.

### V61 official-source holds
- HB-1483 / HB-1484: MEB 2024/35 confirms current OAB regulatory framework and 2023 amendment, but official regulation PDF endpoint was unavailable in this pass. Exact article promotion is withheld; no fallback to secondary domains.

## Existing critical guards
`workflow_id + current official/current-valid binding source + exact provision + actor/action/object/recipient/timing/system/applicability + legal connector semantics`

Mandatory gate:
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Additional guards:
- newer Resmî Gazete amendment controls over stale consolidated text;
- official hosting alone does not prove current effect;
- broad ALL scope cannot silently inherit a school-type-specific provision;
- handbook/manual cannot replace an exact regulation provision;
- compound workflows split before count;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1483/HB-1484 -> retry current official OAB exact provisions only.
- HB-1645 -> V60 rollback/school-type split.
- HB-1646/HB-1647 -> OÖKY exact text but applicability publication pending.
- HB-1667 -> V61 rollback/school-type split.
- HB-2138 -> exact semantics rewrite.
- HB-2139 -> split children staged.
- HB-2045 -> school-type reporting split.
- HB-2052 -> repealed 2006/26 rewrite.
- HB-2053 -> support-room multi-provision candidate.
- HB-0602 -> RAM-side current binding parent unresolved; annulled RAM Directive forbidden.
- HB-0603 -> atomic children staged.
- HB-0138/HB-0395 -> L2 only.
- HB-2218/HB-2229 -> School Health scope.
- HB-2227 -> RAM named authority unresolved.
- HB-2222 -> HEM title mismatch.
- HB-2212 -> BİLSEM current directive organ mismatch.

## V62 önceliği — 300+ atom
1. Retry HB-1483 onward using only official OAB Regulation/Resmî Gazete/MEB sources; if exact current article remains inaccessible, keep WITHHELD.
2. Continue HB-1573 onward against current transport Md13 actor/action chain; search uncounted durable exact matches before NEW IDs.
3. Split HB-1667 by OÖKY vs OÖİKY current duty regime; preserve historical instances.
4. Audit HB-1655-HB-1666 neighboring duty rows solely against official current OÖKY/OÖİKY and later amendment chains.
5. Continue HB-1646/HB-1647 school-type correction.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V62** başlat; minimum **300 atom** hedefle.
