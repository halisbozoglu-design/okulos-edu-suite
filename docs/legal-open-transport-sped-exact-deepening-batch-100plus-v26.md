# Legal Fast Batch V26 — Açık Öğretim + Taşımalı Eğitim + Özel Eğitim exact deepening

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: fast >=100 atom coverage + exact workflow promotion where current official clause aligns.
Migration count: 0

## Official sources
- Açık Öğretim Kurumları Yönetmeliği, RG 22.10.2024/32700: https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm
- Açık Öğretim Kurumları Uygulama Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/2255.pdf
- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- Taşıma Yoluyla Eğitime Erişim Yönetmeliği 2024 değişikliği: https://resmigazete.gov.tr/eskiler/2024/08/20240801-2.htm
- Özel Eğitim Hizmetleri Yönetmeliği: https://resmigazete.gov.tr/eskiler/2018/07/20180707-8.htm

## A. Açık Öğretim — 40 atoms
OPEN-001|Md1|kuruluş/eğitim/öğretim/yönetim/işleyiş kapsamı
OPEN-002|Md3|açık öğretim birimi rolü
OPEN-003|Md3|bilgi yönetim sistemi ana kayıt sistemi
OPEN-004|Md3|çalışma takvimi versioned parameter
OPEN-005|Md3|kılavuz versioned child source
OPEN-006|Md4|AÖO kurum türü
OPEN-007|Md4|AÖİHL kurum türü
OPEN-008|Md4|AÖL kurum türü
OPEN-009|Md4|MAÖL kurum türü
OPEN-010|Md4|MTAÖO kurum türü
OPEN-011|Md7/1-a|duyuru ve yetki doğrultusunda öğrenci işlemleri
OPEN-012|Md7/1-b|öğrenim belgesi aktarımı/uyum
OPEN-013|Md7/1-c|sistemden belge düzenleme
OPEN-014|Md7/1-ç|e-Okul bilgisi eksik öğrenci dosyası oluşturma
OPEN-015|Md7/1-ç|kayıt evrakını tarayıp sisteme yükleme
OPEN-016|Md23|program/ders/kredi/çizelge Bakanlık parametresi
OPEN-017|Md24/1|AÖO asgari öğrenim süresi 1 dönem
OPEN-018|Md24/2|açık öğretim liseleri asgari 8 dönem
OPEN-019|Md24/3-a|12 dönem sonrası öğrenci hakkı kısıtı
OPEN-020|Md24/3-b|sınava katılmayan aktif öğrenci dönem hakkını kullanmış sayılır
OPEN-021|Md25/1|MAÖL yüz yüze dersleri il/ilçe MEM onayıyla birimlerde
OPEN-022|Md25/1|AÖİHL yüz yüze dersleri il/ilçe MEM onayıyla birimlerde
OPEN-023|Md25|nakil dosyasının talep halinde gönderimi
OPEN-024|Md25|onaylı belge örneğinin öğrenciye verilmesi
OPEN-025|Md61/5|öğrenci bilgileri ve sınav sonuçları sistemde arşivlenir
OPEN-026|Md61/6|iş yeri açma/diploma defteri saklanır
OPEN-027|Md61/7|belge/defter/çizelge/sözleşme/form ilgili mevzuata göre arşivlenir
OPEN-028|Md62|hüküm yoksa ilgili mevzuat uygulanır
OPEN-029|Md63|2001 AÖO yönetmeliği mülga
OPEN-030|Md63|2005 AÖL yönetmeliği mülga
OPEN-031|Md63|2005 MAÖL yönetmeliği mülga
OPEN-032|OOKY21/7|MESEM öğrencisi AÖL/MAÖL/AÖİHL eşzamanlı kayıt olabilir
OPEN-033|OOKY21/7|MAÖL öğrencisi MESEM karşılığı derslerden yüz yüze eğitime devam ettirilmez
OPEN-034|new-guide|kayıt belgeleri elektronik sistemden mevcutsa yeniden istenmez
OPEN-035|new-guide|kayıt dönemi tarihleri çalışma takvimi parametresidir
OPEN-036|new-guide|yükseköğretim/mezuniyet belgeleri koşullu istenir
OPEN-037|new-guide|MAÖL uyum belgeleri koşullu istenir
OPEN-038|new-guide|AÖİHL hafızlık belgesi koşullu alınır
OPEN-039|all|eski genelge hükmü yeni yönetmelikle çelişirse bloklanır
OPEN-040|all|completed historical open-ed records immutable

