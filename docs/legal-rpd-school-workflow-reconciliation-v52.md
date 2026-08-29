# V52 — RPD okul workflow reconciliation

Tarih: 2026-08-29
Migration: 0

## Amaç
Yürürlükte kalan Millî Eğitim Bakanlığı Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliğinin okul tarafındaki hükümlerini mevcut 2.229 master workflow ile exact-action düzeyinde yeniden bağlamak; eski/yanlış source mappingleri düzeltmek; compound kayıtları atomik çocuklara ayırmak.

## Current authority katmanı
- Yönetmeliğin okul tarafı hükümleri için temel exact maddeler: Md8-11, Md15-23.
- 2020 RAM Yönergesi current authority olarak kullanılmaz.
- MEB 2026 denetim rehberi operational evidence olabilir; ARTICLE_VERIFIED yalnız yürürlükteki bağlayıcı hüküm + exact workflow/scope eşleşmesiyle verilir.

## HB-2026/2027/2028/2029 integrity set
- HB-2026: RPD Hizmetleri Yürütme Komisyonunun oluşturulması -> Md16/1-5. Önceden ARTICLE_VERIFIED; korunur.
- HB-2027: ilk toplantının öğretmenler kurulundan itibaren en geç bir ay içinde yapılması -> Md16/7. Önceden ARTICLE_VERIFIED; korunur.
- HB-2028: birinci dönem başı, ikinci dönem başı, ders yılı sonu toplantıları + kararların tutanağa bağlanması -> Md16/6 ve Md16/9. Önceden ARTICLE_VERIFIED; korunur.
- HB-2029: gündemin RPD servisince hazırlanıp müdüre sunulması; gündem ve toplantı tarihinin müdürce bir hafta önce yazılı duyurulması -> Md16/8. Master action exact. Eski Batch02 içinde OÖİKY 2026 Md9'a bağlanan source yanlış olduğundan SOURCE_CORRECTION uygulanır. Workflow zaten ARTICLE_VERIFIED havuzunda bulunduğu için sayaç artmaz.

## HB-2030
Metin: okul yıllık rehberlik çerçeve planı ve sınıf rehberlik çerçeve planlarının hazırlanmış olması.
Karar: COMPOUND/SPLIT_REQUIRED.
- child A: SCHOOL_RPD_PROGRAM_PREPARE -> Md10 + Md18/1-g,ğ + Md21/4-b/1.
- child B: CLASS_GUIDANCE_PLAN_PREPARE_APPROVE_SHARE -> Md23/1-a + Md18/1-j.
Whole-row ARTICLE_VERIFIED yok.

## HB-2031
Metin: yıllık çerçeve planı ve yıl sonu çalışma raporunun RAM'e gönderilmesi.
Karar: LEGACY_FORMULATION_REVIEW.
Current Yönetmelik okul programını e-Rehberlik üzerinden RAM'e ulaştırmayı Md18/1-ğ ile açık düzenler. Yıl sonu raporun aynı şekilde fiziksel/ayrı gönderimine ilişkin legacy wording current exact hüküm olarak tek satırda doğrulanmadı. Split/source update gerekir.

## HB-2032/2033/2034
Önceden ARTICLE_VERIFIED; current Yönetmelik üzerinden korunur:
- HB-2032 -> Md21/4-a müşavirlik; sınıf rehberlik planı/uygulamalarında sınıf rehber öğretmenine destek.
- HB-2033 -> Md21/2-a uzmanlık gerektiren sınıf rehberlik etkinlikleri.
- HB-2034 -> Md21/2-b,c,ç ve Md21/3-a kapsamındaki bireyi tanıma/bilgi verme/yöneltme/psikolojik danışma ailesi. Whole-row intent broad fakat mevcut verification parent korunur; final audit sırasında exact-subaction note yeniden değerlendirilecek.

