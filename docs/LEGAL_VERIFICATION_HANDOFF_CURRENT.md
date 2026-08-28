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
- Büyük atomik mevzuat havuzu: **6.675**
- Son tamamlanan batch: **V47**
- Sonraki batch: **V48**

## V46 — 420 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v46.md` — `47e7aa942e907533ccccf74bf3834a86f1df83db`
- RAM counseling reconciliation: `docs/legal-ram-counseling-measure-reconciliation-v46.md` — `f13633774a6edb2b1a97c931f9d7750cb159db08`
- Verification: `docs/legal-article-verified-batch-v46.md` — `387b4ab31e37885633c494dab14ffd5b0867a2b2`
- Progress: `docs/legal-verification-progress-v46-delta.json` — `332afacc90769f29380d09e6e3f607f0691edb21`
- Result: **467/2229**; atom pool **6.195**.
- NOTE: V46'daki `24.04.2026 / RG 33223` metadata ifadesi V47'de düzeltildi. Doğru sayı **33233**.

## V47 — 480 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v47.md` — `710ba3feb128a1ddeb18adc27ea263fc50513834`
- Verification: `docs/legal-article-verified-batch-v47.md` — `c3b17ce2ee9e4758c3f17e7febe1ac6b774d3299`
- Progress: `docs/legal-verification-progress-v47-delta.json` — `329a092db6a80e4fd9d9c96f1845676dd8e210ae`
- **480 support atoms** added.
- ARTICLE_VERIFIED increment: **0**; result **467/2229 = %20,9511**.
- Current authority: **24.04.2026 tarihli ve 33233 sayılı Resmî Gazete**'de yayımlanan `Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ`.
- Resmî Gazete daily issue + published Tebliğ PDF metadata prevails over ORGM listing typo `33223`.
- 2026 Tebliğ durable parameter core extracted:
  - Md7: MEB uygulayıcı/routing rules; school-linked child -> school counselor, counselor absent -> il/ilçe assignment, no school relation -> RAM.
  - Md8: 15 günde bir / asgari 8 oturum; conditional online sessions in school holidays; max 15 files per counselor; application-plan source and role separation rules.
  - Md9: 5 workday institutional assignment; 3 workday process start; family 10-day application; first interview + 5 workday court plan submission; monitoring, 3-month reporting, continuation/termination and mandatory notification branches.
- General RAM client interview is legally separated from court-ordered counseling measure. Legacy text joined with `ve` must split to two process parents.
- `HB-0278`, `HB-0680`, `HB-0943`, `HB-0944` and analogous month records remain LEGACY_CALENDAR_INSTANCE / SPLIT_REQUIRED; no whole-row promotion.
- `HB-0943/HB-0944`: same March/source text; duplicate extraction risk.
- `HB-1040` and analogous records: counseling + Şiddet İl Eylem Planı compound; split first.
- Standalone monthly RAM consultancy rows such as `HB-0141`, `HB-0208`, `HB-0280`, `HB-0396`, `HB-0685`, `HB-0948` recovered; duplicate legal-parent counting prohibited until current source-exact RAM duty binding is established.
- `HB-0602`: RAM school-guidance-program review text carrying PANSİYONLU scope label -> `SCOPE_ERROR_CANDIDATE`.
- `HB-0603`: school-risk-map workflow appears incorrectly mapped to SOCIAL_ACTIVITIES family -> `LEGAL_FAMILY_ERROR_CANDIDATE`.
- Old 2008 counseling communiqué/handbook rules are historical for future instances after 2026 current authority.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez.
- duplicate/calendar-instance workflow ikinci kez sayılmaz.
- named organ ve operational action ayrı workflow layerlarıdır.
- general RPD görüşmesi ile mahkeme kararlı danışmanlık tedbiri aynı workflow değildir.
- `tedbir` sözcüğü tek başına hukuki tür belirlemez.
- mülga/eski kaynak current authority değildir.
- handbook/el kitabı provenance/evidence; son hukuki otorite değildir.
- compound workflow `WITHHELD/SPLIT` edilir.
- yanlış scope ve legal-family publication öncesi düzeltilir.
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
- RAM recurring counseling and consultancy families — parent/calendar-instance normalization sürüyor.

## V48 önceliği — 300+ atom
1. Current 2026 Counseling Measure Communiqué için durable process template alanlarını tamamla: trigger, role routing, deadline engine, evidence, court-report lifecycle, conditional online-session rule, max-file capacity.
2. Masterdaki counseling family için tüm ayların ID manifestini çıkar ve duplicate/split/calendar-instance sınıflandırmasını tamamla.
3. RAM standalone consultancy / school-program review / risk-map workflows için current source-exact authority ara; source yoksa promote etme.
4. `HB-0602` scope ve `HB-0603` legal-family correction paketini Super Admin staging formatına getir.
5. General RPD client interview parentı için current RPD Regulation + RAM directive exact operational provision ara.
6. BİLSEM Md29 duties ve NEW_CANDIDATE publication paketini ilerlet.
7. School Health `HB-2218/HB-2229` conflict split.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V48** başlat; tek mesajda minimum **300 atom** hedefle.
