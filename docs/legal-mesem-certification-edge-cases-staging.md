# Okulos — MESEM İstisnai Belgelendirme / Tamamlama / Usta Öğreticilik Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynaklar

- MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Mevzuat Sistemi — Önceki Öğrenmelerin Tanınması, Denklik ve Ölçme Değerlendirme İşlemleri İle İlgili Usul ve Esaslara İlişkin Yönerge: https://mevzuat.meb.gov.tr/dosyalar/1872.pdf
- MEB Tebliğler Dergisi — Mesleki Eğitim Merkezi Programları Kalfalık ve Ustalık Sınavları Uygulama Esasları: https://mevzuat.meb.gov.tr/dosyalar/1897.pdf

## Doğrulanan atomik kurallar

1. **Mesleki eğitim tamamlama belgesi — OÖKY Md.70/1**  
   Mesleki ve teknik ortaöğretim kurumlarında tamamlayıcı/telafi eğitimini ve gerekli stajı başarıyla tamamlayan ortaöğretim mezunlarına ilgili alan diploması; ortaöğrenimini tamamlamamış kalfa ve ustalara ise mesleki eğitim tamamlama belgesi düzenlenir.

2. **İşletmede beceri eğitimi staj yerine geçebilir — OÖKY Md.70/1**  
   İşletmede beceri eğitimi görmüş öğrenciler ile kalfa ve ustalar stajını tamamlamış sayılır. Sistem `internship_completed_by_workplace_training=true` şeklinde ayrı provenance ile tutmalıdır.

3. **Mesleki eğitim tamamlama belgesinden diplomaya geçiş — OÖKY Md.70/1**  
   Mesleki eğitim tamamlama belgesi verilen kalfa ve ustalar, Mesleki Açık Öğretim Lisesi yoluyla ortak dersleri tamamladıklarında alanlarında diploma almaya hak kazanabilir. Belge, tek başına diploma üretmemelidir.

4. **Usta öğreticilik kursuna erişim — OÖKY Md.70/A-2**  
   Ustalık belgesi veya işyeri açma belgesi bulunanlar ile en az ön lisans seviyesinde mesleki eğitim almış kişiler okul/kurumlarca açılan iş pedagojisi kursuna katılabilir.

5. **Usta öğreticilik belgesinin verilmesi — OÖKY Md.70/A-2**  
   İş pedagojisi kursunu başarıyla tamamlayanlara usta öğreticilik belgesi verilir.

6. **Usta öğreticilik belgesi tek başına kullanılmaz — OÖKY Md.70/A-2**  
   Usta öğreticilik belgesi; ustalık belgesi, işyeri açma belgesi veya en az ön lisans diploması ile birlikte kullanılır. Sistem belgeyi bağımsız mesleki yetki belgesi gibi yorumlamamalıdır.

7. **Usta öğreticilik belgesi imza yapısı — OÖKY Md.70/A-3**  
   Usta öğreticilik belgesinde okul/kurum müdür yardımcısı ile okul/kurum müdürü imzası bulunur. Kalfalık/ustalık belgelerinin imza zinciri farklıdır; şablon motorunda ayrı tutulmalıdır.

8. **İş pedagojisi kursu uzaktan/e-Sınav yapılabilir — Önceki Öğrenmeler Yönergesi Md.14/2**  
   OÖKY Md.70/A kapsamındaki iş pedagojisi kursları uzaktan eğitim yoluyla düzenlenebilir ve sınavları e-Sınav şeklinde yapılabilir. Başarı halinde usta öğreticilik belgesi verilir.

9. **Önceki öğrenme kapsamında kalfalık/ustalık sınavı ayrı rejimdir**  
   2018 tarihli Kalfalık ve Ustalık Sınavları Uygulama Esasları, önceki öğrenmelerin tanınması kapsamında yapılacak sınavların uygulama usulünü düzenler. Örgün MESEM öğrencisinin sınıf sonu kalfalık/ustalık sınavı ile bu başvuru rejimi aynı workflow'a birleştirilmemelidir.

10. **Mülga eski denklik düzenlemeleri aktif kural olarak kullanılamaz — Yönerge Md.16**  
    Yönerge, önceki bazı geçici/müstakil denklik genelge-yönerge ve formlarını yürürlükten kaldırmıştır. Legal source resolver yalnız güncel kaynak zincirini aktif kabul etmelidir.

## Sistem kural kodları

- `MESEM_COMPLETION_CERTIFICATE_AFTER_SUPPLEMENTARY_TRAINING`
- `WORKPLACE_TRAINING_COUNTS_AS_INTERNSHIP`
- `MESEM_COMPLETION_CERT_TO_DIPLOMA_COMMON_COURSES_REQUIRED`
- `MASTER_TRAINER_PEDAGOGY_COURSE_ELIGIBILITY`
- `MASTER_TRAINER_CERT_AFTER_PEDAGOGY_SUCCESS`
- `MASTER_TRAINER_CERT_REQUIRES_BASE_CREDENTIAL`
- `MASTER_TRAINER_CERT_SIGNATURE_CHAIN`
- `MASTER_TRAINER_PEDAGOGY_DISTANCE_ESINAV_ALLOWED`
- `PRIOR_LEARNING_EXAM_REGIME_SEPARATE_FROM_ENROLLED_MESEM`
- `REPEALED_EQUIVALENCE_SOURCE_NOT_ACTIVE`

## Etki sınıfları

- Diploma/mesleki eğitim tamamlama belgesi koşulları → `L3 / BLOCK_DOCUMENT_ISSUE`
- Usta öğreticilik kursuna kabul → `L3 / BLOCK_COURSE_ENROLLMENT`
- Usta öğreticilik belgesi üretimi ve beraber kullanım şartı → `L3 / BLOCK_CREDENTIAL_USE`
- Uzaktan eğitim/e-Sınav imkânı → `L1 / PARAMETER_CAPABILITY`
- İmza zinciri ve şablon → `L2 / DOCUMENT_PROCESS`
- Mülga kaynak filtresi → `L3 / LEGAL_SOURCE_BLOCK`

## Yayın ve geçmiş ilkesi

- Kurallar önce `STAGING` durumunda tutulur; diff/etki analizi ve Super Admin onayından sonra yalnız gelecek/pending süreçlere uygulanır.
- Tamamlanmış sınav, belge, diploma, denklik ve kurs kayıtları ilgili `legal_snapshot` ile immutable kalır.
- Belge kaynağı, madde/fıkra, yürürlük durumu ve başvuru rejimi ayrı alanlarda tutulmalıdır.
- Eski/mülga mevzuata göre verilmiş tarihsel belge kayıtları silinmez; ancak yeni işlem için aktif dayanak sayılamaz.

## ARTICLE_VERIFIED notu

Bu hükümler güncel resmî kaynaklardan doğrulanmıştır. Ancak 2.229 satırlık kalıcı masterdaki kesin `workflow_id` karşılıkları bu çalışma ortamında bulunmadığı için bu turda **ARTICLE_VERIFIED toplamı artırılmamıştır**.
