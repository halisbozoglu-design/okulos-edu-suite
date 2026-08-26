# Legal Fast Batch V28 — Öğrenci İşleri + Kurul/Zümre + Taşımalı Eğitim + Açık Öğretim

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-27
Method: fast >=100 atom coverage + exact workflow promotion where current official clause and master row align.
Migration count: 0

## Official sources
- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Eğitim Kurulları ve Zümreleri Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/2260.pdf
- MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği 2024 amendment/current chain: https://resmigazete.gov.tr/eskiler/2024/08/20240801-2.htm
- MEB Açık Öğretim Kurumları Yönetmeliği 2024: https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm

## A. Öğrenci işleri / kayıt-nakil — 35 atoms
STU-001|OÖKY Md22|kayıt bilgilerinin e-Okul üzerinden yönetimi
STU-002|Md22|kayıt belgelerinin doğrulanması
STU-003|Md22|denklik verisinin kayıt kararında kullanılması
STU-004|Md22|eksik e-Okul bilgilerinin tamamlanması
STU-005|Md23|kontenjan/yerleştirme koşul kontrolü
STU-006|Md23|yetenek sınavlı okul istisnalarının ayrı ele alınması
STU-007|Md23|nakil başvuru koşulları
STU-008|Md23|nakil değerlendirme kaydı
STU-009|Md23|nakil sonucu tebliği
STU-010|Md24|sınıf seviyesi/alan-dal uyumu
STU-011|Md24|program uyumsuzluğunda telafi bağlantısı
STU-012|Md25|öğrenci statü değişikliği audit trail
STU-013|Md25|öğrenci dosyasının yeni kuruma devri
STU-014|Md26|yabancı uyruklu öğrenci özel koşulları
STU-015|Md27|öğrenci yerleştirme ve nakil komisyonu bağlantısı
STU-016|Md28|özel program/okul nakil kuralı
STU-017|Md29|puan/başarı tabanlı nakil kuralı
STU-018|Md30|hazırlık sınıfı geçiş koşulları
STU-019|Md31|MTAL alan/dal geçişi
STU-020|Md31|alan/dal tercihi provenance
STU-021|Md31|yerleştirme sonucu snapshot
STU-022|Md32|öğrenci kontenjanı parameterized
STU-023|Md33|nakil zamanı yearly/period rule
STU-024|Md34|özel durum nakil istisnaları
STU-025|Md35|devam-devamsızlık ayrı workflow
STU-026|Md35|geç gelme ayrı olay kaydı
STU-027|Md35|devamsızlık veli bildirimi bağı
STU-028|Md35|öğrenci durumunun e-Okul'a işlenmesi
STU-029|Md36|devamsızlık nedeniyle ilişik kesme koşulu ayrı gate
STU-030|Md37|nakil ve geçişlerde dönem koşulu
STU-031|Md38|özel durum geçişleri
STU-032|Md41|MESEM nakil/transfer ayrımı
STU-033|Md42|muafiyet/sorumluluk ilişkisi
STU-034|all|tamamlanmış öğrenci işlemleri immutable
STU-035|all|yıllık tarih/puan/limitler versioned parameter

## B. Kurul/Zümre — 35 atoms
BOARD-001|Yönerge Md10/1|sınıf öğretmenler kurulu oluşumu
BOARD-002|Md10/1|şube öğretmenler kurulu oluşumu
BOARD-003|Md10/1|rehberlik öğretmeni kurul üyesi
BOARD-004|Md10/1|HEM/olgunlaşma öğrencisiz bölüm istisnası
BOARD-005|Md10/2|ortaokul toplantıları ekim
BOARD-006|Md10/2|ortaokul toplantıları şubat
BOARD-007|Md10/2|ortaokul toplantıları haziran
BOARD-008|Md10/2|ortaöğretim toplantıları kasım
BOARD-009|Md10/2|ortaöğretim toplantıları nisan
BOARD-010|Md10/2|ihtiyaç halinde ek toplantı
BOARD-011|Md10/2|müdür talebi
BOARD-012|Md10/2|müdür yardımcısı talebi
BOARD-013|Md10/2|rehberlik öğretmeni talebi
BOARD-014|Md10/2|sınıf/şube rehber öğretmeni talebi
BOARD-015|Md10/2|ayrı veya birleştirilmiş toplantı
BOARD-016|Md10/2|ders yılı sonu karar sonuç değerlendirmesi
BOARD-017|Md10/3|EK-1 toplantı takvimi
BOARD-018|Md10/3|gündemin önceden hazırlanması
BOARD-019|Md10/3|en az 5 gün önce bildirim
BOARD-020|Md10/3|yazılı/e-posta/iletişim aracı bildirimi
BOARD-021|Md10/4|kurul başkanı müdür/müdür yardımcısı
BOARD-022|Md10/5|veli/eğitici personel daveti koşullu
BOARD-023|Md10/7|oy çokluğu
BOARD-024|Md10/7|eşitlikte başkanın görüşü
BOARD-025|Md10/7|gündem ve kararların e-Kurul/Zümre modülüne işlenmesi
BOARD-026|Md10/7|müdür onayı sonrası uygulama
BOARD-027|Md10/7|tutanak imza zorunluluğu
BOARD-028|Md10/7|katılmayan üyenin de tutanağı imzalaması
BOARD-029|Md10/7|tutanağın yönetici tarafından saklanması
BOARD-030|Md10/8|başarı artırıcı önlemler
BOARD-031|Md10/8|özel eğitim öğrencileri tedbirleri
BOARD-032|Md10/8|İSG planlaması
BOARD-033|Md10/8|sosyal-kültürel-sportif etkinlikler
BOARD-034|Md10/8|mesleki yönlendirme
BOARD-035|Md10/8|okul sağlığı/değerler eğitimi

