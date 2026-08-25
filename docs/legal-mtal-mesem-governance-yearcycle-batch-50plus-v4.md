# Okulos — MTAL/MESEM Yönetişim, Öğretmen Görevleri, Eğitim Ortamları ve Kurullar Batch 50+

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**  
Birincil kaynak: MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği  
Kaynak: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf

> Bu batch `ARTICLE_VERIFIED` değildir. Amaç güncel resmî hükümleri Okulos workflow/kural motoru için atomik kontrol noktalarına ayırmaktır. 2.229 satırlık kalıcı master ile kesin `workflow_id` bağları kurulmadan doğrulanmış-workflow sayacı artırılmaz.

## Kapsam

İşlenen hükümler: Md.86, 93, 94, 95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 112, 113, 114, 115, 116, 117, 118, 119, 120.

## Atomik kurallar — 96 adet

### A. Öğretmen görevleri — Md.86
1. `TEACHER_LEGAL_DUTY` — Öğretmen görevlerini Türk millî eğitiminin genel amaçları, temel ilkeleri ve ilgili mevzuata uygun yürütür.
2. `TEACHER_CLASS_ENVIRONMENT` — Öğretmen sınıfın fiziksel ve psikolojik eğitim ortamını hazırlar.
3. `TEACHER_METHOD_DISCLOSURE` — İzlenecek program, yöntem ve teknikler öğrenciye açıklanır.
4. `TEACHER_ACTIVE_LEARNING` — Araştırma, yapma ve yaşayarak öğrenmeyi destekleyen teknik ve teknolojik kaynaklar kullanılır.
5. `TEACHER_SCHOOL_ENVIRONMENT_COOP` — Eğitim standartları ve okul-çevre ilişkisinin geliştirilmesine katkı sağlanır.
6. `TEACHER_STUDENT_MODEL_ROLE` — Öğretmen tutum ve davranışlarıyla öğrencilere örnek olur.
7. `TEACHER_OUTCOME_ACTIVITY_PLAN` — Öğretim programı kazanım/becerilerine yönelik etkinlikler planlanır ve uygulanır.
8. `TEACHER_SPECIAL_ED_SUPPORT` — Özel eğitim ihtiyacı olan öğrencilerin eğitim faaliyetleri yürütülür.
9. `TEACHER_CLUB_DUTY` — Sorumluluğa verilen öğrenci kulübü/toplum hizmeti görevleri yürütülür.
10. `TEACHER_CLASS_GUIDANCE_DUTY` — Sınıf rehber öğretmenliği görevi yürütülür.
11. `TEACHER_ASSESSMENT_DUTY` — Sınav, proje, performans ve ilgili ölçme işlemleri yürütülür.
12. `TEACHER_ANNUAL_LESSON_PLAN` — Ünitelendirilmiş yıllık plan ve ders planları hazırlanır.
13. `TEACHER_ATTENDANCE_AT_START` — Ders başlangıcında öğrenci yoklaması yapılır.
14. `TEACHER_LESSON_LOG` — Konu, etkinlik, deney, uygulama, performans ve yazılı yoklama ders defterine işlenir ve imzalanır.
15. `TEACHER_TRIP_PLAN_REPORT` — İnceleme/araştırma gezisi için plan hazırlanır; sonuç raporu müdüre sunulur.
16. `TEACHER_COMMITTEE_PARTICIPATION` — Görevlendirilen kurul, komisyon, ekip, tören, toplantı, kurs ve seminerlere katılım zorunludur.
17. `TEACHER_BOARD_PARTICIPATION` — Öğretmenler kurulu ve zümre toplantılarına katılım ve verilen görevlerin yerine getirilmesi gerekir.
18. `TEACHER_TECH_UPDATE` — Alanındaki bilimsel/teknolojik yenilikler izlenir ve eğitime yansıtılır.
19. `TEACHER_RESOURCE_SAFETY` — Sorumluluğa verilen araç-gereç ve materyaller güvenli kullanılır ve korunur.
20. `TEACHER_DIGITAL_RECORDS` — Elektronik kayıtlar takip edilir; gerekli veri giriş/güncellemeleri yapılır; onay gereken belgeler müdüre sunulur.
21. `TEACHER_PARENT_COOPERATION` — Öğrenci davranış ve başarı durumlarında velilerle işbirliği yapılır.
22. `TEACHER_CONTACT_DURING_LEAVE` — İzinli sayılan sürelerde bulunulacak adres ve iletişim bilgileri yönetime bildirilir.
23. `TEACHER_DUTY_SHIFT` — Verilen nöbet görevi yerine getirilir.
24. `MT_TEACHER_REVOLVING_FUND_PLAN` — Mesleki/teknik alan öğretmeni öğretim programına uygun döner sermaye işlerini planlar/yaptırır.
25. `MT_TEACHER_PRODUCTION_MONITOR` — Öğrencilerin eğitim, öğretim ve üretim etkinlikleri izlenir.
26. `MT_TEACHER_EQUIPMENT_READINESS` — Uygulamalı eğitim araç-gereci zamanında sağlanır, kontrol/teslim alınır ve kullanıma hazır tutulur.
27. `MT_TEACHER_EQUIPMENT_MAINTENANCE` — Makine/araçların korunması, bakım-onarımı ve güvenli kullanımı sağlanır.
28. `MT_TEACHER_USAGE_LIST` — Deney, temrin, döner sermaye işi ve uygulamalarda kullanılan araç-gereç listeleri ilgililere verilir.
29. `MT_TEACHER_WORKSHOP_PLAN` — Temrin, üretim ve hizmetlerin düzenli yürütülmesi için şeflerle birlikte plan hazırlanır.
30. `MT_TEACHER_PROJECT_GUIDANCE` — Öğrencilere alanıyla ilgili proje danışmanlığı ve rehberlik yapılır.
31. `MT_TEACHER_PRODUCTION_QUALITY_TIME` — Döner sermaye üretim/hizmetlerinin istenen nitelik ve sürede tamamlanması sağlanır.

