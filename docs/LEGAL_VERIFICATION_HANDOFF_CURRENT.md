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
- Büyük atomik mevzuat havuzu: **5.415**
- Son tamamlanan batch: **V44**
- Sonraki batch: **V45**

## V43 — büyük batch
- Master crosswalk: `docs/legal-master-id-crosswalk-v43.md` — `0b491db281ca31d109d1a97bf1d6c2560fc66bc7`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-200plus-v43.md` — `f3fc1b78215fa5c890689da8a62de9be3f559872`
- Verification: `docs/legal-article-verified-batch-v43.md` — `0bc30d97431ba970619b0a835e37535140c9a5e2`
- Progress: `docs/legal-verification-progress-v43-delta.json` — `18d19c46cd199010dbd4a56aa556f3062742e0f5`
- 240 support atoms.
- Exact: `HB-0501` İl Tanılama Sınav Komisyonu → BİLSEM Yönergesi Md28.
- Result: **464/2229**; atom pool **5.115**.

## V44 — 300 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300-v44.md` — `325f055a02f3369a44a093d813de9e5a269c2e3e`
- NEW current named organs: `docs/legal-new-current-organs-candidates-v44.md` — `ee256a8a953f98a16d70a1f617878f91ef57fb43`
- Verification: `docs/legal-article-verified-batch-v44.md` — `bb5079b92352df8af2685cca752385c2773786a7`
- Progress: `docs/legal-verification-progress-v44-delta.json` — `6fb49ab3d091af9d8060d23d9fee07e9de1bb994`
- **300 support atoms** added.
- Exact additions:
  - `HB-2214` — Okul-Aile Birliği Genel Kurulu (BİLSEM) → OAB Yönetmeliği Md9; scope Md1-2, Md4/ç.
  - `HB-2215` — Okul-Aile Birliği Yönetim Kurulu (BİLSEM) → Md12.
  - `HB-2216` — Okul-Aile Birliği Denetleme Kurulu (BİLSEM) → Md14.
- BİLSEM OAB records are not duplicate-counted against HEM HB-2223/24/25 because durable workflow_id + institution scope differ.
- Current official source scope explicitly covers MEB schools and education institutions.
- 8 current named legal organs missing from the 2,229 master staged as `NEW_CANDIDATE`:
  1. BİLSEM Merkez Tanılama Sınav Komisyonu Md26-27
  2. BİLSEM Görsel Sanatlar/Resim Değerlendirme Komisyonu Md30
  3. BİLSEM Müzik Değerlendirme Komisyonu Md31
  4. BİLSEM Okul Yönlendirme Komisyonu Md32-33
  5. BİLSEM Bölge Sözlü Sınav Komisyonu Md34
  6. BİLSEM İl Öğretmen Değerlendirme Komisyonu Md35
  7. BİLSEM Proje Jürisi Md40
  8. Özel Eğitim Hizmetleri Kurulu Md39-42
- NEW_CANDIDATE records do not alter 2,229 denominator before Super Admin publication/master-ID assignment.
- RAM recurring compound workflows normalized conceptually to:
  `APPLICATION/REFERRAL -> APPOINTMENT/DISTRIBUTION -> EDUCATIONAL_ASSESSMENT -> BOARD_MEETING -> DECISION/REPORT -> APPROVAL/RECORD -> OFFICIAL_MEASURE_FOLLOWUP`
- RAM `13:30` handbook time moved out of national legal semantics; only `LOCAL_TIME_PARAMETER` if tenant chooses it.
- Known RAM compound/wrong-scope rows include `HB-0204`, `HB-0205`, `HB-0277`, `HB-0512`, `HB-0598`, `HB-0599`, `HB-0761`, `HB-0941`, `HB-0942`, `HB-1141` and related monthly copies.
- Result: **467/2229 = %20,9511**; atom pool **5.415**.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez; recovered durable master evidence kullanılır.
- duplicate workflow ikinci kez sayılmaz.
- aynı maddeyi kullanan farklı durable workflow/school-type kayıtları gerçekten ayrı master workflowsa ayrı doğrulanabilir.
- mülga/eski kaynak current authority değildir.
- handbook/el kitabı provenance/evidence; son hukuki otorite değildir.
- compound workflow `WITHHELD/SPLIT` edilir.
- yanlış okul-kapsam etiketi publication öncesi düzeltilir.
- yıllık kılavuz/takvim/limit/eşik `YEAR_PARAMETER`.
- handbook sabit saatleri `LOCAL_TIME_PARAMETER`, universal legal rule değil.
- NEW current named organ önce `NEW_CANDIDATE -> SUPERADMIN -> MASTER_ID_ASSIGN -> PUBLISH` yolundan geçer.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority yok; WITHHELD.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition reconciliation bekliyor.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` — title/scope exact reconciliation bekliyor.
- `HB-0502` — obsolete annual guide + monthly report compound.
- RAM monthly compound rows — atomic split required before ARTICLE_VERIFIED.

## V45 önceliği — minimum 300 atom
1. RAM compound records için actual parent/child binding manifest oluştur; current ÖEHY Md43-45 ile exact eşleşen atomic parçaları ayır.
2. Monthly duplicate rowsı durable parent + calendar instance modeline bağla; wrong-scope PANSİYON rowsını düzeltme kuyruğuna al.
3. 8 `NEW_CANDIDATE` organ için Super Admin publication package hazırla: canonical key, scope, source, article, composition, duties, evidence, routing, versioning.
4. BİLSEM monthly rows içinde Md29 duties ile exact operational match veren durable workflowları ara.
5. Özel Eğitim Hizmetleri Kurulu için master yayınlamadan önce collision/duplicate taraması yap.
6. School-health conflict source-by-source split et.
7. ARTICLE_VERIFIED yalnız exact mevcut-master rows için artsın.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V45** başlat ve tek mesajda minimum **300 atom** hedefle.
