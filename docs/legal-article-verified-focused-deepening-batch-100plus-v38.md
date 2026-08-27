# Legal Fast Batch V38 — Eser İnceleme + Okul Sağlığı + Özel Eğitim exact deepening

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-28
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0

## Current official sources
- MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği, official MEB copy: https://mevzuat.meb.gov.tr/dosyalar/1850.pdf
- Original RG publication 08.06.2017/30090: https://resmigazete.gov.tr/eskiler/2017/06/20170608-5.htm
- MEB Okul Sağlığı Hemşirelerinin Çalışma Usul ve Esasları Hakkında Yönerge, Tebliğler Dergisi Nisan 2022/2774: https://dhgm.meb.gov.tr/tebligler-dergisi/2022/2774_Nisan_2022.pdf
- Okulda Sağlığın Korunması ve Geliştirilmesi Programı Uygulama Kılavuzu, MEB/Sağlık Bakanlığı official program source: https://okulsagligi.meb.gov.tr/meb_iys_dosyalar/2017_03/24172657_OKUL_SAYLIYININ_KORUNMASI_VE_GELYYTYRLMESY_PROGRAMI_UYGULAMA_KILAVUZU_3256836380940747639.pdf
- Özel Eğitim Hizmetleri Yönetmeliği, current MEB consolidated copy: https://tut.meb.gov.tr/meb_iys_dosyalar/2025_03/07083213_ozelegitimhizmetleriyonetmeligi.pdf

## A. Eser İnceleme ve Seçme Kurulu / yayın süreci — 50 atoms
SOC38-001|Sosyal Etkinlikler Yön Md12/1|eğitim kurumları sosyal etkinlik kapsamlı yayın çıkarabilir
SOC38-002|Md12/1|duyuru yayın türüdür
SOC38-003|Md12/1|dergi yayın türüdür
SOC38-004|Md12/1|gazete yayın türüdür
SOC38-005|Md12/1|duvar gazetesi yayın türüdür
SOC38-006|Md12/1|broşür yayın türüdür
SOC38-007|Md12/1|afiş yayın türüdür
SOC38-008|Md12/1|yıllık yayın türüdür
SOC38-009|Md12/1|kurumun resmî internet sayfasında yayımlama mümkündür
SOC38-010|Md12/2-a|Eser İnceleme ve Seçme Kurulu oluşturulur
SOC38-011|Md12/2-a|kurul başkanı eğitim kurumu müdürüdür veya görevlendirdiği müdür yardımcısıdır
SOC38-012|Md12/2-a|iki öğretmen kurul üyesidir
SOC38-013|Md12/2-a|ilgili sosyal etkinlikler öğrenci kulübü danışman öğretmeni kurul üyesidir
SOC38-014|Md12/2-a|temsilci öğrenci kurul üyesidir
SOC38-015|Md12/2-a|kurul oluşumu yayın süreciyle koşullu workflowdur
SOC38-016|Md12/2-b|kurul yayınlardan sorumludur
SOC38-017|Md12/2-b|kurul yayın içeriğinden sorumludur
SOC38-018|Md12/2-b|kurul inceleme işleminden sorumludur
SOC38-019|Md12/2-b|kurul seçim işleminden sorumludur
SOC38-020|Md12/2-c|bir ders yılında çıkarılacak yayınlar sosyal etkinlikler kurulunca belirlenir
SOC38-021|Md12/2-c|yayın sayısı sosyal etkinlikler kurulunca belirlenir
SOC38-022|Md12/2-c|yayın planı eğitim kurumu müdürünün onayına sunulur
SOC38-023|Md12/2-ç|inceleme belgeleri saklanır
SOC38-024|Md12/2-ç|değerlendirme belgeleri saklanır
SOC38-025|Md12/2-ç|seçme belgeleri saklanır
SOC38-026|Md12/2-ç|yayımlanan eserlerin birer örneği saklanır
SOC38-027|Md12/2-ç|duvar gazetelerinin kaldırılan nüshaları saklanır
SOC38-028|Md12/2-ç|saklama süresi 2 yıldır
SOC38-029|Md12/3|yayın kaynağı OAB aynî/nakdî desteği olabilir
SOC38-030|Md12/3|gönüllü kişi/kurum/kuruluş bağışı kaynak olabilir
SOC38-031|Md12/4|süreli yayınlar Basın Kanunu ve ilgili mevzuata uygun çıkarılır
SOC38-032|Md12/4|eğitim kurumu adına yayın sahibi eğitim kurumu müdürüdür
SOC38-033|Md17/1-c|kulüp temsilcisi ilgili yayın varsa Eser İnceleme ve Seçme Kurulu üyeliğini yürütür
SOC38-034|Md17/2|özel eğitim okullarında kulüp temsilcisi görevleri danışman öğretmenlerce yürütülür
SOC38-035|Md17/3|ilkokullarda kulüp temsilcisi görevleri danışman öğretmen rehberliğinde yürütülür
SOC38-036|current|kurul BOARD entity olarak tutulur
SOC38-037|current|yayın kararı DOC entity ile ilişkilendirilir
SOC38-038|current|üyelik school-year/versioned tutulur
SOC38-039|current|başkan rolü principal-or-delegate olarak modellenir
SOC38-040|current|yayın approval ayrı müdür onayı workflowudur
SOC38-041|current|inceleme kararı immutable evidence taşır
SOC38-042|current|2 yıllık retention legal deadline olarak saklanır
SOC38-043|current|yayın örneği evidence attachment olarak tutulur
SOC38-044|current|duvar gazetesi kaldırma nüshası evidence attachment olabilir
SOC38-045|current|yayın yoksa kurul instance üretimi feature-conditioned tutulabilir
SOC38-046|current|kurul adı generic 'yayın komisyonu' olarak normalize edilmez
SOC38-047|current|master title exact 'Eser İnceleme ve Seçme Kurulu' ise direct binding mümkündür
SOC38-048|current|school_type kapsamı yönetmeliğin her tür/seviye eğitim kurumu kapsamına göre filtrelenir
SOC38-049|current|historical publication decisions mutate edilmez
SOC38-050|HB-2217|master title current Md12/2-a organ adıyla birebir eşleşir

