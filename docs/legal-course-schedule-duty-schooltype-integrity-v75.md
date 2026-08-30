# V75 — Ders Programları / Nöbet / Okul Türü Mevzuat Bütünlüğü

Tarih: 2026-08-30
Repo: halisbozoglu-design/okulos-edu-suite
Migration: 0
Lovable: 0

## Kaynak politikası
Yalnız resmî MEB / mevzuat.meb.gov.tr / Resmî Gazete zinciri ARTICLE_VERIFIED parentı olarak kabul edilir. El kitabı ve TKB rehberi aday/operasyonel kanıt olabilir; exact hükmü ikame etmez.

## Master sınırı
- HB-1642..HB-1654: Ders Programları
- HB-1655..HB-1667: Nöbet Görevi
- HB-1668+: Öğrenci kayıt/nakil alanına geçiş

## Temel sonuçlar

### HB-1642
Master: Haftalık ders programının okul müdürü onayına bağlı uygulanması.
Durum: SCHOOL_TYPE_SPECIFIC_EXACT_PARENT_REQUIRED.
Ortaöğretim ve okul öncesi/ilköğretim hükümleri aynı maddede/aynı semantikte değildir. Broad ALL satır tek okul-türü hükmüyle ARTICLE_VERIFIED yapılamaz.

### HB-1643
Master: Yönetici/öğretmen derslerinin gün-saat dağılımı + ilgililere yazılı/imza karşılığı duyuru.
Durum: COMPOUND_DISTRIBUTION_AND_NOTIFICATION + SCHOOL_TYPE_SPLIT_REQUIRED.
Hazırlama/dağıtım ve tebliğ kanıtı ayrı atomlardır.

### HB-1644
Master: eğitim ortamı + öğretmen durumu + süt izni + pedagojik esaslar.
Durum: MULTI_CONDITION_PROGRAM_BUILD + STATUS_SPECIFIC_SOURCE_REQUIRED.
Süt izni/personel hakkı atomu genel programlama ilkeleriyle birleştirilemez.

### HB-1645
Master: derslerin üst üste/dengeli dağıtımı + bayrak töreni dikkati + beden eğitimi/müzik ilk-son iş günü özeni.
Geçmiş Batch02'de yanlış kaynakla ARTICLE_VERIFIED yazılmıştı; V60 kanonik rollback zaten uygulanmıştır. V75'te ikinci rollback yok.
Durum: ROLLBACK_ALREADY_ACCOUNTED + MASTER_REWRITE/SCHOOL_TYPE_SPLIT.
Batch02'nin 28.07.2026 RG Md90/2 eşleştirmesi içerik olarak bu workflow'u ispatlamaz.

### HB-1646
Master: uygulamalı dersler imkân ölçüsünde ders bütünlüğünü bozmayacak ve birbirini izleyecek.
Durum: SCHOOL_TYPE_SPECIFIC_EXACT_TEXT_CANDIDATE; broad ALL metadata nedeniyle WITHHELD.

### HB-1647
Master: aynı gün teori + uygulama varsa teori öğleden önce, uygulama öğleden sonra tercih edilir.
Durum: SCHOOL_TYPE_SPECIFIC_EXACT_TEXT_CANDIDATE; broad ALL metadata nedeniyle WITHHELD.

## Nöbet zinciri

### HB-1655
Master: öğretmenler nöbet çizelgesine göre nöbeti yerine getirir.
- Ortaöğretim: OÖKY Md91/1 exact family.
- Özel eğitim: Özel Eğitim Hizmetleri Yönetmeliği Md60/1 exact family.
- Okul öncesi/ilköğretim: kendi Md44 nöbet yapısı.
Durum: SAME_ACTION_DIFFERENT_SCHOOLTYPE_PARENT. Broad ALL satır tek maddeyle promote edilmez.

