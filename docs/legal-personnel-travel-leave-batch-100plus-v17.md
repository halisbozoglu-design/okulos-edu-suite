# Legal Fast Batch V17 — Personel / İzin / Rapor / Harcırah / Ek Ders

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Atomized rule count: 120
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Resmî kaynaklar
- 657 sayılı Devlet Memurları Kanunu — https://www.mevzuat.gov.tr/MevzuatMetin/1.5.657.pdf
- 6245 sayılı Harcırah Kanunu — https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6245.pdf
- Devlet Memurlarına Verilecek Hastalık Raporları ile Hastalık ve Refakat İznine İlişkin Usul ve Esaslar Hakkında Yönetmelik — HMB kamu personel mevzuatı: https://www.hmb.gov.tr/bumko-kamu-personel-mevzuat-yonetmelikler
- MEB İzin Yönergesi — MEB Mevzuat listesi: https://meb.gov.tr/Mevzuat/liste.php?ara=5
- MEB Yönetici ve Öğretmenlerinin Ders ve Ek Ders Saatlerine İlişkin Karar ve güncel değişiklikler — MEB Mevzuat: https://meb.gov.tr/Mevzuat/liste.php?ara=7

## Modelleme ilkeleri
- Değişken katsayı, gündelik, tazminat, ek ders birim tutarı ve yıllık parasal değerler `YEAR_PARAMETER` olarak tutulur.
- Personel işlemlerinde `person_id`, `role_id`, `institution_id`, `legal_snapshot_id`, `effective_from/to`, `approval_chain`, `evidence_ids` korunur.
- Tamamlanmış izin/harcırah/ödeme kayıtları sonradan gelen mevzuat değişikliğiyle geriye dönük mutasyona uğratılmaz.
- Sağlık verileri özel nitelikli veri olarak erişim kontrollüdür; raporun yalnız idari işlem için gereken asgari alanları görünür.

