# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **8.755**
- Son tamamlanan batch: **V51**
- Sonraki batch: **V52**

## V50 integrity düzeltmesi
V49'da `HB-0395` ve `HB-0138`, 31.08.2020 tarihli RAM Yönergesi current authority kabul edilerek terfi ettirilmişti. V50'de yargısal durum kontrolü ile RAM Yönergesinin current authority olamayacağı kesinleşti ve sayaç **469 -> 467** olarak geri alındı.

## V51 — 520 atom / current-authority layer reconciliation
- Coverage: `docs/legal-article-verified-focused-deepening-batch-500plus-v51.md` — `10263204d31fc3223374f3856833cc627ed69ba3`
- RAM authority layers: `docs/legal-ram-current-authority-layer-reconciliation-v51.md` — `0e9438baf67d893a3897bf41289a7ab22c54e29a`
- Source validity audit: `docs/legal-source-validity-audit-v51.md` — `6a58cadc836c2b25c8321c2fb1b0c8b35c0f4dec`
- ARTICLE_VERIFIED result: `docs/legal-article-verified-batch-v51.md` — `b931dc51dd54780c0b91713c02bb1280a146e99e`
- Progress: `docs/legal-verification-progress-v51-delta.json` — `8643bf1d9dbd4b4c92a8cfdf5c170c6ff563335b`
- Support atoms: **520**; atom pool **8.235 -> 8.755**.
- ARTICLE_VERIFIED increment: **0**; final **467/2229 = %20,9511**.

### V51 kritik hukuk sonucu
2020 RPD Yönetmeliğinin tamamı iptal edilmiş sayılmaz. Judicial effect provision-level tutulur.
- RPD Regulation document: current inventoryde var.
- Md14: judicially affected.
- 31.08.2020 RAM Yönergesi: current authority değildir; historical/provenance only.
- MEB 2026 RAM inspection guidance surviving Regulation provisions such as **Md16/4, Md18/1-m, Md13/1-a** still uses them as active criteria.

New source model:
- `L1 CURRENT_STATUTORY_OR_REGULATORY` -> ARTICLE_VERIFIED eligible when exact.
- `L2 CURRENT_MINISTRY_OPERATIONAL` -> current guide/inspection/e-Rehberlik/official form evidence; not enough alone for ARTICLE_VERIFIED.
- `L3 HISTORICAL_OPERATIONAL` -> annulled directive / stale handbook; current counter ineligible.

### HB-0602
Canonical: school RPD programs received from schools are examined and review forms returned.
- stored scope is incorrectly `PANSİYONLU OKULLAR`.
- 2026 inspection guidance still expects program examination/evaluation/feedback.
- current exact surviving binding article for RAM-side review action not established.
Status: `SCOPE_ERROR_CANDIDATE + CURRENT_OPERATIONAL_EVIDENCE + ARTICLE_PARENT_NOT_FOUND`.

### HB-0603
Canonical: `Okul risk haritalarının uygulanması`.
Current exact chain is split:
1. class counsellor November risk-data delivery -> RPD Regulation Md23/1-d
2. school RPD service November risk-map creation -> Md21/4-b/3
3. principal November send to RAM -> Md18/1-m
4. RAM receive/collect responsibility-area data -> current 2026 inspection operational evidence until exact durable RAM article is found

Legacy `uygulanması` does not identify actor/action. Status: `ACTION_SCOPE_REWRITE_REQUIRED`; no whole-row promotion.

### HB-0138 / HB-0395
2026 inspection guide still expects counsellor meetings at year start/mid-year/year-end, but exact retained parent is RAM Guide-level rather than surviving binding article.
Status: `CURRENT_OPERATIONAL_EVIDENCE / ARTICLE_PARENT_NOT_FOUND`.
V50 rollback remains correct.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız:
`workflow_id + current binding source + current exact provision + actor/action match + applicability/scope match`
birebir olduğunda artar.

Mandatory source gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/SCOPE -> ARTICLE_VERIFIED`

Guardlar:
- official hosting != current legal effect.
- document current olsa bile provision annulled olabilir.
- directive/guide current operational evidence olabilir ama binding article yerine geçirilmez.
- ID-title tahmin edilmez.
- duplicate/calendar-instance ikinci kez sayılmaz.
- yanlış scope/legal-family düzeltilip yayımlanmadan ARTICLE_VERIFIED olmaz.
- handbook/el kitabı evidence/provenance; final authority değildir.
- compound workflow `WITHHELD/SPLIT`.
- completed historical instances immutable.

## Açık kritik kayıtlar
- RAM legacy Md5 families -> current binding parent research.
- `HB-0602` -> scope error + article parent research.
- `HB-0603` -> actor/action split/rewrite.
- `HB-0138/HB-0395` -> current operational but no binding article parent.
- `HB-2227` -> RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` -> legacy HEM organ adı current organlarla birebir değil.
- `HB-2229/HB-2218` -> Okul Sağlığı source/scope/composition conflict.
- `HB-2212` -> current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` -> GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` -> exact title/scope reconciliation.
- `HB-0502` -> obsolete annual guide + monthly report compound.

## V52 önceliği — 300+ atom
1. Current RPD Regulation surviving provisions Md8-10, Md16-18, Md21, Md23 ile masterdaki school-side standalone workflows için exact ID crosswalk çıkar; safe ARTICLE_VERIFIED artışlarını yakala.
2. `HB-0603` için Super Admin atomic rewrite staging payloadını finalize et; master denominator değişmeden child publication planı hazırla.
3. `HB-0602` source-page boundary/scope correction paketini finalize et; operational-only publication policy ile article verificationı ayır.
4. 2026 RAM inspection guide criterion setini legal parent / guide-only parent diye tümden sınıflandır.
5. Earlier ARTICLE_VERIFIED directive-based rows için judicial/repeal auditini genişlet: BİLSEM, İYEP, Social Activities supporting directives.
6. School Health `HB-2218/HB-2229` source-level split.
7. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V52** başlat; minimum **300 atom** hedefle.
