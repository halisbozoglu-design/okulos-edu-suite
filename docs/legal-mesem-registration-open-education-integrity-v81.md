# V81 — MESEM Kayıt / Açık Öğretim Integrity

Tarih: 2026-09-01
Migration: 0
Lovable: 0

## İncelenen sınır
HB-1723..HB-1734 ana blok. Kaynak master: Mimaros 2.229 kayıtlık kanonik iş akışı havuzu.

## Exact / correction kararları

### HB-1723 — ARTICLE_VERIFIED
Master: Mesleki eğitim merkezinde öğrenim gören öğrencilerin medeni hallerine bakılmamaktadır.
Current exact parent: MEB Ortaöğretim Kurumları Yönetmeliği Md21/4. Evli olanlara ilişkin kayıt/ilişik kuralı mesleki eğitim merkezi öğrencileri için uygulanmaz. School-type metadata MESEM olduğundan kapsam dar ve uyumludur.

### HB-1724 — WITHHELD
Master: Örgün ortaöğretim kurumlarından AÖL veya MAÖL'ye bu okulların kayıt dönemlerinde kayıt yapılır.
Legacy OÖKY Md21/5 bu dili taşısa da 2023 sonrası örgün↔açık öğretim geçiş şartları ve zaman pencereleri değişmiştir; ayrıca metadata MESEM ile master aktör/kapsamı uyuşmamaktadır. Güncel Açık Öğretim Kurumları Yönetmeliği ve OÖKY geçiş hükümleri birlikte atomik yeniden yazılmalı.

### HB-1725 — WITHHELD_SCOPE
Master: MESEM öğrencileri aynı zamanda AÖL, MAÖL veya AÖİHL'ye kayıt yaptırabilir.
OÖKY Md21/7 bu hakkı açıkça destekler. Ancak mevcut school_type_tags AOL|HS|MESEM fazla geniştir. MESEM kaynaklı eşzamanlı kayıt atomu olarak scope publish edilmeden sayılamaz.

### HB-1726 — WITHHELD_SCOPE / CURRENT_OPEN_ED_RECHECK
Master: MAÖL öğrencileri, MESEM'de karşılığı olan derslerden yüz yüze eğitime devam ettirilmez.
OÖKY Md21/7 tarihsel/current text desteği taşır; 22.10.2024 Açık Öğretim Kurumları Yönetmeliği eski MAÖL yönetmeliklerini kaldırmıştır. Yeni yönetmelikte MAÖL yüz yüze eğitim Md25'e taşınmıştır. Masterın 'MESEM'de karşılığı olan ders' muafiyet mekanizması current 2024 düzenleme ile birlikte exact yeniden kilitlenmeden promote edilmez.

### HB-1727 — MASTER_REWRITE_REQUIRED
Master 31 Aralık sonrasını eşik yapıyor. Current OÖKY Md22/9 resmi 2017 değişiklik zincirinde 'ders yılının ikinci döneminde şubat ayından sonra' kaydolanlar için işletmede eğitime devam + o ders yılı yılsonu puanı yok + teorik eğitim yeni ders yılı başında kuralını getiriyor. Tarih alanı exactness field'dır.

### HB-1728 — YEAR_PARAMETER / WITHHELD
GSL yetenek sınavında en fazla 10 gözetmen + puanlamaya katılmama cümlesi yerel/handbook kaynaklarında sürüyor; 2026 merkezi yetenek sınavı kılavuzunun exact hükmü current official PDF seviyesinde kilitlenmeden durable ARTICLE değildir.

### HB-1729 — WITHHELD_SCOPE
Okul birinciliği OÖKY Md64 ailesine ait secondary-school sürecidir. Master generic, metadata ALL olduğundan secondary-only exact parent bütün satıra yayılamaz.

### HB-1730 — WITHHELD_SCOPE
Diplomanın öğrenci/veli/noter vekiline imza karşılığı teslimi secondary-school belge teslim sürecidir; ALL metadata ile promote edilmez. Diploma teslim alıcısı ve teslim kanıtı exactness alanıdır.

### HB-1731 — WITHHELD_SCOPE
Yıpranan/kaybolan diploma yerine öğrenim durum belgesi düzenlenmesi current school-type belge hükümleriyle kilitlenmeli; ALL/common varsayımı yapılmaz.

### HB-1732 — WITHHELD_SCOPE
Başarısızlık/devamsızlık nedeniyle sınıf tekrarı okul türüne göre farklı hükümlere bağlıdır; generic ALL row exact değildir.

### HB-1733 — WITHHELD_CURRENT_FORMAT
Fotoğraflı öğrenci kimlik belgesi yükümlülüğü güncel dijital/e-Devlet belge düzeniyle ve okul türü hükümleriyle current exact recheck gerektirir.

### HB-1734 — WITHHELD_COMPOUND
Elektronik belge/defter/çizelge/sözleşme/form çıktılarının alınması + müdür onayı + saklama tek cümlede birden fazla belge ailesini birleştiriyor. Current Açık Öğretim Yönetmeliği Md61 dijital aktarım/arşiv yapısını düzenlese de tüm okul türleri için aynı fiziksel çıktı kuralı çıkarılamaz.

## Current Open Education correction
22.10.2024 RG 32700 MEB Açık Öğretim Kurumları Yönetmeliği eski Açık Öğretim Ortaokulu, Açık Öğretim Lisesi ve Mesleki Açık Öğretim Lisesi yönetmeliklerini kaldırdı. Açık öğretim birimi görevleri Md7; yüz yüze eğitim Md25; öğrenci dosyaları/arşiv Md61. Eski 2020/1 veya mülga yönetmelik tek başına current exact parent olarak kullanılamaz.

## New guards
- MESEM_MARRIAGE_EXCEPTION_IS_SCHOOL_TYPE_SPECIFIC
- REGISTRATION_WINDOW_DATE_IS_EXACTNESS_FIELD
- OPEN_ED_2024_REPLACEMENT_OVERRIDES_OLD_SEPARATE_REGULATIONS
- SIMULTANEOUS_OPEN_ED_ENROLLMENT_REQUIRES_MESEM_SOURCE_SCOPE
- DIPLOMA_RECIPIENT_AND_DELIVERY_PROOF_ARE_EXACTNESS_FIELDS
- ELECTRONIC_ARCHIVE_DOES_NOT_IMPLY_UNIVERSAL_PRINT_AND_WET_APPROVAL
