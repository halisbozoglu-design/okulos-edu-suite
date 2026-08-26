# Legal Fast Batch V25 — Açık Öğretim + OAB + Taşımalı Eğitim + Özel Eğitim

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: fast >=100 atom coverage + exact master binding in separate ARTICLE_VERIFIED document.
Migration count: 0

## Current official sources
- MEB Açık Öğretim Kurumları Yönetmeliği (22.10.2024): https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm
- MEB Okul-Aile Birliği Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
- OAB 2023 amendment: https://mevzuat.meb.gov.tr/dosyalar/2191.pdf
- MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği 2024 amendment: https://resmigazete.gov.tr/eskiler/2024/08/20240801-2.htm
- MEB Özel Eğitim Hizmetleri Yönetmeliği: https://resmigazete.gov.tr/eskiler/2018/07/20180707-8.htm

## A — Açık Öğretim (30 atoms)
OPEN-001|current|2024 Yönetmeliği eski açık öğretim yönetmeliklerini yeni karar motorunda supersede eder
OPEN-002|current|AOL/AOIHL/MAOL kurum tipleri ayrı school_type/feature filtresi
OPEN-003|current|kayıt kabul koşulları kurum/program türüne göre değerlendirilir
OPEN-004|current|örgün eğitimden açık öğretime geçiş koşulu ayrı eligibility gate
OPEN-005|current|ilk kayıt ile kayıt yenileme ayrı workflow
OPEN-006|current|kayıt dönemi yıllık iş takviminden versioned parameter
OPEN-007|current|kayıt yenileme dönemi versioned parameter
OPEN-008|current|öğrenci dosyası ve elektronik kayıt provenance ile saklanır
OPEN-009|current|ders seçimi dönemsel snapshot olarak tutulur
OPEN-010|current|kredi/ders başarı hesabı program sürümüne bağlıdır
OPEN-011|current|muafiyet ve denklik ayrı karar kaydıdır
OPEN-012|current|yüz yüze eğitim gereken programlarda HAS_OPEN_ED_FACE_TO_FACE koşulu
OPEN-013|current|yüz yüze eğitim merkezi görevlendirmesi ayrı workflow
OPEN-014|current|yüz yüze eğitim ders programı ayrı takvim nesnesi
OPEN-015|current|öğretmen görevlendirmesi yetki/onay kaydıyla tutulur
OPEN-016|current|devam-devamsızlık yüz yüze eğitimde ayrı izlenir
OPEN-017|current|sınav merkezi/sınav dönemi yıllık kılavuza bağlı versioned parameter
OPEN-018|current|sınav başvurusu ile sınava katılım sonucu ayrıdır
OPEN-019|current|not/puan girişleri yetkili kullanıcı audit loguna bağlıdır
OPEN-020|current|itiraz ve düzeltme işlemleri ayrı kayıt olarak tutulur
OPEN-021|current|mezuniyet koşulları program türü/sürümüne göre hesaplanır
OPEN-022|current|diploma üretimi mezuniyet kesinleşmesinden sonra açılır
OPEN-023|current|diploma/öğrenim belgesi seri-kayıt bilgisi saklanır
OPEN-024|current|MAOL işyeri açma/mesleki belge ilişkisi ilgili meslek mevzuatına bağlanır
OPEN-025|current|MESEM ile eşzamanlı açık öğretim kayıtları ayrı kurum kayıtlarıdır
OPEN-026|current|örgün/açık öğretim statü değişikliği tarihsel olarak immutable tutulur
OPEN-027|current|öğrenci kişisel verileri minimum yetkiyle görünür
OPEN-028|current|tamamlanmış sınav/kayıt snapshotları yeni kılavuzla değişmez
OPEN-029|current|eski 2020/1 genelge yalnız tarihsel/cross-check ise kullanılır; 2024 Yönetmeliğe aykırı olamaz
OPEN-030|current|exact article promotion workflow_id + güncel madde/fıkra eşleşmesi sonrası

