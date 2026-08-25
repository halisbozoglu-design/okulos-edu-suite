# Delegated Regulations Deepening — 100+ Batch v10

Status: STAGING / SUPERADMIN APPROVAL REQUIRED
Date: 2026-08-25
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Source/provenance policy
Every atom below preserves: `rule_code`, official source title, official/public authority URL, article/paragraph or section reference, scope, responsible role, trigger, time/deadline when explicit, evidence/output, impact level and source-status note. Annual/numeric values are parameters, not hardcoded timeless law. Historical snapshots remain immutable.

Primary delegation anchor:
- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf

Current/delegated sources used in this batch:
- MEB current legislation index (confirms current regulation titles/dates): https://www.meb.gov.tr/mevzuat/liste.php?ara=6
- Millî Eğitim Bakanlığı Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği, RG 14.08.2020/31213 (article map cross-checked against current consolidated text; MEB index is authority-presence check).
- Özel Eğitim Hizmetleri Yönetmeliği, RG 07.07.2018/30471; operational cross-check: MEB/RAM-hosted current consolidated copy, e.g. https://rizeram.meb.k12.tr/meb_iys_dosyalar/53/01/269836/dosyalar/2024_12/11104229_ozelegitimhizmetleriyonetmeligi.pdf
- Millî Eğitim Bakanlığı Taşıma Yoluyla Eğitime Erişim Yönetmeliği, RG 11.09.2014/29116; official MEB PDF: https://www.meb.gov.tr/meb_iys_dosyalar/2014_09/12024357_tasimayonetmeligi.pdf
- MEB Taşıma Yoluyla Eğitime Erişim Rehberlik ve Denetim Rehberi: https://tkb.meb.gov.tr/meb_iys_dosyalar/2023_11/13135701_tasimayoluylaegitimeerisimrehberlikvedenetimrehberi.pdf
- Devlet Arşiv Hizmetleri Hakkında Yönetmelik, RG 18.10.2019/30922: https://www.devletarsivleri.gov.tr/varliklar/dosyalar/mevzuat/arsivhizmetleri.pdf
- Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik, RG 10.06.2020/31151, Karar 2646; official-text mirror: https://www.aile.gov.tr/media/49629/resm%C3%AE-yazismalarda-uygulanacak-usul-ve-esaslar-hakkinda-yonetmelik.pdf
- Millî Eğitim Bakanlığı Eğitim Öğretim Çalışmalarının Planlı Yürütülmesine İlişkin Yönerge: https://mevzuat.meb.gov.tr/dosyalar/2237.pdf
- Özel Eğitim Hizmetleri Etik Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/2274.pdf

## A. Rehberlik ve psikolojik danışma — 44 atoms
Delegation: OÖKY Md.16; current RPD Yönetmeliği Md.14–25 and related program provisions.