### HB-1656
Master: dersinin en az bulunduğu gün/günlerde nöbet.
Ortaöğretim OÖKY Md91/2-a ile exact; tüm okul türleri için ortak parent değildir.
Durum: SCHOOL_TYPE_SPLIT_REQUIRED.

### HB-1657
Master: birden fazla okulda ders görevi; kadro okulu, orada dersi yoksa en çok ders okuttuğu okul.
Ortaöğretim OÖKY Md91/2-b exact. Okul öncesi/ilköğretim metni 'aylığını aldığı okul' terminolojisi kullanır; master terminolojisi okul-türü bağımlıdır.
Durum: SCHOOL_TYPE_AND_EMPLOYMENT_TERMINOLOGY_SPLIT.

### HB-1658
Master: nöbet ilk dersten 15 dk önce, son dersten 15 dk sonra.
Current ortaöğretim OÖKY Md91/2-c (RG 05.09.2019/30879): varsayılan 30 dakika; okul özelliğine göre öğretmenler kurulu kararıyla 15 dakikadan az olmamak üzere kısaltılabilir.
Current özel eğitim Md60/2: 30 dakika.
Okul öncesi/ilköğretim Md44/8: 30 dakika; okul özelliğine göre 15 dakikadan az olmamak üzere kısaltma.
Durum: FIXED_15_MINUTES_IS_FALSE_AS_UNIVERSAL_DEFAULT + MASTER_REWRITE_REQUIRED.

### HB-1659
Master: kadın öğretmene doğuma 12 hafta kala ve doğumdan sonra 2 yıl nöbet verilmez.
Current ortaöğretim OÖKY Md91/2-ç, RG 08.09.2023/32303 değişiklik zinciri: hamileliğin 24. haftasından itibaren, doğum sonrası analık izninin bitimini takip eden iki yıllık sürenin sonuna kadar, istememesi halinde nöbet verilmez.
Master üç exactness alanını kaybediyor/değiştiriyor: başlangıç tetikleyicisi (12 hafta != 24. hafta), iki yılın başlangıç referansı (doğum != analık izni bitimi), isteğe bağlılık semantiği.
Okul öncesi/ilköğretim için RG 10.07.2019 Md44/7 bir yıllık farklı yapı taşır; sonraki amendment chain ayrıca school-type current snapshot ile izlenmelidir.
Durum: TIMING_TRIGGER + DURATION_REFERENCE + OPTIONALITY_MISMATCH + SCHOOL_TYPE_SPLIT.

### HB-1660
Master: yeterli öğretmen varsa kadın 20+, erkek 25+ yıl olanlar nöbetten muaf.
Ortaöğretim current hüküm 'istekleri halinde' ve ihtiyaç halinde yeniden nöbet verilebilmesi semantiğini taşır; okul öncesi/ilköğretim de benzer ama ayrı parenttır.
Durum: CONDITIONALITY_AND_OPTIONALITY_FIELDS_REQUIRED + SCHOOL_TYPE_SPLIT.

### HB-1661
Master: nöbet esasları öğretmenler kurulunda görüşülür + okul yönetimi yazılı duyurur.
OÖİKY Md44/10 ve Özel Eğitim Md60/4 bu iki aşamalı yapıyı taşır; OÖKY okul-türü exact parent ayrıca kilitlenmelidir.
Durum: MULTI_SCHOOLTYPE_PARENT; no broad ALL promotion.

### HB-1662
Master: nöbete özürsüz gelmeme = derse özürsüz gelmeme gibi işlem.
OÖİKY Md44/9 ve Özel Eğitim Md60/3 exact family; ortaöğretim parentı ayrıca school-type snapshot ile tutulur.
Durum: SCHOOL_TYPE_SPLIT_REQUIRED.

