# OÖKY Gap-Scan — Temel Eğitim/Program/Takvim/Sosyal Süreçler — 50+ Batch V7

## Kaynak ve kapsam
- Birincil kaynak: MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği, güncel metin: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- Bu batch önceki staging ailelerinde kaynak-madde düzeyinde temsil edilmeyen **Md.5–20** hükümlerine odaklanır.
- Amaç: hükümleri doğrudan çalışma motorunda kullanılabilecek atomik kontrol/iş akışı kurallarına ayırmak; legacy `workflow_id` uydurmamak.
- Durum: `STAGING_SUPERADMIN_APPROVAL`; geçmiş kayıtlar immutable, değişiklikler yalnız future/pending akışlara uygulanır.

## Atomik kurallar — 90 adet

### Md.5–7 — Kurumsal ilkeler ve amaçlar
1. `OOKY_005_01` — Ortaöğretim işleyişi Türk millî eğitiminin genel/özel amaç ve temel ilkeleriyle uyumlu olmalı.
2. `OOKY_005_02` — Kurumsal işleyiş evrensel hukukla uyum kontrolünden geçmeli.
3. `OOKY_005_03` — Demokrasi ve insan hakları uyumu kurumsal ilke olarak izlenmeli.
4. `OOKY_005_04` — Öğrenci merkezli eğitim yaklaşımı kurumsal planlarda esas alınmalı.
5. `OOKY_005_05` — Aktif öğrenme ve demokratik kurum kültürü kurumsal kalite göstergelerinde yer almalı.
6. `OOKY_006_01` — Ortaöğretim kurumları dört yıllık, yatılı ve/veya gündüzlü yapı olarak sınıflandırılmalı.
7. `OOKY_006_02` — Kurum türü fen/sosyal bilimler/Anadolu/güzel sanatlar/spor/AIHL/MTAL/ÇPAL/özel eğitim meslek/MESEM kataloglarıyla eşlenmeli.
8. `OOKY_006_03` — Sosyal bilimler liselerinde hazırlık sınıfı zorunlu özellik olarak tutulmalı.
9. `OOKY_006_04` — Diğer kurumlarda hazırlık sınıfı yalnız Bakanlık uygunluğu varsa etkinleştirilmeli.
10. `OOKY_006_05` — Okul açma/kapatma/ad verme süreçleri Bakanlığın ayrıca belirlediği usule delege edilmeli.
11. `OOKY_007_01` — Öğrenci gelişimi bedensel, zihinsel, ahlaki, manevi, sosyal ve kültürel boyutlarla izlenmeli.
12. `OOKY_007_02` — Genel kültür, yükseköğretim, meslek, hayat ve iş alanına hazırlık hedefleri okul planına bağlanmalı.
13. `OOKY_007_03` — Eğitim–istihdam ilişkisi Bakanlık politika/ilkeleriyle uyumlu yürütülmeli.
14. `OOKY_007_04` — Öz güven, öz denetim ve sorumluluk gelişimi öğrenci gelişim hedefleri arasında bulunmalı.
15. `OOKY_007_05` — Çalışma ve dayanışma alışkanlığı öğrenci gelişim çıktısı olarak izlenebilmeli.
16. `OOKY_007_06` — Yabancı dil yeterliği dünyadaki gelişmeleri izleyebilecek düzey hedefiyle ilişkilendirilmeli.
17. `OOKY_007_07` — Proje geliştirme ve bilgi üretme becerisi eğitim hedefi olarak tanımlanmalı.
18. `OOKY_007_08` — Teknoloji kullanımı nitelikli eğitim hedefiyle ilişkilendirilmeli.
19. `OOKY_007_09` — Hayat boyu öğrenme bilinci okul programlarında hedef olarak bulunmalı.
20. `OOKY_007_10` — Eğitim/üretim/hizmet faaliyetlerinde uluslararası standart ve belgelendirme teşvik edilmeli.
21. `OOKY_007_11` — MTAL/MESEM programları ulusal/uluslararası standart, sınıflama, ulusal yeterlik ve mevzuat referanslarıyla ilişkilendirilmeli.
22. `OOKY_007_12` — MTAL/MESEM programları işgücü piyasasının nitelik ihtiyacına göre güncellenebilir olmalı.
23. `OOKY_007_13` — Girişimcilik, meslek ahlakı, İSG, sosyal/çevresel sorumluluk ve iş alışkanlığı mesleki program çıktılarına bağlanmalı.
24. `OOKY_007_14` — Önceki öğrenmenin tanınması, denklik ve belgelendirme ayrı süreç ailesi olarak ilişkilendirilmeli.

