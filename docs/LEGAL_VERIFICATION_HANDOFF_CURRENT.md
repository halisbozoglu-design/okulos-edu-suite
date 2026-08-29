# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
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
- Büyük atomik mevzuat havuzu: **13.485**
- Son tamamlanan batch: **V62**
- Sonraki batch: **V63**

## V62 — 410 atom
- Integrity: `docs/legal-official-source-oab-transport-duty-integrity-v62.md` — `8bf687672188b3dce7da2bfd5c95e31bdcec048d`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v62.md` — `6f6afb3fa24d7688e7ee3ce2ecc7a29e4c86cc98`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v62.md` — `1c5dd1b17c52fc6fcec325cc31a2e8265cc023e4`
- Progress: `docs/legal-verification-progress-v62-delta.json` — `6bbeea261874dbf3d2bc346aec01ff75663e8492`
- Support atoms: **410**; pool **13.075 -> 13.485**.
- ARTICLE_VERIFIED: **467 -> 467**, delta 0.

### V62 key finding — HB-1659
Master says pregnancy duty exemption is 12 weeks before birth and **two years after birth**. Current official OÖKY Md91/2-ç says **one year after birth**; current official OÖİKY Md44/7 also says **one year**. Status: `LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED`. No silent source substitution.

### V62 school-type duty profile
HB-1655, HB-1656, HB-1657, HB-1658, HB-1661, HB-1662 and HB-1664 have strong current OÖKY Md91 counterparts. However their durable metadata is broad `ALL`; OÖİKY Md44 has different timing and condition parameters. Status: `SCHOOL_TYPE_SCOPE_SPLIT_REQUIRED`, no promotion under ALL scope.

### V62 withheld
- HB-1660 -> request/need semantics and school-type split required.
- HB-1665 -> special-education/anaokulu applicability needs atomic resolution.
- HB-1666 -> `Nöbet defteri tutulmaktadır`; exact current parent not established from Md91/Md44.
- HB-1573 -> punctual school-bus arrival is operationally plausible but exact current school-side parent not locked; no inference from generic service compliance.
- HB-1483/HB-1484 -> official MEB OAB regulation PDF endpoint still failed in this pass; no secondary fallback, remain withheld.

## Existing critical guards
`workflow_id + current official/current-valid binding source + exact provision + actor/action/object/recipient/timing/system/applicability + legal connector semantics`

Mandatory gate:
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Additional guards:
- newer Resmî Gazete amendment controls over stale consolidated text;
- official hosting alone does not prove current effect;
- broad ALL scope cannot silently inherit a school-type-specific provision;
- similar duties across school types are not interchangeable when timing/conditions differ;
- handbook/manual cannot replace exact regulation provision;
- compound workflows split before count;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1659 -> rewrite two years to current one-year rule with school-type publication.
- HB-1655..HB-1665 -> school-type duty-profile split/reconciliation.
- HB-1666 -> current exact duty-book authority unresolved.
- HB-1573 -> current exact punctual-arrival parent unresolved.
- HB-1483/HB-1484 -> official OAB exact retry only.
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

## V63 önceliği — 300+ atom
1. Resolve HB-1655..HB-1665 into explicit OÖKY/OÖİKY profiles; identify any existing durable school-type-specific counterparts before NEW IDs.
2. Search current official source for HB-1666 duty-book requirement; do not infer.
3. Retry HB-1483/HB-1484 from official OAB source/Resmî Gazete only.
4. Continue HB-1573+ transport exact-parent audit using only official sources.
5. Continue HB-1646/HB-1647 and HB-1667 school-type correction staging.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V63** başlat; minimum **300 atom** hedefle.