1. `RPD_SERVICE_REQUIRED` — Md.15/1 — Eğitim kurumunda RPD servisi oluşturulur. Role: müdür. Evidence: servis tanımı. Impact L3.
2. `RPD_SERVICE_ACCESSIBLE_LOCATION` — Md.15/2-a — Servis öğrenci/veli/personelin kolay ulaşabileceği yerde olmalı. Evidence: mekân uygunluk kaydı. L2.
3. `RPD_SERVICE_PHYSICAL_CONDITIONS` — Md.15/2-b — Uygun fiziki koşul zorunlu. Evidence: kontrol listesi. L2.
4. `RPD_SERVICE_ICT_EQUIPMENT` — Md.15/2-c — Bilişim/iletişim ve büro araçları sağlanır. Role: müdürlük. L2.
5. `RPD_SERVICE_INDIVIDUAL_WORKSPACE` — Md.15/2-c — Bireysel çalışma için gerekli ortam/araç sağlanır. L3/privacy.
6. `RPD_SERVICE_GROUP_WORKSPACE` — Md.15/2-c — Grup çalışması için gerekli araç/ortam sağlanır. L2.
7. `RPD_SERVICE_EXCLUSIVE_USE` — Md.15/2-ç — Servis başka amaçla kullanılmaz. L3/privacy.
8. `RPD_COMMISSION_REQUIRED` — Md.16/1 — Kurum RPD yürütme komisyonu kurar. Evidence: kurul kararı. L3.
9. `RPD_COMMISSION_CHAIR_PRINCIPAL` — Md.16/2 — Başkan eğitim kurumu müdürüdür. L2.
10. `RPD_COMMISSION_DEPUTIES` — Md.16/2-a — Müdür yardımcıları üyedir. L2.
11. `RPD_COMMISSION_COUNSELORS` — Md.16/2-b — Rehber öğretmen/psikolojik danışmanlar üyedir. L2.
12. `RPD_COMMISSION_CLASS_LEVEL_REPS` — Md.16/2-c — Her sınıf düzeyinden en az bir sınıf rehber öğretmeni temsilcisi. L2.
13. `RPD_COMMISSION_DISCIPLINE_REP` — Md.16/2-d — Ortaöğretimde disiplin kurulu temsilcisi yer alır. L2.
14. `RPD_COMMISSION_HONOR_REP` — Md.16/2-d — Ortaöğretimde onur kurulu temsilcisi yer alır. L2.
15. `RPD_COMMISSION_PARENT_ASSOC_REP` — Md.16/2-e — Okul aile birliği temsilcisi yer alır. L2.
16. `RPD_COMMISSION_MINUTES` — Md.16/9 — Kararlar tutanaklaştırılır. Evidence: imzalı/dijital tutanak. L3/evidence.
17. `RPD_COMMISSION_WRITTEN_NOTICE` — Md.16/10 — Kararlar personele yazılı duyurulur. Evidence: tebliğ kaydı. L2.
18. `RPD_NO_COUNSELOR_RAM_COOP` — Md.16/11 — Rehber öğretmen yoksa hizmet RAM iş birliğiyle yürütülür. L3/routing.
19. `RPD_SPECIAL_TARGET_OPINION` — Md.17/1-a — Kurum özel hedefleri için komisyon görüş verir. L2.
20. `RPD_PROGRAM_REVIEW` — Md.17/1-b — Okul RPD programı komisyonca incelenir. Evidence: görüş. L2.
21. `RPD_PROGRAM_IMPLEMENT_MEASURES` — Md.17/1-b — Program için gerekli tedbirler karara bağlanır. L2.
22. `RPD_SERVICE_MONITOR_EVALUATE` — Md.17/1-c — Çalışmalar incelenir/değerlendirilir. L2.
23. `RPD_PROBLEM_REMEDIATION` — Md.17/1-c — Ortaya çıkan sorunlar için önlem belirlenir. L2.
24. `RPD_COMMUNICATION_PLAN` — Md.17/1-ç — Öğrenci-aile-idare-öğretmen iletişim çalışmaları planlanır. L2.
25. `RPD_EXTERNAL_COOP_PLAN` — Md.17/1-d — İlgili kurum/kuruluşlarla iş birliği faaliyetleri planlanır. L2.
26. `RPD_SOCIOEMOTIONAL_OPINION` — Md.17/1-e — Sosyal-duygusal gelişim çalışmaları için görüş verilir. L2.
27. `RPD_ACADEMIC_OPINION` — Md.17/1-e — Akademik gelişim çalışmaları için görüş verilir. L2.
28. `RPD_CAREER_OPINION` — Md.17/1-e — Kariyer gelişimi çalışmaları için görüş verilir. L2.
29. `RPD_PSYCHOSOCIAL_PROGRAM_LINK` — Md.17/1-f — Psikososyal destek programla ilişkilendirilir. L2.
30. `RPD_PSYCHOSOCIAL_DUTY` — Md.17/1-g — İhtiyaç halinde psikososyal destek görevleri yürütülür. L2.
31. `RPD_PROGRAM_TEACHERS_BOARD_INFO` — Md.20 cross-ref — Çalışmalar öğretmenler kuruluna raporlanır. Evidence: kurul bilgi notu. L2.
32. `RPD_AGENDA_AND_DECISIONS_WRITTEN` — Md.20 — Komisyon gündem ve kararları yazılı hale getirilir. L3/evidence.
33. `RPD_PROGRAM_EREHBERLIK` — Md.20 — Okul programı e-Rehberlik üzerinden hazırlanır. L2/system.
34. `RPD_PROGRAM_PRINCIPAL_APPROVAL` — Md.20 — Program müdür onayına sunulur. L3/approval.
35. `RPD_COUNSELOR_THREE_SERVICE_DOMAINS` — Md.21/1 — Gelişimsel-önleyici, iyileştirici ve destek hizmetleri ayrıştırılır. L2/model.
36. `RPD_CLASS_GUIDANCE_SPECIALIST_ACTIVITY` — Md.21/2-a — Özel bilgi/beceri gerektiren sınıf rehberlik etkinliklerini rehber öğretmen uygular. L3/role.
37. `RPD_INDIVIDUAL_RECOGNITION_TECHNIQUE` — Md.21/2-b — Bireyi tanıma teknikleri uygulanabilir. L2.
38. `RPD_INDIVIDUAL_RECOGNITION_REPORT` — Md.21/2-b — Değerlendirme raporlaştırılır. L3/data.
39. `RPD_STUDENT_FEEDBACK` — Md.21/2-b — Öğrenciye geribildirim verilir. L2.
40. `RPD_INTERESTED_PARTY_SHARE_CONTROLLED` — Md.21/2-b + confidentiality rules — İlgili paylaşım yetki/gizlilik kontrolüyle yapılır. L3/privacy.
41. `RPD_OTHER_TEACHER_SUPPORT` — Md.24/1 — Sınıf rehberliği olmayan öğretmen gerektiğinde destek verir. L2.
42. `RPD_OTHER_TEACHER_COLLABORATION` — Md.24/2 — Öğretmen servisle iş birliği yapar. L2.
43. `RPD_STUDENT_REFERRAL` — Md.24/3 — Destek ihtiyacı fark edilen öğrenci servise yönlendirilir; servis yoksa RAM'a yönlendirilir. L3/routing.
44. `RPD_WEEKLY_30_HOURS` — Md.25/1 — RPD personeli için bir iş saati 60 dk, haftalık 30 iş saati. L1/time-parameter.

