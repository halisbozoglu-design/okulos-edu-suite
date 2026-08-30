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
- Büyük atomik mevzuat havuzu: **9.235**
- Son tamamlanan batch: **V52**
- Sonraki batch: **V53**

## V50 integrity düzeltmesi
V49'da `HB-0395` ve `HB-0138`, 31.08.2020 tarihli RAM Yönergesi current authority kabul edilerek terfi ettirilmişti. V50'de yargısal durum kontrolü ile RAM Yönergesinin current authority olamayacağı kesinleşti ve sayaç **469 -> 467** olarak geri alındı.

## V51 — 520 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-500plus-v51.md` — `10263204d31fc3223374f3856833cc627ed69ba3`
- RAM authority layers: `docs/legal-ram-current-authority-layer-reconciliation-v51.md` — `0e9438baf67d893a3897bf41289a7ab22c54e29a`
- Source validity: `docs/legal-source-validity-audit-v51.md` — `6a58cadc836c2b25c8321c2fb1b0c8b35c0f4dec`
- Verification: `docs/legal-article-verified-batch-v51.md` — `b931dc51dd54780c0b91713c02bb1280a146e99e`
- Progress: `8643bf1d9dbd4b4c92a8cfdf5c170c6ff563335b`
- Result: **467/2229**; atom pool **8.755**.

### Current authority model
- `L1 CURRENT_STATUTORY_OR_REGULATORY`: exact olduğunda ARTICLE_VERIFIED eligible.
- `L2 CURRENT_MINISTRY_OPERATIONAL`: current guide/inspection/e-Rehberlik/form evidence; tek başına ARTICLE_VERIFIED değil.
- `L3 HISTORICAL_OPERATIONAL`: annulled directive/stale handbook; current counter ineligible.

2020 RPD Yönetmeliğinin tamamı iptal değildir; judicial effect provision-level tutulur. Md14 judicially affected; 31.08.2020 RAM Yönergesi current authority değildir.

## V52 — 480 atom / school-side RPD reconciliation
- RPD school reconciliation: `docs/legal-rpd-school-workflow-reconciliation-v52.md` — `d89319b733ee49cd49c93e1ccb44712d22d91060`
- Source correction staging: `docs/legal-source-correction-staging-v52.md` — `cb50cae7248e8ecc5d8f475318c2f0316e756ce1`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v52.md` — `89fe40764a805ae770c78d3b9498d82c812de460`
- Verification: `docs/legal-article-verified-batch-v52.md` — `c231390259f2a68e913edfa60f73c7b77ac7a960`
- Progress: `docs/legal-verification-progress-v52-delta.json` — `752e3df80f40232c1fe88037504cd541d1c3ab48`
- Support atoms: **480**; pool **8.755 -> 9.235**.
- ARTICLE_VERIFIED: **467 -> 467**; no duplicate increment.

### V52 exact source corrections
- `HB-2029`: historical ARTICLE_VERIFIED but one old batch mapped it incorrectly/generically to OÖİKY 2026 Md9. Correct exact parent is **RPD Yönetmeliği Md16/8**: agenda prepared by RPD service and submitted to principal; agenda + meeting date announced in writing one week before.
- `HB-2036`: correct exact parent is **RPD Yönetmeliği Md21/4-a** for consultancy to teacher/parent/administrator/other school actors. Already counted historically; source correction only.

### Existing exact set retained
- `HB-2026` -> Md16/1-5.
- `HB-2027` -> Md16/7.
- `HB-2028` -> Md16/6,9.
- `HB-2032` -> Md21/4-a.
- `HB-2033` -> Md21/2-a.
- `HB-2034` -> Md21 service family; final audit keeps subaction precision review.

### V52 withheld/integrity
- `HB-2030`: school RPD program + class guidance plans in one row -> `SPLIT_REQUIRED`.
- `HB-2031`: legacy plan + year-end report-to-RAM wording; current whole-row exact provision unresolved.
- `HB-2035`: career information action overlaps Md21/2-c/ç but master audience includes teachers/parents; `PARTIAL_MULTI_PROVISION`, no whole-row promotion.
- `HB-2037`: prior generic source does not prove full records+archive action -> `ARTICLE_VERIFIED_INTEGRITY_REVIEW`.
- `HB-2038`: prior generic source does not prove family/economic data tracking; also KVKK purpose/minimization check -> `ARTICLE_VERIFIED_INTEGRITY_REVIEW_HIGH`.

### HB-0603 atomic rewrite
Legacy: `Okul risk haritalarının uygulanması` is too ambiguous and has wrong legal-family mapping.
Staged children:
1. `SCHOOL_CLASS_RISK_DATA_SEND_TO_RPD_SERVICE` -> class guidance teacher, November -> **Md23/1-d**.
2. `SCHOOL_RISK_MAP_BUILD` -> school RPD process; exact builder provision must remain source-exact at publish.
3. `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal, November -> **Md18/1-m**.
Legacy HB-0603 becomes `SUPERSEDED_BY_ATOMIC_CHILDREN` only after Super Admin publication; historical completed instances immutable.

