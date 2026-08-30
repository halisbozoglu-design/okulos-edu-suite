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

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact: **1.762**
- Atom havuzu: **13.895**
- Son batch: **V63**
- Sonraki batch: **V64**

## V63 — 410 atom
- Integrity: `docs/legal-duty-schooltype-integrity-v63.md` — `0856c02d2b97b32f407795eb4e42a35991684ce1`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v63.md` — `81e09b370da1f8c8bd6dba9f6a65897ded7605b4`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v63.md` — `0e785ce904eaf303e69d2148ab478387f57c752d`
- Progress: `docs/legal-verification-progress-v63-delta.json` — `642f0b1dea1e117f4320f2885376d836c0e0099b`
- Support atoms: **410**; pool **13.485 -> 13.895**.
- ARTICLE_VERIFIED: **467 -> 467**, delta 0.

### V63 exact school-type profile findings
- HB-1655: OÖKY Md91/1 + OÖİKY Md44/4; broad ALL publish yok.
- HB-1656: OÖKY Md91/2-a secondary-only semantics; OÖİKY Md44 eş hüküm yok.
- HB-1657: OÖKY `kadrosunun bulunduğu okul`; OÖİKY `aylığını aldığı okul`; split.
- HB-1658: OÖKY default 15 dk; OÖİKY default 30 dk, kurul kararıyla en az 15 dk; split/rewrite.
- HB-1659: legacy 2 yıl yanlış; current postpartum **1 yıl**. OÖKY prenatal 12 hafta, OÖİKY prenatal 3 ay.
- HB-1660: OÖKY `istek + muaf tutulabilir`; OÖİKY `yeterli öğretmen varsa verilmez, ihtiyaçta verilebilir`; split.
- HB-1661: her iki ailede kurul + yazılı duyuru; OÖİKY ayrıca nöbetçi öğretmen görev talimatnamesi ister.
- HB-1662: iki ailede de özürsüz nöbet = özürsüz ders işlemi; broad ALL yine universalize edilmez.
- HB-1663: OÖKY engelli öğretmen + engelli çocuk; OÖİKY yalnız engelli çocuk tercihi.
- HB-1664: OÖKY Md91/2-h exact; OÖİKY Md44 eş hüküm bulunmadı.
- HB-1665: legacy compound yanlış; OÖKY özel eğitim öğretmeni nöbetten muaf, OÖİKY okul öncesi öğretmeni kendi devresinde/etkinlik dışı nöbet.
- HB-1666: genel `nöbet defteri tutulur` current parent bulunmadı. Taşıma Yönetmeliği Md13/4-h yalnız taşıma sorunlarının nöbet defterine veya tutanağa kaydını düzenler; universal görev oluşturmaz.

### V63 retained
`HB-1573` -> official MEB `Okul Servis Araçlarının Çalıştırılmasına İlişkin Usul ve Esaslar`, EK-1 Tip Şartname Md3/1-a: öğrenci okul açılışından 15 dk önce bırakılır, kapanıştan 15 dk sonra alınır. ARTICLE_VERIFIED retained, delta 0.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- newer RG amendment controls;
- broad ALL scope school-type-specific hükmü miras alamaz;
- benzer görev exact değildir, timing/condition/actor farkı korunur;
- compound split edilir;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1655..1665 -> school-type durable child/profile publication pending.
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

## V64 önceliği — 300+ atom
1. Search master for existing school-type-specific durable equivalents of HB-1655..1665 before NEW child IDs.
2. Audit HB-1574 onward current transport duties against 2024 RG Md13 and official MEB 1959/annual technical sources; correct year-parameter rows.
3. Retry HB-1483/HB-1484 only through official OAB/RG source.
4. Continue HB-1645..1647 and HB-1667 split staging.
5. Continue unresolved HB-2053/HB-2045/HB-0602.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V64** başlat; minimum **300 atom** hedefle.