## B. Özel eğitim / BEP / kaynaştırma — 30 atoms
Delegation: OÖKY Md.10/f; current Özel Eğitim Hizmetleri Yönetmeliği Md.22–24, 47–48. Current title/date confirmed by MEB legislation index. Exact operational cross-check from current MEB/RAM-hosted consolidated copy.

45. `SPED_INCLUSION_REQUIRES_EVALUATION_REPORT` — Md.22 — Kaynaştırma/bütünleştirme için özel eğitim değerlendirme kurulu raporu esas alınır. L3/eligibility.
46. `SPED_FULL_TIME_INCLUSION` — Md.22–23 — Tam zamanlı kaynaştırma modeli desteklenir. L2/program.
47. `SPED_PART_TIME_INCLUSION` — Md.22 — Yarı zamanlı model ayrı statüdür. L2/program.
48. `SPED_BEP_MANDATORY` — Md.23/1-a + OÖKY Md.10/f — Öğrenci programı temel alınarak BEP hazırlanır. L3/block.
49. `SPED_FOLLOW_HOME_SCHOOL_PROGRAM` — Md.23/1-a — Öğrenci kayıtlı okulun programını takip eder. L3/program.
50. `SPED_SAME_DIPLOMA` — Md.23/1-b — Ortaöğretimi tamamlayan tam zamanlı kaynaştırma öğrencisine akranlarına verilen diploma düzenlenir. L3/document.
51. `SPED_ENVIRONMENT_ADAPTATION` — Md.23/1-c — Okulda uygun ortam düzenlemeleri yapılır. L3/accommodation.
52. `SPED_SUPPORT_ROOM_OPEN` — Md.23/1-c — Destek eğitim odası açılması gereği workflow'a bağlanır. L3/facility.
53. `SPED_MAX_TWO_PER_BRANCH` — Md.23/1-ç — Kaynaştırma öğrencileri şubelere eşit dağıtılır ve her şubede 2'yi geçmez. L3/capacity.
54. `SPED_DEVELOPMENT_FEATURE_PLACEMENT` — Md.23/1-ç — Yerleştirmede gelişim özellikleri dikkate alınır. L3/placement.
55. `SPED_ASSESSMENT_SPECIAL_RULE_LINK` — Md.24 — Başarı değerlendirmesi özel eğitim hükümleriyle bağlantılı tutulur; OÖKY Md.10/f'deki sınıf geçme/sınav ilişkisi ayrıca korunur. L3/assessment.
56. `SPED_BEP_UNIT_REQUIRED` — Md.47/1 — Okulda BEP geliştirme birimi oluşturulur. L3/governance.
57. `SPED_BEP_UNIT_CHAIR` — Md.47/2 — Müdür veya görevlendirdiği müdür yardımcısı başkan. L2.
58. `SPED_BEP_UNIT_COUNSELOR` — Md.47/2-a — Rehberlik öğretmeni üye. L2.
59. `SPED_BEP_UNIT_CLASS_TEACHER` — Md.47/2-b — Sınıf öğretmeni üye. L2.
60. `SPED_BEP_UNIT_FIELD_TEACHERS` — Md.47/2-c — Öğrencinin dersini okutan alan öğretmenleri üye. L2.
61. `SPED_BEP_UNIT_PARENT` — Md.47/2-ç — Veli üyedir. L2/participation.
62. `SPED_BEP_UNIT_STUDENT` — Md.47/2-d — Öğrenci birim üyesidir. L2/participation.
63. `SPED_BEP_UNIT_EVALUATION_MEMBER_OPTIONAL` — Md.47/3 — Gerektiğinde özel eğitim değerlendirme kurulundan üye görüş için katılır. L2.
64. `SPED_VOCATIONAL_FIELD_TEACHER` — Md.47/4 — Mesleki eğitim veren özel eğitim okullarında meslek alan öğretmeni katılır. L2.
65. `SPED_BEP_UNIT_WORKING_RULES` — Md.47/5 — Birim çalışma usul/esaslarını okul yönetimi belirler. L2.
66. `SPED_BEP_COORDINATE_PREPARATION` — Md.48/1-a — BEP hazırlama koordinasyonu. L2.
67. `SPED_BEP_COORDINATE_IMPLEMENTATION` — Md.48/1-a — BEP uygulama koordinasyonu. L2.
68. `SPED_BEP_MONITOR` — Md.48/1-a — BEP izleme koordinasyonu. L2.
69. `SPED_BEP_EVALUATE` — Md.48/1-a — BEP değerlendirme koordinasyonu. L2.
70. `SPED_PRIVACY_ETHICAL_BASE` — Özel Eğitim Hizmetleri Etik Yönergesi Md.1–4 — özel eğitim verilerinde etik/gizlilik kaynağı ilişkilendirilir. L3/privacy.
71. `SPED_KVKK_ETHICS_LINK` — Etik Yönerge Md.3 — 6698 sayılı Kanun dayanağı provenance olarak tutulur. L3/data.
72. `SPED_CHILD_PROTECTION_ETHICS_LINK` — Etik Yönerge Md.3 — 5395 sayılı Çocuk Koruma Kanunu ilişkisi tutulur. L3/safeguarding.
73. `SPED_OHS_ETHICS_LINK` — Etik Yönerge Md.3 — 6331 sayılı İSG Kanunu ilişkisi tutulur. L3/safety.
74. `SPED_MESLEKI_EDUCATION_LINK` — Etik Yönerge Md.3 — 3308 sayılı Mesleki Eğitim Kanunu ilişkisi korunur. L2/legal-link.