## B. Taşıma Yoluyla Eğitime Erişim — 40 atoms
TRANS-001|Md1|eğitim hakkına erişim amacı
TRANS-002|Md4|öğrenci taşıma uygulaması tanımı
TRANS-003|Md4|taşıma merkezi okul/kurum tanımı
TRANS-004|Md4|rehber personel tanımı
TRANS-005|Md4|servis aracı tanımı
TRANS-006|Md4|özel eğitim kursiyeri kapsamı
TRANS-007|Md4|refakat gereksinimi BEP birimi kararına bağlanır
TRANS-008|Md5|planlama komisyonu kararları kayıtlıdır
TRANS-009|Md5|özel eğitim taşıma planı modüle girilir
TRANS-010|Md5|işletmede mesleki eğitim güzergâh kontrolü
TRANS-011|Md5|kardeş özel eğitim öğrencisi koşul kontrolü
TRANS-012|Md5|veli yazılı talebi ayrı kanıttır
TRANS-013|Md5/2|planlama kararı eğitim yılı başlamadan incelenir
TRANS-014|Md5/2|Ek-2 izleme-gözlem formu kanıttır
TRANS-015|Md7/2|YBO/ikili eğitim okulunun taşıma merkezi olması kural olarak engelli
TRANS-016|Md8/1-a|toplu taşıma bulunmaması şartı
TRANS-017|Md8/1-b|uygun eğitim kurumu bulunmaması/kapalı olması şartı
TRANS-018|Md8/8|ihale/ekonomiklik sorunu halinde alternatif erişim
TRANS-019|Md13/1-a|ilkokul/ortaokul kapasite bildirimi şubat 2. hafta
TRANS-020|Md13/1-a|IHO/ortaöğretim kapasite bildirimi ağustos 1. hafta
TRANS-021|Md13/1-b|kayıt-kabul/nakil mevzuata uygun yapılır
TRANS-022|Md13/1-c|taşınan ve diğer öğrenciler dengeli şubelere dağıtılır
TRANS-023|Md13/1-ç|ders/vakit çizelgesi geliş-gidişe göre düzenlenir
TRANS-024|Md13/1-d|boşluklarda sosyal-kültürel-sportif/kütüphane yararlanımı
TRANS-025|Md13/1-e|öğle yemeği sağlık/güven/düzen tedbirleri
TRANS-026|Md13/1-e|yüklenici sözleşmesi günlük kontrol edilir
TRANS-027|Md13/1-e|giderilemeyen aksaklık MEM'e raporlanır
TRANS-028|Md13/1-f|veli/vasi/muhtar/belediye/kamu iş birliği
TRANS-029|Md13/1-g|öğrenciler isim listesine göre kontrol edilir
TRANS-030|Md13/1-ğ|servis/rehber puantajı ay sonunda MEM'e gönderilir
TRANS-031|Md13/1-h|servis/şoför/rehber günlük mevzuat-sözleşme kontrolü
TRANS-032|Md13/1-h|giderilemeyen servis aksaklığı MEM'e raporlanır
TRANS-033|food|yemek bedeli okul/kurum hesabına aktarılır
TRANS-034|food|besin değeri/sağlık/zamanında ulaştırma kontrolü
TRANS-035|food|kapsam dışı öğrenciye genel olarak yemek verilmez
TRANS-036|food|SYDV verisiyle istisnai öğrenci tespiti
TRANS-037|food|ikili eğitimde taşıma kapsamı yemek kuralı
TRANS-038|Md21|uygulama ve yönetim bütünleşik yürütülür
TRANS-039|Md21|ekonomiklik/sosyal verimlilik analizi
TRANS-040|all|2024 değişikliği öncesi metin yalnız historical snapshot

