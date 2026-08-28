# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-28
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **459 / 2.229 = %20,5922**
- Kalan exact doğrulama: **1.770**
- Büyük atomik mevzuat havuzu: **4.635**
- Son tamamlanan batch: **V40**
- Sonraki batch: **V41**

## V39
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v39.md`
  - commit `c0c2088b4bdc2a9ca242657d59638d5f209f0795`
- Verification: `docs/legal-article-verified-batch-v39.md`
  - commit `945049b4911e9c952ded90e76830750806fdbfe1`
- Progress: `docs/legal-verification-progress-v39-delta.json`
  - commit `ce1dbe50e6fb6aa82578da97604318d17be74728`
- Result: **457/2229**, atom pool **4.515**.

## V40
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v40.md`
  - commit `1fba05ac2733be8ac1c083f86b467817f837a196`
- Verification: `docs/legal-article-verified-batch-v40.md`
  - commit `55c162b5fe3288f53852db1e6d2d07961ec2dfe6`
- Progress: `docs/legal-verification-progress-v40-delta.json`
  - commit `0bc4696fcf74ee309f8c928165f9bc2a1d803ab8`
- 120 support atoms added.
- Exact additions:
  - `HB-2221` — Öğretmenler Kurulu (HEM/Hayat Boyu Öğrenme) → HBÖKY Md39/1-3.
  - `HB-2228` — Özel Eğitim Değerlendirme Kurulu (RAM) → ÖEHY Md43/1-5; duties/work rules Md44-45.
- Result: **459/2229 = %20,5922**; atom pool **4.635**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra` aynı organ/eylemi birebir destekliyorsa artar.

Guardlar:
- duplicate workflow ikinci kez sayılmaz;
- mülga/eski kaynak current authority değildir;
- handbook/el kitabı son hukuki otorite değildir;
- legacy ay/saat/tarih current hükümde evrensel değilse hardcode edilmez;
- compound workflow `WITHHELD/SPLIT` edilir;
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER` olarak sürümlenir.

## Açık kritik kayıtlar
- `HB-2222` — legacy HEM organ adı current HBÖKY Md38-41 named organlarıyla birebir değil.
- `HB-2227` — “Merkez Komisyon Kurulu” claimed RAM directive exact current source re-established değil; withheld.
- `HB-2229` / `HB-2218` — Okul Sağlığı Yönetim Ekibi source/scope/composition reconciliation bekliyor.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı komisyonu annual-guide dependent.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation.
- `HB-2204` — AÖİHL denklik komisyonu current 2024 Açık Öğretim Md25/2-a ile birebir değil.
- `HB-2205` — Alan/Dal Kontenjan Belirleme Komisyonu current OÖKY organ adıyla birebir değil.
- `HB-2206` — named koordinatör öğretmen komisyonu exact hükmü çözülmedi.
- Eski pansiyon `716.pdf`, açık öğretim `443.pdf`, BİLSEM `524.pdf` current authority değildir.

## V41 önceliği
1. `HB-2223..2227` exact master title/source reconciliation yap; OAB/RAM satırlarından birebir current hüküm bulunanları promote et.
2. BİLSEM current named organları için exact retained master workflow ID ara:
   - Merkez Tanılama Sınav Komisyonu Md26,
   - İl Tanılama Sınav Komisyonu Md28,
   - Proje Jürisi Md40.
3. Özel Eğitim Hizmetleri Kurulu Md39-42 için master ID eşleşmesi ara.
4. Okul Sağlığı source/scope çatışmasını zorla normalize etme.
5. 100+ support atom hedefle; ARTICLE_VERIFIED yalnız exact mappingde artsın.
6. Migration **0** kalsın.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V41** başlat.