### B. Uzman/usta öğretici ve diğer personel — Md.93-94
32. `EXPERT_TRAINER_NEED_GATE` — Öğretmen ihtiyacının karşılanamadığı alanlarda uzman, usta öğretici veya MYK seviye 4+ yeterlilik sahibinden yararlanılabilir.
33. `EXPERT_TRAINER_PROTOCOL_EXCEPTION` — Ulusal/uluslararası sözleşme veya özel mevzuatla eğitim yapılan alanlarda öğretmen bulunsa da şartları taşıyan usta öğretici görevlendirilebilir.
34. `EXPERT_INDEPENDENT_TEACHING` — Uzman görevlendirilenler bağımsız ders okutabilir.
35. `MASTER_TRAINER_SUPERVISED_TEACHING` — Usta öğreticiler öğretmen gözetiminde ders yürütür.
36. `VOLUNTEER_MASTER_TRAINER` — Şartları taşıyan gönüllü usta öğreticiler ücretsiz görevlendirilebilir.
37. `EXPERT_MASTER_TRAINER_AGE_LIMIT` — 65 yaşını dolduranlara uzman/usta öğreticilik görevi verilmez.
38. `SCHOOL_TECHNICIAN_ROLE` — Bakım-onarım ve uygulama alanlarında teknisyen çalıştırılabilir.
39. `SCHOOL_LIBRARY_STAFF_ROLE` — Kütüphane işleri için kütüphane memuru çalıştırılabilir.
40. `SCHOOL_SECURITY_STAFF_ROLE` — Bina, tesis, araç ve gereç güvenliği için gece bekçisi/koruma/güvenlik personeli çalıştırılabilir.
41. `SCHOOL_WAREHOUSE_STAFF_ROLE` — Ambar/depo işleri için ambar memuru çalıştırılabilir.
42. `SCHOOL_HEALTH_STAFF_ROLE` — Revir ve sağlık işleri için hemşire çalıştırılabilir.
43. `SCHOOL_KITCHEN_STAFF_ROLE` — Yemekhanesi bulunan okullarda aşçı çalıştırılabilir.
44. `STAFF_WRITTEN_DUTY_NOTICE` — Personel görevleri müdürce mevzuata göre belirlenip yazılı tebliğ edilir.
45. `OUTSOURCED_STAFF_CONTRACT_SCOPE` — Hizmet alımı personelinin görev esasları sözleşmeyle belirlenir.

