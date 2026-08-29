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
- Büyük atomik mevzuat havuzu: **10.555**
- Son tamamlanan batch: **V55**
- Sonraki batch: **V56**

## Integrity history
- V49 HB-0395/HB-0138 temporary promotion via 2020 RAM Directive; V50 judicial-status audit rolled both back.
- RPD Regulation current effect is provision-level; judicially affected Md14 does not invalidate unrelated surviving articles.
- V53 HB-2038 rollback: generic family/education/economic parent-data tracking lacks exact current duty.
- V54 HB-2046/HB-2049 rollback; HB-2048/HB-2050 new exact promotions; net counter unchanged.
- V55 recovers HB-2047 from current RPD Ethical Directive and adds +1.

## V55 — 420 atom
- Privacy + School Health reconciliation: `docs/legal-rpd-privacy-and-school-health-reconciliation-v55.md` — `d5541841e1afd66e195c0af14ffdcdfcc26ed290`
- Batch02 integrity audit: `docs/legal-batch02-generic-source-integrity-v55.md` — `c3b990ad5217ecb7740328dba6222c4115fc1be1`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v55.md` — `66b92be4df043afbceb9be2b96dea4109d9b5bb4`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v55.md` — `dd07d2b94c4fa06ea1819567e7f53638ffaff475`
- Progress: `docs/legal-verification-progress-v55-delta.json` — `61fa8eb73ea364e16ed761e9d759a947856aa27c`
- Support atoms: **420**; pool **10.135 -> 10.555**.
- ARTICLE_VERIFIED: **466 -> 467**.

### V55 new exact
`HB-2047` — `Öğrenci hakkındaki özel ve gizlilik içeren bilgiler korunmaktadır.`
Current exact source: MEB Rehberlik ve Psikolojik Danışma Hizmetleri Etik Yönergesi.
- Md4/1-c: gizlilik core ethical principle.
- Md9/1-ç: education institution principal does not request service-required private/confidential student information/documents.
- Md10/1-b,c: assistant principal protects RPD records' security/confidentiality and does not request such data.
- Md11/1-c/1: counsellor/psychological counsellor does not share service-required private/confidential information/documents without individual/guardian consent except judicial/administrative investigation scope.
Primary ARTICLE_VERIFIED anchor: **Md11/1-c/1**; managerial provisions support enforcement.

### HB-2045
Canonical: e-Okul student development files are filled.
Old 2008 primary-education provision explicitly created this duty, but old provision is historical. Current secondary legislation still has electronic student development file, while current primary/lower-secondary regime uses newer school-type-specific reporting constructs. Universal master wording is therefore unsafe.
Status: `SCHOOL_TYPE_SPLIT_REQUIRED + CURRENT_PARENT_RESEARCH`.

### School Health scope correction
Current 2022 `Okul Sağlığı Hemşirelerinin Çalışma Usul ve Esasları Hakkında Yönerge`:
- Md1-2: scope = MEB official/private schools and school-health nursing services.
- Md4/ç: exact School Health Management Team composition.
- Md6/2: school management establishes and ensures functional operation.

`HB-2218` master scope = BİLSEM. Do not assume BİLSEM is included merely from handbook list. Status `WITHHELD_SCOPE_APPLICABILITY_REVIEW`.
`HB-2229` master scope = RAM. RAM is outside explicit school scope; status `WRONG_SCOPE_CANDIDATE + WITHHELD_CURRENT_PARENT_NOT_FOUND`.

## RPD exact anchors retained
- HB-2023 -> Md15/2-a
- HB-2024 -> Md15/2-b
- HB-2025 -> Md15/2-c
- HB-2029 -> Md16/8
- HB-2036 -> Md21/4-a
- HB-2037 -> Md21/4-b/4
- HB-2048 -> Md21/2-b
- HB-2050 -> Md23/1-g
- HB-2047 -> Ethical Directive Md11/1-c/1

## HB-0603 atomic publication staging
Legacy `Okul risk haritalarının uygulanması` remains too broad. Source-locked children:
1. `CLASS_RISK_DATA_TO_RPD_SERVICE` -> class guidance teacher -> November -> Md23/1-d.
2. `SCHOOL_RISK_MAP_BUILD` -> counsellor/psychological counsellor -> Md21/4-b/3.
3. `SCHOOL_RISK_MAP_SEND_TO_RAM` -> principal -> November -> Md18/1-m.
Legacy superseded only after Super Admin publication; historical completed instances immutable; denominator unchanged before new durable IDs publish.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding/current-valid source + exact provision + actor/action/object/recipient/timing/system/applicability match`

Mandatory source gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- source title match without institutional applicability is insufficient.
- handbook/manual cannot widen a directive/regulation's scope.
- replacement law may change actor/recipient/timing; legacy wording is not grandfathered.
- same workflow source correction = 0 new count.
- duplicate/calendar-instance second count forbidden.
- wrong scope/legal-family must be corrected/published before verification.
- compound workflow = WITHHELD/SPLIT.
- historical completed instances immutable.
- personal/contextual data workflows require exact purpose/actor/data authority and separate privacy/access/retention controls.

## Açık kritik kayıtlar
- HB-2045 -> school-type/current-parent split.
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

## V56 önceliği — 300+ atom
1. Continue Batch02 integrity audit on clearly suspicious non-RPD rows: social activities, boarding/open-education registration, archive/compound rows; row-level only, no mass rollback.
2. Search master for uncounted exact matches to RPD Md21/4-b/1,/2,/3,/5 and principal Md18/1-g,ğ,h,ı,m.
3. Resolve HB-2045 by school-type: current OÖKY student development file vs current OÖİKY development report/e-Rapor; split rather than universalize if necessary.
4. Search HB-0602 RAM-side current binding parent; never use annulled RAM Directive.
5. Continue BİLSEM current directive judicial/repeal audit and Md29 commission duties.
6. School Health: identify valid school-scoped master IDs for team creation; do not reuse HB-2218/HB-2229 outside applicability.
7. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V56** başlat; minimum **300 atom** hedefle.