## C. Taşımalı eğitim — 18 atoms
Source: MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği + MEB Teftiş Kurulu rehberlik/denetim rehberi. This is legal/compliance workflow only; no GPS/mobile app implementation in this repo.

75. `TRANSPORT_EDUCATION_ACCESS_SCOPE` — Yönetmelik Md.1–2 — Taşıma, eğitim hakkına erişim amacıyla uygulanır. L2/scope.
76. `TRANSPORT_ELIGIBLE_SCHOOL_LEVELS` — Md.1 — İlköğretim/ortaöğretim/özel eğitim erişimi kapsamı ayrı özellik filtresi. L2/filter.
77. `TRANSPORT_SPECIAL_ED_COURSIER_SCOPE` — Md.1 — Yaygın eğitimde özel eğitim kursiyeri kapsamı ayrı tutulur. L2/filter.
78. `TRANSPORT_PLAN_COMMISSION_REQUIRED` — Yönetmelik Md.8 ilişkisi — Planlama komisyonu kararı gerektiren durumlar workflow'a bağlanır. L3/approval.
79. `TRANSPORT_DISTANCE_MIN_2KM_BASE` — TKB rehberi kontrol 19, Yönetmelik Md.8/2 — Yerleşim-taşıma merkezi uzaklığında 2 km taban esas. L1/parameter.
80. `TRANSPORT_DISTANCE_MAX_50KM_BASE` — aynı kaynak — Normalde 50 km'den fazla taşıma yapılmaz. L3/eligibility.
81. `TRANSPORT_DISTANCE_EXCEPTION_COMMISSION` — Md.8/2 — Mesafe artırma/azaltma komisyon kararına bağlanır. L3/approval.
82. `TRANSPORT_BOARDING_TO_TRANSPORT_MIN_ONE_YEAR` — TKB rehberi kontrol 20, Md.8/3 — En az bir ders yılı parasız yatılı okuyan ortaöğretim öğrencisi geçişte değerlendirilebilir. L3/eligibility.
83. `TRANSPORT_BOARDING_TO_TRANSPORT_PARENT_APPLICATION` — Md.8/3 — Başvuru veli tarafından yapılır. L2/role.
84. `TRANSPORT_BOARDING_TO_TRANSPORT_SCHOOL_RECIPIENT` — Md.8/3 — Başvuru öğrencinin parasız yatılı okuduğu okul müdürlüğüne yapılır. L2/routing.
85. `TRANSPORT_BOARDING_TO_TRANSPORT_DEADLINE` — Md.8/3 — Ders bitiminden haziran sonuna kadar. L1/annual-deadline.
86. `TRANSPORT_BOARDING_COMMISSION_OPINION` — Md.8/3 — Yatılılık/bursluluk komisyonu görüşü alınır. L3/approval.
87. `TRANSPORT_PLAN_COMMISSION_FINAL_EVAL` — Md.8/3 — Planlama komisyonu değerlendirir. L3/decision.
88. `TRANSPORT_INSPECTION_GUIDE_SOURCE` — TKB rehberi — Denetim kanıt listesi kaynak-snapshot'a bağlanır. L2/audit.
89. `TRANSPORT_OPERATIONAL_NO_GPS_SCOPE` — repo boundary — Bu batch yalnız mevzuat, rol, belge ve denetim workflow'u üretir; GPS/servis mobil kodu bu repo işinin parçası değildir. Architecture guard.
90. `TRANSPORT_CURRENT_RULE_VERSIONING` — Yönetmelik değişiklikleri yıllık/tarihli legal version olarak izlenir. L2/legal-version.
91. `TRANSPORT_EXCEPTION_EVIDENCE` — Komisyon istisna kararı karar tutanağı/ekleri olmadan tamamlanamaz. L3/evidence.
92. `TRANSPORT_ELIGIBILITY_SNAPSHOT` — Öğrenciye uygulanan mesafe/statü/yatılılık koşulları karar anında legal_snapshot ile dondurulur. L3/history.

