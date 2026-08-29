# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **466 / 2.229 = %20,9062**
- Kalan exact doğrulama: **1.763**
- Büyük atomik mevzuat havuzu: **10.135**
- Son tamamlanan batch: **V54**
- Sonraki batch: **V55**

## Integrity history
- V49 temporarily promoted HB-0395/HB-0138 using 2020 RAM Directive.
- V50 judicial-status audit rolled both back because the RAM Directive cannot be used as current authority.
- Current RPD Regulation is treated provision-by-provision; Md14 judicially affected does not invalidate unrelated surviving provisions.
- V53 rolled back HB-2038 because no exact current duty was found for continuous generic tracking of named parent data attributes.
- V54 detects legacy actor/action drift even where the legal topic itself survives.

## V54 — 440 atom
- RPD Batch02 integrity reconciliation: `docs/legal-rpd-batch02-integrity-reconciliation-v54.md` — `d1ccd137eb6dd5cb5f0924ea742d79a83fb6d78b`
- Program-management crosswalk: `docs/legal-rpd-program-management-crosswalk-v54.md` — `ea388837244ce12fb59d031948b48315725562da`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v54.md` — `803eb3cd3536fc5d3127ed70fe1aa597338639b7`
- Verification: `docs/legal-article-verified-batch-v54.md` — `e6f7d3b56be3c2c35ab2f986a3a3a39a8d3c434e`
- Progress: `docs/legal-verification-progress-v54-delta.json` — `82a39b8187394fa6275200167f860ec786f188da`
- Support atoms: **440**; pool **9.695 -> 10.135**.
- ARTICLE_VERIFIED: **466 -> 466** (2 rollback + 2 new exact promotion).

### V54 explicit rollbacks
- `HB-2046`: legacy workflow says school-year end report -> RPD service. Current RPD Regulation Md23/1-ı says **each term end -> education institution principal**. Status `WITHHELD_LEGACY_ACTION_MISMATCH`. Delta -1.
- `HB-2049`: e-Okul student-development-file/class-guidance-section duty tracks superseded 2001 RPD model; no current exact parent established. Status `WITHHELD_LEGACY_ACTION_PARENT_NOT_FOUND`. Delta -1.

### V54 new ARTICLE_VERIFIED
- `HB-2048` -> RPD Regulation **Md21/2-b**: individual-recognition techniques are applied/evaluated; delta +1.
- `HB-2050` -> RPD Regulation **Md23/1-g**: class guidance teacher cooperates with guidance teacher/psychological counsellor and directs students to clubs, elective courses and social activities according to student attributes; delta +1.

### V54 source corrections, zero count
- `HB-2023` -> Md15/2-a (service easily reachable)
- `HB-2024` -> Md15/2-b (suitable physical conditions)
- `HB-2025` -> Md15/2-c (IT/communication/office and individual/group work equipment)
- `HB-2029` -> Md16/8
- `HB-2036` -> Md21/4-a
- `HB-2037` -> Md21/4-b/4

### HB-0603 atomic publication staging completed
Legacy `Okul risk haritalarının uygulanması` remains too ambiguous for whole-row verification.
Source-locked children:
1. `CLASS_RISK_DATA_TO_RPD_SERVICE` -> class guidance teacher -> every November -> **Md23/1-d**.
2. `SCHOOL_RISK_MAP_BUILD` -> guidance teacher/psychological counsellor -> **Md21/4-b/3**.
3. `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal -> every November -> **Md18/1-m**.
Legacy HB-0603 becomes superseded only after Super Admin publication; historical completed instances remain immutable; denominator does not change before durable child IDs are approved/published.

## Current RPD program-management exact chain
- Md21/4-b/1: school RPD program prepared in e-Rehberlik by first week October for RAM transmission.
- Md21/4-b/2: counsellor weekly program in e-Rehberlik.
- Md21/4-b/3: November school risk map creation.
- Md21/4-b/4: activity entry / client-file records / offline filing-storage.
- Md21/4-b/5: collaborative implementation + year-end effectiveness evaluation.
- Md18/1-g: principal ensures program preparation.
- Md18/1-ğ: principal approves/sends program by first week October via e-Rehberlik.
- Md18/1-h: principal monitors school and weekly program implementation via e-Rehberlik.
- Md18/1-ı: principal follows regular entry of work to e-Rehberlik.
- Md18/1-m: principal sends November risk map to relevant RAM.

## Current authority model
- `L1 CURRENT_STATUTORY_OR_REGULATORY`: exact olduğunda ARTICLE_VERIFIED eligible.
- `L2 CURRENT_MINISTRY_OPERATIONAL`: current guide/inspection/e-Rehberlik/form evidence; tek başına ARTICLE_VERIFIED değil.
- `L3 HISTORICAL_OPERATIONAL`: annulled/repealed directive or stale handbook; current counter ineligible.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding source + current exact provision + actor/action/object/recipient/timing/system/applicability match`

Mandatory gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- document current olsa bile provision annulled olabilir.
- replacement regulation may change actor/recipient/timing; legacy wording is not grandfathered.
- directive/guide may be operational evidence but cannot substitute for binding exact parent.
- same workflow source correction gets 0 new count.
- duplicate/calendar-instance second count forbidden.
- wrong scope/legal-family must be corrected/published before verification.
- handbook is evidence/provenance, not final authority.
- compound workflow `WITHHELD/SPLIT`.
- historical completed instances immutable.
- personal/contextual data collection requires exact purpose/actor/data-object authority and separate privacy controls.

## Açık kritik kayıtlar
- `HB-2045` -> generic e-Okul student development file; current exact actor/action parent unresolved.
- `HB-2047` -> generic confidentiality control; duty-level parent/privacy scope must be locked.
- `HB-2046/HB-2049` -> V54 rollback; legacy action mismatch.
- `HB-0602` -> PANSİYONLU scope error + RAM-side exact binding parent unresolved.
- `HB-0603` -> atomic staging source-locked; Super Admin publication pending.
- `HB-0138/HB-0395` -> operational evidence only; no current binding parent.
- `HB-2038` -> rolled back; privacy/exact-parent review.
- RAM legacy Md5 families -> current binding parent research.
- `HB-2227` -> RAM Merkez Komisyon Kurulu current exact named authority unresolved.
- `HB-2222` -> legacy HEM organ title not one-to-one with current organ.
- `HB-2229/HB-2218` -> School Health source/scope/composition conflict.
- `HB-2212` -> current BİLSEM Directive has no Sınıf/Şube Öğretmenler Kurulu.
- `HB-2210` -> GSL/Spor Liseleri talent exam annual-guide dependent.
- `HB-2204/2205/2206` -> exact title/scope reconciliation.
- `HB-0502` -> obsolete annual guide + monthly report compound.

## V55 önceliği — 300+ atom
1. Continue Batch02 integrity audit beyond HB-2050; identify generic OÖİKY mappings that actually reflect repealed/other legal families and source-correct or rollback them.
2. Search exact master matches for Md21/4-b/1, /2, /3, /5 and principal Md18/1-g,ğ,h,ı,m; promote only existing uncounted durable IDs.
3. Audit `HB-2045/HB-2047` using current e-Okul/RPD/privacy sources; do not infer duties from definitions alone.
4. Continue `HB-0602` current binding-parent research without annulled RAM Directive.
5. School Health `HB-2218/HB-2229` source-level split.
6. BİLSEM current directive judicial/repeal guard + Md29 duties.
7. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V55** başlat; minimum **300 atom** hedefle.
