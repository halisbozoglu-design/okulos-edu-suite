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
- Büyük atomik mevzuat havuzu: **4.755**
- Son tamamlanan batch: **V41**
- Sonraki batch: **V42**

## V40
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v40.md` — `1fba05ac2733be8ac1c083f86b467817f837a196`
- Verification: `docs/legal-article-verified-batch-v40.md` — `55c162b5fe3288f53852db1e6d2d07961ec2dfe6`
- Progress: `docs/legal-verification-progress-v40-delta.json` — `0bc4696fcf74ee309f8c928165f9bc2a1d803ab8`
- Exact: `HB-2221`, `HB-2228`.
- Result: **459/2229**; atom pool **4.635**.

## V41
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v41.md` — `945ab708a2cb7cae0bb3e8e6dfdea394607b9bbf`
- Verification: `docs/legal-article-verified-batch-v41.md` — `f6d4dfa1782cdac90ee4f838006e0e2e72bf2252`
- Progress: `docs/legal-verification-progress-v41-delta.json` — `68396075d2f1206e37a01eee6dec49548012aae8`
- 120 support atoms added.
- ARTICLE_VERIFIED increment: **0**.
- Durable current legal organs confirmed:
  - Özel Eğitim Hizmetleri Kurulu — ÖEHY Md39-42.
  - BİLSEM Merkez Tanılama Sınav Komisyonu — Md26-27.
  - BİLSEM İl Tanılama Sınav Komisyonu — Md28-29.
  - BİLSEM Proje Jürisi — Md40.
  - OAB organ family — current OAB Yönetmeliği.
- `HB-2223..2227` exact retained ID-title mapping repo code search ile geri kazanılamadığı için tahmin edilmedi.
- Result: **459/2229 = %20,5922**; atom pool **4.755**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez;
- duplicate workflow ikinci kez sayılmaz;
- mülga/eski kaynak current authority değildir;
- handbook/el kitabı son hukuki otorite değildir;
- compound workflow `WITHHELD/SPLIT` edilir;
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER` olarak sürümlenir.

## Açık kritik kayıtlar
- `HB-2223..2227` — canonical master inventory/source recovery gerekiyor.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition reconciliation bekliyor.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2204/2205/2206` — title/scope exact reconciliation bekliyor.

## V42 önceliği
1. HB-ID'leri üreten canonical master workflow inventory/source dosyasını repo tree/history üzerinden geri kazan.
2. Recovered inventory ile BİLSEM Md26/Md28/Md40 organlarını exact workflow ID'ye bağla.
3. Özel Eğitim Hizmetleri Kurulu Md39-42 için exact master ID ara.
4. `HB-2223..2227` satırlarını canonical inventory üzerinden tek tek çöz.
5. Exact ID bulunamazsa sayaç artırma; 100+ support atom deepeninge devam et.
6. Migration **0** kalsın.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V42** başlat.
