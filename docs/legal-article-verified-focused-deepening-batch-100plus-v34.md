# Legal Fast Batch V34 — ARTICLE_VERIFIED Focused Deepening

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-27
Method: exact-clause-first; no new legal family; duplicate/timing guards preserved.
Migration count: 0

## Current official sources
- MEB Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1703.pdf
- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği / RG 08.06.2017: https://resmigazete.gov.tr/eskiler/2017/06/20170608-5.htm

## A. Öğrenci Davranışlarını Değerlendirme Kurulu — Md57 — 30 atoms
ODD34-001|Md57/1|ortaokul ve imam-hatip ortaokulunda kurul oluşturulur
ODD34-002|Md57/1|amaç olumlu davranış kazandırma
ODD34-003|Md57/1|amaç olumsuz davranışları önleme
ODD34-004|Md57/1|öğrenci ilgi/istek/yetenek/ihtiyaç girdidir
ODD34-005|Md57/2-a|başkan müdür başyardımcısı veya görevlendirilen müdür yardımcısı
ODD34-006|Md57/2-b|üç öğretmen üye
ODD34-007|Md57/2-b|öğretmen üyeler ilk öğretmenler kurulunda seçilir
ODD34-008|Md57/2-b|öğretmen seçimi gizli oyla
ODD34-009|Md57/2-c|OAB kendi üyeleri arasından bir veli seçer
ODD34-010|Md57/3|yetersiz öğretmen halinde aday öğretmen seçilebilir
ODD34-011|Md57/3|yetersiz öğretmen halinde sözleşmeli öğretmen seçilebilir
ODD34-012|Md57/3|yetersiz öğretmen halinde ücretli öğretmen seçilebilir
ODD34-013|Md57/4|oy eşitliğinde seçim yenilenir
ODD34-014|Md57/4|ikinci eşitlikte kıdem önceliği
ODD34-015|Md57/4|kıdem eşitliğinde kura
ODD34-016|Md57/5|üç yedek öğretmen üye seçilir
ODD34-017|Md57/5|yedekler oy sırasına göre
ODD34-018|Md57/5|mazeret halinde yedek sırayla göreve gelir
ODD34-019|Md57/6|kurul görevi yeni kurul oluşana kadar sürer
ODD34-020|Md57/6|kabul edilebilir özür olmadıkça üye ayrılamaz
ODD34-021|Md57/7|ikili eğitimde ayrı kurul oluşturulabilir
ODD34-022|Md57/8|ihtiyaç halinde rehberlik öğretmeni toplantıya katılabilir
ODD34-023|Md57/8|rehberlik öğretmeni oy kullanamaz
ODD34-024|Md57|kurul dönemsel üyelik snapshotı tutulur
ODD34-025|Md57|asıl/yedek üyelik ayrı kayıtlanır
ODD34-026|Md57|seçim yöntemi ve sonuç kanıtı saklanır
ODD34-027|Md57|başkanlık yetkisi rol bazlıdır
ODD34-028|Md57|school_type MID/IHO filtresi uygulanır
ODD34-029|Md57|kurul oluşturma işi yıllık instance olarak üretilir
ODD34-030|Md57|tamamlanmış kurul dönemi immutable kalır

## B. Ortaöğretim Onur + Disiplin Kurulları — Md178-185 — 40 atoms
OOK34-001|Md178/1|onur genel kurulu ders yılı başında oluşturulur
OOK34-002|Md178/1|her sınıfın her şubesinden bir öğrenci seçilir
OOK34-003|Md178/1|seçim sınıf rehber öğretmeni gözetiminde yapılır
OOK34-004|Md178/1|boşalan üyelik izleyen dönem başında doldurulur
OOK34-005|Md178/2|onur genel kurulu üyesi diğer öğrenci kurullarında görev alabilir
OOK34-006|Md179/1-a|onur genel kurulu her dönemde en az bir kez toplanır
OOK34-007|Md179/1-b|onur kurulunu seçer
OOK34-008|Md179/1-c|öğrenciliğe yakışmayan davranışları inceler
OOK34-009|Md179/1-c|önlem önerilerini okul yönetimine bildirir
OOK34-010|Md180/1|her sınıf seviyesinden bir onur kurulu üyesi seçilir
OOK34-011|Md180/1|üst sınıf öğrencilerinden ikinci başkan seçilir
OOK34-012|Md180/1|ikinci başkan yedek üyesi seçilir
OOK34-013|Md180/2|tek şubeli sınıflarda seçilenler doğrudan onur kurulunu oluşturur
OOK34-014|Md180/2|üst sınıf temsilcisi ikinci başkan olur
OOK34-015|Md180/3|üst sınıf yoksa mevcut en üst sınıf esas alınır
OOK34-016|Md181/1-a|onur üyeliği için disipline aykırı davranış bulunmamalı
OOK34-017|Md181/1-b|örnek davranış niteliği aranır
OOK34-018|Md181/1-c|çalışkan/dürüst/doğru sözlü/güvenilir nitelik aranır
OOK34-019|Md181|nitelik kaybında üyelik düşer
OOK34-020|Md181|disiplin cezası alanın üyeliği düşer
OOK34-021|Md182/1|onur kurulu başkanı öğretmenler kurulunca seçilen öğretmendir
OOK34-022|Md182/1|başkan disiplin kurulu üyeleri dışından seçilir
OOK34-023|Md182/1|başkan için yedek üye seçilir
OOK34-024|Md183/1-a|onur kurulu ayda en az bir kez toplanır
OOK34-025|Md183/1-a|disiplin/düzen konularını görüşür
OOK34-026|Md183/1-a|kararları disiplin kuruluna iletilmek üzere müdüre sunar
OOK34-027|Md183/1-b|onur belgesi önerisi yapar
OOK34-028|Md183/1-c|boş zaman/disiplin önleme programları hazırlar
OOK34-029|Md184/1|onur kurulu kararları karar defterine yazılır
OOK34-030|Md185/1-a|disiplin kurulu başkanlığı müdür başyardımcısı/görevlendirilen müdür yardımcısı
OOK34-031|Md185/1-b|iki öğretmen üye ilk ayda gizli oyla seçilir
OOK34-032|Md185/1-c|onur kurulu ikinci başkanı üyedir
OOK34-033|Md185/1-ç|OAB bir veli üye seçer
OOK34-034|Md185/2|yetersiz öğretmen halinde aday öğretmen seçilebilir
OOK34-035|Md185/2|sözleşmeli/ücretli öğretmen seçilebilir
OOK34-036|Md185/3|oy eşitliğinde yeniden seçim/kıdem/kura sırası uygulanır
OOK34-037|Md185/4|kurul görevi yeni kurul oluşana kadar sürer
OOK34-038|Md185/5|ikili öğretimde ayrı disiplin kurulu kurulabilir
OOK34-039|Md185/6|genel disiplin toplantısına rehberlik öğretmeni/onur kurulu başkanı/varsa doktor katılabilir
OOK34-040|Md185/6|bu katılımcılar oy kullanamaz

