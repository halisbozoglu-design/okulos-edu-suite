# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-28
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **463 / 2.229 = %20,7716**
- Kalan exact doğrulama: **1.766**
- Büyük atomik mevzuat havuzu: **4.875**
- Son tamamlanan batch: **V42**
- Sonraki batch: **V43**

## V41
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v41.md` — `945ab708a2cb7cae0bb3e8e6dfdea394607b9bbf`
- Verification: `docs/legal-article-verified-batch-v41.md` — `f6d4dfa1782cdac90ee4f838006e0e2e72bf2252`
- Progress: `docs/legal-verification-progress-v41-delta.json` — `68396075d2f1206e37a01eee6dec49548012aae8`
- Result: **459/2229**; atom pool **4.755**.

## V42
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v42.md` — `dffdd5dc677e72442fffb0a15d10b7655164f355`
- Verification: `docs/legal-article-verified-batch-v42.md` — `da43c165284d75fdf75107f2019f1ac55da7757f`
- Progress: `docs/legal-verification-progress-v42-delta.json` — `0fd7a5274399b6efabdc5783d80e3cc032aa69af`
- 120 support atoms added.
- Canonical/durable master artifacts recovered from File Library; exact retained mappings recovered for `HB-2223..2227`.
- Exact additions:
  - `HB-2223` — Okul-Aile Birliği Genel Kurulu (HEM) → OAB Yönetmeliği Md9; Md8 + scope definitions supporting.
  - `HB-2224` — Okul-Aile Birliği Yönetim Kurulu (HEM) → Md12.
  - `HB-2225` — Okul-Aile Birliği Denetleme Kurulu (HEM) → Md14.
  - `HB-2226` — Eser İnceleme ve Seçme Kurulu (HEM) → Sosyal Etkinlikler Yönetmeliği Md12/2-a-b-ç; HEM applicability Md7/4 and non-formal scope Md1-2.
- Old OAB candidate Md18/25 was a finance similarity candidate, not exact organ-formation authority; corrected before promotion.
- `HB-2227` exact retained title is Merkez Komisyon Kurulu (RAM); current exact named authority not established, so WITHHELD.
- Result: **463/2229 = %20,7716**; atom pool **4.875**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez; recovered durable master evidence kullanılır;
- duplicate workflow ikinci kez sayılmaz;
- mülga/eski kaynak current authority değildir;
- handbook/el kitabı yalnız provenance/evidence, son hukuki otorite değildir;
- similarity candidate current exact maddeyle düzeltilmeden promote edilmez;
- compound workflow `WITHHELD/SPLIT` edilir;
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER` olarak sürümlenir.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority bulunmadı.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition reconciliation bekliyor.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation; recovered master artifacts üzerinden yeniden çöz.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2204/2205/2206` — title/scope exact reconciliation bekliyor.

## V43 önceliği
1. Recovered durable master artifacts içinde BİLSEM current named organlarını ara ve exact retained workflow ID varsa bağla: Md26, Md28, Md30, Md31, Md32, Md34, Md35, Md40.
2. Özel Eğitim Hizmetleri Kurulu Md39-42 için exact retained master ID ara.
3. `HB-2214/2215/2216` BİLSEM OAB kayıtlarını HEM OAB çözümündeki yöntemle scope + duplicate audit yap.
4. `HB-2227` için current exact RAM authority yoksa WITHHELD bırak; benzer isimle normalize etme.
5. Okul Sağlığı kayıtlarını source-scope split çözülmeden promote etme.
6. En az 100, tercihen 120 support atom; migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V43** başlat.
