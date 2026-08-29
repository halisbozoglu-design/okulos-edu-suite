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
- Büyük atomik mevzuat havuzu: **10.965**
- Son tamamlanan batch: **V56**
- Sonraki batch: **V57**

## Integrity history
- V49 HB-0395/HB-0138 temporary promotion via 2020 RAM Directive; V50 judicial-status audit rolled both back.
- RPD Regulation current effect is provision-level; judicially affected Md14 does not invalidate unrelated surviving articles.
- V53 HB-2038 rollback: generic parent-data tracking lacks exact current duty.
- V54 HB-2046/HB-2049 rollback; HB-2048/HB-2050 promotion; net unchanged.
- V55 HB-2047 exact privacy duty promotion.
- V56 identifies compound Batch02 social-activity row HB-0310 and replaces legacy 2006/26 current-authority assumption for HB-2052.

## V56 — 410 atom
- Social/special-ed integrity: `docs/legal-batch02-social-specialed-integrity-v56.md` — `1296a7fd0b574c7f4b0f9ee897dda3ee5ef20964`
- HB-2045 school-type split: `docs/legal-hb2045-school-type-split-v56.md` — `2d659980b7069dd43d72b91789d9fc3254b44354`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v56.md` — `d85c053d58652a2008a7a200131e1c1f1db132bf`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v56.md` — `0cf71de94696305c511c1178f765822a7c243ab5`
- Progress: `docs/legal-verification-progress-v56-delta.json` — `6f8610e4bd6f70644de2cd35142911056c2d4fea`
- Support atoms: **410**; pool **10.555 -> 10.965**.
- ARTICLE_VERIFIED: **467 -> 467** (+1 new exact, -1 rollback).

### V56 new exact
`HB-2051` — `Uyuşturucu kullanımı ve bağımlılıkla mücadele; 2014/20 sayılı genelge doğrultusunda yürütülmektedir.`
Current source: MEB Circular 2014/20. TTKB 2026 document inventory independently lists the same circular as `Sürekli`.
Counter delta: +1.

### V56 rollback
`HB-0310` combines Social Activities Board establishment + annual social-activity planning + teacher course distribution + duty/time roster. Current Social Activities Regulation Md6 supports the first two, but not the latter two. Whole-row verification is invalid.
Status: `ROLLBACK_ARTICLE_VERIFIED + SPLIT_REQUIRED`.
Counter delta: -1.

### V56 source corrections / retained
- `HB-0323` -> Social Activities Regulation Md6/8: board work evaluated at teachers-board meetings.
- `HB-2169` -> Social Activities Regulation Md6, school-type applicability filtered.
- `HB-2190` -> current exact Md6 already established in earlier audit; no duplicate increment.
- `HB-2054` -> Special Education Services Regulation Md23/1-ç retained.
- `HB-2055` -> Special Education Services Regulation Md25/1-a retained.

### V56 withheld/split
- `HB-2045` -> universal e-School student-development-file wording is unsafe; school-type split staged.
- `HB-2052` -> legacy text says 2006/26, but current 2024/56 explicitly repeals 2006/26 and 2009/09. Master rewrite required before current verification. It was not found in the current counted set, so no rollback delta.
- `HB-2053` -> support-room number/opening + equipment/material provision spans current Md25 and Md62; `MULTI_PROVISION_EXACT_CANDIDATE`, withheld pending atomicity decision.
- `HB-2220` -> HEM social activities are optional under Social Activities Regulation Md7/4; unconditional annual board duty not accepted without applicability condition.

## HB-0603 atomic publication staging
Legacy `Okul risk haritalarının uygulanması` remains too broad. Source-locked children:
1. `CLASS_RISK_DATA_TO_RPD_SERVICE` -> class guidance teacher -> November -> Md23/1-d.
2. `SCHOOL_RISK_MAP_BUILD` -> counsellor/psychological counsellor -> Md21/4-b/3.
3. `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal -> November -> Md18/1-m.
Legacy superseded only after Super Admin publication; historical completed instances immutable; denominator unchanged before durable child IDs publish.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding/current-valid source + exact provision + actor/action/object/recipient/timing/system/applicability match`

Mandatory source gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- source title match without institutional applicability is insufficient.
- a master row explicitly naming a repealed source cannot be cured silently by substituting a new source; current rewrite/publish is required.
- handbook/manual cannot widen binding scope.
- same workflow source correction = 0 new count.
- duplicate/calendar-instance second count forbidden.
- wrong scope/legal-family must be corrected/published before verification.
- compound workflow = WITHHELD/SPLIT; if it was already counted, rollback.
- historical completed instances immutable.
- personal/contextual data workflows require exact purpose/actor/data authority and privacy/access/retention controls.

## Açık kritik kayıtlar
- HB-2045 -> school-type/current-parent split.
- HB-2052 -> 2006/26 repealed; current rewrite to 2024/56/current addiction authority required.
- HB-2053 -> multi-provision support-room candidate.
- HB-2046/HB-2049 -> V54 rollback.
- HB-2038 -> V53 rollback/privacy review.
- HB-0602 -> PANSİYONLU scope error + RAM-side binding parent unresolved.
- HB-0603 -> atomic staging ready; SA publication pending.
- HB-0138/HB-0395 -> current operational evidence only; no L1 parent.
- RAM legacy Md5 families -> current binding parent research.
- HB-2218 -> BİLSEM School Health applicability unresolved.
- HB-2229 -> RAM School Health wrong-scope candidate.
- HB-2227 -> RAM Merkez Komisyon Kurulu current named authority unresolved.
- HB-2222 -> legacy HEM title not one-to-one with current organ.
- HB-2212 -> current BİLSEM Directive has no Sınıf/Şube Öğretmenler Kurulu.
- HB-2210 -> GSL/Spor talent exam annual-guide dependent.
- HB-2204/2205/2206 -> exact title/scope reconciliation.
- HB-0502 -> obsolete annual guide + monthly report compound.

## V57 önceliği — 300+ atom
1. Audit Batch02 social-event rows `HB-2082`, `HB-2083`, `HB-2088`, `HB-2089`, `HB-2095`; source-correct exact actions against current Social Activities Regulation, rollback compound/mismatch only.
2. Audit archive/discipline rows `HB-2132`, `HB-2136`, `HB-2139`; current school-type regulation and exact board/notification provisions required.
3. Continue HB-2053 atomic split decision and search an existing standalone master counterpart before creating NEW candidate IDs.
4. Continue HB-2045 current OÖKY vs OÖİKY reporting model split.
5. Continue HB-0602 RAM-side current binding-parent search without annulled RAM Directive.
6. Continue School Health and BİLSEM current-effect/scope audits.
7. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V57** başlat; minimum **300 atom** hedefle.