## B — Okul-Aile Birliği (30 atoms)
OABX-001|Md8|birlik organları genel kurul+yönetim kurulu+denetleme kurulu
OABX-002|Md9/1|genel kurul birlik üyelerinden oluşur
OABX-003|Md9/1|olağan genel kurul her yıl en geç ekim sonuna kadar
OABX-004|Md9/1|yeni açılan okulda açılıştan itibaren en geç iki ay
OABX-005|Md9/2|toplantı/karar yeter sayısı kontrolü
OABX-006|Md9/3|yer-zaman-gündem önceden duyuru kanıtı
OABX-007|Md10|katılım cetveli tutulur
OABX-008|Md10|toplantı açılış ve divan seçimi kayıt altına alınır
OABX-009|Md10|kurul seçimleri asıl/yedek liste olarak oylanır
OABX-010|Md11|genel kurul yönetim kurulu üyelerini seçer
OABX-011|Md11|genel kurul denetleme kurulu veli/kursiyer üyesini seçer
OABX-012|Md11|önceki dönem faaliyet raporları görüşülür/ibra edilir
OABX-013|Md11|tahmini bütçe genel kurulda görüşülür
OABX-014|Md12/1|yönetim kurulu beş asıl/beş yedek yapısıyla tutulur
OABX-015|Md12/2|yönetim kurulu görev süresi bir yıldır
OABX-016|Md12/3|ilk hafta görev dağılımı yapılır
OABX-017|Md13/1|yönetim kurulu genel kurul kararlarını okul yönetimiyle planlı yürütür
OABX-018|Md13/3|yönetim kurulu eğitim yılında ayda bir toplanır
OABX-019|Md13/5|kararlar karar defterine yazılır ve imzalanır
OABX-020|Md13/10|gelir-gider kayıtları eğitim yılında her dönem en az bir kez ilan panosu+internet sitesinde duyurulur
OABX-021|Md14/1|denetleme kurulu üç asıl/üç yedek yapı
OABX-022|Md14/2|denetleme kurulu görev süresi bir yıl
OABX-023|Md14/4|yılda en az iki denetim ve ara rapor
OABX-024|Md14/4|faaliyet dönemi nihai raporu genel kurula sunulur
OABX-025|Md18/1|harcamalar yönetim kurulu kararıyla ve okul talebiyle
OABX-026|Md18/2|banka çekiminde müşterek imza kontrolü
OABX-027|Md18/4|kaynakların etkili/verimli/mevzuata uygun kullanım sorumluluğu
OABX-028|Md18/5|birlik başkanı gelir/bağış/harcama bilgisini her ay sonunda okul müdürüne yazılı bildirir
OABX-029|Md23/5|okul idaresi mali kayıtları TEFBİS/merkezî sisteme kaydeder
OABX-030|Md25|mevzuata aykırı/siyasi/çıkar sağlayıcı işlemler yasaktır

## C — Taşımalı Eğitim (30 atoms)
TASX-001|2024-Md1|kapsam öğrenci/kursiyer erişim hakkı temelli
TASX-002|Md4|taşıma hizmetinden faydalanacak kişi kategorileri ayrı eligibility
TASX-003|Md4|taşıma merkezi okul/kurum ayrı institution relation
TASX-004|Md4|öğrencisi taşınacak okul/kurum ayrı kaynak kurum
TASX-005|Md4|öğrencisi taşınacak yerleşim birimi eligibility verisi
TASX-006|Md4|geçici ikamet senaryosu desteklenir
TASX-007|Md4|özel eğitim refakatçi kararı BEP birimi kararına bağlanır
TASX-008|Md4|rehber personel statüsü ayrı rol
TASX-009|Md4|okul servis aracı ticari tescilli uygun araç filtresi
TASX-010|current|taşınacak öğrenci listesi yıllık snapshot
TASX-011|current|taşıma güzergâhı/version ayrı kayıt
TASX-012|current|taşıma merkezi seçimi yetkili kurul/onayla
TASX-013|current|taşıma planı eğitim yılı bazında
TASX-014|current|araç/sürücü/rehber personel uygunluk belgeleri
TASX-015|current|servis denetim komisyonu rol kompozisyonu
TASX-016|current|denetim bulgusu ve düzeltici faaliyet
TASX-017|current|yüklenici sözleşmesi procurement relation
TASX-018|current|öğrenci teslim/alım güvenliği okul operasyonuna bağlanır
TASX-019|current|devamsızlık ile taşıma kullanımı ayrı tutulur
TASX-020|current|ücretsiz öğle yemeği eligibility taşıma kapsamına göre
TASX-021|current|özel eğitim öğrencisinin yemek/refakat koşulu ayrı
TASX-022|current|taşımalı ve diğer öğrencilerin sınıflara dengeli dağılım kontrolü
TASX-023|current|güzergâh değişikliği geçmişi silmez
TASX-024|current|araç değişikliği onay/audit gerektirir
TASX-025|current|kaza/olay kayıtları güvenlik olayına linklenir
TASX-026|current|kişisel konum/GPS uygulaması bu legal workflowdan ayrıdır
TASX-027|current|sözleşme bitiş/yenileme yeni instance oluşturur
TASX-028|current|yıllık ihale/parasal değerler YEAR_PARAMETER
TASX-029|current|2024 değişiklik öncesi hükümler historical snapshot olarak saklanır
TASX-030|current|exact article binding master workflow bazında yapılır