## C. Taşımalı eğitim — 25 atoms
TRN-001|2024 current|taşıma kapsam uygunluğu
TRN-002|Md13|taşıma merkezi okul müdürü rolü
TRN-003|Md13|taşımadan sorumlu müdür yardımcısı
TRN-004|Md13|nöbetçi müdür yardımcısı
TRN-005|Md13|nöbetçi öğretmen
TRN-006|Md13|öğrencilerin sınıf/şubelere dengeli dağıtımı
TRN-007|Md13|öğle yemeği tedbiri
TRN-008|Md13|yüklenici sözleşme uyumu günlük kontrol
TRN-009|Md13|aksaklık raporu MEM'e
TRN-010|Md13|servis geliş-gidiş takibi
TRN-011|Md13|rehber personel koşulu
TRN-012|Md13|özel eğitim öğrenci/refakatçi kararı
TRN-013|Md13|veli/vasi yetkilendirmesi
TRN-014|Md13|öğrenci listesi güncelliği
TRN-015|Md13|taşıma merkezi kapasite kontrolü
TRN-016|current|özel eğitim kursiyeri kapsamı
TRN-017|current|geçici ikamet kapsamı
TRN-018|current|ücretsiz öğle yemeği kapsam filtresi
TRN-019|current|ikili eğitim yemek istisnası
TRN-020|current|taşıma dışı dezavantajlı öğrenci yemek istisnası
TRN-021|Md21|ekonomiklik/sosyal verimlilik analizi
TRN-022|Md21|maliyet-fayda/maliyet-etkinlik
TRN-023|Md23|farkındalık eğitimi takvim görevi
TRN-024|all|ihale/sözleşme kamu ihale modülüne link
TRN-025|all|tamamlanmış taşıma yılı snapshot immutable

## D. Açık öğretim — 25 atoms
OPEN-001|2024 current|AÖL kurum türü
OPEN-002|current|MAÖL kurum türü
OPEN-003|current|AÖİHL kurum türü
OPEN-004|current|yeni kayıt ayrı workflow
OPEN-005|current|kayıt yenileme ayrı workflow
OPEN-006|current|belge/uyum komisyonu
OPEN-007|current|aktif/pasif öğrencilik statüsü
OPEN-008|current|ders seçimi
OPEN-009|current|sınav katılımı
OPEN-010|current|kredi/başarı kaydı
OPEN-011|current|mezuniyet kontrolü
OPEN-012|current|belge düzenleme
OPEN-013|current|öğrenci bilgi sistemi kaydı
OPEN-014|current|ücret/muafiyet yearly parameter
OPEN-015|current|özel durum kayıt hakkı
OPEN-016|current|örgün-açık geçişi
OPEN-017|current|açık-örgün geçişi
OPEN-018|current|yüz yüze eğitim MAÖL
OPEN-019|current|yüz yüze eğitim AÖİHL
OPEN-020|current|yüz yüze eğitim devam takibi
OPEN-021|current|yüz yüze eğitim öğretmen görevlendirme
OPEN-022|current|yüz yüze eğitim merkez/kurum sorumluluğu
OPEN-023|current|takvim tarihleri yearly version
OPEN-024|current|tamamlanmış dönem snapshot immutable
OPEN-025|current|eski yönetmelik/hüküm source-status reconciliation

## Counts
- Student: 35
- Boards: 35
- Transport: 25
- Open education: 25
- TOTAL: 120
- migration: 0

## QA flags
- Exact ARTICLE_VERIFIED promotion only when master workflow text and current official clause are coextensive.
- Old handbook month/date assertions are not promoted if current law uses a different period rule.
- Existing verified workflow IDs are deduplicated before count increment.
