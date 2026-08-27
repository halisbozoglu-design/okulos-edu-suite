# Legal Fast Batch V35 — ARTICLE_VERIFIED Priority / Pansiyon + MTAL + Açık Öğretim

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-27
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0

## Current source focus
- Current consolidated Yatılılık/Bursluluk/Sosyal Yardımlar/Okul Pansiyonları Yönetmeliği (2016/9487; 2024 amendments included): https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=20169487&MevzuatTur=21&MevzuatTertip=5
- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- Açık Öğretim Kurumları Yönetmeliği (22.10.2024): https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm

## A. Pansiyon / yatılılık exact deepening — 50 atoms
P35-001|Md8/1|okul yatılılık ve bursluluk komisyonu üç üyeden oluşur
P35-002|Md8/1|başkan pansiyondan sorumlu müdür yardımcısıdır
P35-003|Md8/1|iki öğretmen üyedir
P35-004|Md8/2|başvuru işlemleri komisyon görevidir
P35-005|Md8/2|kayıt-kabul işlemleri komisyon görevidir
P35-006|Md8/2|nakil işlemleri komisyon görevidir
P35-007|Md8/2|geçiş işlemleri komisyon görevidir
P35-008|Md8/2|yerleştirme işlemleri komisyon görevidir
P35-009|Md15/1|okullar arası yatılı/burslu nakil öğrencinin okul mevzuatına göre yapılır
P35-010|Md15/1|nakil e-Okul/e-Mesem üzerinden yürütülür
P35-011|Md15/2-a|burslu öğrencinin bursluluğu nakilde devam eder
P35-012|Md15/2-b|yatılı öğrencinin yatılılığı açık kontenjana göre devam eder
P35-013|Md15/2-b|açık kontenjan yoksa il/ilçe komisyonu yerleştirir
P35-014|Md15/2-b|yerleşim biriminde uygun pansiyon yoksa yatılılık sona erebilir
P35-015|Md15/3|aynı yerleşim birimindeki pansiyonlar arası nakil il/ilçe komisyonunca yapılır
P35-016|Md15/3|kapasite/açık kontenjan dikkate alınır
P35-017|Md15/4|okul değiştirme cezası alan yatılı öğrencinin pansiyon yerleştirmesi komisyonca yapılır
P35-018|Md16/1|ortaöğretimde yatılılık-bursluluk geçişi eğitim süresince bir defa
P35-019|Md16/1|bursluluktan yatılılığa geçiş sınavsız
P35-020|Md16/1|yatılılıktan bursluluğa geçiş merkezi bursluluk sınavı şartlarına bağlı
P35-021|Md16/2|bursluluktan yatılılığa veli başvurusu okul müdürlüğüne yapılır
P35-022|Md16/2|başvuru dönemi ders kesiminden eylül son iş günü mesai bitimine kadar
P35-023|Md16/3|komisyon başvuruyu süre bitiminden itibaren üç gün içinde sonuçlandırır
P35-024|Md16/3|sonuç e-Okul/e-Mesem'e kaydedilir
P35-025|Md16/4|belirli sağlık/aile bütünlüğü nedenlerinde sınav ve süre istisnası vardır
P35-026|current|pansiyon özelliği yoksa görev instance üretme
P35-027|current|school_type + HAS_PANSION filtresi birlikte uygulanır
P35-028|current|komisyon kuruluşu BOARD modülüne bağlanır
P35-029|current|nakil STUDENT+DORM ilişkili modüllerle tek workflow olur
P35-030|current|geçiş süreci ayrı workflow olarak korunur
P35-031|current|yıllık kontenjanlar YEAR_PARAMETER
P35-032|current|bursluluk sınavı tarihleri YEAR_PARAMETER
P35-033|current|geçmiş nakil snapshotları immutable
P35-034|current|geçmiş komisyon üyelikleri overwrite edilmez
P35-035|current|2024 değişiklikleri ayrı legal_version olarak tutulur
P35-036|current|eski 2008/1983 yönetmelikleri aktif karar motorunda bloklanır
P35-037|current|2016/9487 current consolidated source parent authority olur
P35-038|current|e-Okul/e-Mesem kanal bilgisi evidence olarak tutulur
P35-039|current|nakil ve yerleştirme aynı kayıtta birleşmişse split kontrolü yapılır
P35-040|current|aylık handbook zamanlaması mevzuatta yoksa legal deadline sayılmaz
P35-041|current|Eylül ibaresi yalnız mevzuatça desteklenirse exact timing olur
P35-042|current|komisyon görevleri rol bazlı tutulur
P35-043|current|pansiyondan sorumlu müdür yardımcısı rolü personel atamasından ayrılır
P35-044|current|komisyon karar/onay kanıtı saklanır
P35-045|current|il/ilçe komisyonu ile okul komisyonu ayrı entitydir
P35-046|current|tenant override yasal komisyon bileşimini değiştiremez
P35-047|current|aktif mevzuat değişirse pending instance impact review yapılır
P35-048|current|completed historical instance mutate edilmez
P35-049|current|ARTICLE_VERIFIED yalnız exact workflow_id + source + clause ile artar
P35-050|current|handbook kaynak destekleyici, current regulation authoritydir

