# Legal Fast Batch V27 — Öğrenci Kayıtları + Kurullar/Zümreler + Taşıma + Açık Öğretim

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-27
Method: fast >=100 atom coverage + exact workflow promotion where possible.
Migration: 0

## Official sources
- OÖKY current: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Eğitim Kurulları ve Zümreleri Yönergesi current consolidated/değişiklikli metin: https://mevzuat.meb.gov.tr/dosyalar/2260.pdf
- Taşıma Yoluyla Eğitime Erişim Yönetmeliği 2024 current amendment chain: https://resmigazete.gov.tr/eskiler/2024/08/20240801-2.htm
- Açık Öğretim Kurumları Yönetmeliği 2024: https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm

## A. OÖKY öğrenci kayıt/nakil exact deepening — 40 atoms
REG-001|Md20|ortaöğretime geçiş yolu/yerleştirme tipi saklanır
REG-002|Md20|merkezi sınav puanlı yerleştirme ayrı akış
REG-003|Md20|kayıt alanı tercihi ayrı akış
REG-004|Md20|pansiyon kontenjanlı yerleştirme ayrı akış
REG-005|Md20|yetenek sınavlı yerleştirme ayrı akış
REG-006|Md20/2|yıllık yönerge/kılavuz parametre kaynağı
REG-007|Md21/1|ortaokul/İHO mezuniyet şartı
REG-008|Md21/1|18 yaş koşulu
REG-009|Md21/1|MESEM 18+ istisnası
REG-010|Md21/2|kayıt e-Okul/denklik verisine göre
REG-011|Md21/2|adres ulusal adres veri tabanı
REG-012|Md21/2|ilave kayıt belgesi istenmeme kontrolü
REG-013|Md21/3|mesleki program sağlık uygunluğu
REG-014|Md21/3|gerektiğinde sağlık/kurul raporu
REG-015|Md21/3|MESEM işe giriş sağlık raporu
REG-016|Md21/4|evli aday örgün kayıt engeli
REG-017|Md21/4|öğrenciyken evlenme halinde açık öğretime aktarım
REG-018|Md21/4|MESEM evlilik istisnası
REG-019|Md21/5|açık öğretimden örgüne geçiş zaman penceresi
REG-020|Md21/5|örgünden AÖL/MAÖL'ye kayıt dönemi penceresi
REG-021|Md21/6|özel eğitim ihtiyacında MEM tedbiri
REG-022|Md21/7|MESEM+açık öğretim eşzamanlı kayıt
REG-023|Md21/7|MAÖL karşılık ders yüz yüze muafiyet
REG-024|Md22/1|kılavuz süresinde e-Okul kayıt
REG-025|Md22/2|kayıt hakkı kaybı koşulları
REG-026|Md22/2|MESEM iki aylık sözleşme bekleme
REG-027|Md22/2|sözleşmeyle kayıt tamamlama
REG-028|Md22/2|SGK işe giriş bağlantısı
REG-029|Md22/6|koruma/evlat edinmede adres gizliliği
REG-030|Md22/7|e-Okul mevcut kaydın yeni okula aktarımı
REG-031|Md22/7|eksik/yok e-Okul bilgisinin sisteme işlenmesi
REG-032|Md22/8|ders yılı öncesi ayrılmada e-Okul transferi
REG-033|Md22/8|diğer ayrılmalarda nakil hükümleri
REG-034|Md22/9|MESEM sözleşmeli 18+ yıl boyu kayıt
REG-035|Md22/9|birinci dönem sonuna kadar teorik yoğunlaştırma
REG-036|Md22/9|şubat sonrası yılsonu puanı verilmemesi
REG-037|Md22/9|teorik eğitimin yeni ders yılı başında başlaması
REG-038|Md23/1|yerleştirme/nakil komisyonu yıllık kuruluş
REG-039|Md23/2|komisyon dengeli yerleştirme/nakil
REG-040|Md23|özel durum/özel eğitim/yabancı öğrenci alt yolları