## A — 657 sayılı Kanun: görev, sorumluluk, çalışma, izin ve personel işlemleri (60 atom)
A01 | 657 | memur sadakat yükümlülüğü | role=PERSON | impact=L2
A02 | 657 | tarafsızlık ve devlete bağlılık | role=PERSON | impact=L2
A03 | 657 | davranış ve işbirliği yükümlülüğü | impact=L2
A04 | 657 | amirin verdiği görevin mevzuata uygun yerine getirilmesi | evidence=task | impact=L3
A05 | 657 | hukuka aykırı emir görülürse amire bildirim akışı | evidence=written_notice | impact=L3
A06 | 657 | konusu suç teşkil eden emir yerine getirilemez | impact=L3
A07 | 657 | memur yaptığı işten sorumludur | impact=L3
A08 | 657 | kamu malını koruma ve hizmete hazır tutma yükümlülüğü | module=ASSET | impact=L3
A09 | 657 | kamu malı zararı doğarsa sorumluluk/kamu zararı bağlantısı kurulur | module=FIN | impact=L3
A10 | 657 | kişisel sorumluluk ile kurum sorumluluğu ayrı kaydedilir | impact=L2
A11 | 657 | mal bildirimi yükümlülüğü ilgili mevzuata yönlendirilir | impact=L3
A12 | 657 | basına bilgi verme yetkisi rol bazlıdır | impact=L3
A13 | 657 | resmî belge/araç/gereç yetkisiz özel kullanım engellenir | impact=L3
A14 | 657 | hizmet içi bilgi ve belgelerin gizliliği korunur | impact=L3
A15 | 657 | çalışma saatleri kurum takvimine bağlanır | parameter=calendar | impact=L2
A16 | 657 | haftalık çalışma süresi genel kuralı ayrı parametre olarak tutulur | impact=L2
A17 | 657 | günlük başlama-bitiş saatleri kurum/üst makam düzenine bağlanır | impact=L2
A18 | 657 | fazla çalışma yalnız hukuki dayanakla tanımlanır | impact=L3
A19 | 657 | yıllık izin kıdeme göre hesaplanır | evidence=service_duration | impact=L3
A20 | 657 | yıllık izin kullanım zamanı amir onayına bağlıdır | evidence=approval | impact=L3
A21 | 657 | birbirini izleyen iki yıl izninin birlikte kullanılabilmesi kural motoruna bağlanır | impact=L2
A22 | 657 | önceki yıllardan kalan izin için kanundaki sınır uygulanır | impact=L3
A23 | 657 | zorunlu hâllerde gidiş-dönüş yol süresi izne eklenebilirse ayrıca kaydedilir | impact=L2
A24 | 657 | mazeret izni türleri olay bazlı ayrıştırılır | impact=L3
A25 | 657 | doğum öncesi/doğum sonrası izin ayrı dönemlerdir | data=minimal | impact=L3
A26 | 657 | çoğul gebelik ek süre kuralı ayrı koşuldur | data=minimal | impact=L3
A27 | 657 | sağlık durumuna göre doğum öncesi çalışılan süre doğum sonrasına aktarılabilir | evidence=medical | impact=L3
A28 | 657 | erken doğumda kullanılamayan süre doğum sonrasına eklenir | impact=L3
A29 | 657 | süt izni dönem ve süreleri parametrik tutulur | impact=L3
A30 | 657 | babalık izni olay tarihine bağlanır | impact=L3
A31 | 657 | evlenme izni olay tarihine bağlanır | impact=L2
A32 | 657 | ölüm izni kanunda sayılan yakınlık derecelerine göre kontrol edilir | impact=L3
A33 | 657 | amirce verilebilen diğer mazeret izni ayrı onay akışıdır | impact=L3
A34 | 657 | hastalık izni rapor mevzuatıyla birlikte işletilir | relation=HEALTH_REPORT | impact=L3
A35 | 657 | uzun süreli tedavi gerektiren hastalıklar için farklı üst sınır kuralı ayrı tutulur | impact=L3
A36 | 657 | diğer hastalıklarda genel hastalık izni üst sınırı ayrı tutulur | impact=L3
A37 | 657 | hastalık izninin sonunda göreve başlayamama yeni hukuki olay üretir | impact=L3
A38 | 657 | refakat izni sağlık kurulu raporuna bağlıdır | evidence=board_report | impact=L3
A39 | 657 | aylıksız izin türleri gerekçesine göre ayrıştırılır | impact=L3
A40 | 657 | doğum sonrası aylıksız izin ayrı süreçtir | impact=L3
A41 | 657 | eş durumu/yurt dışı görevlendirmeye bağlı aylıksız izin ayrı süreçtir | impact=L3
A42 | 657 | hizmet süresine bağlı aylıksız izin şartları koşul motoruna bağlanır | impact=L3
A43 | 657 | izin bitiminde göreve başlama tarihi otomatik görev üretir | impact=L3
A44 | 657 | süresinde göreve dönmeme personel olayı olarak eskale edilir | impact=L3
A45 | 657 | çekilme talebi yazılı kayıt ve tarih taşır | evidence=request | impact=L3
A46 | 657 | çekilmede devir-teslim yükümlülüğü ayrı workflow’dur | evidence=handover | impact=L3
A47 | 657 | izinsiz/mazeretsiz görevi terk hâli personel olayına dönüşür | impact=L3
A48 | 657 | disiplin cezaları tür ve fiil eşleştirmesiyle ayrı hukuk ailesine bağlanır | module=DISCIPLINE | impact=L3
A49 | 657 | savunma alınmadan disiplin cezası verilemez | evidence=defense | impact=L3
A50 | 657 | disiplin zamanaşımı tarihleri olay tarihinden hesaplanır | deadline=versioned | impact=L3
A51 | 657 | disiplin kararının tebliği kanıtlı yapılır | evidence=notification | impact=L3
A52 | 657 | görevden uzaklaştırma tedbirdir, ceza değildir | impact=L3
A53 | 657 | görevden uzaklaştırma yetkisi rol/merci bazlı kontrol edilir | impact=L3
A54 | 657 | uzaklaştırma sürecinde periyodik gözden geçirme görevi üretilir | impact=L3
A55 | 657 | derece/kademe/öğrenim/hizmet süreleri personel özlük kaydında kaynaklı tutulur | impact=L2
A56 | 657 | vekâlet ve ikinci görev işlemleri ayrı hukuki statüdür | impact=L2
A57 | 657 | zam/tazminat unsurları dönemsel parametredir | parameter=YEAR_PARAMETER | impact=L2
A58 | 657 | aile/çocuk yardımı gibi mali haklar hak sahipliği ve dönem parametresiyle hesaplanır | impact=L3
A59 | 657 | mali hak değişikliğinde geçmiş bordrolar değiştirilmez, fark/mahsup kaydı üretilir | impact=L3
A60 | 657 | özlük belgesi ve kararları arşiv/legal snapshot ile ilişkilendirilir | module=ARCHIVE | impact=L3

