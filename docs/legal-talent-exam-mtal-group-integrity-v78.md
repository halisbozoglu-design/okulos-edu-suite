# V78 — Yetenek Sınavı / MTAL Grup Oluşturma Integrity

Tarih: 2026-08-31
Migration: 0
Lovable: 0

## Kaynaklar
- MEB 2026 Yetenek Sınavı ile Öğrenci Alan Okullara İlişkin Başvuru, Sınav ve Yerleştirme Kılavuzu duyurusu.
- MEB Ortaöğretim Kurumları Yönetmeliği güncel resmî konsolide metni.
- 08.09.2023/32303 Resmî Gazete değişiklik zinciri.

## Bulgular
- HB-1690..1697 yetenek sınavı ailesidir; genel `Öğrenci Kayıt ve Nakilleri` başlığı altında bulunmaları kapsamı genişletmez.
- 2026 current annual model: başvuru 1-26 Haziran; başvuru kontrol/randevu 29-30 Haziran; giriş belgeleri 30 Hazirana kadar; sınav 1-12 Temmuz; merkezi ilk yerleştirme asil/yedek 13 Temmuz; kesin kayıt 13-22 Temmuz; sonraki boş kontenjan/yedek-ek yerleştirme Ağustos takvimine bağlıdır.
- Current modelde aday en fazla 3 tercih, ek yerleştirmede en fazla 5 tercih yapabilir; başarı eşiği 50; yerleştirme puanı yetenek sınavı %70 + OBP %30.
- HB-1690 `8. sınıfı bitiren öğrencilerin başvuruları belirlenen tarihlerde kabul edilir` yalnız annual guide child olarak ele alınabilir; tarih ve okul/program applicability parametredir.
- HB-1691 sınav giriş belgesi current annual guide ile operasyonel olarak doğrulanır; kalıcı statutory ARTICLE parent değildir.
- HB-1692 `alanlara göre listelerin okul ve internet sitesinde ilanı` current 2026 merkezi tercih/yerleştirme yapısıyla birebir kilitlenmedi; WITHHELD.
- HB-1693 generic `Yetenek Sınav Komisyonları` named organ/üye kriterlerini kaybetmektedir; okul türü ve yıllık guide ayrımı gerekir.
- HB-1694 `en fazla dört gözetmen + değerlendirmeye katılmama` hükmü current OÖKY ana metninde bulunmadı; annual guide primary exact text kilidi olmadan ARTICLE_VERIFIED değil.
- HB-1695 değerlendirme/sıralama current annual guide ile operasyonel olarak yaşar fakat program/alan ölçütleri annual child parametresidir.
- HB-1696 legacy okul+internet sitesinde asil/yedek liste ilanı 2026 merkezi yerleştirme modelindeki ilan nesnesi/kanalıyla birebir değildir; rewrite/recheck.
- HB-1697 boş kontenjan/yedek çağrısı current modelde ikinci/üçüncü yerleştirme ve ek yerleştirme takvimine bölünür; tek generic workflow olarak exact değildir.
- HB-1698 OÖKY Md21/3: mesleki-teknik kayıt için sağlık durumunun mesleğin öğrenimine elverişli olması; gerektiğinde alana geçiş sürecinde sağlık/sağlık kurulu raporuyla belgeleme. Master `kayıt yaptıracak öğrencilerden gerektiğinde rapor istenir` diyerek zaman/nesneyi genişletiyor; no promotion.
- HB-1699 ARTICLE_VERIFIED: OÖKY Md26/1, MTAL 9. sınıfta kayıt + sınıf tekrarı dahil öğrenci sayısı 10'dan az programda sınıf oluşturulmaz.
- HB-1700 ARTICLE_VERIFIED: OÖKY Md26/3, aynı alan/dalda donatım yokluğu nedeniyle işyerinde uygulamalı eğitim yapan en az 8 kişilik öğrenci grubu için okul yönetimince öğretmen görevlendirilir.

## Guards
- ANNUAL_TALENT_EXAM_GUIDE_IS_YEAR_PARAMETER.
- GENERIC_TALENT_EXAM_COMMISSION_NAME_DOES_NOT_PROVE_CURRENT_COMPOSITION.
- RESULT_PUBLICATION_CHANNEL_IS_EXACTNESS_FIELD.
- CENTRAL_PLACEMENT_MODEL_CANNOT_BE_NORMALIZED_TO_LEGACY_SCHOOL_LIST_POSTING.
- HEALTH_SUITABILITY_AND_HEALTH_REPORT_REQUEST_ARE_DISTINCT_ATOMS.
- FIELD_TRANSITION_TIMING_CANNOT_BE_NORMALIZED_TO_INITIAL_REGISTRATION.
- MTAL_GROUP_THRESHOLD_IS_PROGRAM_SPECIFIC.

## Sayaç
V77 canonical 466 -> V78 468; net +2.