## D — Özel Eğitim (30 atoms)
SPEDX-001|Md4|özel eğitim ihtiyacı olan birey tanımı current source
SPEDX-002|Md4|BEP tanımı ayrı program nesnesi
SPEDX-003|Md4|destek eğitim odası ayrı ortam/feature
SPEDX-004|Md4|kaynaştırma/bütünleştirme uygulaması ayrı eğitim modeli
SPEDX-005|current|eğitsel değerlendirme/tanılama RAM süreci
SPEDX-006|current|başvuru ve değerlendirme dosyası provenance
SPEDX-007|current|özel eğitim değerlendirme kurulu ayrı kurul
SPEDX-008|current|kurul kararları oylama/rapor kanıtıyla
SPEDX-009|current|yerleştirme kararı ayrı decision record
SPEDX-010|current|özel eğitim hizmetleri kurulu üst karar/koordinasyon katmanı
SPEDX-011|current|BEP geliştirme birimi ayrı rol grubu
SPEDX-012|current|BEP öğrenci performansı ve hedeflerle versionlanır
SPEDX-013|current|BEP revizyonu eski sürümü silmez
SPEDX-014|current|destek eğitim odası açılması yetkili teklif/onaya bağlı
SPEDX-015|Md25|destek eğitim odası hizmeti öğrenci ihtiyacına göre planlanır
SPEDX-016|Md25|öğretmen görevlendirmesi ayrı assignment
SPEDX-017|current|kaynaştırma öğrencisi sınıf/şube yerleştirme koşulları
SPEDX-018|current|sınav tedbirleri öğrenci/BEP kararına bağlanır
SPEDX-019|current|refakat ihtiyacı öğrenci özel kararına bağlı
SPEDX-020|current|erişilebilirlik/fiziki düzenleme ihtiyacı FAC relation
SPEDX-021|current|devam-devamsızlık okul türü kurallarıyla entegre
SPEDX-022|current|özel eğitim sınıfı açma/kapama ayrı workflow
SPEDX-023|current|özel eğitim okul türü SPED filter
SPEDX-024|current|özel yetenekli öğrenci BİLSEM ile karıştırılmaz
SPEDX-025|current|veli bilgilendirme/katılım kayıtları
SPEDX-026|current|öğrenci sağlık/engel verisi yüksek gizlilik sınıfı
SPEDX-027|current|RAM modülü veri girişleri yetkili kullanıcı audit logu
SPEDX-028|current|eski 2016 Özel Eğitim Yönetmeliği aktif karar kaynağı olamaz
SPEDX-029|current|tamamlanmış BEP/kurul snapshotları sonraki değişiklikten etkilenmez
SPEDX-030|current|exact article/fıkra promotion yalnız master workflow birebir eşleşmesinde

## Counts
- OPEN: 30
- OAB: 30
- TASIMA: 30
- SPED: 30
- TOTAL: 120
- migration: 0
