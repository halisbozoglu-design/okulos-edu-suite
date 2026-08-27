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
- Büyük atomik mevzuat havuzu: **4.395**
- Son tamamlanan batch: **V38**
- Sonraki batch: **V39**

## V37
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v37.md`
  - commit `0a3cc801eb1a1f3b655148d1dfbe18d83a4b2df5`
- Verification: `docs/legal-article-verified-batch-v37.md`
  - commit `8d4ab1d548a3e772b7a64a8d79d33b5c6383112d`
- Progress: `docs/legal-verification-progress-v37-delta.json`
  - commit `d3a0a941e3b4124598b046d9e812e639b2d9cee5`
- Exact additions: `HB-2211`, `HB-2213`, `HB-2219`
- Result: **456/2229**; atom pool **4.275**

## V38
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v38.md`
  - commit `8e96b1409f1d1ef638f58811ec8b99f2b209ed9b`
- Verification: `docs/legal-article-verified-batch-v38.md`
  - commit `b9c01d189a14a1814cdb9e5f735f4c28cbf25b74`
- Progress: `docs/legal-verification-progress-v38-delta.json`
  - commit `b807f9204969f3857ce608ba765bf970f75398aa`
- 120 support atoms added.
- Exact addition:
  - `HB-2217` — **Eser İnceleme ve Seçme Kurulu** → MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği **Md.12/2-a-b-ç**.
- Result: **457/2229 = %20,5025**; atom pool **4.395**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız şu üçü aynı anda birebir olduğunda artar:
`workflow_id + güncel resmî kaynak + exact madde/fıkra`

Guardlar:
- duplicate workflow ikinci kez sayılmaz;
- mülga/eski kaynak current authority değildir;
- handbook/el kitabı son hukuki otorite değildir;
- legacy ay/saat/tarih current hükümde evrensel değilse hardcode edilmez;
- compound workflow `WITHHELD/SPLIT` edilir;
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER` olarak sürümlenir.

## Açık kritik kayıtlar
- `HB-2218` ve `HB-2229` — **Okul Sağlığı Yönetim Ekibi**: 2022 MEB okul sağlığı hemşiresi yönergesi ile genel okul sağlığı program kılavuzunun kapsam/bileşimi farklı; master scope reconcile edilmeden ARTICLE_VERIFIED yapılmaz.
- `HB-2210` — Güzel Sanatlar/Spor Liseleri yetenek sınavı komisyonu: yıllık kılavuz/genel yazı bağımlılığı sürüyor; durable exact provision bulunmadan promote edilmez.
- `HB-2212` — current BİLSEM Yönergesinde “Sınıf/Şube Öğretmenler Kurulu” adlı organ yok; withheld.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation bekliyor.
- `HB-2204` — AÖİHL denklik komisyonu adı/scope current 2024 Açık Öğretim Md25/2-a ile birebir değil.
- `HB-2205` — Alan/Dal Kontenjan Belirleme Komisyonu current OÖKY organ adıyla birebir değil.
- `HB-2206` — named koordinatör öğretmen komisyonu exact hükmü çözülmedi.
- `HB-2222` — HEM kurul adı current organ adıyla birebir değil.
- `HB-0406`, `HB-0716` — legacy zamanlama guardları devam ediyor.
- Eski pansiyon `716.pdf`, eski açık öğretim `443.pdf`, eski BİLSEM `524.pdf` current authority olarak kullanılmaz.

## V39 önceliği
Yeni family açmaktan önce mevcut master satırları exact hükümlere bağla:
1. BİLSEM named tanılama/değerlendirme komisyonları ve Proje Jürisi için karşılık gelen durable master workflow ID'lerini çöz.
2. Özel eğitim named kurul/komisyon master kayıtlarını current ÖEHY ile eşleştir.
3. HEM/hayat boyu öğrenme named kurul kayıtlarını current mevzuatla reconcile et.
4. Okul Sağlığı Yönetim Ekibi scope çatışmasını çöz; zorla promote etme.
5. HB-2210 için current GSL/Spor Lisesi yıllık kılavuz + durable parent rule ayrımını kur.
6. En az 100 destek atomu hedefle; ARTICLE_VERIFIED yalnız exact eşleşmede artsın.
7. Migration **0** kalsın.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
`okul-kapisi` reposuna mevzuat doğrulama işi yazma.

Kullanıcı `Devam` dediğinde soru sormadan **V39** başlat.
