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
Yıllık teknik şartname/sözleşme tasarısı durable ulusal master parentı değildir; current-year/tenant instance üzerinde `YEAR_PARAMETER` veya legal snapshot olarak tutulur. Durable ARTICLE_VERIFIED için current regulation/directive-level exact parent gerekir.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **14.715**
- Son batch: **V65**
- Sonraki batch: **V66**

## V65 — 410 atom
- Integrity: `docs/legal-transport-contract-integrity-v65.md` — `bd70d18f8d71308c9f44ce9448f62a3c9740984e`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v65.md` — `560b215bb6ee2e520361e4b4adb49e6d2733bd3a`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v65.md` — `c86d643dab375fddddd1a9d72db956013db7dbad`
- Progress: `docs/legal-verification-progress-v65-delta.json` — `9ff1612b39444063cf7d628486b96f34d71f4448`
- Support atoms: **410**; pool **14.305 -> 14.715**.
- ARTICLE_VERIFIED: **467 -> 468** (+1).

### V65 promotion
`HB-1578` — `Taşıma uygulaması kapsamında yapılan taşıma ihale sözleşmelerinin bir örneği okulda bulunmaktadır.`
Current exact official parent: MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği, RG 01.08.2024 / 32619.
- Md16/2-ç: ihale sözleşmelerinin bir örneği ilgili taşıma merkezi okul/kurum müdürlüklerine gönderilir.
- Md18/1-d: sözleşmelerin onaylı nüshası ilgili taşıma merkezi okul/kurum müdürlüklerine gönderilir.
Master durable ID, actor/action/object/recipient exact. Önceki verified setlerde HB-1578 bulunmadı.
Delta +1.

### V65 fire-extinguisher result
`HB-1575` master: servis aracında kullanılabilir durumda yangın söndürme tüpü.
Current official DHGM evidence:
- Okul müdürü araç denetim formu: bakımlı ve son kullanma tarihi geçmemiş yangın söndürme tüpü kontrolü; source field Teknik Şartname.
- 2026-2027 İlk-Ortaöğretim Taşıma İhaleleri Örnek Sözleşme Tasarısı special violation row 22: minibüste 1x2 kg; <=26 kişilik otobüste 2x2 kg; >26 kişilik otobüste 2x6 kg yangın söndürme cihazı.
Status: `CURRENT_YEAR_EXACT_OPERATIONAL + YEAR_PARAMETER`; durable ARTICLE_VERIFIED yok. Teknik şartname DOCX web parser tarafından doğrudan okunamadı.

### V65 retained
- HB-1576 V64 exact korunur.
- HB-1577 current Transport Regulation Md13/1-ğ exact; Batch08'de zaten sayılmış, duplicate delta 0.

### Document handling note
Current DHGM page updated 30.07.2026 and publishes 2026-2027 technical specification, administrative specification and contract template. Contract PDF was readable. Technical specification DOCX returned unsupported content type in web reader. PDF screenshot attempts for the contract/inspection-form views returned internal errors; screenshot success is not claimed.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- newer RG/current official consolidated text controls over stale uploaded copies;
- annual source must be current-year and stays year-specific unless durable current parent exists;
- annual technical spec/contract template cannot universalize a durable master workflow;
- broad ALL scope school-type-specific hükmü miras alamaz;
- similar duty is not exact where timing/condition/actor differs;
- compound split edilir;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1574 -> current 2026-2027 technical-spec exact clause still unparsed; remains rolled back/current-year recheck.
- HB-1575 -> current-year exact operational/YEAR_PARAMETER; durable statutory parent unresolved.
- HB-1655..1665 -> school-type durable profile publication pending; no sibling reuse found V64.
- HB-1666 -> universal duty-book authority unresolved.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1645/HB-1646/HB-1647/HB-1667 -> school-type correction staging.
- HB-2138 -> exact semantics rewrite.
- HB-2139 -> split children staged.
- HB-2045 -> school-type reporting split.
- HB-2052 -> repealed 2006/26 rewrite.
- HB-2053 -> support-room atomicity.
- HB-0602 -> RAM-side binding parent unresolved; annulled RAM Directive forbidden.
- HB-0603 -> atomic children staged.
- HB-0138/HB-0395 -> L2 only.
- HB-2218/HB-2229 -> School Health scope.

## V66 önceliği — 300+ atom
1. Continue after HB-1578 into project-resource rows, but first complete transport side-source corrections and search any remaining HB-157x service rows/duplicates.
2. Retry HB-1574 via official 2026-2027 technical-spec text only; no prior-year substitution.
3. Search durable official parent for HB-1575 fire-extinguisher equipment; if only annual contract layer remains, keep YEAR_PARAMETER.
4. Retry HB-1483/HB-1484 using official OAB/RG source only.
5. Continue HB-1655..1665/HB-1645..1647/HB-1667 school-type staging.
6. Continue HB-2053/HB-2045/HB-0602 exact-parent chains.
7. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V66** başlat; minimum **300 atom** hedefle.