### Md.8–9 — Eğitim etkinliği, süre ve işletme çalışma zamanı
25. `OOKY_008_01` — Eğitim etkinlikleri uygulanan program türü ve içeriğine uygun yürütülmeli.
26. `OOKY_008_02` — Etkinlik mekânı okul/işletme/program niteliğine göre seçilmeli.
27. `OOKY_008_03` — Yabancı dil, Kur’an-ı Kerim ve meslek derslerinde grup oluştururken öğrenci seviyesi dikkate alınmalı.
28. `OOKY_008_04` — Özel eğitim ihtiyacı olan öğrencilerde bireysel farklılık/yeterlik/ilgi/istek/yetenek/gelişim özellikleri planlamaya girdi olmalı.
29. `OOKY_008_05` — Öğrenci bireysel/grup alan uygulamaları öğretmen gözetiminde yürütülmeli.
30. `OOKY_008_06` — Spor salonu/saha, müzik odası, atölye, laboratuvar, kütüphane ve konferans alanlarının öğrenci kullanımına açılması için yönetim tedbir almalı.
31. `OOKY_008_07` — Okul içi uygulama ve etkinlik türleri zümre önerisi üzerine okul yönetimi kararıyla belirlenmeli.
32. `OOKY_008_08` — Destekleme ve yetiştirme kursu açılışı Bakanlık usul/esaslarına bağlı olmalı.
33. `OOKY_009_01` — Normal ders saati 40 dakika parametresi olarak tutulmalı.
34. `OOKY_009_02` — Ders başlangıç/bitiş ve öğle arası süreleri il çalışma takvimine bağlı planlanmalı.
35. `OOKY_009_03` — Zaman çizelgesi komisyonu müdür + okul zümre başkanları + öğrenci temsilcisinden oluşmalı.
36. `OOKY_009_04` — Zaman çizelgesi belirlenirken program, çevre ve ulaşım şartları dikkate alınmalı.
37. `OOKY_009_05` — Normal öğretimde ders arası en az 10 dakika olmalı.
38. `OOKY_009_06` — Normal öğretimde öğle arası en az 45 dakika olmalı.
39. `OOKY_009_07` — İkili öğretimde bu alt süreler için özel istisna uygulanabilmeli.
40. `OOKY_009_08` — Blok ders yalnız zümre önerisi + müdür onayıyla uygulanmalı.
41. `OOKY_009_09` — Bir blok ders en fazla iki ders saatiyle sınırlı olmalı.
42. `OOKY_009_10` — MTAL atölye/laboratuvar mesleki alan uygulama dersi 40 dakika üzerinden hesaplanmalı.
43. `OOKY_009_11` — İşletmede mesleki eğitim dersi 60 dakika üzerinden hesaplanmalı.
44. `OOKY_009_12` — Okul veya işletmede staj 60 dakika üzerinden hesaplanmalı.
45. `OOKY_009_13` — İşletmede mesleki eğitimin gündüz yapılması varsayılan kural olmalı.
46. `OOKY_009_14` — Sanayi dışı sektörlerde gece eğitimi için sektör/program/iklim/mevsimsellik + kurul kararı şartı aranmalı.
47. `OOKY_009_15` — İzin verilen gece mesleki eğitiminde günlük süre 8 saati aşmamalı.
48. `OOKY_009_16` — İzin verilen gece mesleki eğitimi saat 22:00’yi geçmemeli.
49. `OOKY_009_17` — Yoğunlaştırılmış işletme eğitiminde haftada 6 gün planlama yalnız veli veya reşit öğrenci isteğiyle yapılabilmeli.
50. `OOKY_009_18` — Haftada 6 gün planlama yasal haftalık azami çalışma süresini aşmamalı.

