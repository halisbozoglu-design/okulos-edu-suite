# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası — zorunlu
ARTICLE_VERIFIED için yalnız:
- `mevzuat.gov.tr`
- `mevzuat.meb.gov.tr`
- `meb.gov.tr` ve resmî MEB birimleri
- `resmigazete.gov.tr`
İkincil mevzuat/hukuk/okul siteleri exact doğrulama kaynağı değildir. Resmî rehber/el kitabı L2 destek olabilir; yönetmelik maddesinin yerine geçmez.
Yüklenmiş/eski mevzuat kopyası güncel resmî konsolide metinle çatışırsa current legal effect için resmî güncel metin esas alınır.
Yıllık teknik şartname/sözleşme tasarısı durable ulusal master parentı değildir; current-year/tenant instance üzerinde `YEAR_PARAMETER` veya legal snapshot olarak tutulur. Durable ARTICLE_VERIFIED için current regulation/directive-level exact parent gerekir.

### V66 yeni scope guard
Bir düzenlemenin kapsam maddesi hedef kurum/hukuk rejimini açıkça dışlıyorsa, konu veya rol adları benziyor diye o düzenleme ARTICLE_VERIFIED parent yapılamaz. `SAME_TOPIC != SAME_SCOPE`.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **15.125**
- Son batch: **V66**
- Sonraki batch: **V67**

## V66 — 410 atom
- Integrity: `docs/legal-project-funds-revolving-scope-integrity-v66.md` — `cf0fff5bc48c9b28ba5efef96864e6c4b50cbbe7`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v66.md` — `02cc7928fe02b02e8afa7be524e4907cf7a5558b`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v66.md` — `de30fcc41e983c3b4487fdd82010046107666194`
- Progress: `docs/legal-verification-progress-v66-delta.json` — `296822ca99a029b4311c92bcba2fe78e914fcea4`
- Support atoms: **410**; pool **14.715 -> 15.125**.
- ARTICLE_VERIFIED: **468 -> 468**, delta 0.

### V66 proje kaynakları HB-1579..HB-1584
Master exact texts recovered. These cover contract precedence, generic fallback finance rule, project objective, tax exemption, expense documentation and final-report document submission.
Current official MEB materials show these concepts operationally in project/program contexts, but exact rules depend on grant agreement/program/beneficiary/reporting structure. No single universal durable school-level provision was established.
- HB-1579: CONTRACT/PROGRAM_DEPENDENT.
- HB-1580: legacy generic `Maliye Bakanlığının çıkarmış olduğu yönetmelik` wording; source identity/current institution name missing, rewrite/decomposition required.
- HB-1581: project-objective agreement dependent.
- HB-1582: tax exemption instrument/project dependent.
- HB-1583: documentation standard program/finance-rule dependent.
- HB-1584: final report recipient/timing/package program dependent.
All withheld from durable ARTICLE_VERIFIED.

### V66 school revolving capital scope correction
Master HB-1585 combines technical assistant-principal assignment and accountant assignment. Current OÖKY Md81 supports the technical assistant-principal part for revolving-capital schools.
However 23.01.2021 / 31373 `Millî Eğitim Bakanlığı Döner Sermaye İşletmeleri Yönetmeliği` Article 1 expressly excludes revolving funds established under 3423 (mesleki/teknik school revolving funds). It therefore cannot be used as the parent for these school-DÖSE rows.
HB-1585 status: `COMPOUND + LEGAL_FAMILY_SPLIT_REQUIRED`.
HB-1586 (`Saymandan Kefalet Sandığına kesinti`) current exact school-DÖSE parent not locked; withheld.

## ARTICLE_VERIFIED gate
`OFFICIAL_DOMAIN -> SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- newer RG/current official consolidated text controls over stale uploaded copies;
- annual source must be current-year and stays year-specific unless durable current parent exists;
- annual technical spec/contract template cannot universalize a durable master workflow;
- scope exclusion blocks topic/name-based inheritance;
- broad ALL scope school-type-specific hükmü miras alamaz;
- similar duty is not exact where timing/condition/actor differs;
- compound split edilir;
- historical completed instances immutable;
- duplicate count forbidden.

## Açık kritik kayıtlar
- HB-1574 -> current 2026-2027 technical-spec exact clause still unparsed; remains rolled back/current-year recheck.
- HB-1575 -> current-year exact operational/YEAR_PARAMETER; durable statutory parent unresolved.
- HB-1579..1584 -> project/contract/program dependent; durable universal parent not found.
- HB-1585 -> split technical assistant principal vs accountant legal chain.
- HB-1586 -> current exact school-DÖSE kefalet parent unresolved.
- HB-1587/HB-1588 -> next current school-DÖSE exact-parent audit.
- HB-1655..1665 -> school-type durable profile publication pending; no sibling reuse found V64.
- HB-1666 -> universal duty-book authority unresolved.
- HB-1483/HB-1484 -> official OAB exact retry only.
- HB-1645/HB-1646/HB-1647/HB-1667 -> school-type correction staging.
- HB-2138 -> exact semantics rewrite.
- HB-2139 -> split children staged.
- HB-2045 -> school-type reporting split.
- HB-2052 -> repealed 2006/26 rewrite.
- HB-2053 -> support-room atomicity.
- HB-0602 -> RAM-side binding parent unresolved; annulled RAM Directive forbidden.
- HB-0603 -> atomic children staged.
- HB-0138/HB-0395 -> L2 only.
- HB-2218/HB-2229 -> School Health scope.

## V67 önceliği — 300+ atom
1. Continue HB-1587 onward school DÖSE rows; establish current 3423/OÖKY/current school-revolving legal chain without using the scope-excluding 2021 regulation.
2. Audit devir-teslim, opening records, budget/accounting, inventory and personnel/surety rows separately by actor/object.
3. Continue project-resource rows only as project-instance rules unless a current universal official MEB provision is found.
4. Retry HB-1483/HB-1484 official OAB source only.
5. Continue HB-1574/HB-1575 durable-parent search and school-type staging backlog.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V67** başlat; minimum **300 atom** hedefle.