### C. Eğitim ortamları, tesis ve güvenlik — Md.95, 97-106
46. `FACILITY_PROJECT_FIT` — Bina/tesisler yerleşim ihtiyacı, öğrenci yaş-gelişim durumu ve okul tür/programına uygun Bakanlık projeleri çerçevesinde planlanır.
47. `FACILITY_ACCESSIBILITY` — Bina, tesis ve bahçe engelli bireylerin erişilebilirlik gereklerine uygun düzenlenir.
48. `CLASSROOM_FIT_FOR_PURPOSE` — Derslik donanımı ders özelliği, öğrenci sayısı, yaş-gelişim ve özel durumlara göre düzenlenir.
49. `CLASSROOM_NO_OFFICE_CONVERSION` — Derslikler yönetim/hizmet odasına dönüştürülemez.
50. `WORKSHOP_LAB_ESTABLISHMENT` — Alan/dal/ders özelliğine göre atölye ve laboratuvar kurulur ve eğitime hazır tutulur.
51. `WORKSHOP_LAB_ACCESSIBILITY` — Atölye/laboratuvar özel eğitim ihtiyacı olan öğrencilerin kullanımına uygun düzenlenir.
52. `WORKSHOP_LAB_EQUIPMENT_LIST` — Gerekli araç-gereç/donanım Bakanlıkça belirlenen listeye göre tutulur.
53. `SERVICE_ROOMS_STANDARD` — Yönetici, öğretmen, rehberlik, memur ve diğer personel için hizmete uygun standart odalar ayrılır.
54. `PRAYER_SPACE` — Okulda ibadet ihtiyacı için doğal aydınlatmalı uygun mekân ayrılır.
55. `LIBRARY_LEGAL_OPERATION` — Kütüphane ilgili okul kütüphaneleri mevzuatına göre düzenlenir ve işletilir.
56. `SPORT_FACILITY_READY` — Spor alanı/tesisi/çok amaçlı salon kullanıma hazır tutulur.
57. `SPORT_MULTI_USE` — Spor alanları farklı spor etkinliklerine uygun planlanır.
58. `SPORT_SAFETY_NOTICE` — Spor tesisi kullanım açıklamaları görünür yerde tutulur ve güvenlik önlemleri alınır.
59. `SPORT_COMMUNITY_USE` — İmkân ölçüsünde diğer okullar ve çevrenin spor tesislerinden yararlanması sağlanabilir.
60. `ART_MUSIC_ROOM_RESOURCES` — Görsel sanatlar/müzik odalarında ilgili kitap, araç, gereç, doküman ve malzeme bulundurulur.
61. `SUPPORT_ED_ROOM` — Tam zamanlı kaynaştırma ve özel yetenekli öğrenciler için mevzuata uygun destek eğitim odası açılır.
62. `DORM_INFIRMARY_REQUIRED` — Yatılı/pansiyonlu okulda pansiyonun uygun bölümünde revir düzenlenir.
63. `NON_DORM_FIRST_AID_CABINET` — Diğer okullarda yönetim kontrolünde acil durum ecza dolabı oluşturulur.
64. `CANTEEN_OAB_LEGAL_FLOW` — Kantin kurulması, işletilmesi ve denetimi Okul-Aile Birliği mevzuatına göre yürütülür.
65. `PUBLIC_HOUSING_LEGAL_FLOW` — Kamu konutları ilgili kamu konutları mevzuatına göre yönetilir.