## C. Özel Eğitim — 40 atoms
SPED-001|Md1-3|özel eğitim hakkına erişim temel amaç
SPED-002|Md4|BEP tanımı
SPED-003|Md4|destek eğitim hizmeti tanımı
SPED-004|Md4|destek eğitim odası tanımı
SPED-005|Md4|kaynaştırma/bütünleştirme tanımı
SPED-006|Md4|RAM modülü elektronik kayıt sistemi
SPED-007|Md23|tam zamanlı kaynaştırma planlaması
SPED-008|Md23/1-ç|öğrenciler şubelere eşit ve en çok 2 olacak şekilde dağıtılır
SPED-009|Md24|ölçme değerlendirmede BEP esastır
SPED-010|Md24|ölçme araçlarında öğrenciye uygun düzenleme
SPED-011|Md25|destek eğitim odası açılması
SPED-012|Md25/1-a|destek eğitim süresi haftalık dersin %40'ını aşmaz
SPED-013|Md25|destek eğitim planı öğrenci ihtiyacına göre yapılır
SPED-014|Md25|özel yetenekli öğrenci destek odası kapsamı
SPED-015|Md47|BEP geliştirme birimi kurulur
SPED-016|Md47|birim rol üyelikleri kayıt altındadır
SPED-017|Md47|veli katılımı rol bazlı temsil edilir
SPED-018|Md47|toplantı ve karar geçmişi immutable
SPED-019|Md48/1-a|BEP hazırlanması koordine edilir
SPED-020|Md48/1-a|BEP uygulanması koordine edilir
SPED-021|Md48/1-a|BEP izlenmesi koordine edilir
SPED-022|Md48/1-a|BEP değerlendirilmesi koordine edilir
SPED-023|Md48/1-b|eğitim ortamı/araç düzenlemesi ihtiyaca göre
SPED-024|eval|eğitsel değerlendirme talebi ayrı workflow
SPED-025|eval|veli talebi provenance olarak tutulur
SPED-026|eval|okul/kurum talebi provenance olarak tutulur
SPED-027|eval|kademe geçişlerinde yeniden değerlendirme tetiklenebilir
SPED-028|eval|performans/ihtiyaç değişikliği yeniden değerlendirme tetikleyebilir
SPED-029|family|aile katılımı BEP ve rehberlik ilişkisine bağlanır
SPED-030|support|özel araç-gereç ve materyal ihtiyacı kanıtlanır
SPED-031|support|erişilebilirlik ihtiyaçları facility workflow'a bağlanır
SPED-032|support|destek personeli ihtiyacı role assignment'a bağlanır
SPED-033|records|özel eğitim verileri sıkı ACL ile saklanır
SPED-034|records|tanı/rapor verisi amaçla sınırlı işlenir
SPED-035|records|BEP versiyonları tarihsel olarak korunur
SPED-036|records|öğrenci okul değiştirince geçmiş BEP üzerine yazılmaz
SPED-037|cross|taşımalı özel eğitimde refakat kararı transport modülüne bağlanır
SPED-038|cross|ölçme uyarlamaları exam modülüne bağlanır
SPED-039|Md68|2006 Özel Eğitim Hizmetleri Yönetmeliği mülga
SPED-040|all|exact article promotion only current consolidated clause match

## Counts
- Açık Öğretim: 40
- Taşıma: 40
- Özel Eğitim: 40
- TOTAL: 120
- migration: 0
