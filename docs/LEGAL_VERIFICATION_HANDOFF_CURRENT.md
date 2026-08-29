# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **11.815**
- Son tamamlanan batch: **V58**
- Sonraki batch: **V59**

## Integrity history
- V49 HB-0395/HB-0138 temporary promotion via annulled RAM Directive; V50 rolled back.
- V53 HB-2038 rollback: exact current parent-data tracking duty not found.
- V54 HB-2046/HB-2049 rollback; HB-2048/HB-2050 promotion.
- V55 HB-2047 exact privacy promotion.
- V56 HB-0310 compound rollback + HB-2051 promotion.
- V57 HB-2139 compound rollback and social/discipline source correction.
- V58 HB-2137 new exact promotion; boolean/legal connector semantics added to exactness guard.

## V58 — 420 atom
- Discipline/social integrity: `docs/legal-discipline-social-integrity-reconciliation-v58.md` — `879c58c25d4361c8924fc274811870b0e2c5fea6`
- HB-2139 atomic staging: `docs/legal-hb2139-atomic-split-staging-v58.md` — `d9cfea9adb89fde788406aa6574672183d883aad`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v58.md` — `ea8a9eff2dedccc5368778afcca66f597fe2e1bb`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v58.md` — `5f8d6a537b9b54d743d4e8fc53ab68710cc43b0f`
- Progress: `docs/legal-verification-progress-v58-delta.json` — `062294ae15ba5358965f7c4ddc73f3b0d5f0103f`
- Support atoms: **420**; pool **11.395 -> 11.815**.
- ARTICLE_VERIFIED: **466 -> 467**.

### V58 new exact
`HB-2137` -> OÖKY Md193/1.
Discipline board chair obtains written statements of referred students/witnesses, collects information/documents, prepares file and submits it to board.
No prior ARTICLE_VERIFIED duplicate found in Batch02/repo search.
Delta +1.

### V58 retained/source-corrected
- `HB-2135` -> OÖKY Md192/1; enforce `HAS_RPD_SERVICE` applicability. Schools without RPD service use Md192/2 path.
- `HB-2079` -> current Social Activities Regulation Md7/3.
- `HB-2081` -> Md8/5.
- `HB-2093` -> Md19/2 + Md19/4.
Counter delta 0.

### V58 withheld
- `HB-2138`: master says `written OR oral defence`; current Md194/1 requires written defence and, when necessary, oral defence. Status `MASTER_REWRITE_REQUIRED + WITHHELD_EXACT_SEMANTICS`.
- `HB-2139`: V57 rollback remains. File Library recall search did not find a clean standalone durable sibling for either legal child. Staging only: `DISCIPLINE_DECISION_WRITE_TO_BOOK` -> Md196/1; `DISCIPLINE_SANCTION_NOTIFY_AND_RETAIN_PROOF` -> Md169/5. SA approval/master ID assignment required before publish/count.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding/current-valid source + exact provision + actor/action/object/recipient/timing/system/applicability + legal connector semantics`

Mandatory gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- `ve`, `veya`, `gerektiğinde`, `öncelikle` gibi bağlaç/koşullar görevin kapsamını değiştiriyorsa exactness'in parçasıdır.
- wrong legal family/source can be source-corrected delta 0 only when same master action remains exact/current.
- compound = WITHHELD/SPLIT; previously counted compound gets rollback.
- named repealed source cannot be silently substituted; rewrite/publish required.
- duplicate/calendar-instance second count forbidden.
- historical completed instances immutable.
- personal/contextual data needs exact authority + privacy/access/retention controls.

## Source note
Official OÖKY consolidated PDF `mevzuat.meb.gov.tr/dosyalar/1657.pdf` was opened and discipline pages were screenshot successfully in V58.
Official Social Activities PDF `mevzuat.meb.gov.tr/dosyalar/1850.pdf` text was readable, but screenshot calls returned cache/internal errors in this pass; no screenshot success is claimed.

## Açık kritik kayıtlar
- HB-2138 -> rewrite `written + where necessary oral` semantics.
- HB-2139 -> split children staged; SA publication pending.
- HB-2045 -> school-type/current-parent split.
- HB-2052 -> 2006/26 repealed; current rewrite required.
- HB-2053 -> multi-provision support-room candidate.
- HB-2046/HB-2049 -> V54 rollback.
- HB-2038 -> V53 rollback/privacy review.
- HB-0602 -> PANSİYONLU scope error + RAM-side binding parent unresolved.
- HB-0603 -> atomic staging ready; SA publication pending.
- HB-0138/HB-0395 -> current operational evidence only; no L1 parent.
- HB-2218 -> BİLSEM School Health applicability unresolved.
- HB-2229 -> RAM School Health wrong-scope candidate.
- HB-2227 -> RAM Merkez Komisyon Kurulu current authority unresolved.
- HB-2222 -> legacy HEM title mismatch.
- HB-2212 -> current BİLSEM Directive has no Sınıf/Şube Öğretmenler Kurulu.
- HB-2210 -> talent exam annual-guide dependent.
- HB-2204/2205/2206 -> exact title/scope reconciliation.
- HB-0502 -> obsolete annual guide + monthly-report compound.

## V59 önceliği — 300+ atom
1. Audit `HB-2140` and neighboring discipline reporting/decision/appeal rows against OÖKY Md189/g-ğ, Md197-203 and current evidence-retention rules.
2. Search Batch02 for more rows incorrectly tied to OÖİKY Md9/36/85 while actually belonging to OÖKY/Social Activities/other families; row-level correction only.
3. Resolve HB-2138 rewrite staging without altering historical completed instances.
4. Continue HB-2053 support-room atomicity and search existing master siblings before NEW IDs.
5. Continue HB-2045 school-type reporting split.
6. Continue HB-0602 current RAM-side binding-parent search; annulled RAM Directive forbidden.
7. Continue School Health/BİLSEM scope/current-effect audits.
8. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V59** başlat; minimum **300 atom** hedefle.
