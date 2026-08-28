# Legal Fast Batch V41 — OAB/RAM/BİLSEM retained-ID reconciliation

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-28
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0

## Current official source focus
- MEB Özel Eğitim Hizmetleri Yönetmeliği current consolidated source: https://orgm.meb.gov.tr/meb_iys_dosyalar/2021_09/13145613_Ozel_EYitim_Hizmetleri_YonetmeliYi_son.pdf
- MEB Bilim ve Sanat Merkezleri Yönergesi current consolidated source: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf
- MEB Okul-Aile Birliği Yönetmeliği official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf

## A. Özel Eğitim Hizmetleri Kurulu — 50 atoms
SPED41-001|ÖEHY Md39/1|Özel Eğitim Hizmetleri Kurulu il/ilçe MEM bünyesinde oluşturulur
SPED41-002|Md39/1|kurul özel eğitim hizmetlerinin planlanması amacı taşır
SPED41-003|Md39/1|kurul özel eğitim hizmetlerinin yürütülmesi amacı taşır
SPED41-004|Md39/1|kurul özel eğitim hizmetlerinin izlenmesi amacı taşır
SPED41-005|Md39/1|kurul özel eğitim hizmetlerinin değerlendirilmesi amacı taşır
SPED41-006|Md39/2|kurul MEM yöneticisi başkanlığında çalışır
SPED41-007|Md39/2|özel eğitim/rehberlik hizmetlerinden sorumlu şube müdürü üyedir
SPED41-008|Md39/2|RAM müdürü üyedir
SPED41-009|Md39/2|özel eğitim okul/kurum yöneticileri arasından üye bulunur
SPED41-010|Md39/2|özel eğitim öğretmeni üyedir
SPED41-011|Md39/2|rehberlik öğretmeni üyedir
SPED41-012|Md39/2|gerektiğinde ilgili kurum/kuruluş temsilcileri toplantıya çağrılabilir
SPED41-013|Md40|kurul özel eğitim hizmetlerini planlar
SPED41-014|Md40|özel eğitim ihtiyacı olan bireylerin eğitim ortamlarına yerleştirilmesine ilişkin işlemleri yürütür
SPED41-015|Md40|eğitim tedbirlerinin uygulanmasını izler
SPED41-016|Md40|özel eğitim sınıfı açılması/kapatılması süreçlerini değerlendirir
SPED41-017|Md40|destek eğitim odası süreçlerini izler
SPED41-018|Md40|özel eğitim hizmetlerinin koordinasyonunu sağlar
SPED41-019|Md40|Özel Eğitim Değerlendirme Kurulu raporlarını hizmet planlamasında kullanır
SPED41-020|Md40|gerektiğinde kurumlar arası koordinasyon sağlar
SPED41-021|Md41|kurul çalışma usul ve esasları current regulation ile bağlıdır
SPED41-022|Md41|toplantı/karar süreci BOARD workflowudur
SPED41-023|Md41|kararlar kayıt altına alınır
SPED41-024|Md41|kurul kararları ilgili birimlere bildirilir
SPED41-025|Md42|yerleştirme kararları öğrenci bazlı ayrı işlem üretir
SPED41-026|Md42|yerleştirmede en az sınırlandırılmış eğitim ortamı esastır
SPED41-027|Md42|öğrencinin gelişim özellikleri dikkate alınır
SPED41-028|Md42|öğrencinin eğitim performansı dikkate alınır
SPED41-029|Md42|özel eğitim ihtiyacı dikkate alınır
SPED41-030|Md42|veli görüşü süreç girdisidir
SPED41-031|guard|Özel Eğitim Hizmetleri Kurulu ile Özel Eğitim Değerlendirme Kurulu aynı organ değildir
SPED41-032|guard|HB-2228 yalnız RAM Özel Eğitim Değerlendirme Kuruludur
SPED41-033|guard|il/ilçe MEM kurul workflowu RAM workflowuna normalize edilmez
SPED41-034|guard|placement decision immutable student decision olarak tutulur
SPED41-035|guard|board decision ve evaluation report ayrı evidence türleridir
SPED41-036|guard|current source Md39-42 durable parent authoritydir
SPED41-037|guard|legacy regulation article numbering current authority değildir
SPED41-038|guard|school-level BEP birimi bu kuruldan ayrıdır
SPED41-039|guard|BEP kararları il/ilçe kurul kararına normalize edilmez
SPED41-040|guard|RAM evaluation recommendation ile il/ilçe placement aynı işlem değildir
SPED41-041|master|exact retained workflow ID bulunursa title='Özel Eğitim Hizmetleri Kurulu' olmalıdır
SPED41-042|master|scope il/ilçe MEM olmalıdır
SPED41-043|master|RAM scope ise promote edilmez
SPED41-044|master|school scope ise promote edilmez
SPED41-045|master|title exact değilse WITHHELD/SPLIT
SPED41-046|master|Md39 formation exact bağdır
SPED41-047|master|Md40 duties supporting bağdır
SPED41-048|master|Md41-42 work/placement supporting bağdır
SPED41-049|migration|0
SPED41-050|snapshot|historical decisions mutate edilmez