## D. Devlet arşiv hizmetleri — 20 atoms
Source: Devlet Arşiv Hizmetleri Hakkında Yönetmelik, especially Md.5 and Md.9; source URL above.

93. `ARCHIVE_PROTECT_FIRE` — Md.5/1-a — Belgeler yangına karşı korunur. L3/safety.
94. `ARCHIVE_PROTECT_THEFT` — Md.5/1-a — Hırsızlığa karşı korunur. L3.
95. `ARCHIVE_PROTECT_HUMIDITY` — Md.5/1-a — Rutubete karşı korunur. L3.
96. `ARCHIVE_PROTECT_TEMPERATURE` — Md.5/1-a — Uygunsuz sıcaklığa karşı korunur. L3.
97. `ARCHIVE_PROTECT_FLOOD` — Md.5/1-a — Su baskınına karşı korunur. L3.
98. `ARCHIVE_PROTECT_DUST` — Md.5/1-a — Toza karşı korunur. L2.
99. `ARCHIVE_PROTECT_PESTS` — Md.5/1-a — Hayvan/haşerat tahribatına karşı korunur. L2.
100. `ARCHIVE_PRESERVE_ORIGINAL_ORDER` — Md.5/1-a — Belgeler asli düzenleri içinde muhafaza edilir. L3/records.
101. `EARCHIVE_CYBER_SECURITY` — Md.5/1-b — Elektronik belgeler siber saldırıya karşı korunur. L3/security.
102. `EARCHIVE_DISASTER_SECURITY` — Md.5/1-b — Elektronik belgeler afet risklerine karşı korunur. L3.
103. `EARCHIVE_HW_SW_RISK` — Md.5/1-b — Yazılım/donanım kaynaklı kayıp riski yönetilir. L3.
104. `EARCHIVE_DISASTER_RECOVERY_PLAN` — Md.5/1-b — Felaket kurtarma planı yapılır/yürütülür. L3.
105. `EARCHIVE_BACKUP_UNITS` — Md.5/1-b — Yedekleme üniteleri tesis edilir. L3.
106. `ARCHIVE_CENTRAL_ARCHIVE` — Md.9/1 — Taşra/bölge/yurt dışı teşkilatında merkezi arşiv modeli uygulanır. L2/structure.
107. `ARCHIVE_UNIT_ARCHIVE_OPTIONAL` — Md.9/2 — İhtiyaç halinde birim arşivi oluşturulabilir. L1/capability.
108. `ARCHIVE_STORAGE_STANDARD` — Md.9/3 — Arşiv mekân standardı güncel standart referansıyla tutulur; eski TS numarası tarihsel snapshot olarak kalır. L2/reference-version.
109. `ARCHIVE_RETENTION_PLAN` — Md.9/4 — Saklama/bekletme süreleri saklama planına göre uygulanır. L3/retention.
110. `EARCHIVE_ACCESSIBLE_FORMAT` — Md.9/5 — Elektronik bilgi/belge erişilebilir tutulur. L3.
111. `EARCHIVE_RETAINABLE_FORMAT` — Md.9/5 — Saklanabilir format/ortam zorunluluğu. L3.
112. `EARCHIVE_DISPOSABLE_CONTROL` — Md.9/5 — Tasfiye edilebilirlik planlanır. L3.