## B. Okul Sağlığı Yönetim Ekibi / okul sağlığı — 30 atoms
HLT38-001|2022 Yönerge Md4/ç|Okul Sağlığı Yönetim Ekibi yönergede tanımlanır
HLT38-002|Md4/ç|50+ çalışanlı okulda işveren/işveren vekili ekip başkanıdır
HLT38-003|Md4/ç|50+ çalışanlı okulda İSG kurulundan iki üye ekipte yer alır
HLT38-004|Md4/ç|okul sağlığı hemşiresi ekip üyesidir
HLT38-005|Md4/ç|rehber öğretmen ekip üyesidir
HLT38-006|Md4/ç|50 altı çalışanlı okulda işveren/işveren vekili ekip başkanıdır
HLT38-007|Md4/ç|50 altı çalışanlı okulda İSG ekibi veya risk değerlendirme ekibinden iki üye yer alır
HLT38-008|Md4/ç|çalışan sayısı ekibin bileşimini etkileyen parametredir
HLT38-009|program kılavuzu|okulun Okul Sağlığı Yönetim Ekibi olması beklenir
HLT38-010|program kılavuzu|program modelinde bir idareci ekipte yer alır
HLT38-011|program kılavuzu|bir öğretmen ekipte yer alır
HLT38-012|program kılavuzu|bir öğrenci ekipte yer alır
HLT38-013|program kılavuzu|bir OAB üyesi ekipte yer alır
HLT38-014|program kılavuzu|varsa sağlık çalışanı doğal üyedir
HLT38-015|program kılavuzu|varsa rehber öğretmen doğal üyedir
HLT38-016|program kılavuzu|ekip sağlık çalışmalarını planlar
HLT38-017|program kılavuzu|ekip sağlık çalışmalarını uygular
HLT38-018|program kılavuzu|ekip sağlık çalışmalarını izler
HLT38-019|program kılavuzu|ekip sağlık çalışmalarını değerlendirir
HLT38-020|program kılavuzu|okula özgü yıllık Okul Sağlığı Planı hazırlanır
HLT38-021|guard|2022 hemşire yönergesi ile program kılavuzu ekip bileşimi birebir aynı değildir
HLT38-022|guard|scope/role conflict çözülmeden generic school-health master row tek current compositiona sabitlenmez
HLT38-023|guard|school nurse varlığı feature parameter olarak tutulur
HLT38-024|guard|employee_count 50 threshold versioned parameterdır
HLT38-025|guard|program guide composition supportive authoritydir
HLT38-026|guard|2022 Yönerge school-health nursing scope içinde daha yüksek normatif weight taşır
HLT38-027|HB-2218|exact current formation source bulundu ancak master kapsamı ile source-scope birebirliği henüz tamamlanmadı
HLT38-028|HB-2229|aynı school-health name ailesinde duplicate/scope audit gerekir
HLT38-029|current|yerel sunum/örnek form tek başına legal authority sayılmaz
HLT38-030|current|ARTICLE_VERIFIED için organ adı + scope + source clause üçlü eşleşme aranır

