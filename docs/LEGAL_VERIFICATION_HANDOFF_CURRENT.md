# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **466 / 2.229 = %20,9062**
- Kalan exact doğrulama: **1.763**
- Büyük atomik mevzuat havuzu: **9.695**
- Son tamamlanan batch: **V53**
- Sonraki batch: **V54**

## Integrity history
- V49 temporarily promoted HB-0395/HB-0138 using 2020 RAM Directive.
- V50 judicial-status audit rolled both back because the RAM Directive cannot be used as current authority.
- Current RPD Regulation is treated provision-by-provision; Md14 judicially affected does not invalidate unrelated surviving provisions.
- Official hosting alone does not prove current legal effect.

## V53 — 460 atom
- RPD integrity reconciliation: `docs/legal-rpd-integrity-reconciliation-v53.md` — `6a8b4e59fb2e47549f29c23250609dc353bf0496`
- HB-0603 atomic payload: `docs/legal-hb0603-atomic-publication-payload-v53.md` — `b6876e62b16e94fd30005ea2a3b718ef082c8b54`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v53.md` — `f464b4fb95ac7438cf8354b362e25a6472b3c6dc`
- Verification: `docs/legal-article-verified-batch-v53.md` — `85f3f70d312a9399245d754b90aba987623f72c0`
- Progress: `docs/legal-verification-progress-v53-delta.json` — `a2c6483e0fae84f2207e1781bb7b7b52e424ef74`
- Support atoms: **460**; pool **9.235 -> 9.695**.
- ARTICLE_VERIFIED: **467 -> 466**.

### HB-2037 retained / source corrected
Canonical action: school RPD service work records are kept and documents archived.
Exact current parent: **RPD Regulation Md21/4-b/4**.
This provision covers e-Rehberlik activity entry, client-file records, and filing/storing work that cannot be entered electronically.
Prior generic OÖİKY 2026 Md9 mapping is superseded.
Counter delta: 0 because HB-2037 was already counted.

### HB-2038 explicit rollback
Canonical action: RPD service tracks/evaluates parents' family integrity, education status and economic status.
Prior generic OÖİKY 2026 Md9/1-3 mapping is not action-exact.
V53 did not establish a current binding provision requiring continuous generic tracking of these three named parent attributes.
Status: `WITHHELD_EXACT_PARENT_NOT_FOUND + PRIVACY_SCOPE_REVIEW`.
Counter delta: **-1**.
Do not create a default personal-data collection duty from broad needs-analysis/individual-recognition language.

### Current exact school RPD program-management chain
- Md21/4-b/1: school RPD program prepared in e-Rehberlik by first week October for RAM transmission.
- Md21/4-b/2: counsellor weekly program in e-Rehberlik.
- Md21/4-b/3: November school risk-map creation from class risk data.
- Md21/4-b/4: activity records / client file / offline filing-storage.
- Md21/4-b/5: collaborative program implementation + year-end effectiveness evaluation.
- Md18/1-m: principal sends November school risk map to relevant RAM.

### HB-0603 atomic publication staging
Legacy `Okul risk haritalarının uygulanması` is too ambiguous.
Staged children:
1. `SCHOOL_RISK_MAP_BUILD` -> counsellor/psychological counsellor -> Md21/4-b/3.
2. `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal -> Md18/1-m.
3. `CLASS_RISK_DATA_TO_RPD_SERVICE` -> class guidance teacher; exact article text must be locked before publication.
Legacy HB-0603 becomes `SUPERSEDED_BY_ATOMIC_CHILDREN` only after Super Admin publication. Historical completed instances immutable. Denominator unchanged until new durable IDs are approved/published.

## Current authority model
- `L1 CURRENT_STATUTORY_OR_REGULATORY`: exact olduğunda ARTICLE_VERIFIED eligible.
- `L2 CURRENT_MINISTRY_OPERATIONAL`: current guide/inspection/e-Rehberlik/form evidence; tek başına ARTICLE_VERIFIED değil.
- `L3 HISTORICAL_OPERATIONAL`: annulled directive/stale handbook; current counter ineligible.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding source + current exact provision + actor/action match + applicability/scope match`

Mandatory source gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/SCOPE -> ARTICLE_VERIFIED`

Additional privacy gate:
For workflows requiring collection/tracking of personal or sensitive contextual data, broad adjacent provisions are insufficient. Purpose, actor, data category and operational necessity must be source-exact; access/retention/minimization rules are separate mandatory controls.

Guardlar:
- official hosting != current legal effect.
- document current olsa bile provision annulled olabilir.
- directive/guide current operational evidence olabilir ama binding article yerine geçirilmez.
- same workflow source correction gets 0 new count.
- duplicate/calendar-instance ikinci kez sayılmaz.
- wrong scope/legal-family must be corrected/published before verification.
- handbook is evidence/provenance, not final authority.
- compound workflow `WITHHELD/SPLIT`.
- completed historical instances immutable.

## Açık kritik kayıtlar
- `HB-0602` -> PANSİYONLU scope error + RAM-side exact binding parent unresolved.
- `HB-0603` -> atomic publication staging ready.
- `HB-0138/HB-0395` -> operational evidence only; no current binding parent.
- `HB-2038` -> rolled back; privacy/exact-parent review.
- RAM legacy Md5 families -> current binding parent research.
- `HB-2227` -> RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` -> legacy HEM organ adı current organlarla birebir değil.
- `HB-2229/HB-2218` -> Okul Sağlığı source/scope/composition conflict.
- `HB-2212` -> current BİLSEM Directive has no Sınıf/Şube Öğretmenler Kurulu.
- `HB-2210` -> GSL/Spor Liseleri talent exam annual-guide dependent.
- `HB-2204/2205/2206` -> exact title/scope reconciliation.
- `HB-0502` -> obsolete annual guide + monthly report compound.

## V54 önceliği — 300+ atom
1. Search canonical master for exact standalone matches to RPD Regulation Md21/4-b/1, /2, /3, /4, /5 and Md18/1-m; promote only previously uncounted exact IDs.
2. Audit HB-2046/HB-2049 and neighboring guidance rows that were generically ARTICLE_VERIFIED in Batch02; source-correct or rollback as needed.
3. Finalize HB-0603 child C exact class-guidance provision before Super Admin publication.
4. Continue HB-0602 current binding-parent search without using annulled RAM Directive.
5. Expand privacy-source audit for guidance data collection and retention workflows.
6. School Health HB-2218/HB-2229 source-level split.
7. BİLSEM current directive judicial/repeal guard + Md29 duties.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V54** başlat; minimum **300 atom** hedefle.