## E. Resmî yazışma ve belge yaşam döngüsü — 16 atoms
Source: Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik, RG 10.06.2020/31151; OÖKY Md.224 electronic-document/archive delegation.

113. `OFFICIAL_CORRESPONDENCE_ELECTRONIC` — Yönetmelik Md.1 — Güvenli elektronik imzalı resmî yazışma desteklenir. L3/document.
114. `OFFICIAL_CORRESPONDENCE_PHYSICAL` — Md.1 — Fiziksel ortam/el yazısı imzalı resmî yazışma ayrı kanal olarak tutulur. L3/document.
115. `OFFICIAL_CORRESPONDENCE_FAST_SECURE_EXCHANGE` — Md.1 — Bilgi/belge alışverişinde hız ve güvenlik ilkesi. L2.
116. `OFFICIAL_CORRESPONDENCE_UNIFORMITY` — Md.1 — Uygulama birliği esastır. L2.
117. `MEB_CORRESPONDENCE_CURRENT_RULE_ONLY` — MEB imza/yetki düzenlemeleri güncel 2020 yönetmeliğine referans vermelidir; 2014/7074 tarihsel kaynak aktif karar kaynağı değildir. L3/legal-source-block.
118. `OFFICIAL_DOCUMENT_SOURCE_VERSION` — Her resmî yazı, üretildiği tarihte geçerli yazışma standardının legal_version kaydına bağlanır. L3/history.
119. `OFFICIAL_DOCUMENT_SIGN_CHANNEL` — Güvenli e-imza / fiziksel imza kanalı belge metadata'sında ayrılır. L2.
120. `OFFICIAL_DOCUMENT_APPROVER` — Yetkili imzacı/vekâlet durumu karar anı snapshot'ında tutulur. L3/audit.
121. `OFFICIAL_DOCUMENT_PARAPH_CHAIN` — Kurumsal paraf/imza zinciri belge workflow'una bağlanır; yetki devri metadata'sı ayrı tutulur. L3/audit.
122. `OFFICIAL_DOCUMENT_EVIDENCE_IMMUTABLE` — Tamamlanmış/tebliğ edilmiş belgenin tarihsel sürümü değiştirilemez; yeni sürüm yeni kayıt olur. L3/history.
123. `OFFICIAL_DOCUMENT_ARCHIVE_LINK` — Yazışma tamamlanınca arşiv/saklama sınıfı atanır. L3/records.
124. `OFFICIAL_DOCUMENT_EARCHIVE_FALLBACK` — OÖKY Md.224: elektronik arşivlenemeyen evrak için çıktı/onay/usulüne uygun saklama fallback'i korunur. L3.
125. `OFFICIAL_DOCUMENT_PROVENANCE_REQUIRED` — Belge şablonu kuralı, kaynak mevzuat + madde + URL olmadan ACTIVE olamaz. L3/legal.
126. `OFFICIAL_DOCUMENT_STAGING_APPROVAL` — Mevzuat değişikliği belge şablonunu doğrudan mutasyona uğratmaz; staging → impact → Super Admin → future/pending. L3/change-control.
127. `OFFICIAL_DOCUMENT_HISTORICAL_SNAPSHOT` — Eski mevzuata göre tamamlanmış resmî yazılar historical legal_snapshot ile korunur. L3/history.
128. `OFFICIAL_DOCUMENT_ARCHIVE_RETENTION_SOURCE` — Saklama süresi yazışma yönetmeliğinden uydurulmaz; Devlet Arşivleri/saklama planı kaynağından çözülür. L3/source-resolution.

