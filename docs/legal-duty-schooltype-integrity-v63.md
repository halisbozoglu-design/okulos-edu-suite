# V63 — Nöbet / Taşıma Resmî Kaynak Integrity

Kaynak politikası: yalnız mevzuat.gov.tr, mevzuat.meb.gov.tr, MEB resmî birimleri ve resmigazete.gov.tr.

## Nöbet rejimi: school-type ayrımı

Current official parents:
- Ortaöğretim Kurumları Yönetmeliği Md91.
- Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği Md44.

### HB-1655
Master: öğretmen nöbeti nöbet çizelgesine göre yerine getirir.
- OÖKY Md91/1: exact secondary-school parent.
- OÖİKY Md44/4: ilköğretim için okul müdürlüğünce düzenlenen nöbet çizelgesine göre görev.
Status: SCHOOL_TYPE_PROFILE_REQUIRED. Broad ALL row doğrudan tek maddeyle doğrulanmaz.

### HB-1656
Master: nöbet, dersin en az bulunduğu gün/günlerde verilir.
- OÖKY Md91/2-a exact.
- OÖİKY Md44'te aynı şart yok.
Status: SECONDARY_ONLY_SEMANTICS + SCHOOL_TYPE_SPLIT_REQUIRED.

### HB-1657
Master: birden fazla okulda ders varsa kadrosunun bulunduğu okul; orada dersi yoksa en çok ders okuttuğu okul.
- OÖKY Md91/2-b aynı `kadrosunun bulunduğu okul` semantiğini taşır.
- OÖİKY Md44/5 `aylığını aldığı okul` semantiğini kullanır.
Status: SCHOOL_TYPE_SEMANTICS_SPLIT_REQUIRED.

### HB-1658
Master sabit 15 dakika önce/sonra.
- OÖKY Md91/2-c: 15 dakika; taşımalı eğitimde kurul kararıyla 30 dakikaya çıkarılabilir.
- OÖİKY Md44/8: default 30 dakika; okul özelliğine göre kurul kararıyla en az 15 dakikaya indirilebilir.
Status: LEGAL_PARAMETER_DIVERGENCE + SCHOOL_TYPE_REWRITE_REQUIRED.

### HB-1659
Master doğumdan sonra iki yıl.
- OÖKY Md91/2-ç: doğuma 12 hafta kala + doğumdan sonra 1 yıl.
- OÖİKY Md44/7: doğuma 3 ay kala + doğumdan itibaren 1 yıl.
Status: LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED. Sessiz kaynak değişimi yasak.

### HB-1660
Master yeterli öğretmen varsa kadın 20 / erkek 25 hizmet yılı sonrası muafiyet.
- OÖKY Md91/2-d: istekleri hâlinde muaf tutulabilir; nöbet aksarsa görev verilebilir.
- OÖİKY Md44/6: öğretmen yeterliyse görev verilmez; ihtiyaç hâlinde verilebilir.
Status: SCHOOL_TYPE_CONDITION_SEMANTICS_SPLIT_REQUIRED.

### HB-1661
Master: nöbet esasları öğretmenler kurulunda görüşülür ve yönetimce yazılı duyurulur.
- OÖKY Md91/2-e exact.
- OÖİKY Md44/10 aynı çekirdeği taşır ancak ayrıca nöbetçi öğretmen görev talimatnamesi hazırlanmasını emreder.
Status: PROFILE_SPLIT; ilköğretim profili ek mandatory step'i kaybetmemeli.

### HB-1662
Master: özürsüz nöbete gelmeme, derse özürsüz gelmeme gibi işleme alınır.
- OÖKY Md91/2-f.
- OÖİKY Md44/9.
Same action in both school families; ancak durable ALL metadata diğer kurum türlerini de kapsadığı için tek global ARTICLE_VERIFIED yapılmaz.

### HB-1663
Master: engelli öğretmenler ve engelli çocuğu olan öğretmenlerin gün/saat tercihine öncelik.
- OÖKY Md91/2-g iki grubu da kapsar.
- OÖİKY Md44/11 yalnız engelli çocuğu bulunan öğretmenleri düzenler.
Status: PARTIAL_SCOPE_MISMATCH + SPLIT_REQUIRED.

### HB-1664
Master: öğretmeni bulunmayan sınıfın düzeni ve etüt çalışmasını nöbetçi öğretmen sağlar.
- OÖKY Md91/2-h exact.
- OÖİKY Md44'te aynı hüküm bulunmadı.
Status: SECONDARY_ONLY + SCHOOL_TYPE_SPLIT_REQUIRED.

### HB-1665
Legacy master, özel eğitim sınıfı ve anaokulu öğretmenlerini aynı cümlede `kendi sınıflarında nöbet` şeklinde birleştiriyor.
- OÖKY Md91/2-ğ: özel eğitim sınıflarında görev yapan özel eğitim öğretmenleri nöbetten muaftır.
- OÖİKY Md44/2: bağımsız anaokulu, ana sınıfı ve uygulama sınıfı öğretmenleri kendi devrelerinde ve etkinlik saatleri dışında nöbet tutar.
Status: LEGACY_COMPOUND_CONFLICT + MASTER_REWRITE_AND_SPLIT_REQUIRED.

### HB-1666
Master: `Nöbet defteri tutulmaktadır.`
- OÖKY Md91 ve OÖİKY Md44 genel bir `nöbet defteri tutulur` hükmü vermiyor.
- Current Taşıma Yoluyla Eğitime Erişim Yönetmeliği Md13/4-h, yalnız taşıma kapsamındaki olumsuzlukların nöbet defterine işlenmesi veya tutanak düzenlenmesini öngörür.
Status: GENERAL_DUTY_WITHHELD; TRANSPORT_CONTEXT_EVIDENCE_ONLY. Bu hüküm genel defter tutma yükümlülüğüne genişletilemez.

## HB-1573
Master: servis araçları öğrencileri zamanında kuruma getirir.
Official MEB `Okul Servis Araçlarının Çalıştırılmasına İlişkin Usul ve Esaslar`, EK-1 Tip Şartname Md3/1-a: taşımacı öğrenciyi valilikçe belirlenen okul açılış saatinden 15 dakika önce okula bırakır ve kapanıştan 15 dakika sonra alır.
Status: ARTICLE_VERIFIED_RETAINED_OFFICIAL_SOURCE. Delta 0.

## Count decision
No new durable ALL row promoted in this batch. No previously counted row in the 1655-1666 family was proven eligible for rollback from current canonical count. HB-1573 remains counted.
ARTICLE_VERIFIED delta: 0.
Migration: 0. Lovable: 0.
