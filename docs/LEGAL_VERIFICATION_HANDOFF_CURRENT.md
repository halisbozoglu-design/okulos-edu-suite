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
- Büyük atomik mevzuat havuzu: **6.195**
- Son tamamlanan batch: **V46**
- Sonraki batch: **V47**

## V45
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v45.md` — `f9920cf7b6c64de769137b5cab1118a0c8d75cf7`
- Verification: `docs/legal-article-verified-batch-v45.md` — `0bd7455a3906764a1253e6855e828399fb0e3862`
- NEW_CANDIDATE publication pack: `docs/legal-new-organ-superadmin-publication-pack-v45.md` — `cfd3035cd20008f2845718450cb883189bb5a2e8`
- Progress: `docs/legal-verification-progress-v45-delta.json` — `f8bff2563b4f1ef6eb3dec9241c8b405171a04e3`
- Result: **467/2229**; atom pool **5.775**.

## V46 — 420 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v46.md` — `47e7aa942e907533ccccf74bf3834a86f1df83db`
- RAM counseling reconciliation: `docs/legal-ram-counseling-measure-reconciliation-v46.md` — `f13633774a6edb2b1a97c931f9d7750cb159db08`
- Verification: `docs/legal-article-verified-batch-v46.md` — `387b4ab31e37885633c494dab14ffd5b0867a2b2`
- Progress: `docs/legal-verification-progress-v46-delta.json` — `332afacc90769f29380d09e6e3f607f0691edb21`
- **420 support atoms** added.
- ARTICLE_VERIFIED increment: **0**; result **467/2229 = %20,9511**.
- Current authority recovered: ORGM current page confirms **24.04.2026 / RG 33223 Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ**.
- Counseling-measure workflows must use this current 2026 authority instead of stale historical Tebliğ copies.
- `HB-0137`, `HB-0513`, `HB-0762` — `Öğrencilerin resmi tedbirlerinin alınması ve takip edilmesi`: `TEDBIR_SCOPE_REVIEW`; not exact ÖEHY Md44.
- `HB-0943/HB-0944` — same March + same text; `DUPLICATE_EXTRACTION_REVIEW`; row also combines general RAM interview + counseling-measure execution, so `SPLIT_REQUIRED`.
- `HB-0278`, `HB-0680` and analogous month rows belong to same counseling/interview family and must become canonical parent + calendar instances rather than independent legal parents.
- `HB-0206`, `HB-0600`, `HB-0763`, `HB-1040` combine counseling-measure execution with Şiddet İl Eylem Planı; split before promotion.
- `HB-0514` combines counseling measure and local manager meeting; split before promotion.
- Current ÖEHY Md43-45 remains independent legal parent for RAM Özel Eğitim Değerlendirme Kurulu (`HB-2228`): formation / duties / working rules.
- `tedbir` semantics are no longer guessed. Counseling measure, special-education assessment/placement and other official measures route to separate legal parents.
- Monthly labels are calendar metadata, not national legal timing unless current source explicitly says so.
- `13:30` remains `LOCAL_TIME_PARAMETER`.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez.
- duplicate/calendar-instance workflow ikinci kez sayılmaz.
- named organ ve operational action ayrı workflow layerlarıdır.
- `tedbir` sözcüğü hukuki türü belirlemek için tek başına yeterli değildir.
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
- RAM counseling/official-measure monthly families — split/duplicate/scope normalization devam ediyor.

## V47 önceliği — 300+ atom
1. 2026 Danışmanlık Tedbiri Tebliğinin exact madde/fıkra atomlarını current masterdaki saf danışmanlık-tedbiri workflowlarıyla eşleştir; compound olmayan mevcut ID bulursan promote et.
2. RAM genel görüşme işlerini current Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliğiyle ayrı exact family olarak çöz.
3. `HB-0943/HB-0944` duplicate kökenini canonical source satırı bazında kesinleştir.
4. `HB-0137/0513/0762` generic official-measure family için legal-type discriminator geliştir; hukuki tür belli olmadan promote etme.
5. BİLSEM Md29 operational duties ve 8 NEW_CANDIDATE organ publication alanlarını ilerlet.
6. School Health `HB-2218/HB-2229` source-level split.
7. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V47** başlat ve tek mesajda minimum **300 atom** hedefle.