## B. Eğitim kurulları/zümreler exact deepening — 40 atoms
BRD-001|Md6|Bakanlık-il-ilçe-kurum düzeyinde kurul oluşturma
BRD-002|Md6|il MEM müdürleri kurulu
BRD-003|Md6|ilçe MEM müdürleri kurulu
BRD-004|Md6|eğitim kurumu müdürleri kurulu
BRD-005|Md6|kademe/tür müdürleri kurulu
BRD-006|Md6|öğretmenler kurulu
BRD-007|Md6|sınıf/şube öğretmenler kurulu
BRD-008|Md6|sanat ve spor kurulu
BRD-009|Md7/1|EK-1 zaman dilimi
BRD-010|Md7/1|gündemin toplantı öncesi duyurulması
BRD-011|Md7/2|karar/sonuç onayı ve paylaşımı
BRD-012|Md7/3|başkan çağrısıyla ek toplantı
BRD-013|Md7/3|üyelerin yarısından fazlası yazılı talep
BRD-014|Md7/4|olağanüstü hariç tarih-yer-gündem 5 gün önce
BRD-015|Md7/5|çoğunluk önerisiyle gündeme konu ekleme
BRD-016|Md8|mevzuat/program/ortak sınav/proje/sosyal sorumluluk gündemi
BRD-017|Md8|uygulamaya yönelik karar
BRD-018|Md8|kurul kompozisyonu rol bazlı
BRD-019|Md9/1|öğretmenler kurulu üyeleri
BRD-020|Md9/2|gündeme göre dış/ilgili katılımcılar
BRD-021|Md9/3|öğretmenler kurulu 5 gün önce duyuru
BRD-022|Md9/4|ders yılı öncesi toplantı
BRD-023|Md9/4|ikinci dönem başı toplantı
BRD-024|Md9/4|ders yılı sonu toplantı
BRD-025|Md9/4|gerektiğinde ek toplantı
BRD-026|Md9/5|toplantının ders saati dışında yapılması esası
BRD-027|Md9/5|ders saatinde toplantıda MEM onayı
BRD-028|Md9/6|karar oy çokluğu
BRD-029|Md9/6|eşitlikte başkan görüşü
BRD-030|Md9/6|müdür onayı sonrası uygulama
BRD-031|Md9/6|yıl sonunda karar-sonuç değerlendirmesi
BRD-032|Md14/1|ilçe sınıf/alan zümre oluşumu
BRD-033|Md14/5|ilçe zümre üç ana toplantı dönemi
BRD-034|Md14|ilçe zümre ara toplantı şartı
BRD-035|Md14|ilçe zümre ortak sınav ve uygulama birliği gündemi
BRD-036|Md15/1|il sınıf/alan zümre oluşumu
BRD-037|Md15/4|il zümre üç ana toplantı dönemi
BRD-038|Md15/6|il zümre tarih-yer-gündem 5 gün önce
BRD-039|Md15/3|kararların il MEM onayı ve ilçelere duyurulması
BRD-040|Md15/3|tutanağın tüm üyelerce imzalanması/saklanması

## C. Taşımalı eğitim operational deepening — 20 atoms
TRN-001|current|taşıma merkezi kurum feature gate
TRN-002|current|taşınan öğrenci listesi snapshot
TRN-003|current|güzergah/mesafe/yol güvenliği kanıtı
TRN-004|current|servis/araç/şoför uygunluk kaydı
TRN-005|current|taşımadan sorumlu yönetici ataması
TRN-006|current|nöbetçi yönetici/öğretmen sorumluluğu
TRN-007|Md13|öğrencilerin sınıf/şubelere dengeli dağıtılması
TRN-008|current|taşıma başlangıç-bitiş takibi
TRN-009|current|devam-devamsızlık taşıma olayı ilişkisi
TRN-010|current|öğrenci teslim alma/bırakma kanıtı
TRN-011|current|veli/vası iletişim kaydı
TRN-012|current|yüklenici sözleşme provenance
TRN-013|current|denetim bulgusu/corrective action
TRN-014|current|kaza/acil durum incident link
TRN-015|current|özel eğitim taşımasında ihtiyaç filtresi
TRN-016|current|yemek hizmeti varsa ayrı feature
TRN-017|current|yıllık ihale/ödenek parametreleri versioned
TRN-018|current|GPS/mobil uygulama geliştirmesi bu hukuk batchinin dışında
TRN-019|current|tamamlanmış taşıma dönemi immutable snapshot
TRN-020|current|2024+ değişiklik etkisi future/pending'e uygulanır

## D. Açık öğretim/student-interface deepening — 20 atoms
OPEN-001|current|AÖL/MAÖL/AÖİHL kurum/program ayrımı
OPEN-002|current|yeni kayıt takvimi versioned
OPEN-003|current|kayıt yenileme takvimi versioned
OPEN-004|current|kayıt tipi provenance
OPEN-005|current|öğrencilik durumu lifecycle
OPEN-006|current|belge değerlendirme/uyum komisyonu bağlantısı
OPEN-007|current|bilgi yönetim sistemi kaydı
OPEN-008|current|örgün-açık geçiş kaynağı OÖKY Md21/5 ile cross-link
OPEN-009|current|MESEM eşzamanlı kayıt OÖKY Md21/7 cross-link
OPEN-010|current|yüz yüze eğitim programı feature gate
OPEN-011|current|yüz yüze merkez/alan/ders bağlama
OPEN-012|current|devam/başarı kuralları ayrı workflow
OPEN-013|current|muafiyet/denklik ayrı workflow
OPEN-014|current|sınav dönemi ayrı versioned instance
OPEN-015|current|mezuniyet koşulları legal snapshot
OPEN-016|current|nakil/geçiş tarihçesi immutable
OPEN-017|current|kılavuz yıllık parametre; yönetmelik parent authority
OPEN-018|current|eski 2020 genelge yeni kaynakla çelişirse aktif karar üretmez
OPEN-019|current|kişisel veri role-based erişim
OPEN-020|current|exact article promotion yalnız workflow_id birebir eşleşmeyle

## Counts
- Registration/student affairs: 40
- Boards/zümre: 40
- Transport: 20
- Open education: 20
- TOTAL: 120
- migration: 0

## Audit flags
- Existing ARTICLE_VERIFIED rows are never counted twice.
- HB-1675 already exists in an older ARTICLE_VERIFIED batch; V27 therefore does not increment it despite current OÖKY Md22/8 also matching.
- Annual calendar/guide dates remain versioned child parameters.
- Final global correctness/duplicate/old-source audit remains deferred.