### Md.10 — Program, BEP ve mesleki standartlar
51. `OOKY_010_01` — Ortak, alan/dal ve seçmeli dersler okul/program türüne göre ayrı kataloglanmalı.
52. `OOKY_010_02` — Yeni yerel seçmeli ders ancak uygun ortam ve öğretmen varsa değerlendirilmeli.
53. `OOKY_010_03` — Yeni yerel seçmeli ders için eğitim bölgesi müdürler kurulu uygunluğu aranmalı.
54. `OOKY_010_04` — Yeni yerel seçmeli ders çevre ihtiyacı ve özellikleriyle ilişkilendirilmeli.
55. `OOKY_010_05` — Yeni yerel seçmeli ders programı/materyali eğitim bölgesi zümre öğretmenlerince hazırlanmalı.
56. `OOKY_010_06` — Yeni yerel seçmeli ders il millî eğitim müdürü onayı olmadan yayınlanmamalı.
57. `OOKY_010_07` — İlk kez uygulanan yerel programın örneği Bakanlığın ilgili birimine gönderilmeli.
58. `OOKY_010_08` — Tam zamanlı kaynaştırma öğrencisi kayıtlı okulun programını izlemeli.
59. `OOKY_010_09` — Kaynaştırma öğrencisi için BEP hazırlanması zorunlu kontrol olmalı.
60. `OOKY_010_10` — BEP geliştirme birimi oluşturulması zorunlu kontrol olmalı.
61. `OOKY_010_11` — Özel eğitim iş ve işlemleri güncel Özel Eğitim Hizmetleri mevzuatına delege edilmeli.
62. `OOKY_010_12` — Kaynaştırma öğrencisinin başarı değerlendirmesi OÖKY sınıf geçme/sınav hükümleriyle bağlanmalı.
63. `OOKY_010_13` — Belirli hazırlık sınıflı merkezi sınav okullarında matematik/fen dersinin yabancı dille okutulması için uygun öğretmen şartı aranmalı.
64. `OOKY_010_14` — Bu uygulamada normalde en az 12 öğrenci talebi aranmalı; özel öğretim ve IB istisnaları parametrik tutulmalı.
65. `OOKY_010_15` — IB uygulanıyorsa CAS çalışmaları program bileşeni olarak tutulmalı.
66. `OOKY_010_16` — IB öğrencilerinde matematik/fen derslerinin yabancı dille okutulması kuralı bağlanmalı.
67. `OOKY_010_17` — Hazırlık yabancı dilinde dinleme/konuşma/okuma/yazma beceri dağılımı zümre kararıyla belirlenmeli.
68. `OOKY_010_18` — MTAL programları Ulusal Meslek Standartları doğrultusunda güncellenmeli.
69. `OOKY_010_19` — Gerektiğinde ulusal/uluslararası meslek standartlarıyla yeni mesleki program hazırlanabilmeli.
70. `OOKY_010_20` — Alan/dal uygulama dersleri işletmede yürütülüyorsa sistemde `işletmelerde mesleki eğitim` olarak sınıflanmalı.
71. `OOKY_010_21` — MESEM’de kalfalık ve ustalık programları ayrı program tipleri olarak tutulmalı.
72. `OOKY_010_22` — MESEM teorik ve pratik eğitim birbirini tamamlayan plan bileşenleri olmalı.