## B. BİLSEM current named organs — 40 atoms
BIL41-001|BİLSEM Md26|Merkez Tanılama Sınav Komisyonu current named organdır
BIL41-002|Md26/1|komisyon Genel Müdür/daire başkanı başkanlığında kurulur
BIL41-003|Md26/1|üç daire başkanı bileşim çekirdeğidir
BIL41-004|Md26/1|alan uzmanları ihtiyaç halinde görevlendirilebilir
BIL41-005|Md26/2|her yetenek alanı için alt komisyon oluşturulabilir
BIL41-006|Md27|ülke geneli tanılama/yerleştirme planlanır
BIL41-007|Md27|alt komisyon süreçleri yürütülür
BIL41-008|Md27|il düzeyinde çözülemeyen itirazlar karara bağlanır
BIL41-009|Md28|İl Tanılama Sınav Komisyonu current named organdır
BIL41-010|Md28/2|il MEM müdürü/görevlendirdiği yönetici başkandır
BIL41-011|Md28/2|özel eğitim/rehberlik yöneticisi üyedir
BIL41-012|Md28/2|BİLSEM/RAM müdürlerinden üyeler bulunur
BIL41-013|Md28/3|başkan dahil en az 4 üye vardır
BIL41-014|Md28/3|en fazla 7 üye vardır
BIL41-015|Md28/4|ihtiyaç halinde ilçe aktörleri dahil edilebilir
BIL41-016|Md29|ön değerlendirme il komisyonu görev alanıdır
BIL41-017|Md29|bireysel değerlendirme il komisyonu görev alanıdır
BIL41-018|Md29|resim/müzik değerlendirme komisyonları oluşturulur
BIL41-019|Md30|resim değerlendirme komisyonu ayrı named sub-organ olarak modellenir
BIL41-020|Md31|müzik değerlendirme komisyonu ayrı named sub-organ olarak modellenir
BIL41-021|Md32|Okul Yönlendirme Komisyonu ayrı school-level organdır
BIL41-022|Md33|Okul Yönlendirme Komisyonunun görevleri ayrı workflowdur
BIL41-023|Md34|Bölge Sözlü Sınav Komisyonu ayrı organdır
BIL41-024|Md35|İl Öğretmen Değerlendirme Komisyonu ayrı organdır
BIL41-025|Md40|Proje Jürisi current named organdır
BIL41-026|Md40/1|danışman öğretmen jüri üyesidir
BIL41-027|Md40/1|müdür/görevlendirdiği müdür yardımcısı jüri üyesidir
BIL41-028|Md40/1|en az bir kurum öğretmeni jüri üyesidir
BIL41-029|Md40/1|alan uzmanı/akademik personel jüriye katılır
BIL41-030|Md40/2|proje değerlendirme jüri görevidir
BIL41-031|master|repo code search HB-2223 exact hit vermedi
BIL41-032|master|repo code search HB-2224 exact hit vermedi
BIL41-033|master|repo code search HB-2225 exact hit vermedi
BIL41-034|master|repo code search HB-2226 exact hit vermedi
BIL41-035|master|repo code search HB-2227 exact hit vermedi
BIL41-036|guard|retained ID tahmin edilmez
BIL41-037|guard|current named organ varlığı tek başına ARTICLE_VERIFIED sayılmaz
BIL41-038|guard|annual guide parameters durable directive organından ayrılır
BIL41-039|migration|0
BIL41-040|snapshot|historical BİLSEM organ records versioned tutulur

## C. Okul-Aile Birliği / HB-2223..2226 reconciliation — 20 atoms
OAB41-001|OAB Yönetmeliği|Okul-Aile Birliği okul bazlı named organdır
OAB41-002|current|genel kurul ayrı organdır
OAB41-003|current|yönetim kurulu ayrı organdır
OAB41-004|current|denetleme kurulu ayrı organdır
OAB41-005|current|organ adları birbirine normalize edilmez
OAB41-006|current|BİLSEM kapsamı kurum statüsü ve yönetmelik kapsam hükmüyle birlikte değerlendirilir
OAB41-007|guard|BİLSEM Yönergesinde öğretmenler kuruluna OAB başkanının gerektiğinde katılımı OAB organını yeniden kurmaz
OAB41-008|guard|HB-2214/2215/2216 duplicate/applicability audit sürer
OAB41-009|master|HB-2223 retained title repo search ile geri kazanılamadı
OAB41-010|master|HB-2224 retained title repo search ile geri kazanılamadı
OAB41-011|master|HB-2225 retained title repo search ile geri kazanılamadı
OAB41-012|master|HB-2226 retained title repo search ile geri kazanılamadı
OAB41-013|guard|ID-title ilişkisi tahmin edilmez
OAB41-014|guard|similar organ name direct promotion üretmez
OAB41-015|guard|school_type applicability exact kontrol gerekir
OAB41-016|guard|duplicate ID ikinci kez sayılmaz
OAB41-017|guard|historical OAB decisions immutable tutulur
OAB41-018|guard|current official source parent authority olarak saklanır
OAB41-019|migration|0
OAB41-020|final|unresolved rows WITHHELD kalır

## D. Exact-verification guards — 10 atoms
VER41-001|HB-2223..2227|repo code-search exact retained records bulunamadı; no guessed promotion
VER41-002|BİLSEM|Md26/Md28/Md40 current organs confirmed
VER41-003|SPED|Md39-42 Özel Eğitim Hizmetleri Kurulu family confirmed
VER41-004|SPED|HB-2228 duplicate count yasak
VER41-005|OAB|school applicability exact scope olmadan promote edilmez
VER41-006|school-health|HB-2218/HB-2229 conflict remains withheld
VER41-007|legacy|obsolete title current organla otomatik rename edilmez
VER41-008|duplicate|already verified workflow IDs excluded
VER41-009|migration|0
VER41-010|next|master source inventory recovery prioritized

## Counts
- Special Education Services Board: 50
- BİLSEM named organs: 40
- OAB reconciliation: 20
- Guards: 10
- TOTAL: 120
- Migration: 0
