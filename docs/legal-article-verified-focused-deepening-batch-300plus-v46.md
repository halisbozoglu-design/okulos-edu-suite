# V46 — RAM Danışmanlık Tedbiri / Özel Eğitim Derinleştirme

Tarih: 2026-08-28
Repo: `halisbozoglu-design/okulos-edu-suite`
Migration: **0**
Batch: **420 support atoms**

## Amaç
RAM aylık kayıtlarındaki tekrar, compound ve yanlış hukuk ailesi bağlarını temizleyerek 2026 güncel hukuki çekirdeğe bağlamak; yalnız whole-row exact kayıtları ARTICLE_VERIFIED saymak.

## Güncel resmî kaynaklar
1. MEB ORGM — 24.04.2026 tarihli, 33223 sayılı Resmî Gazete'de yayımlanan **Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ**. ORGM mevzuat sayfası 11.05.2026 günceldir.
2. MEB Özel Eğitim Hizmetleri Yönetmeliği — Özel Eğitim Değerlendirme Kurulu Md43-45.

## 2026 Danışmanlık Tedbiri hukuki çekirdeği
- MEB/Aile ve Sosyal Hizmetler/yerel yönetim sorumluluk ayrımı korunur.
- MEB kapsamında çocuk okul/kuruma kayıtlı ise okul rehber öğretmeni/psikolojik danışman; gerekli hallerde il/ilçe MEM görevlendirmesi uygulanır.
- Çocuğun herhangi bir okul/kurumla ilişiği yoksa ilgili RAM üzerinden süreç yürütülür.
- Atama, ilk görüşme, uygulama planı, izleme, görüşme periyodu, üç aylık değerlendirme raporu ve mahkeme kararıyla sonlandırma ayrı atomlardır.
- Süreç `CONDITION_TRIGGERED`; aylık rehber/el kitabı satırları ulusal hukukta Mart/Ekim/Ocak zorunluluğu oluşturmaz.

## RAM master reconciliation
### A. `Öğrencilerin resmi tedbirlerinin alınması ve takip edilmesi`
Kanonik masterda aynı ifade birden fazla aylık kayıt olarak bulunur; en az:
- HB-0137 — Haziran
- HB-0513 — Ekim
- HB-0762 — Ocak
ve aynı ifadeyi compound satır içinde taşıyan HB-0204, HB-0598, HB-0858, HB-0941 vb.

Karar:
- Bu ifade **ÖEHY Md44 ile whole-row exact değildir**. Md44 Özel Eğitim Değerlendirme Kurulunun eğitsel değerlendirme/tanılama, rapor, aile katılımı, eğitim ortamı önerisi vb. görevlerini sayar; jenerik `resmî tedbirlerin alınması ve takip edilmesi` ifadesi tek başına Md44'e zorlanamaz.
- `TEDBIR_SCOPE_REVIEW` olarak ayrılır.
- Eğer kayıt danışmanlık tedbiri mahkeme kararını ifade ediyorsa 2026 Tebliğ ile; özel eğitim yerleştirme/tedbirini ifade ediyorsa ilgili özel eğitim hükmüyle ayrı ayrı bağlanmalıdır.

### B. `Merkezimize başvuran ve yönlendirilen öğrenci ve velileriyle görüşmelerin yapılması ve danışmanlık tedbiri görüşmelerinin sürdürülmesi`
Kanonik masterda standalone veya compound tekrarlar vardır; örnek:
- HB-0278
- HB-0680
- HB-0943
- HB-0944
- HB-0206 / HB-0600 / HB-0763 / HB-1040 gibi Şiddet İl Eylem Planı ile birleşmiş satırlar
- HB-0514 gibi okul müdürleri toplantısıyla birleşmiş satırlar.

Karar:
- Satır iki ayrı hukuki işi birleştirir:
  1. `GENERAL_RAM_COUNSELING_INTERVIEW`
  2. `COUNSELING_MEASURE_EXECUTION`
