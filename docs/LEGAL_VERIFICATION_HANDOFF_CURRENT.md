# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-28
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **464 / 2.229 = %20,8165**
- Kalan exact doğrulama: **1.765**
- Büyük atomik mevzuat havuzu: **5.115**
- Son tamamlanan batch: **V43**
- Sonraki batch: **V44**

## V42
- Coverage: `docs/legal-article-verified-focused-deepening-batch-100plus-v42.md` — `dffdd5dc677e72442fffb0a15d10b7655164f355`
- Verification: `docs/legal-article-verified-batch-v42.md` — `da43c165284d75fdf75107f2019f1ac55da7757f`
- Progress: `docs/legal-verification-progress-v42-delta.json` — `0fd7a5274399b6efabdc5783d80e3cc032aa69af`
- Result: **463/2229**; atom pool **4.875**.

## V43 — 200+ batch
- Master crosswalk: `docs/legal-master-id-crosswalk-v43.md` — `0b491db281ca31d109d1a97bf1d6c2560fc66bc7`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-200plus-v43.md` — `f3fc1b78215fa5c890689da8a62de9be3f559872`
- Verification: `docs/legal-article-verified-batch-v43.md` — `0bc30d97431ba970619b0a835e37535140c9a5e2`
- Progress: `docs/legal-verification-progress-v43-delta.json` — `18d19c46cd199010dbd4a56aa556f3062742e0f5`
- **240 support atoms** added.
- Exact addition:
  - `HB-0501` — İl tanılama sınav komisyonunun kurulması → current BİLSEM Yönergesi Md28; Md29 supporting duties.
- Canonical BİLSEM crosswalk recovered/classified for `HB-0123`, `HB-0500`, `HB-0501`, `HB-0502`, `HB-0503`, `HB-0586`, `HB-0669`, `HB-0748`.
- `HB-0123`: legacy generic BİLSEM İl Komisyonu wording; current directive separates provincial diagnosis commission and talent-area evaluation commissions → SPLIT/RENAME.
- `HB-0502`: obsolete 2018-2019 guide publication + monthly report → SPLIT + OLD_YEAR_PARAMETER.
- `HB-0500`: annual identification/placement guide dependent → YEAR_PARAMETER.
- `HB-0503/HB-0586`: information-meeting workflow lacks exact durable universal clause → WITHHELD.
- `HB-0669`: group screening placement + monthly reporting is compound → SPLIT.
- `HB-0748`: monthly report exact current provision still required.
- RAM recurring Özel Eğitim Değerlendirme Kurulu rows recovered, including `HB-0136`, `HB-0205`, `HB-0278`, `HB-0512`, `HB-0598`, `HB-0599`, `HB-0679`, `HB-0761`, `HB-0858`, `HB-0941`, `HB-0942`, `HB-1039`, `HB-1140` and analogous copies.
- RAM legacy rows frequently combine evaluation + board meeting + report + director approval + fixed `13:30` + sometimes official-measure/year-end reporting. Fixed handbook time is **not** universal legal requirement; compound rows require atomic split before promotion.
- Result: **464/2229 = %20,8165**; atom pool **5.115**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez; recovered durable master evidence kullanılır;
- duplicate workflow ikinci kez sayılmaz;
- mülga/eski kaynak current authority değildir;
- handbook/el kitabı yalnız provenance/evidence, son hukuki otorite değildir;
- similarity candidate current exact maddeyle düzeltilmeden promote edilmez;
- compound workflow `WITHHELD/SPLIT` edilir;
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER` olarak sürümlenir;
- handbook sabit saatleri (örn. RAM 13:30) universal legal rule yapılmaz.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority bulunmadı.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition reconciliation bekliyor.
- `HB-2214/2215/2216` — BİLSEM/OAB applicability + duplicate reconciliation.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2204/2205/2206` — title/scope exact reconciliation bekliyor.
- RAM recurring monthly rows — atomic split required before count.

## V44 önceliği — yine büyük batch
1. 200+ support atom hedefle.
2. Recovered canonical master içinde BİLSEM current named organs için exact workflow ID ara: Md26, Md30, Md31, Md32, Md34, Md35, Md40.
3. `HB-0748` aylık faaliyet raporu için current exact BİLSEM directive provision ara.
4. RAM recurring rows için atomic decomposition map oluştur: BOARD_FORMATION / ASSESSMENT / DECISION / REPORT / APPROVAL / YEAR_END_REPORT / LOCAL_TIME_PARAMETER.
5. Özel Eğitim Değerlendirme Kurulu current consolidated maddelerini bu atomik parçalara bağla; whole-row değil atomic exact doğrula.
6. Özel Eğitim Hizmetleri Kurulu Md39-42 için retained master ID aramaya devam et.
7. `HB-2214/2215/2216` BİLSEM OAB duplicate/scope audit.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V44** başlat; tek mesajda mümkün olduğunca fazla iş yap.