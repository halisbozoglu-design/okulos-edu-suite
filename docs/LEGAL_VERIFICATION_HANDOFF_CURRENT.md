# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-28
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **5.775**
- Son tamamlanan batch: **V45**
- Sonraki batch: **V46**

## V44
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300-v44.md` — `325f055a02f3369a44a093d813de9e5a269c2e3e`
- NEW current named organs: `docs/legal-new-current-organs-candidates-v44.md` — `ee256a8a953f98a16d70a1f617878f91ef57fb43`
- Verification: `docs/legal-article-verified-batch-v44.md` — `bb5079b92352df8af2685cca752385c2773786a7`
- Progress: `docs/legal-verification-progress-v44-delta.json` — `6fb49ab3d091af9d8060d23d9fee07e9de1bb994`
- Result: **467/2229**; atom pool **5.415**.

## V45 — 360 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v45.md` — `f9920cf7b6c64de769137b5cab1118a0c8d75cf7`
- Verification: `docs/legal-article-verified-batch-v45.md` — `0bd7455a3906764a1253e6855e828399fb0e3862`
- NEW_CANDIDATE publication pack: `docs/legal-new-organ-superadmin-publication-pack-v45.md` — `cfd3035cd20008f2845718450cb883189bb5a2e8`
- Progress: `docs/legal-verification-progress-v45-delta.json` — `f8bff2563b4f1ef6eb3dec9241c8b405171a04e3`
- **360 support atoms** added.
- ARTICLE_VERIFIED increment: **0**; result remains **467/2229 = %20,9511**.
- RAM recurring monthly rows normalized under durable parent `HB-2228 — Özel Eğitim Değerlendirme Kurulu` instead of being counted as independent legal parents.
- Canonical process normalized to:
  `APPLICATION/REFERRAL -> APPOINTMENT/DISTRIBUTION -> EDUCATIONAL_ASSESSMENT -> BOARD_DECISION -> REPORT/EDUCATION_PLAN -> RECORD/NOTIFICATION -> REVIEW/FOLLOW_UP`
- ÖEHY mapping: Md43 = board formation; Md44 = duties; Md45 = working rules.
- Monthly copies such as `HB-0136`, `HB-0204`, `HB-0205`, `HB-0277`, `HB-0512`, `HB-0598`, `HB-0599`, `HB-0679`, `HB-0761`, `HB-0858`, `HB-0941`, `HB-0942`, `HB-1039`, `HB-1140` and analogous rows → `LEGACY_CALENDAR_INSTANCE` / `SPLIT_REQUIRED` as applicable.
- Wrong-section/scope copies such as RAM text under pension scope → `SCOPE_ERROR_CANDIDATE`.
- `13:30` fixed handbook time → `LOCAL_TIME_PARAMETER`, not universal law.
- Canonical master search confirmed `HB-2228` is Özel Eğitim Değerlendirme Kurulu; it must never be renamed to Özel Eğitim Hizmetleri Kurulu.
- No exact retained 2,229-master row titled `Özel Eğitim Hizmetleri Kurulu` recovered; it remains `NEW_CANDIDATE` at il/ilçe MEM level under ÖEHY Md39-42.
- 8 NEW_CANDIDATE current organs now have a Super Admin publication pack; no unrelated old HB-ID reused.
- Master denominator remains 2,229 until approved new-candidate publication.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez.
- duplicate/calendar-instance workflow ikinci kez sayılmaz.
- named organ ve operational action ayrı workflow layerlarıdır.
- mülga/eski kaynak current authority değildir.
- handbook/el kitabı provenance/evidence; son hukuki otorite değildir.
- compound workflow `WITHHELD/SPLIT` edilir.
- yanlış okul-kapsam etiketi publication öncesi düzeltilir.
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER`.
- handbook sabit saatleri `LOCAL_TIME_PARAMETER`.
- NEW current named organ `NEW_CANDIDATE -> SUPERADMIN -> MASTER_ID_ASSIGN -> PUBLISH` yolundan geçer.
- completed historical workflow instances immutable.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority yok; WITHHELD.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition reconciliation bekliyor.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` — title/scope exact reconciliation bekliyor.
- `HB-0502` — obsolete annual guide + monthly report compound.
- RAM recurring rows — parent/instance/scope correction manifest operationalization needed.

## V46 önceliği — minimum 300 atom
1. RAM parent/instance correction manifestini workflow-ID bazında daha geniş listeye dönüştür; duplicate families ve wrong-scope copiesı topluca sınıflandır.
2. ÖEHY Md44 görevlerini canonical masterdaki standalone RAM operational rows ile exact match et; whole compound row değil, yalnız atomic legacy rows terfi etsin.
3. `HB-0137` ve benzeri standalone official-measure/follow-up rows için current exact clause araştır.
4. BİLSEM Md29 görevleriyle birebir eşleşen standalone master workflows ara.
5. 8 NEW_CANDIDATE organın composition/member/role-routing alanlarını source-exact olarak doldur.
6. Okul Sağlığı `HB-2218/HB-2229` çatışmasını source-level split et.
7. ARTICLE_VERIFIED yalnız güvenli exact mevcut-master rows için artsın.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V46** başlat; tek mesajda minimum **300 atom** hedefle.
