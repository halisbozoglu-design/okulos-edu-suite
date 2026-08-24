# Okulos — Nakil Sonrası Muafiyet ve Sorumluluk Mevzuat Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynak

- MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- İncelenen hüküm: **Md.42/1-a,b,c,ç**

## Atomik kurallar

1. **Nakil sonrası ders karşılaştırması — Md.42/1**  
   Nakli kabul edilen öğrencinin önceki okulda gördüğü dersler, yeni okulun dersleriyle sınıf seviyesinde karşılaştırılır. Toplam ders saati ve zorunlu derslerdeki eksiklik/başarısızlık sorumluluk hesabına girer.

2. **Eksik ders saati kaynaklı sorumluluk — Md.42/1-a**  
   Sınıf bazındaki eksik ders saatleri, yeni okulun haftalık ders saati toplamı esas alınarak öğrencinin yeni okulda seçtiği derslerden sorumluluk doğurur; öğrenci sorumluluk sınav döneminde sınava alınır.

3. **Yeni okul çizelgesinde olmayan eski sorumluluk dersinden muafiyet — Md.42/1-a**  
   Öğrenci, yeni okulun haftalık ders çizelgesinde bulunmayan önceki okuluna ait sorumlu olduğu derslerden muaf tutulur.

4. **Görülmeyen zorunlu dersten sorumluluk — Md.42/1-b**  
   Öğrenci, hiç görmediği zorunlu ortak/alan/dal derslerinden sorumlu tutulur.

5. **Ders saati farkı bir saatten fazlaysa sorumluluk — Md.42/1-b**  
   Öğrencinin gördüğü zorunlu ortak/alan/dal dersinde haftalık ders saati farkı bir saatten fazlaysa sorumluluk doğar ve sorumluluk sınav döneminde sınava alınır.

6. **Eski seçmeli dersin yeni zorunlu dersle ilişkilendirilmesi — Md.42/1-b**  
   Önceki okulda seçmeli olan bir ders yeni okulda zorunlu ortak/alan/dal dersle ilişkilendirilebiliyorsa öğrenci bu dersten ayrıca sorumlu tutulmaz.

7. **Yılsonu başarı durumunun yeniden hesaplanması — Md.42/1-c**  
   Nakil sonrası yılsonu başarı durumu yeni okulun haftalık ders çizelgesi ve ders saatleri dikkate alınarak yeniden hesaplanır.

8. **İlişkilendirilemeyen başarılı eski derslerin puana etkisi — Md.42/1-c**  
   Yeni okul dersleriyle ilişkilendirilemeyen ancak önceki okulda başarılı olunan dersler yılsonu başarı puanı hesabında dikkate alınır.

9. **Mesleki seviyeye göre sınıf belirleme — Md.42/1-ç**  
   Yönetmeliğin Md.37/2-c kapsamındaki nakil/geçişlerde öğrencinin devam edeceği sınıf mesleki seviyesine göre belirlenir.

10. **Seviye belirleme komisyonu — Md.42/1-ç**  
    İl/ilçe millî eğitim müdürlüğünce belirlenecek okul/kurum müdürlüklerinde ilgili alan öğretmenlerinden komisyon oluşturulur.

11. **Aynı alan/dalda geçmiş eğitim varsa değerlendirme — Md.42/1-ç**  
    Aynı alan/dalda daha önce mesleki eğitim görenlerin seviyesi, önceki ders içerikleri ve başarı durumlarına göre belirlenir.

12. **Mesleki eğitim geçmişi yoksa/farklı alana geçişte seviye sınavı — Md.42/1-ç**  
    Daha önce mesleki eğitim görmeyen veya farklı alan/dalda eğitime devam etmek isteyenlerin devam edeceği sınıf seviye sınavına göre belirlenir.

## Sistem etkileri

- `TRANSFER_COURSE_COMPARISON_REQUIRED` → L2 / PROCESS
- `TRANSFER_MISSING_HOURS_RESPONSIBILITY` → L2 / PROCESS
- `TRANSFER_OBSOLETE_RESPONSIBILITY_EXEMPTION` → L2 / PROCESS
- `TRANSFER_MANDATORY_COURSE_GAP_RESPONSIBILITY` → L2 / PROCESS
- `TRANSFER_YEAR_END_SCORE_RECALCULATION` → L2 / PROCESS
- `VOCATIONAL_LEVEL_COMMISSION_REQUIRED` → L2 / ROLE+COMMISSION
- `VOCATIONAL_LEVEL_EXAM_REQUIRED` → L2 / EXAM

## Uygulama modeli

- Bu hükümler genel `TRANSFER` motorunda tutulmalı; yalnız MESEM'e özel olmayan kısımlar okul türü filtresiyle uygulanmalıdır.
- Sorumluluk/muafiyet sonucu kaynak ders + hedef ders + sınıf seviyesi + haftalık saat farkı ile açıklanabilir şekilde kaydedilmelidir.
- Komisyon/seviye sınavı yalnız Md.42/1-ç kapsam koşulu gerçekleştiğinde üretilmelidir.
- Karar anında kullanılan ders çizelgesi sürümü ve legal snapshot saklanmalıdır; geçmiş sonuçlar yeni çizelge/mevzuatla geriye dönük değiştirilmemelidir.
- Yeni kural staging → diff → Super Admin onayı → gelecek/pending işlemler zinciriyle yayımlanmalıdır.

## ARTICLE_VERIFIED sayacı

Bu belge güncel resmî hükmü atomik kurallara ayırır; ancak 2.229 master içindeki kesin `workflow_id` eşleşmeleri doğrudan teyit edilmediği için **ARTICLE_VERIFIED toplamı artırılmamıştır**.
