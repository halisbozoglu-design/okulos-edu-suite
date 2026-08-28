# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **8.235**
- Son tamamlanan batch: **V50**
- Sonraki batch: **V51**

## V49 düzeltmesi
V49'da `HB-0395` ve `HB-0138`, 31.08.2020 tarihli RAM Yönergesi Md5/4-a/7 current authority kabul edilerek ARTICLE_VERIFIED yapılmıştı. V50'de judicial-status kontrolü sonucunda bu dayanak current-authority şartını karşılamadığı için iki terfi geri alınmıştır.

Historical V49 artifacts korunur; canonical current counter V50 ile düzeltilmiştir.

## V50 — 420 atom / integrity reconciliation
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v50.md` — `0fd731785b70ccde4c3a5212a37190b7c0455ac7`
- Judicial-status guard: `docs/legal-current-authority-judicial-status-guard-v50.md` — `14cb2f53b896bcc4b4d9a6e0a49f75fd53378404`
- Verification rollback: `docs/legal-article-verified-batch-v50.md` — `2286976863b30f6348470fb5f754fa83ce7dc8c9`
- Progress: `docs/legal-verification-progress-v50-delta.json` — `2fd378d01a564279e49770eef62b0bf5a1f08f75`
- Support atoms: **420**; atom pool **7.815 -> 8.235**.
- ARTICLE_VERIFIED: **469 -> 467**.

### RAM Yönergesi judicial status
Danıştay 8. Dairesi E.2020/6422 K.2024/2231, 24.04.2024 tarihli kararıyla 2020 Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği Md14 ile 31.08.2020 tarihli Rehberlik ve Araştırma Merkezi Yönergesinin bütününün iptaline karar vermiştir. Daha eski yargısal materyallerde Yönergenin tamamı yönünden yürütmenin durdurulduğu da görülmektedir.

Bu nedenle MEB'in eski mevzuat/archive sayfasında PDF linkinin bulunması `current_effect=true` anlamına gelmez.

### New current-authority gate
`OFFICIAL_SOURCE_FOUND -> EFFECTIVE_DATE_CHECK -> REPEAL/REPLACEMENT_CHECK -> JUDICIAL_STATUS_CHECK -> CURRENT_EFFECT_CONFIRMED -> EXACT_ARTICLE_SCOPE_MATCH -> ARTICLE_VERIFIED`

Fail states:
- REPEALED
- REPLACED
- STAYED/SUSPENDED
- ANNULLED
- EXPIRED

### Rollback
- `HB-0395` -> `WITHHELD_CURRENT_AUTHORITY`
- `HB-0138` -> `WITHHELD_CURRENT_AUTHORITY`

Bunların legacy metinleri workflow/process evidence olarak korunur; bağımsız current Regulation/Law/CBK exact parent bulunmadan ARTICLE_VERIFIED olmaz.

### RAM Md5-derived families
Aşağıdaki aileler yalnız iptal edilmiş/stayed RAM Yönergesi Md5 ile exact bağlanıyorsa current verification alamaz:
- school-program preparation consultancy
- school-program review/feedback
- institutions-without-counsellor work
- school visit consultancy
- stakeholder training activities
- needs-analysis/local-target evaluation
- year-start/year-end counsellor meetings
- year-start planning/team creation

Status: `CURRENT_PARENT_RESEARCH_REQUIRED`.

### HB-0602
Master scope `PANSİYONLU OKULLAR` hatası hâlâ geçerlidir; ancak RAM Yönergesi Md5/4-a/2 artık current authority olarak kullanılmayacaktır.
Status:
- `SCOPE_ERROR_CANDIDATE`
- `CURRENT_PARENT_RESEARCH_REQUIRED`
Super Admin correction ancak current exact parent belirlendikten sonra publish edilir.

### HB-0603
`Okul risk haritalarının uygulanması` belirsizdir. Current RPD Regulationdaki school-side create/send duties ayrı atomlardır; RAM'e source-exact olmayan uygulama görevi üretilmez.
Status: `ACTION_SCOPE_REWRITE_REQUIRED`.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + current official source + exact article/paragraph + matching operational/applicability scope` birebir olduğunda artar.

Ek guard:
- official hosting != current legal effect.
- directive/circular/guide için repeal/replacement/judicial-status kontrolü zorunlu.
- ID-title tahmin edilmez.
- duplicate/calendar-instance ikinci kez sayılmaz.
- yanlış scope/legal-family düzeltilip yayımlanmadan ARTICLE_VERIFIED olmaz.
- handbook/el kitabı evidence/provenance; final authority değildir.
- compound workflow `WITHHELD/SPLIT`.
- completed historical instances immutable.

## Açık kritik kayıtlar
- RAM legacy Md5 families -> current Regulation/Law parent research.
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition conflict.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` — exact title/scope reconciliation.
- `HB-0502` — obsolete annual guide + monthly report compound.
- `HB-0602` — scope error + current-parent research.
- `HB-0603` — actor/action rewrite pending.

## V51 önceliği — 300+ atom
1. RAM operational tasks için iptal edilmiş 2020 Yönerge yerine current upper-level authority ara: 573/ilgili KHK-Kanun hükümleri, current Özel Eğitim Hizmetleri Yönetmeliği, current RPD Regulation surviving provisions ve yeni MEB düzenlemeleri.
2. `HB-0395/HB-0138` için bağımsız current exact parent bulunursa yeniden terfi; bulunmazsa withheld.
3. `HB-0602` için current source exact program-review duty araştır; scope correction only after authority is safe.
4. RAM visit/consultancy family için current legal parent araştır.
5. Source-validity auditini daha önce ARTICLE_VERIFIED yapılan directive/guide-based kayıtlar üzerinde genişlet.
6. School Health `HB-2218/HB-2229` conflict split.
7. BİLSEM current directive judicial/repeal status guard + Md29 operational duties.
8. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V51** başlat; minimum **300 atom** hedefle.