## B. MTAL commission deepening — 40 atoms
MT35-001|candidate|Alan/Dal Kontenjan Belirleme Komisyonu ayrı BOARD entity
MT35-002|candidate|komisyon yalnız MTAL koşulunda aktif
MT35-003|candidate|alan/dal kontenjanı yıllık plan parametresidir
MT35-004|candidate|kontenjan kararı source snapshot taşır
MT35-005|candidate|koordinatör öğretmen belirleme ayrı süreçtir
MT35-006|candidate|koordinatörlük dağıtımı alan zümresi ilişkisi taşır
MT35-007|candidate|işletme eğitimi şartları MTAL/MESEM filtresine bağlıdır
MT35-008|candidate|işletme uygunluk komisyonu ayrı workflowdur
MT35-009|candidate|şef belirleme/teklif komisyonu ayrı entitydir
MT35-010|candidate|şeflik görevlendirmesi personel assignment history taşır
MT35-011|candidate|açık öğretim yüz yüze denklik komisyonu OPEN feature ile koşulludur
MT35-012|candidate|MAÖL yüz yüze eğitim MTAL feature ilişkisi taşır
MT35-013|candidate|AÖİHL yüz yüze eğitim IHL feature ilişkisi taşır
MT35-014|candidate|denklik komisyonu ile öğrenci denklik kararı ayrı kayıtlardır
MT35-015|candidate|komisyon üyeliği school-year versioned
MT35-016|candidate|komisyon kararları immutable evidence taşır
MT35-017|candidate|alan/dal kararları öğrenci tercih süreciyle cross-link edilir
MT35-018|candidate|kapasite/atölye koşulları karar girdisi olarak tutulur
MT35-019|candidate|öğretmen normu ayrı modülden referanslanır
MT35-020|candidate|sektör/işletme verisi provenance ile tutulur
MT35-021|candidate|koordinatör öğretmen görevi PERSON+MTAL ilişkili
MT35-022|candidate|öğrenci burs/sosyal yardım komisyonu proje okulu koşuluna bağlıdır
MT35-023|candidate|güzel sanatlar/spor yetenek komisyonu school_type filtered
MT35-024|candidate|MTAL komisyon adları handbooktan doğrudan current authority sayılmaz
MT35-025|candidate|exact article çözülmeyen MTAL komisyonu ARTICLE_VERIFIED olmaz
MT35-026|candidate|mülga yönerge kaynakları karar motorunda bloklanır
MT35-027|candidate|current MTEGM source değişikliği legal_diff tetikler
MT35-028|candidate|komisyon oluşturma ve görevlendirme tek assignment zinciri kullanır
MT35-029|candidate|görevlendirme başlangıç/bitiş tarihleri saklanır
MT35-030|candidate|üyelik değişimi geçmişi overwrite etmez
MT35-031|candidate|yıllık komisyon yeniden oluşturma yeni versiondır
MT35-032|candidate|tenant yalnız ek üye/yerel notu mevzuat izin verirse ekleyebilir
MT35-033|candidate|komisyon adı canonical + source label birlikte saklanır
MT35-034|candidate|aynı komisyon farklı handbook satırlarında duplicate guard ile birleşir
MT35-035|candidate|mevzuat maddesi kesinleşmeden deadline hardcode edilmez
MT35-036|candidate|komisyon kararı öğrenciyi etkiliyorsa STUDENT relation eklenir
MT35-037|candidate|personel etkiliyorsa PERSON relation eklenir
MT35-038|candidate|takvim etkiliyorsa CAL relation eklenir
MT35-039|candidate|belge çıktısı varsa DOC relation eklenir
MT35-040|candidate|final audit current MTEGM exact clauses ile yapılır