## HB-2035
Meslek özellikleri, ön koşullar, eğitim/staj imkanları, çalışma koşulları, burslar ve program bilgilerinin öğrenciler, öğretmenler ve velilerle paylaşılması.
- Md21/2-c öğrencilerin ihtiyaç duydukları sosyal-duygusal/akademik/kariyer bilgilerini öğrencilerle paylaşmayı düzenler.
- Master row öğretmen ve veli audiencesini de kapsar.
- Md21/4-a müşavirlik öğretmen/veli/yöneticiye rehberlik anlayışı kazandırma çalışmalarını düzenler ancak meslek-burs-veri paylaşımıyla birebir değildir.
Karar: PARTIAL_MULTI_PROVISION; whole-row promote yok.

## HB-2036
Müşavirlik: idareci, öğretmen, personel ve ailelere yönelik rehberlik hizmetlerinde iş birliği.
Doğru parent: Md21/4-a. Eski Batch02 source mapping OÖİKY 2026 Md9 yanlış/çok genel. Workflow zaten ARTICLE_VERIFIED havuzundaysa SOURCE_CORRECTION_ONLY; yeni sayaç yok.

## HB-2037
RPD çalışmalarının kaydı ve doküman arşivi. Current Yönetmelikte e-Rehberlik kayıt/izleme hükümleri ve hizmet kayıtları vardır; ancak legacy rowdaki tüm dokümanların arşivlenmesi ifadesi için tek exact hüküm gerekir. Eski Batch02 OÖİKY Md9 mapping yeterli değil. Status: SOURCE_REVIEW_REQUIRED; final auditte yanlış madde riski.

## HB-2038
Veli aile bütünlüğü/eğitim/ekonomik durum verilerinin takibi. Kişisel veri + ihtiyaç/assessment ekseni. OÖİKY Md9 generic mapping exact değil. Status: EXACT_PROVISION_REQUIRED + KVKK_PURPOSE_MINIMIZATION_CHECK.

## HB-0603 atomic rewrite
Legacy: `Okul risk haritalarının uygulanması`.
Bu tek işlem hukuken belirsiz ve yanlış legal-family ile eşleştirilmiş.
Yeni staging children:
1. `SCHOOL_CLASS_RISK_DATA_SEND_TO_RPD_SERVICE`
   - actor: sınıf rehber öğretmeni
   - action: risk altındaki öğrencilere ait verinin bir örneğini RPD servisine ilet
   - timing: her yıl Kasım
   - authority: Md23/1-d
2. `SCHOOL_RISK_MAP_BUILD`
   - actor: RPD servisi / rehber öğretmen-psikolojik danışman, sınıf rehber öğretmenleriyle iş birliği
   - action: okul risk haritasını oluştur
   - timing: Kasım sürecinde
   - authority relation: Md18/1-m, Md3/k-l contextual; exact builder wording current service duties/final consolidated text ile stagingde tutulur
3. `SCHOOL_RISK_MAP_SEND_TO_RAM`
   - actor: eğitim kurumu müdürü
   - action: oluşturulan okul risk haritasını bağlı RAM'e ulaştır
   - timing: her yıl Kasım
   - authority: Md18/1-m

Legacy HB-0603: `SUPERSEDED_BY_ATOMIC_CHILDREN` ancak Super Admin publish sonrası. Historical completed instances immutable.

## HB-0602 correction
Legacy scope etiketi `PANSİYONLU OKULLAR İŞ VE İŞLEMLERİ` hatalıdır. İş RAM tarafında okul RPD program incelemesi/geri bildirimidir. İptal RAM Yönergesine dayanılarak publish yapılmaz. Current MEB operational evidence korunur; bağlayıcı current exact RAM parent bulunana kadar `SCOPE_ERROR_CANDIDATE + CURRENT_PARENT_REQUIRED`.

## Guard
Yanlış source mapping düzeltildiğinde workflow daha önce sayılmışsa sayaç ikinci kez artmaz. Yanlış hüküm exact current hükümle değiştirilebilir; bu `SOURCE_CORRECTION`, yeni workflow doğrulaması değildir.
