# V70 — DÖSE EKAP / SGK / DMİS-BKMYBS integrity

Kaynak politikası: yalnız resmî MEB / Resmî Gazete / mevzuat.gov.tr. Migration 0. Lovable 0.

## Master sıra sınırı
DÖSE denetim bloğu HB-1608 ile biter. HB-1609 stratejik planlama bölümüne geçer. V70 konu bütünlüğü için HB-1604..HB-1608 üzerinde kapanmıştır.

## HB-1604
Master: ihale ve doğrudan temin işlemlerinin EKAP'a işlenmesi ve kayıt numarası alınması.
Current MEB TKB 09.10.2025 DÖSE rehberi, 01.08.2025 itibarıyla 4734 kapsamı/istisna ihale, doğrudan temin ve sözleşme süreçlerinin Kamu Alımlarının Elektronik Ortamda Yapılmasına İlişkin Uygulama Yönetmeliği kapsamında EKAP üzerinden yürütülmesini denetim kriteri yapıyor. Ancak masterdaki ayrıca `kayıt numaraları alınmaktadır` atomu primary hüküm düzeyinde kilitlenmedi. Status: L2_CURRENT_PARTIAL_EXACT + PRIMARY_PROVISION_AND_RECORD_NUMBER_LOCK_PENDING. Whole-row ARTICLE_VERIFIED yok.

## HB-1605
Master: bütçe yapma işlemleri zamanında yapılarak onay alınır. DHGM İşletmeler Daire Başkanlığı güncel görev sayfası, döner sermaye işletmelerinin bütçe ve ek bütçelerinin DMİS üzerinden onaylanması işlemini halen görev olarak gösteriyor. Buna karşılık 2025 TKB rehberi mali/muhasebe işlemlerinin 2024 sonuna kadar BKMYBS'ye aktarımını kaydediyor. Bütçe onayı ile muhasebe kayıt sistemi aynı nesne değildir. Status: CURRENT_OPERATIONAL + SYSTEM_FUNCTION_SPLIT_REQUIRED + PRIMARY_BUDGET_PROVISION_LOCK_PENDING.

## HB-1606
Master: parça başı ücret ödemelerinden `SGK işçi ve işveren payları kesilmekte`, ilgili hesaplara zamanında yatırılmaktadır. 5510 sayılı Kanun Md80 prime esas kazancı; Md86 ise işverenin sigortalı payını ücret/kazançtan kesip kendisine ait prim tutarını ekleyerek Kuruma ödeme mantığını düzenler. İşveren payının ücret ödemesinden `kesildiği` şeklindeki master semantiği exact değildir. Status: CONNECTOR_SEMANTIC_MISMATCH + MASTER_REWRITE_REQUIRED. Önerilen atomik model: (1) prime esas kazancı belirle, (2) sigortalı payını kes, (3) işveren payını ekle/tahakkuk ettir, (4) süresinde bildir/öde. Whole-row ARTICLE_VERIFIED yok.

## HB-1607
Master: parça başı ücretlerin eğitim-öğretim sınıfındaki memur, usta öğretici ve işçilerin vergi matrahlarına yansıtılması. Current official Income Tax material confirms ücret/prim/ikramiye ve benzeri hizmet karşılığı ödemelerin ücret niteliğini; ancak actor sınıfları, istisnalar ve matrah hesap mekanizması ayrı hükümlere dağılır. Status: TAX_BASE_ROLE_AND_EXEMPTION_SPLIT_REQUIRED + PRIMARY_EXACT_CHAIN_PENDING. Whole-row ARTICLE_VERIFIED yok.

## HB-1608
Master: bütün döner sermaye kayıtlarının DMİS'e düzenli girilmesi. Current 09.10.2025 MEB TKB DÖSE rehberi, Hazine ve Maliye Bakanlığının 15.08.2024/3347897 yazısı ve MEB DHGM 29.08.2024/E-49700667-710-112032964 yazısı doğrultusunda, DMİS'te yürütülen mali iş ve işlemlerin BKMYBS'de gerçekleştirilebilmesi için MEB döner sermaye işletmelerinin 2024 Eylül-Aralık döneminde BKMYBS'ye aktarılmasının planlandığını/gerçekleştirildiğini kaydediyor. Bu nedenle broad `tüm kayıtlar DMİS'e girilir` master cümlesi current system-object olarak güvenli değildir. Status: LEGACY_SYSTEM_OBJECT + MASTER_REWRITE_REQUIRED + FUNCTION_LEVEL_SYSTEM_ROUTING. Bütçe/ek bütçe onayı gibi halen DMİS adıyla yürütülen ayrı fonksiyonlar ayrı tutulur.

## V69/V70 back-correction
Current TKB rehberi ayrıca aylık mizan ve yıl sonu bilanço/eklerinin 01.03.2012'den beri Genel Müdürlüğe gönderilmemesini, kurumda muhafaza edilmesini; yıl sonu idare hesapları dosyasının ve Sayıştay'a gönderilecek belgelerin de güncel uygulamada kurumda muhafaza edilip istenildiğinde sunulmasını denetim kriteri yapıyor. Bu, HB-1599 ve HB-1602 legacy recipient/send semantics için rewrite gereğini güçlendirir.

## New guards
- SYSTEM_NAME_MATCH_REQUIRES_FUNCTION_MATCH: aynı sistem adı farklı fonksiyonlarda farklı current status taşıyabilir; DMİS bütçe onayı ile BKMYBS muhasebe kaydı karıştırılmaz.
- EMPLOYEE_SHARE_AND_EMPLOYER_SHARE_ARE_NOT_SAME_DEDUCTION: `ve` bağlacı işçi ve işveren primlerinin ücret üzerinden aynı şekilde kesildiği anlamına getirilemez.
- LEGACY_SEND_RECIPIENT_CANNOT_SURVIVE_CURRENT_RETAIN_ON_REQUEST_RULE.
- SECTION_BOUNDARY_STOPS_DOMAIN_DRIFT: master kaynak bölümü değiştiğinde batch aynı hukuk ailesi varsayımıyla devam etmez.