### D. Kurul/komisyon/ekip omurgası — Md.107-120
66. `BOARD_COMMISSION_TEAM_PURPOSE` — Kurul/komisyon/ekipler eğitim-yönetim verimliliği, çevre işbirliği, kurumlar arası işbirliği ve çocuk hakları amaçlarıyla oluşturulur.
67. `MANDATORY_BOARD_SET` — Öğretmenler kurulu, sınıf/şube kurulu, zümre, zümre başkanları, öğrenci meclisi, ödül-disiplin, onur ve sosyal etkinlik kurulları kurulur.
68. `OPTIONAL_BOARD_SET` — İhtiyaca göre bilim, danışma, sanat, proje vb. kurullar oluşturulabilir.
69. `TEACHERS_BOARD_COMPOSITION` — Öğretmenler kurulu müdür başkanlığında yönetici, öğretmen, uzman ve eğitici personelden oluşur.
70. `TEACHERS_BOARD_EXTERNAL_INVITE` — Gündeme göre sektör temsilcisi, usta öğretici, proje personeli, teknisyen, İSG uzmanı, öğrenci/pansiyon temsilcisi ve OAB başkanı çağrılabilir.
71. `TEACHERS_BOARD_FIRST_TERM_WINDOW` — Olağan öğretmenler kurulu Eylül ayının ilk 3 işgünü içinde yapılır.
72. `TEACHERS_BOARD_SECOND_TERM_WINDOW` — İkinci dönem kurul toplantısı ilk haftanın ilk 2 işgünü içinde yapılır.
73. `TEACHERS_BOARD_YEAR_END_WINDOW` — Ders yılı bitimini takip eden haftanın ilk 2 işgünü içinde yıl sonu toplantısı yapılır.
74. `TEACHERS_BOARD_NOTICE_5_DAYS` — Zorunlu durum dışında toplantı tarihi, yeri ve gündemi en az 5 gün önce duyurulur.
75. `TEACHERS_BOARD_EKURUL_AGENDA` — Gündem toplantı öncesi e-Kurul ve Zümre Modülü üzerinden duyurulur.
76. `TEACHERS_BOARD_EXTRA_MEETING` — Müdürün gerekli görmesi veya üyelerin salt çoğunluğunun yazılı istemiyle ek toplantı yapılabilir.
77. `TEACHERS_BOARD_OUTSIDE_CLASS_HOURS` — Kurul toplantıları esas olarak ders saatleri dışında yapılır.
78. `TEACHERS_BOARD_CLASS_HOURS_APPROVAL` — Zorunlu hâlde müdür önerisi ve il/ilçe MEM onayıyla ders saatlerinde yapılabilir; öğrenciler izinli sayılır.
79. `TEACHERS_BOARD_MAJORITY_DECISION` — Kararlar oy çokluğuyla alınır; eşitlikte başkanın katıldığı görüş kabul edilir.
80. `TEACHERS_BOARD_DECISION_PUBLISH` — Gündem/kararlar e-Kurul/Zümre Modülüne işlenir ve müdür onayı sonrası uygulanır.
81. `TEACHERS_BOARD_MINUTES_SIGN_ARCHIVE` — Tutanak ilgili personelce imzalanır ve kurum yönetimince saklanır.
82. `TEACHERS_BOARD_LEGAL_CHANGE_AGENDA` — Bakanlık emirleri, mevzuat değişiklikleri, MEBBİS/e-Okul/e-Pansiyon gündeme alınır.
83. `TEACHERS_BOARD_SUCCESS_ATTENDANCE_DISCIPLINE` — Başarı, devam-devamsızlık, ödül-disiplin ve okul birinciliği görüşülür.
84. `TEACHERS_BOARD_BEP_GUIDANCE` — BEP, rehberlik ve öğrenci destek konuları kurul gündeminde değerlendirilir.
85. `TEACHERS_BOARD_ISG` — İş sağlığı ve güvenliği kurul gündem maddelerindendir.
86. `TEACHERS_BOARD_AUDIT_GUIDANCE` — Denetim ve rehberlik çalışmaları kurul gündeminde değerlendirilir.
87. `SCHOOL_ZUMRE_PRESIDENT_BOARD_TERM` — Sınıf/alan zümre başkanları kurulu her eğitim-öğretim yılı için kendi başkanını seçer; zorunlu hâl dışında yıl içinde değiştirilmez.
88. `SCHOOL_ZUMRE_PRESIDENT_BOARD_NOTICE` — Toplantı gündemi e-Kurul/Zümre üzerinden duyurulur; zorunlu durum dışında tarih/yer/gündem en az 5 gün önce bildirilir.
89. `SCHOOL_ZUMRE_DECISION_APPROVAL` — Kararlar oy çokluğuyla alınır, e-Kurul/Zümreye işlenir ve müdür onayı sonrası uygulanır.
90. `SCHOOL_ZUMRE_MTAL_FINANCE_CAPACITY` — MTAL'lerde alan/bölüm gelir-gider ve hizmet/üretim kapasitesi ayrıca değerlendirilir.
91. `SCHOOL_ZUMRE_MTAL_MARKETING` — MTAL'lerde tanıtım, pazarlama, hizmet/ürün satışı ve sosyal etkinliklere katılım çalışmaları gündeme alınabilir.
92. `DISTRICT_ZUMRE_TERM` — İlçe zümre başkan/yedek başkanı Eylülden itibaren iki yıl için seçilir.
93. `DISTRICT_ZUMRE_CALENDAR` — İlçe zümreleri Eylül ikinci haftanın ilk 2 işgünü, ikinci dönem ikinci haftanın ilk 2 işgünü ve Haziran dördüncü haftanın ilk 2 işgününde toplanır.
94. `PROVINCE_ZUMRE_CALENDAR` — İl zümreleri Eylül ikinci haftanın son 3 işgünü, ikinci dönem ikinci haftanın son 3 işgünü ve Haziran dördüncü haftanın son 3 işgününde toplanır.
95. `SOCIAL_ACTIVITY_BOARD_REQUIRED` — Kulüp ve toplum hizmetlerini yürütmek üzere sosyal etkinlikler kurulu oluşturulur.
96. `COMMISSION_TEAM_REGISTRY` — Kontenjan, rehberlik, ihale, muayene-kabul, kalite kontrol komisyonları ile okul gelişim, sivil savunma ve İSG ekipleri ilgili mevzuata göre kurulur ve görev yapar.