## B — Hastalık raporu ve refakat izni yönetmeliği (20 atom)
B01 | RAPOR-Md5 | raporun yetkili sağlık hizmeti sunucusunca düzenlenmesi esastır | evidence=medical_report | impact=L3
B02 | RAPOR-Md5 | SGK sözleşmesi olmayan sunucu raporlarında onay şartı süreye göre kontrol edilir | impact=L3
B03 | RAPOR-Md5 | 10 günü aşmayan raporda sözleşmeli hekim onayı kontrol edilir | impact=L3
B04 | RAPOR-Md5 | 10 günü aşan raporda sağlık kurulu onayı kontrol edilir | impact=L3
B05 | RAPOR-Md5 | yurt dışında düzenlenen rapor ilgili ülke mevzuatı/temsilcilik prosedürüne göre işlenir | impact=L3
B06 | RAPOR-Md6 | tek hekim raporu üst sınırları kural motorunda tutulur | impact=L3
B07 | RAPOR-Md6 | aynı hekimce devam raporu/verilebilecek toplam süre kontrol edilir | impact=L3
B08 | RAPOR-Md6 | daha uzun istirahat için sağlık kurulu raporu gereksinimi kontrol edilir | impact=L3
B09 | RAPOR-Md7 | hastalık izni yetkili amir/onay sürecinden geçer | evidence=approval | impact=L3
B10 | RAPOR-Md7 | raporun kuruma iletilme süresi deadline olarak izlenir | impact=L3
B11 | RAPOR-Md7 | usule aykırı rapor için personele bildirim ve göreve çağrı workflow’u oluşturulur | impact=L3
B12 | RAPOR-Md8 | yıllık izin sırasında rapor alınması yıllık izin hesabını etkileyen ayrı olaydır | impact=L3
B13 | RAPOR-Md8 | rapor bitişi-yıllık izin bitişi ilişkisine göre göreve başlama tarihi hesaplanır | impact=L3
B14 | RAPOR-Md9 | gerekli hâllerde göreve dönüş için iyileşme raporu aranır | impact=L3
B15 | RAPOR-Md10 | refakat izni sağlık kurulu raporuna dayanır | evidence=board_report | impact=L3
B16 | RAPOR-Md10 | refakat edilecek kişi kanunda/yönetmelikte sayılan yakınlık kapsamında olmalıdır | impact=L3
B17 | RAPOR-Md10 | hayati tehlike/ağır kaza/uzun tedavi koşulu raporda bulunmalıdır | impact=L3
B18 | RAPOR-Md10 | refakat gerekliliği ve süresi raporda açıkça belirtilmelidir | impact=L3
B19 | RAPOR | sağlık verisinin tanı ayrıntısı gereksiz rollere gösterilmez | module=PRIVACY | impact=L3
B20 | RAPOR | rapor aslı/elektronik doğrulama bilgisi arşivlenir, görünürlük asgari yetkiyle sınırlandırılır | impact=L3

## C — 6245 sayılı Harcırah Kanunu (20 atom)
C01 | 6245-Md1 | harcırah kapsamı kurum/kişi statüsüne göre kontrol edilir | impact=L3
C02 | 6245 | geçici görev ile sürekli görev yolluğu birbirinden ayrılır | impact=L3
C03 | 6245 | yol masrafı ayrı harcırah unsurudur | impact=L2
C04 | 6245 | gündelik ayrı harcırah unsurudur | parameter=YEAR_PARAMETER | impact=L3
C05 | 6245 | aile masrafı yalnız koşulları oluştuğunda hesaplanır | impact=L3
C06 | 6245 | yer değiştirme masrafı yalnız sürekli görev şartlarında değerlendirilir | impact=L3
C07 | 6245 | memuriyet mahalli parametresi görev yeri ve mevzuata göre belirlenir | impact=L3
C08 | 6245 | memuriyet mahalli içindeki görevlendirme için harcırah hakkı ayrıca kontrol edilir | impact=L3
C09 | 6245 | geçici görevlendirme onayı harcırah talebinin hukuki dayanağıdır | evidence=assignment | impact=L3
C10 | 6245 | görev başlangıç/bitiş tarih-saatleri ödeme hesabına bağlanır | impact=L3
C11 | 6245 | ulaşım türü ve bilet/kanıt belgeleri masraf kalemine bağlanır | evidence=ticket | impact=L3
C12 | 6245 | konaklama gideri yalnız ilgili düzenleme ve belge şartlarıyla ödenir | evidence=invoice | impact=L3
C13 | 6245 | gündelik tutarı bütçe yılı cetvel/katsayı kaynağından çekilir | parameter=YEAR_PARAMETER | impact=L3
C14 | 6245 | yurtiçi/yurtdışı gündelik rejimleri ayrıdır | impact=L3
C15 | 6245 | aynı görev için mükerrer ödeme engellenir | impact=L3
C16 | 6245 | avans verilmişse görev dönüşünde mahsup workflow’u açılır | relation=ADVANCE | impact=L3
C17 | 6245 | harcırah bildirimi ve ekleri ödeme kanıt paketidir | evidence=declaration | impact=L3
C18 | 6245 | görevlendirme iptal/değişiklikleri tarihçeli tutulur | impact=L2
C19 | 6245 | geçmiş yıl gündelikleri yeni yıl tutarıyla geriye dönük hesaplanmaz | impact=L3
C20 | 6245 | mevzuata aykırı/fazla ödeme kamu alacağı-kamu zararı sürecine bağlanır | impact=L3