### HB-1663
Master: engelli öğretmen + engelli çocuğu olan öğretmen için gün ve saat tercihlerine öncelik.
OÖİKY Md44/11: engelli öğretmen, engelli çocuğu veya bakmakla yükümlü engelli bireyi olanlara nöbet verilmez; ancak istemeleri halinde gün tercihlerine öncelik verilerek nöbet verilir. Master zorunlu muafiyet ve 'istemeleri halinde' koşulunu kaybediyor ve 'saat' unsurunu genişletiyor.
Özel Eğitim Md60/5 ise engelli çocuğu bulunan öğretmen için haftalık program ve nöbette gün/saat tercihi önceliği düzenler; engelli öğretmeni aynı kapsamda saymaz.
Durum: ACTOR_SCOPE + EXEMPTION + OPTIONALITY + DAY/HOUR_SEMANTICS_MISMATCH.

### HB-1664
Master: öğretmeni olmayan sınıfta nöbetçi öğretmen düzen + etüt sağlar.
OÖİKY Md44/13 yalnız sınıfın düzenini, o saatte dersi olmayan nöbetçi öğretmenin sağlamasını düzenler; 'etüt çalışması yaptırma' genişletmesi exact değildir.
Durum: OBJECT_SEMANTIC_BROADENING + WITHHELD.

### HB-1665
Master: özel eğitim sınıfları ve anaokullarında öğretmenler nöbeti kendi sınıflarında tutar.
OÖİKY Md44/2 ve Md44/12 ayrışır: okul öncesi öğretmenleri öğrencilerin bulunduğu alanlarda/kendi devresinde etkinlik saatleri dışında; özel eğitim sınıfı öğretmeni teneffüs/yemek saatlerinde kendi öğrencilerinin gözetimine devam eder. Özel Eğitim Md60/1 ayrıca özel eğitim anaokulu/anasınıfı/sınıflarını düzenler.
Durum: TWO_DISTINCT_DUTY_MODELS_MERGED + SPLIT_REQUIRED.

### HB-1666
Master: nöbet defteri tutulur.
Current universal exact binding parent henüz kilitlenemedi.
Durum: WITHHELD_CURRENT_PARENT_NOT_FOUND.

### HB-1667
Master: öğle arası nöbeti nöbetçi müdür yardımcısı ve öğretmenlerin temel ihtiyaçları gözetilerek okul müdürü tarafından dönüşümlü/dengeli düzenlenir.
Geçmiş Batch02 yanlış RG/Md90/2 eşleştirmesiyle ARTICLE_VERIFIED yapılmış, V61'de kanonik rollback zaten uygulanmıştır. OÖİKY RG 10.07.2019 değişik Md44/4 öğretmenlerin dinlenme süreleri gözetilerek dönüşümlü/dengeli okul idaresi düzenini destekler; ancak master müdür yardımcısını ve 'temel ihtiyaçlar' nesnesini ekler ve ALL kapsamındadır.
Durum: ROLLBACK_ALREADY_ACCOUNTED + ACTOR/OBJECT_BROADENING + SCHOOL_TYPE_SPLIT.

## Yeni guard'lar
- FIXED_MINIMUM_CANNOT_BE_NORMALIZED_AS_DEFAULT_DURATION
- PREGNANCY_WEEK_AND_WEEKS_BEFORE_BIRTH_ARE_NOT_INTERCHANGEABLE
- POSTPARTUM_DURATION_REFERENCE_POINT_IS_EXACTNESS_FIELD
- OPTIONAL_NO_DUTY != ABSOLUTE_NO_DUTY
- DISABLED_TEACHER_EXEMPTION != PREFERENCE_PRIORITY_ONLY
- SAME_DUTY_NAME_ACROSS_SCHOOL_TYPES_DOES_NOT_CREATE_COMMON_PARENT
- PRIOR_ROLLBACK_MUST_NOT_BE_COUNTED_TWICE
- OLD_BATCH_ARTICLE_REFERENCE_MUST_MATCH_WORKFLOW_CONTENT, NOT ONLY DOCUMENT_TITLE

## Counter effect
ARTICLE_VERIFIED: 475 -> 475. No new promotion; no duplicate rollback.