## Sistem etkisi

- Bu 96 atom `WORKFLOW`, `BOARD`, `ROLE`, `FACILITY`, `OHS`, `DOCUMENT`, `NOTIFICATION` ve `ASSET` entity tiplerine bağlanmaya adaydır.
- Tarih/süre kuralları kod içine sabit gömülmek yerine sürümlü legal parameter olarak tutulmalıdır.
- Kurul toplantı takvimleri yıllık iş akışı takvimiyle instance üretmelidir.
- e-Kurul/e-Zümre kayıt zorunlulukları belge/kanıt adımı olarak modellenmelidir.
- Personel görevlendirmelerinde önce rol/yeterlilik, sonra kişi bağlanmalıdır.
- Tesis şartları kurum özelliği filtresinden (`pansiyon`, `kantin`, `spor_tesisi`, `atolye_lab`, `destek_egitim_odasi`) geçirilmelidir.
- Bu batchteki hükümler tüm ortaöğretim kurumlarını etkileyebilen genel kurallar içerir; MTAL/MESEM'e özgü alt akışlar yalnız ilgili school_type/feature filtresiyle etkinleşmelidir.

## QA / sayaç politikası

- Atomik kural sayısı: **96**
- `ARTICLE_VERIFIED` artışı: **0**
- Sebep: Güncel resmî hükümler doğrulandı ve atomize edildi; fakat 2.229 satırlık kalıcı master ile kesin `workflow_id` bağları bu oturumda mevcut değildir.
- Aynı madde/fıkra başka staging dosyasında family-level olarak bulunuyorsa bu kayıt yeni workflow doğrulaması sayılmaz; yalnız daha ayrıntılı kontrol atomu/cross-validation olarak tutulur.