## C. Özel eğitim / BEP ve okul karar ilişkileri — 30 atoms
SPED38-001|ÖEHY Md22/4|kaynaştırma/bütünleştirme yapılan okulda BEP geliştirme birimi oluşturulması zorunludur
SPED38-002|Md22/5|Öğrenci Davranışlarını Değerlendirme Kurulu BEP birimiyle iş birliği yapar
SPED38-003|Md22/5|Ödül ve Disiplin Kurulu BEP birimiyle iş birliği yapar
SPED38-004|Md23/1-a|tam zamanlı kaynaştırmada öğrenci için BEP hazırlanır
SPED38-005|Md23/1-c|uygun ortam düzenlemeleri yapılır
SPED38-006|Md23/1-c|destek eğitim odası açılır
SPED38-007|Md24/1-a|başarı BEP'e göre değerlendirilir
SPED38-008|Md24/1-b|ölçme/değerlendirmede süre uyarlaması yapılabilir
SPED38-009|Md24/1-b|ortam uyarlaması yapılabilir
SPED38-010|Md24/1-b|yöntem uyarlaması yapılabilir
SPED38-011|Md24/1-b|cihaz ve materyal uyarlaması yapılabilir
SPED38-012|Md24/1-c|merkezi sınavlarda gerekli tedbirler alınır
SPED38-013|Md24/1-ç|belirli yetersizliklerde yabancı dil muafiyeti veli yazılı talebi + BEP kararıyla olabilir
SPED38-014|Md24/1-ç|muafiyet okul yönetimince e-Okul'a işlenir
SPED38-015|Md47/1|BEP geliştirme birimi oluşturulur
SPED38-016|Md47/2|başkan okul müdürü veya görevlendirdiği müdür yardımcısıdır
SPED38-017|Md47/2-a|rehberlik öğretmeni üyedir
SPED38-018|Md47/2-b|sınıf öğretmeni üyedir
SPED38-019|Md47/2-c|dersi okutan alan öğretmenleri üyedir
SPED38-020|Md47/2-ç|veli üyedir
SPED38-021|Md47/2-d|öğrenci üyedir
SPED38-022|Md47/3|gerektiğinde özel eğitim değerlendirme kurulundan bir üye katılır
SPED38-023|Md47/4|mesleki eğitim veren özel eğitim okulunda meslek alan öğretmeni katılır
SPED38-024|Md47/5|çalışma usul ve esasları okul yönetimince belirlenir
SPED38-025|Md48/1-d|destek eğitim odasında eğitim alacak öğrenciler belirlenir
SPED38-026|Md48/1-d|destek eğitim dersleri belirlenir
SPED38-027|Md48/1-d|haftalık ders saati belirlenir
SPED38-028|Md48/1-ğ|sınavlarda refakat gereken öğrenciler belirlenir
SPED38-029|Md48/2-b|özel eğitim meslek okulunda koordinatör öğretmenler BEP birimince belirlenir
SPED38-030|guard|HB-2176/HB-2196 daha önce verified; duplicate count yapılmaz

## D. Exact-verification guards — 10 atoms
VER38-001|HB-2217|exact workflow title = Eser İnceleme ve Seçme Kurulu
VER38-002|HB-2217|current official source = Sosyal Etkinlikler Yönetmeliği
VER38-003|HB-2217|exact clause = Md12/2-a-b-ç
VER38-004|HB-2217|scope = her tür/seviyedeki eğitim kurumu; BİLSEM dahil institutional applicability supported
VER38-005|HB-2217|ARTICLE_VERIFIED promotion eligible
VER38-006|HB-2218|current source family found but cross-source composition/scope conflict requires withholding
VER38-007|duplicate guard|BEP master IDs already counted are not recounted
VER38-008|source guard|local presentations/forms are evidence only, not parent authority
VER38-009|migration|0
VER38-010|final audit|duplicate/outdated/scope conflicts global final auditte tekrar kontrol edilir

## Counts
- Eser İnceleme / publications: 50
- School health: 30
- Special education/BEP: 30
- Verification guards: 10
- TOTAL: 120
- Migration: 0
