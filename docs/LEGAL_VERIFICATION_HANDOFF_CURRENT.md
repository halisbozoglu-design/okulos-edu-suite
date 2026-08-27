# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-28
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **457 / 2.229 = %20,5025**
- Kalan exact doğrulama: **1.772**
- Büyük atomik mevzuat havuzu: **4.515**
- Son tamamlanan batch: **V39**
- Sonraki batch: **V40**

## V38
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v38.md`
  - commit `8e96b1409f1d1ef638f58811ec8b99f2b209ed9b`
- Verification: `docs/legal-article-verified-batch-v38.md`
  - commit `b9c01d189a14a1814cdb9e5f735f4c28cbf25b74`
- Progress: `docs/legal-verification-progress-v38-delta.json`
  - commit `b807f9204969f3857ce608ba765bf970f75398aa`
- Exact addition: `HB-2217` — Eser İnceleme ve Seçme Kurulu → Sosyal Etkinlikler Yönetmeliği Md12/2-a-b-ç.
- Result: **457/2229**; atom pool **4.395**.

## V39
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v39.md`
  - commit `c0c2088b4bdc2a9ca242657d59638d5f209f0795`
- Verification: `docs/legal-article-verified-batch-v39.md`
  - commit `945049b4911e9c952ded90e76830750806fdbfe1`
- Progress: `docs/legal-verification-progress-v39-delta.json`
  - commit `ce1dbe50e6fb6aa82578da97604318d17be74728`
- 120 support atoms added.
- ARTICLE_VERIFIED increment: **0**. Exact master-ID mismatch guard intentionally preserved.
- Current HEM/Hayat Boyu Öğrenme legal organs mapped:
  - İl Hayat Boyu Öğrenme Komisyonu — HBÖKY Md35
  - İlçe Hayat Boyu Öğrenme Komisyonu — HBÖKY Md36
  - Sınav Komisyonu — HBÖKY Md37
  - Öğretmenler Kurulu — HBÖKY Md39
  - Sınıf/Şube Öğretmenler Kurulu — HBÖKY Md40
  - Zümre Öğretmenler Kurulu — HBÖKY Md41
- Özel Eğitim Değerlendirme Kurulu legal family deepened via 5378 Md16 + ÖEHY Md22.
- Result remains **457/2229 = %20,5025**; atom pool **4.515**.

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
- `HB-2222` — legacy HEM kurul adı current HBÖKY Md35-41 named organlarıyla birebir değil; withheld.
- `HB-2218`, `HB-2229` — Okul Sağlığı Yönetim Ekibi kaynak/scope reconciliation bekliyor.
- `HB-2210` — Güzel Sanatlar/Spor Liseleri yetenek sınavı komisyonu annual-guide dependent.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation.
- `HB-2204` — AÖİHL denklik komisyonu current 2024 Açık Öğretim Md25/2-a ile birebir değil.
- `HB-2205` — Alan/Dal Kontenjan Belirleme Komisyonu current OÖKY organ adıyla birebir değil.
- `HB-2206` — named koordinatör öğretmen komisyonu exact hükmü çözülmedi.
- `HB-0406`, `HB-0716` — legacy timing guards.
- Eski pansiyon `716.pdf`, açık öğretim `443.pdf`, BİLSEM `524.pdf` current authority değildir.

## V40 önceliği
1. Master workflow kaynak dosyasındaki HB-2220+ satırların exact isimlerini çöz; HEM Md35-41 organlarıyla birebir eşleşen varsa promote et.
2. BİLSEM Merkez/İl Tanılama Sınav Komisyonları, resim/müzik bireysel değerlendirme komisyonları ve Proje Jürisi için durable master ID eşleşmesi ara.
3. Özel Eğitim Değerlendirme Kurulu/RAM master satırlarını exact ID + Md/fıkra ile bağla.
4. 2024 HBÖKY değişikliklerinin Md35-41 üzerindeki etkisini current RG değişiklik zinciriyle kontrol et.
5. Okul sağlığı scope çatışmasını zorla çözme; kaynakların uygulama alanını ayır.
6. 100+ destek atomu hedefle; sayaç yalnız exact promotionda artsın.
7. Migration **0** kalsın.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V40** başlat.
