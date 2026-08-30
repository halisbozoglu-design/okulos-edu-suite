# V66 — Proje Kaynakları ve Döner Sermaye Kapsam Integrity

Tarih: 2026-08-30
Kaynak politikası: yalnız mevzuat.gov.tr / mevzuat.meb.gov.tr / resmî MEB birimleri / resmigazete.gov.tr.
Migration: 0. Lovable: 0.

## HB-1579..HB-1584 — proje kaynakları
Master satırları proje sözleşmesini, sözleşmede hüküm yoksa mali mevzuatı, proje ana amacını, vergi muafiyetini, harcama belgelendirmesini ve final raporla belge gönderimini birlikte bir proje-yönetim ailesi olarak taşıyor.

Sonuç: bu altı kayıt için tek ve evrensel bir MEB düzenleyici hüküm bulunmadı. Resmî MEB Erasmus/AB proje rehberlerinde sözleşme, ara/nihai rapor ve proje amacına bağlılık operasyonel olarak görülüyor; YEĞİTEK resmî görev metninde uluslararası proje mali raporlarının bilgi-belgeye dayalı hazırlanması yer alıyor. Ancak bunlar proje/program/sözleşme tipine göre değişiyor. Durable okul masterına evrensel ARTICLE_VERIFIED parent olarak genişletilmedi.

Durumlar:
- HB-1579: CONTRACT/PROGRAM_DEPENDENT, WITHHELD_DURABLE_PARENT_NOT_FOUND.
- HB-1580: LEGACY_GENERIC_FINANCE_WORDING; 'Maliye Bakanlığının çıkarmış olduğu yönetmelik' şeklindeki belirsiz/kurum adı eski ifade master rewrite gerektiriyor.
- HB-1581: PROJECT_OBJECTIVE_CONTRACT_DEPENDENT.
- HB-1582: TAX_EXEMPTION_PROJECT/PROGRAM_DEPENDENT; proje türü ve vergi istisna belgesine göre değişir.
- HB-1583: DOCUMENTATION_DUTY_PROJECT/FINANCE_RULE_DEPENDENT.
- HB-1584: FINAL_REPORT_RECIPIENT/TIMING_PROGRAM_DEPENDENT.

Bu kayıtlar tenant/project instance üzerinde sözleşme ve program rehberi snapshot'ı ile üretilebilir; ulusal durable masterda 'yasal zorunluluk' etiketiyle genellenemez.

## HB-1585 — döner sermaye sorumluları
Master: döner sermayeden sorumlu teknik müdür yardımcısı VE sayman görevlendirilmesi.

Güncel OÖKY Md81, döner sermayeli okullarda atölye/laboratuvar/meslek dersleri öğretmenleri arasından atanan bir müdür yardımcısının teknik müdür yardımcısı olarak görevlendirilmesini destekler.

23.01.2021 / 31373 MEB Döner Sermaye İşletmeleri Yönetmeliği ise kapsam maddesinde 3423 sayılı Kanuna göre kurulan mesleki ve teknik okul döner sermayelerini açıkça hariç tutar; bu nedenle okul DÖSE satırlarının parentı olarak kullanılamaz.

Sonuç: HB-1585 = COMPOUND + LEGAL_FAMILY_SPLIT_REQUIRED. Teknik müdür yardımcısı parçası OÖKY Md81; sayman görevlendirme parçası ayrı 3423/okul döner-sermaye personel zinciri. Tek ARTICLE_VERIFIED yok.

## HB-1586 — Kefalet Sandığı kesintisi
Master saymandan Kefalet Sandığı kesintisi yapıldığını söylüyor. Güncel resmî MEB aramasında okul DÖSE sayman/kefalet işlemlerine ait exact current provision kilitlenmedi. Eski İşletmeler Dairesi yönergesi personelin kefalet işlemlerini anıyor fakat güncel exact durable parent olarak kabul edilmedi.

Status: WITHHELD_CURRENT_EXACT_PARENT_NOT_LOCKED.

## Integrity guard
`SAME_TOPIC != SAME_SCOPE`.
Merkez/il MEM döner sermaye yönetmeliği, 3423 kapsamındaki okul döner sermayesine otomatik uygulanamaz. Kapsam maddesinde açık istisna varsa aşağı seviyedeki benzer görevler üzerinden genişletme yapılamaz.