### HB-0602
Stored scope is incorrectly `PANSİYONLU OKULLAR`. Do not bind to annulled RAM Directive. Status remains:
`SCOPE_ERROR_CANDIDATE + CURRENT_OPERATIONAL_EVIDENCE + ARTICLE_PARENT_NOT_FOUND`.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding source + current exact provision + actor/action match + applicability/scope match`

Mandatory source gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/SCOPE -> ARTICLE_VERIFIED`

Guardlar:
- official hosting != current legal effect.
- document current olsa bile provision annulled olabilir.
- directive/guide current operational evidence olabilir ama binding article yerine geçirilmez.
- same workflow source correction gets **0** new count.
- duplicate/calendar-instance ikinci kez sayılmaz.
- yanlış scope/legal-family düzeltilip yayımlanmadan ARTICLE_VERIFIED olmaz.
- handbook/el kitabı evidence/provenance; final authority değildir.
- compound workflow `WITHHELD/SPLIT`.
- completed historical instances immutable.

## Açık kritik kayıtlar
- `HB-2037/HB-2038` -> prior ARTICLE_VERIFIED source integrity review.
- RAM legacy Md5 families -> current binding parent research.
- `HB-0602` -> scope error + article parent research.
- `HB-0603` -> atomic children publication staging.
- `HB-0138/HB-0395` -> operational evidence only; no binding parent.
- `HB-2227` -> RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` -> legacy HEM organ adı current organlarla birebir değil.
- `HB-2229/HB-2218` -> Okul Sağlığı source/scope/composition conflict.
- `HB-2212` -> current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` -> GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` -> exact title/scope reconciliation.
- `HB-0502` -> obsolete annual guide + monthly report compound.

## V53 önceliği — 300+ atom
1. `HB-2037/HB-2038` için exact current provision araştır; doğrulanamazsa explicit rollback delta uygula.
2. RPD Yönetmeliği Md18/1-g,ğ,h,ı,j,m,n ve Md21/4-b alt bentleriyle masterdaki program/e-Rehberlik/risk-map standalone ID'leri tara; duplicate olmayan exact workflows terfi et.
3. `HB-0603` Super Admin publication payloadını child IDs/roles/evidence/transition rules ile finalize et; denominator change only if new durable IDs approved later.
4. `HB-0602` current RAM-side exact parent search devam.
5. Earlier ARTICLE_VERIFIED source audit: especially suspicious generic OÖİKY mapping rows around HB-2023..2038.
6. School Health `HB-2218/HB-2229` source-level split.
7. BİLSEM current directive judicial/repeal guard + Md29 duties.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V53** başlat; minimum **300 atom** hedefle.