- 2 numaralı parça için güncel 2026 Tebliğ güçlü/exact kaynak ailesidir.
- Whole-row `ARTICLE_VERIFIED` yapılmaz; önce SPLIT gerekir.
- Aylık tekrarlar durable legal parent değil, `CALENDAR_INSTANCE / LEGACY_MONTH_CHILD` olarak ele alınır.
- HB-0943 ve HB-0944 aynı ay + aynı metin olduğundan `DUPLICATE_EXTRACTION_REVIEW`.

## ÖEHY Md43-45 exact atomları
- Md43: kurulun RAM'da oluşturulması, başkan/üyeler, veli/birey katılımı, gerektiğinde dış kurum personeli, yedek üyeler.
- Md44/a: eğitsel değerlendirme/tanılama ve özel eğitim ihtiyacına karar.
- Md44/b: Özel Eğitim Değerlendirme Kurulu Raporu düzenleyip RAM müdürünün onayına sunma.
- Md44/c: bilgi/belge dosyası inceleme.
- Md44/ç: itiraz üzerine yeniden değerlendirme/tanılama.
- Md44/d: en az sınırlandırılmış eğitim ortamı/özel eğitim hizmeti önerisi.
- Md44/e: aile katılımı ve bilgilendirme.
- Md44/f: aile eğitim programları.
- Md44/g: özel öğretim kurumlarında destek eğitim planı.
- Md44/ğ: Bakanlıkça tanılanan özel yetenekli öğrenciyi BİLSEM'e yönlendirme.
- Md44/h: kılavuz takvimi dışındaki belirli öğrencileri destek eğitim odasına yönlendirme.
- Md45: iki yıllık üyelik, 5 iş gününde yenileme, çoğunluk, 30 iş gününde karar/rapor, mazerette yedek üye.

## Model düzeltmeleri
`RAM_LEGAL_PARENT`
→ `APPLICATION_OR_REFERRAL`
→ `ASSESSMENT_AND_DIAGNOSIS`
→ `BOARD_DECISION`
→ `REPORT_AND_APPROVAL`
→ `PLACEMENT_OR_SERVICE_RECOMMENDATION`
→ `FAMILY_INFORMATION`
→ `FOLLOW_UP`

Danışmanlık tedbiri ise ayrı parent:
`COUNSELING_MEASURE_COURT_DECISION`
→ `RESPONSIBLE_INSTITUTION`
→ `ASSIGN_COUNSELOR`
→ `FIRST_CONTACT`
→ `IMPLEMENTATION_PLAN`
→ `INTERVIEWS`
→ `MONITORING_CRITERIA`
→ `QUARTERLY_REPORT`
→ `COURT_CONTINUE/END_DECISION`

## Guard sonuçları
- HB-0137: WITHHELD — exact ÖEHY Md44 değildir.
- HB-0513: WITHHELD/INSTANCE — HB-0137 ile aynı semantik aile.
- HB-0762: WITHHELD/INSTANCE — aynı semantik aile.
- HB-0943/HB-0944: SPLIT + DUPLICATE REVIEW.
- HB-0206/HB-0600/HB-0763/HB-1040: SPLIT; danışmanlık tedbiri + Şiddet İl Eylem Planı aynı satırda tutulmaz.
- RAM `13:30`: LOCAL_TIME_PARAMETER.
- PANSİYON etiketi altına sızan RAM satırları: SCOPE_ERROR_CANDIDATE.

## 420 atom dağılımı
- 2026 Danışmanlık Tedbiri Tebliği lifecycle/procedure: 110
- ÖEHY Md43-45 exact decomposition: 90
- RAM monthly duplicate/instance reconciliation: 110
- counseling-vs-special-education tedbir scope guards: 55
- scope/timing/evidence/versioning/publication guards: 55

Toplam: **420**

## ARTICLE_VERIFIED sonucu
Bu batchte whole-row exact koşulunu yeni karşılayan mevcut master kayıt saptanmadı. Sayaç zorla artırılmadı.

Başlangıç: **467 / 2,229**
Bitiş: **467 / 2,229 = %20,9511**
Atom havuzu: **5,775 → 6,195**
Kalan exact: **1,762**
Migration: **0**
