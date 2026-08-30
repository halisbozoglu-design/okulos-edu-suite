# V71 — Stratejik Planlama integrity audit

Kaynak politikası: yalnız resmî MEB / Resmî Gazete. Migration 0. Lovable 0.

## Current authority chain
- 5018 sayılı Kanun Md9: kamu idarelerinde stratejik planlama, misyon-vizyon, amaç/hedef, performans göstergeleri, katılımcılık, izleme-değerlendirme üst normu.
- MEB 2022/21 sayılı Genelge + MEB 2024-2028 Stratejik Plan Hazırlık Programı: Bakanlık, il/ilçe MEM ile okul/kurumlar için 2024-2028 dönemine özgü çalışma modeli ve takvim.
- 2026 SGB yayınları 2024-2028 okul/kurum stratejik plan rehberini ve 2022/21 zincirini güncel operasyonel kaynak olarak hâlâ yayımlamaktadır.

## HB-1609
Master: Strateji Geliştirme Kurulu ve Stratejik Planlama Ekibi oluşturulur; görev/sorumlulukları belirlenir.
Current MEB Hazırlık Programı 6.1.2.4 okul/kurum için iki organı da exact adlarıyla düzenler. Kurul: okul müdürü + bir müdür yardımcısı + iki öğretmen + OAB başkanı; personel <=5 ise tüm personel. Ekip: üst kurul üyesi olmayan görevlendirilmiş müdür yardımcısı başkanlığında öğretmenler ve gönüllü veliler.
Status: ARTICLE_VERIFIED. Period scope: 2024-2028 legal snapshot.

## HB-1610
Master: hazırlık faaliyetleri, zaman çizelgesi ve eğitim ihtiyacını kapsayan Hazırlık Programı.
Current MEB Hazırlık Programı EK-3 okul/kurum adımlarında stratejik plan hazırlık programının oluşturulmasını; ekip/kurul eğitimi ve takvimi ayrıca düzenler. Masterın üç atomu aynı hazırlık programı ailesinde current-period exacttır.
Status: ARTICLE_VERIFIED. Period scope: 2024-2028 legal snapshot.

## HB-1611
Paydaşların belirlenmesi/görüşlerinin alınması + GZFT dış çevre analizi aynı satırda birleştirilmiş. Current program durum analizinde paydaş beklenti/önerileri, anket/toplantılar, PESTLE/GZFT ve ihtiyaç analizini ayrı atomlar olarak düzenler.
Status: COMPOUND_ANALYSIS_SPLIT_REQUIRED; whole-row count yok.

## HB-1612
Kuruluş içi analiz current programda açıkça durum analizinin parçasıdır. Ancak master teknoloji altyapısı, kurum kültürü, fiziksel kaynaklar ve mali yapıyı tek cümlede paketliyor; exact guide template against current 2024-2028 school guide pending.
Status: CURRENT_PERIOD_OPERATIONAL_EXACT + TEMPLATE_DETAIL_LOCK_PENDING.

## HB-1614 / HB-1615 / HB-1616
Current program misyon-vizyon-temel değerler; amaç-hedef-performans göstergeleri-stratejiler; faaliyet/projeler zincirini açıkça içerir. Bunlar current-period source exact candidates. Durable master publication için 2024-2028 period binding snapshot metadata zorunlu tutulur; bu batchte sayaç HB-1609/1610 ile sınırlandırıldı, diğerleri duplicate/current-guide exactness recheck kuyruğunda.

## HB-1617
Ayrıntılı eylem planında sorumlu birim, zaman, kaynaklar gibi alanlar current strategic planning modelinin doğal parçalarıdır ancak masterdaki tüm alanların tek current MEB school guide provision/template ile birebir kilidi tamamlanmadı.
Status: WITHHELD_TEMPLATE_EXACTNESS.

## HB-1618
Okul planının ilçe/il MEM stratejik planıyla uyumu güçlü current operational requirementtır; 2024-2028 rehber okul planlarının Bakanlık ve il MEM hedefleriyle uyumlaştırılmasını amaçlar. Masterdaki `ilçe/İl` connector semantiği ayrıca exact hierarchy check gerektirir.
Status: WITHHELD_HIERARCHY_CONNECTOR_RECHECK.

## HB-1619
Master ayrı `İzleme ve değerlendirme ekipleri` kurulmasını zorunlu tutuyor. Current MEB Hazırlık Programı 6.5 ise izleme/değerlendirmeden sorumlu `birim ve kişiler` ile takvimin belirlenmesini ister; ayrı adlı ekip kurma zorunluluğu koymaz.
Status: LEGACY_OR_LOCAL_ORGAN_NAME + MASTER_REWRITE_REQUIRED. ARTICLE_VERIFIED yok.

## HB-1620 / HB-1621
Current 2026 MEB taşra uygulamalarında okul/kurum planları her yıl izlenip değerlendiriliyor; current MEB strategic model hedef/performance/faaliyet gerçekleşmelerinin raporlanmasını ve elde edilen bilgilerle planın gözden geçirilmesini destekliyor. Ancak masterın `Yıllık İzleme ve Değerlendirme Raporu` exact isim/periyot semantiği central current school guide üzerinde ayrıca kilitlenecek.
Status: CURRENT_OPERATIONAL + CENTRAL_TEMPLATE_LOCK_PENDING.

## HB-1622 boundary
HB-1622 stratejik planlama bloğunda görünse de `Hizmet standartları tablosu` farklı idari hizmet-standardı hukuk ailesidir. Stratejik plan source'una miras bırakılamaz.
Status: LEGAL_FAMILY_BOUNDARY_SPLIT.

## New guards
- PERIODIC_STRATEGIC_PLAN_SOURCE_REQUIRES_PERIOD_SNAPSHOT.
- NAMED_TEAM_MUST_EXIST_IN_CURRENT_SOURCE; `sorumlu birim/kişiler` ayrı bir `ekip` adı olarak normalize edilemez.
- STRATEGIC_PLAN_CONTENT_ATOMS may share one period program but compound master rows still split when separately executable.
- SECTION_PLACEMENT_DOES_NOT_DEFINE_LEGAL_FAMILY: HB-1622 strategic section placement does not make service-standards law strategic planning law.
