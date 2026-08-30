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

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact: **1.762**
- Atom havuzu: **14.305**
- Son batch: **V64**
- Sonraki batch: **V65**

## V64 — 410 atom
- Integrity: `docs/legal-official-current-vs-stale-transport-duty-integrity-v64.md` — `07295d722da3f64c7a74812992bb8ca0d755a841`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v64.md` — `4e4f513bf9314d80ccc985772d4e1afef0c2b40a`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v64.md` — `7bb35cb523296838a65cfa3b545db182c172ec40`
- Progress: `docs/legal-verification-progress-v64-delta.json` — `79431c6ebe7e3a6ae13b1b5fa24ede15499a1ed3`
- Support atoms: **410**; pool **13.895 -> 14.305**.
- ARTICLE_VERIFIED: **467 -> 467** (+1 / -1).

### V64 current-vs-stale guard
File Library contained older OÖKY copies with older Md91 wording. Current official MEB `1657.pdf` currently serves the applicable text and controls current effect. Current official OÖİKY `1703.pdf` is separately scoped. `CURRENT_OFFICIAL_CONSOLIDATED_OVERRIDES_STALE_UPLOADED_COPY` added as an integrity rule.

### V64 duplicate search
No clean pre-existing school-type-specific durable sibling was established for HB-1655..HB-1665. The search returned the same broad ALL master rows/derivative copies. Therefore these require existing-master scope rewrite/split + SA approval/publish; no duplicate promotion/new ID shortcut.

### V64 promotion
`HB-1576` -> current official MEB `Okul Servis Araçlarının Çalıştırılmasına İlişkin Usul ve Esaslar` (`1959.pdf`) Md5/1-d. Door may be automatic/driver-operated or manually/mechanically driver-controlled; automatic-door status signal condition preserved. Delta +1.

### V64 rollback
`HB-1574` had been counted from the 2025-2026 annual İlk-Ortaöğretim Taşıma Teknik Şartname clause 2.3. DHGM's official current page now publishes a 2026-2027 technical specification. The current-year link is an official DOCX but could not be parsed by the web reader in this pass, so the 2025-2026 annual source alone cannot satisfy current exact effect. Status `ROLLBACK_ARTICLE_VERIFIED + YEAR_PARAMETER_CURRENT_CLAUSE_RECHECK`. Delta -1. Historical 2025-2026 instances immutable.

### V64 withheld/retained
- HB-1575 fire extinguisher: `1959.pdf` Md5/1-ç references required vehicle equipment, but exact named extinguisher child provision not locked. WITHHELD.
- HB-1577: current 2024 Transport Regulation Md13/1-ğ retained, delta 0.
- HB-1666: transport-specific duty-book/tutanak semantics do not create universal duty-book workflow; withheld.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- newer RG/current official consolidated text controls over stale uploaded copies;
- annual source must be current-year or durable-parent exact; expired annual child cannot prove current exact effect;
- broad ALL scope school-type-specific hükmü miras alamaz;
- similar duty is not exact where timing/condition/actor differs;
- compound split edilir;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1574 -> 2026-2027 official technical-spec clause recheck; no secondary fallback.
- HB-1575 -> exact fire-extinguisher authority chain.
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

## V65 önceliği — 300+ atom
1. Resolve current 2026-2027 official transport technical DOCX contents through official MEB paths/search; re-promote HB-1574 only if exact clause confirmed.
2. Audit HB-1575 and vehicle-equipment rows through current official Okul Servis Araçları/traffic regulatory chain.
3. Continue HB-1578 onward transport-contract/document-retention rows against current 2024 Transport Regulation and official MEB procurement documents.
4. Retry HB-1483/HB-1484 official OAB source only.
5. Continue HB-1655..1665/HB-1645..1647/HB-1667 school-type staging.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V65** başlat; minimum **300 atom** hedefle.