## D — MEB İzin / Ek Ders / Bordro bağlantıları (20 atom)
D01 | MEB-IZIN | izin talebi tür, başlangıç, bitiş, gerekçe ve onay merciini taşır | impact=L3
D02 | MEB-IZIN | görev yeri/rolüne göre izin onay mercii dinamik belirlenir | impact=L3
D03 | MEB-IZIN | izin uzatma yeni onay işlemidir; önceki kaydı mutasyona uğratmaz | impact=L3
D04 | MEB-IZIN | izin iptali/erken dönüş tarihçeli kayıt üretir | impact=L2
D05 | MEB-IZIN | izin süresince vekâlet/görev devri gerekiyorsa ilişkili görev oluşturulur | impact=L2
D06 | MEB-IZIN | rapor ve izin çakışması mevzuat kuralına göre çözülür | impact=L3
D07 | MEB-EKDERS | aylık karşılığı ders ve ek ders birbirinden ayrı hesap unsurlarıdır | impact=L3
D08 | MEB-EKDERS | yönetici/öğretmen rolü ek ders kural setini değiştirir | impact=L3
D09 | MEB-EKDERS | fiilen yapılmayan ders için ödeme yalnız açık istisna varsa mümkündür | impact=L3
D10 | MEB-EKDERS | nöbet, DYK, kurs, egzersiz, koordinatörlük vb. görevler ayrı ek ders kaynak kodlarına bağlanır | impact=L3
D11 | MEB-EKDERS | aynı saat için mükerrer ek ders ödemesi engellenir | impact=L3
D12 | MEB-EKDERS | tatil/izin/raporun ek ders etkisi görev türü bazında hesaplanır | impact=L3
D13 | MEB-EKDERS | 10.02.2025 tarihli Karar Sayısı 9514 dahil güncel değişiklikler versioned legal snapshot olarak tutulur | impact=L3
D14 | MEB-EKDERS | ek ders birim tutarı mali yıl katsayılarıyla hesaplanır, sabit yazılmaz | parameter=YEAR_PARAMETER | impact=L3
D15 | PAYROLL | bordro dönemi kapandıktan sonra kaynak veri değişikliği fark/mahsup kaydı üretir | impact=L3
D16 | PAYROLL | personel statüsü, derece/kademe, hizmet, aile durumu ve kesintiler dönem snapshot’ında tutulur | impact=L3
D17 | PAYROLL | ödeme emri/gerçekleştirme kanıtları 5018 akışına bağlanır | relation=FINANCE | impact=L3
D18 | PAYROLL | yetkisiz kullanıcı sağlık/maaş ayrıntısına erişemez | module=PRIVACY | impact=L3
D19 | PAYROLL | bordro ve ek ders çizelgesinde hazırlayan-kontrol-onay zinciri kaydedilir | evidence=approval_chain | impact=L3
D20 | PAYROLL | mevzuat değişikliği yalnız yürürlük tarihinden sonraki hesap dönemlerine uygulanır; geçmiş dönem snapshot korunur | impact=L3

## Sayım
- 657: 60
- Hastalık/refakat raporu: 20
- 6245 harcırah: 20
- MEB izin/ek ders/bordro bağlantıları: 20
- TOPLAM: 120 atom

## Final denetimde özellikle kontrol edilecekler
- 657’de değişiklik görmüş izin, disiplin, mali hak ve görevden uzaklaştırma fıkralarının güncel konsolide metinle madde/fıkra eşlemesi.
- 6245’te memuriyet mahalli, geçici/sürekli görev ve güncel bütçe yılı gündelikleri.
- MEB İzin Yönergesi yürürlük/değişiklik durumu ve yetki tabloları.
- Ek Ders Kararının 2025/9514 ve sonraki değişiklikleri; mülga hükümler aktif kural olarak kullanılmayacak.
- Değişken parasal tutarlar yalnız YEAR_PARAMETER kaynağından beslenecek.