### Md.11–13 — Ders seçimi, haftalık program, materyal
73. `OOKY_011_01` — Ders seçimi açıklamaları ikinci dönemin ilk haftasında öğrencilere duyurulmalı.
74. `OOKY_011_02` — Ders seçimi şubat ayı içinde öğrenci tarafından yapılmalı.
75. `OOKY_011_03` — Seçim sürecinde veli, sınıf rehber öğretmeni ve rehberlik öğretmeni bilgilendirilmeli.
76. `OOKY_011_04` — Seçilen dersler e-Okul’a işlenmeli.
77. `OOKY_011_05` — Kitap ihtiyacı Kitap Seçim Modülüne girilmeli.
78. `OOKY_011_06` — Grup oluşmadığı için açılamayan dersler okul yönetimince ilan edilmeli.
79. `OOKY_011_07` — Açılamayan dersi seçen öğrenci açılan seçeneklere yeniden yönlendirilmeli.
80. `OOKY_011_08` — Süresinde seçim yapmayan öğrencinin dersleri okul yönetimince belirlenmeli.
81. `OOKY_011_09` — 9. sınıfa yeni başlayanların seçim/değişiklik işlemleri ders yılının ilk haftasında tamamlanmalı.
82. `OOKY_011_10` — Seçmeli ders normalde en az 10 öğrenci talebiyle açılmalı.
83. `OOKY_011_11` — Açılmış seçmeli derste yıl içinde sayı düşse de ders sürdürülmeli.
84. `OOKY_011_12` — Merkezi okulda ortak seçmeli ders açılması millî eğitim müdürlüğü onayına bağlı olmalı; öğrenci kaydı kendi okulunda kalmalı.
85. `OOKY_012_01` — Haftalık ders programı müdür onayından sonra yürürlüğe girmeli.
86. `OOKY_012_02` — Haftalık program ilgililere yazılı ve imza karşılığı duyurulmalı.
87. `OOKY_012_03` — Program hazırlanırken eğitim ortamı, öğretmen durumu, süt izni, fiziksel şartlar ve pedagojik esaslar dikkate alınmalı.
88. `OOKY_012_04` — Uygulamalı meslek dersleri imkân ölçüsünde birbirini izleyecek şekilde planlanmalı.
89. `OOKY_013_01` — Ders kitabı Bakanlıkça belirlenmiş/ilan edilmiş kaynaklardan seçilmeli; MTAL alan/dal derslerinde çerçeve program modül materyalleri kullanılmalı.

### Md.14–20 — Takvim, rehberlik, sosyal etkinlik, çevre ve geçiş
90. `OOKY_014_020_COMPOSITE` — Resmî tatil/yarım gün, 180 iş günü ve valilik onaylı çalışma takvimi; olağanüstü tatil ve telafi; MESEM teorik eğitimin haftada 1–2 gün ve 36 hafta planlanması; rehberlik için ortam/araç sağlanması; zararlı alışkanlık ve şiddete karşı okul merkezli önleme; sosyal etkinliklerde koruma ve israfı önleme; MESEM öğrencisinin işletme günündeki etkinliği için işletmeyle işbirliği; okul-aile-çevre bilgilendirmesi; ortaöğretime yerleştirme kanalının sınav/kayıt alanı/pansiyon/yetenek türüne göre ayrılması ve ilgili yıllık kılavuz/genelgeye delege edilmesi ayrı alt kontroller halinde uygulanmalıdır.

> Not: Son atom, Md.14–20 arasındaki çok sayıda birbirine bağlı yıllık/koşullu alt kontrolün tek kaynak-provenance düğümü altında tutulması içindir; implementasyonda alt kontroller ayrı condition/evidence alanları olarak saklanır. Batch sayacı kaynak-provenance açısından 90 atomdur; `workflow_id` sayısı değildir.

## Sistem etkisi
- Modüller: `WF`, `CAL`, `STUDENT`, `PERSON`, `GUID`, `SPED`, `SOC`, `MTAL`, `DYK`, `DOC`, `NOTIF`, `LEG`.
- Zaman parametreleri hard-code edilmemeli: `SECOND_TERM_FIRST_WEEK`, `FEBRUARY`, `FIRST_WEEK_OF_SCHOOL_YEAR`, `MIN_180_WORKDAYS`, `MESEM_36_WEEKS`, `MESEM_THEORY_1_2_DAYS_WEEK` sürümlü legal parameter olarak tutulmalı.
- Yıllık LGS/yerleştirme kılavuzu gibi değişken usuller OÖKY’den türetilip sabitlenmemeli; ilgili yılın resmî kılavuzu `legal_version` olarak bağlanmalı.
- BEP/özel eğitim, ders kitapları, rehberlik ve yerleştirme gibi açık mevzuat delegasyonlarında güncel yan mevzuat ayrı kaynak olarak doğrulanmadan otomatik yayın yapılmamalı.

## ARTICLE_VERIFIED politikası
Bu batch **90 atomik operasyon kuralı** üretir; `ARTICLE_VERIFIED` artışı **0**'dır. 2.229 satırlık durable master ile kesin `workflow_id + current source + article/paragraph` eşleşmesi kurulmadan sayaç artırılmaz.