## F. Cross-family orchestration — 12 atoms
129. `RPD_SPED_PRIVACY_BRIDGE` — RPD danışan bilgisi + özel eğitim verisi için en sıkı geçerli gizlilik/erişim politikası uygulanır. L3/privacy.
130. `RPD_SPED_BEP_BRIDGE` — BEP hedefleri rehberlik verileriyle ilişkilendirilebilir ancak tanı/özel veri yetkisiz rollere açılmaz. L3/privacy.
131. `SPED_TRANSPORT_ELIGIBILITY_BRIDGE` — Özel eğitim statüsü taşıma uygunluk kontrolüne yalnız gerekli veri minimizasyonuyla aktarılır. L3/privacy.
132. `BOARDING_TRANSPORT_EXCLUSIVE_STATE_CHECK` — Parasız yatılılıktan taşıma kapsamına geçişte statü çakışması kontrol edilir. L3/eligibility.
133. `RPD_RECORD_ARCHIVE_CLASSIFICATION` — Danışan dosyası ile genel okul evrakı aynı erişim sınıfında saklanmaz. L3/privacy.
134. `SPED_RECORD_ARCHIVE_CLASSIFICATION` — BEP/özel eğitim belgeleri rol tabanlı özel kayıt sınıfıdır. L3/privacy.
135. `COMMISSION_MINUTES_ARCHIVE_LINK` — RPD/BEP/taşıma komisyon tutanakları ilgili workflow ve arşiv kaydına çift yönlü bağlanır. L3/evidence.
136. `LEGAL_SOURCE_ACTIVE_STATUS_CHECK` — Mülga kaynak tespit edilirse yeni karar üretimi engellenir; tarihsel kayıtta tutulabilir. L3/legal-source-block.
137. `LEGAL_SOURCE_OFFICIAL_URL_REQUIRED` — ACTIVE legal rule için resmî kurum URL'si zorunlu; yardımcı konsolide metin yalnız cross-check olabilir. L3/source-quality.
138. `LEGAL_PARAGRAPH_REQUIRED_BEFORE_PUBLISH` — Staging atom ACTIVE olmadan önce exact article/paragraph doğrulaması gerekir. L3/publication.
139. `NO_MASTER_COUNTER_WITHOUT_WORKFLOW_BINDING` — 2,229 master içinde exact workflow_id eşlemesi yoksa ARTICLE_VERIFIED artmaz. L3/QA.
140. `NO_SCHEMA_MIGRATION_FOR_METADATA_ONLY` — Bu batch mevcut legal/staging metadata modeliyle temsil edilebildiği için migration açılmaz. Architecture/minimal-token.

## Batch totals
- atomized_rule_count: 140
- new_source_atom_count: 140
- crossvalidated_atom_count: 0 (cross-family bridges are new orchestration atoms, not duplicate source claims)
- migration_count: 0
- article_verified_increment: 0

## Publication rule
All rules remain STAGING until exact current-source article/paragraph review is complete and Super Admin approves. Apply only to future/pending workflows. Completed tasks, issued documents, historical RPD/BEP/transport/boarding decisions and archived correspondence remain immutable under their legal_snapshot.