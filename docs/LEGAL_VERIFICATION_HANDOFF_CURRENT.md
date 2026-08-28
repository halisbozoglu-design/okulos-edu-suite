# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **469 / 2.229 = %21,0408**
- Kalan exact doğrulama: **1.760**
- Büyük atomik mevzuat havuzu: **7.815**
- Son tamamlanan batch: **V49**
- Sonraki batch: **V50**

## V49 — 600 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v49.md` — `5ce23b4bac56c06aeb66371ab8f98f282268803f`
- Verification: `docs/legal-article-verified-batch-v49.md` — `0e1527718046bccfae759c5418465576a45574ea`
- RAM consultancy normalization: `docs/legal-ram-consultancy-normalization-v49.md` — `4646bcc009f5abd4107c26fbbe8ba17fc36cad99`
- Progress: `docs/legal-verification-progress-v49-delta.json` — `4646b434d75a74cd5e9ea981c5e371efbb08cf2b`
- Support atoms: **600**; atom pool **7.215 -> 7.815**.
- ARTICLE_VERIFIED: **467 -> 469**.

### Exact promotions
1. `HB-0395` — sorumluluk bölgesindeki rehber öğretmen/psikolojik danışmanlarla eğitim-öğretim yılı ilk toplantısı -> current RAM Yönergesi **Md5/4-a/7**.
2. `HB-0138` — sorumluluk bölgesindeki rehber öğretmen/psikolojik danışmanlarla yıl sonu toplantısı -> current RAM Yönergesi **Md5/4-a/7**.

Guard:
- `HB-0516` aynı beginning-of-year first-meeting semantiğinin Ekim kopyası; duplicate/calendar-instance olarak ikinci kez sayılmaz.
- Ara dönem toplantısı Md5/4-a/7 altında bağımsız zorunlu national event değildir; current hüküm başlangıç + bitiş olmak üzere yılda en az iki toplantıyı zorunlu tutar.

### RAM Md5/4-a atomic parents
- `RAM_SCHOOL_PROGRAM_PREP_CONSULTANCY` -> a/1
- `RAM_SCHOOL_PROGRAM_REVIEW_FEEDBACK` -> a/2
- `RAM_NO_COUNSELOR_GENERAL_LOCAL_TARGET_WORK` -> a/3
- `RAM_SCHOOL_VISIT_CONSULTANCY` -> a/4
- `RAM_STAKEHOLDER_TRAINING_ACTIVITY` -> a/5
- `RAM_NEEDS_ANALYSIS_LOCAL_TARGET_EVALUATION` -> a/6
- `RAM_COUNSELOR_YEAR_START_END_MEETINGS` -> a/7
- `RAM_YEAR_START_MEETING_PLANNING_GROUPS` -> a/8

### Generic consultancy family
`HB-0141`, `HB-0208`, `HB-0280`, `HB-0396`, `HB-0685`, `HB-0767`, `HB-0863`, `HB-0948` ve benzerlerindeki `Resmi/özel okul ve kurumlara yönelik müşavirlik çalışmalarının yapılması` ifadesi current Md5/4-a altındaki birden fazla müşavirlik türünü ayırt etmediği için whole-row ARTICLE_VERIFIED yapılmaz.

### Visit family
`HB-0764`, `HB-0946`, `HB-0947`, `HB-1143` gibi visit-only kayıtlar current Md5/4-a/4 ile güçlü kısmi eşleşir; fakat current hüküm ziyarete ek olarak rehber öğretmen/psikolojik danışman, öğretmen ve yönetime müşavirlik sunulmasını da içerir. Legacy row yalnız ziyaret dediği için `PARTIAL_EXACT_ACTION`, promote edilmez.

### Program review
- `HB-0517`, `HB-0601`: program review + generic consultancy compound -> `SPLIT_REQUIRED`.
- `HB-0602`: program review/form feedback operationally Md5/4-a/2 ile uyumlu; fakat master scope yanlışlıkla PANSİYONLU. `SCOPE_CORRECTION_READY`; Super Admin correction publication öncesi ARTICLE_VERIFIED değil.
- `HB-0603`: `Okul risk haritalarının uygulanması` belirsiz; `ACTION_SCOPE_REWRITE_REQUIRED`.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + current official source + exact article/paragraph + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title tahmin edilmez.
- duplicate/calendar-instance ikinci kez sayılmaz.
- yanlış scope/legal-family düzeltilip yayımlanmadan ARTICLE_VERIFIED olmaz.
- handbook/el kitabı evidence/provenance; final authority değildir.
- compound workflow `WITHHELD/SPLIT`.
- month label national legal timing değildir.
- completed historical instances immutable.
- tenant override immutable legal core/source değiştiremez.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition conflict.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` — exact title/scope reconciliation.
- `HB-0502` — obsolete annual guide + monthly report compound.
- `HB-0602` — Super Admin scope correction publication pending.
- `HB-0603` — actor/action rewrite pending.

## V50 önceliği — 300+ atom
1. RAM Yönergesi Md5/4-a/1, a/2, a/3, a/4, a/5, a/6, a/8 için canonical masterda gerçekten source-exact standalone IDs ara; yalnız exact olanları terfi et.
2. `HB-0602` corrected durable payload + Super Admin publication patch planını finalize et; migration 0.
3. Yıl başı/yıl sonu toplantı ailesindeki duplicate IDs ve mid-year optional instances manifestini tamamla.
4. RAM visit records için legacy evidence satırlarında müşavirlik çıktısı bulunup bulunmadığını tekrar test et.
5. School Health `HB-2218/HB-2229` conflict split.
6. BİLSEM Md29 operational duties + 8 NEW_CANDIDATE publication paketini ilerlet.
7. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V50** başlat; minimum **300 atom** hedefle.