## C. Open-education commission controls — 30 atoms
OPEN35-001|current|2024 Açık Öğretim Kurumları Yönetmeliği parent source
OPEN35-002|current|2025 uygulama yönergesi subordinate source
OPEN35-003|current|eski açık öğretim yönetmelikleri active engine'de bloklanır
OPEN35-004|current|yüz yüze eğitim feature=HAS_OPEN_ED_FACE_TO_FACE
OPEN35-005|current|MAÖL ve AÖİHL kurum türleri ayrı filtrelenir
OPEN35-006|current|denklik süreci öğrenci bazlı kayıt taşır
OPEN35-007|current|denklik komisyonu ayrı BOARD entity olarak temsil edilir
OPEN35-008|current|komisyon üyeliği year-versioned
OPEN35-009|current|karar belgesi evidence olarak saklanır
OPEN35-010|current|ders eşleştirmesi ayrı decision detail olur
OPEN35-011|current|yüz yüze devam attendance ile cross-link edilir
OPEN35-012|current|kayıt dönemi YEAR_PARAMETER
OPEN35-013|current|sınav dönemi YEAR_PARAMETER
OPEN35-014|current|başvuru takvimi annual guide versioned
OPEN35-015|current|öğrenci eşzamanlı program istisnaları current OÖKY ile cross-check edilir
OPEN35-016|current|denklik sonucu geçmişe dönük overwrite edilmez
OPEN35-017|current|komisyon karar revizyonu yeni version olur
OPEN35-018|current|source/effective date her kararda saklanır
OPEN35-019|current|tenant denklik kuralını değiştiremez
OPEN35-020|current|kurum feature yoksa komisyon instance oluşmaz
OPEN35-021|current|AÖİHL denklik MTAL denklikle aynı entity sayılmaz
OPEN35-022|current|MAÖL denklik AÖİHL denklikle aynı entity sayılmaz
OPEN35-023|current|isim benzerliği duplicate kabulü için yeterli değildir
OPEN35-024|current|exact article çözülmeden ARTICLE_VERIFIED yapılmaz
OPEN35-025|current|handbook liste maddesi sadece candidate discovery kaynağıdır
OPEN35-026|current|current RG source authoritative
OPEN35-027|current|module relation BOARD|OPEN|STUDENT|CAL|DOC|LEG
OPEN35-028|current|pending mevzuat değişiklikleri Super Admin review'a gider
OPEN35-029|current|tamamlanmış geçmiş kararlar immutable
OPEN35-030|current|final exact audit sonrası publish edilir

## Counts
- Pansiyon: 50
- MTAL commissions: 40
- Open education commissions: 30
- TOTAL: 120
- migration: 0

## Verification promotion
- HB-2201 is eligible: master title is exactly “Okul Yatılılık ve Bursluluk Komisyonu”; current consolidated regulation Md8/1-2 directly defines its composition and duties.
- HB-0406 is withheld because the legacy row contains an explicit September timing not stated by current Md8; entity match is exact but timing is not legally proven.
- Monthly e-Okul nakil rows are withheld where handbook month labels are not universal statutory deadlines.
- HB-2204/2205/2206/2209 remain candidates until exact current MTEGM/open-education clauses are resolved.