## C. Sosyal Etkinlikler Kurulu — Md6 — 30 atoms
SOC34-001|Md6/1|sosyal etkinlikler kurulu oluşturulur
SOC34-002|Md6/1|başkan müdür veya görevlendirdiği müdür yardımcısı
SOC34-003|Md6/1|üç danışman öğretmen üye
SOC34-004|Md6/1|öğretmenler danışman öğretmen havuzundan seçilir
SOC34-005|Md6/1|iki öğrenci kulüp temsilcisi üye
SOC34-006|Md6/1|öğrenci temsilcileri kendi aralarında seçer
SOC34-007|Md6/1|OAB bir veli üye belirler
SOC34-008|Md6/1|birleştirilmiş sınıfta mevcut öğretmenlerle yürütülebilir
SOC34-009|Md6/2|eylül ayında yıllık sosyal etkinlik planı yapılır
SOC34-010|Md6/2|uygulama ekimden itibaren yürütülür
SOC34-011|Md6/3|yıl içinde yeni plan yapılabilir
SOC34-012|Md6/3|değişen şartlar yeni plan tetikler
SOC34-013|Md6/3|istek ve ihtiyaç yeni karar tetikler
SOC34-014|Md6/4|plan ve karar müdür onayıyla yürürlüğe girer
SOC34-015|Md6/5|belirli gün ve haftalar kulüplere dağıtılır
SOC34-016|Md6/5|etkinlik kapsamı sınıf içi/sınıflar arası/kurum içi/kurum dışı planlanır
SOC34-017|Md6/5|plan müdür onayına sunulur
SOC34-018|Md6/6|danışman öğretmenlerle işbirliği
SOC34-019|Md6/6|öğretmenlerle işbirliği
SOC34-020|Md6/6|öğrencilerle işbirliği
SOC34-021|Md6/6|gönüllü velilerle işbirliği
SOC34-022|Md6/6|diğer ilgililerle işbirliği
SOC34-023|Md6/7|sekretarya eğitim kurumu müdürlüğünce yürütülür
SOC34-024|Md6/8|kurul işlemleri öğretmenler kurulunda değerlendirilir
SOC34-025|Md6/9|sosyal etkinlik başarı belgesi adayları belirlenir
SOC34-026|Md6/9|liste müdür onayına sunulur
SOC34-027|Md6|kurul üyelikleri öğretim yılı bazında versioned
SOC34-028|Md6|plan/karar/onay kanıtları ilişkilendirilir
SOC34-029|Md6|tamamlanan yıl planı immutable
SOC34-030|Md6|kurul school_type ALL filtresine bağlı uygulanır

## D. Exact-binding guards / cross-relations — 20 atoms
X34-001|guard|HB-2186 exact Md57 ad-eşleşmesi
X34-002|guard|HB-2187 exact Md185 ad-eşleşmesi
X34-003|guard|HB-2188 exact Md178 ad-eşleşmesi
X34-004|guard|HB-2189 exact Md180 ad-eşleşmesi
X34-005|guard|HB-2190 exact Md6 ad-eşleşmesi
X34-006|guard|HB-2201 boarding commission current-source reconciliation bekler
X34-007|guard|HB-2181/HB-2202 school-health exact clause bekler
X34-008|guard|HB-2182/HB-2203 psychosocial-team exact source bekler
X34-009|guard|HB-2204 open-education equivalence commission exact source bekler
X34-010|guard|HB-2205 MTAL area/quota commission exact source bekler
X34-011|guard|HB-2206 coordinator-teacher commission exact source bekler
X34-012|guard|duplicate ARTICLE_VERIFIED IDs yeniden sayılmaz
X34-013|guard|mülga yatılılık kaynağı kullanılmaz
X34-014|guard|kurumsal yıllık saat/tarih evrensel hukuk gibi kodlanmaz
X34-015|guard|current source snapshot tutulur
X34-016|guard|workflow_id text must directly match legal entity/action
X34-017|guard|article/paragraph required for count increase
X34-018|guard|historical completed instance not mutated
X34-019|guard|source authority hierarchy enforced
X34-020|guard|Super Admin final publish gate preserved

## Counts
- ODD: 30
- OOKY onur/disiplin: 40
- Social Activities: 30
- Guards: 20
- TOTAL: 120
- migration: 0
