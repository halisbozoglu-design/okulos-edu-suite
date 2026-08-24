# Okulos — MESEM İşletme Seçimi/Uygunluğu Mevzuat Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynak

- MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- İncelenen hükümler: Md.135-142

## Atomik kurallar

1. **Öğrenci grubu — Md.135/1**  
   Aynı meslek alan/dalında işletmede beceri eğitimi gören **en fazla 12 kişilik** öğrenci grubu için işletme en az bir eğitici personel veya usta öğretici görevlendirir.

2. **İşletmeye öğrenci seçme komisyonu — Md.136/1-2**  
   Talep kapasiteyi aşıyorsa koordinatör müdür yardımcısı başkanlığında en az üç üyeli komisyon kurulur. Sıralamada alt sınıf yılsonu başarı puanları, disiplin durumu ve genel durum dikkate alınır.

3. **Sıralama dışı öncelikli öğrenciler — Md.136/3**  
   Yönetmelikte sayılan şehit/gazi çocukları, eğitim tedbiri kararı verilen çocuklar ve koruma altındaki öğrenciler işletmede mesleki eğitime gönderilirken sıralamaya tabi tutulmaz.

4. **Planlama ve ortak sorumluluk — Md.137**  
   İşletmedeki mesleki eğitimin planlanması, uygulanması ve değerlendirilmesi okul müdürü ile işletme yetkilisince yapılır; program uygunluğundan görev/yetki alanları ölçüsünde birlikte sorumludurlar.

5. **Seçmeli meslek dersleri — Md.138**  
   Seçmeli meslek dersleri işletmede yapılabilir; gerektiğinde yarıyıl/yaz tatili ve hafta sonlarında yoğunlaştırılabilir.

6. **İşletme bildirim takvimi — Md.139**  
   Yükümlü işletme listeleri şubat ayında il millî eğitim müdürlüğüne bildirilir. Personel sayısında esas dönem normal işletmelerde ocak, yaz mevsiminde çalışan işletmelerde temmuz verileridir.

7. **İl/ilçe işletme belirleme komisyonu — Md.140/1**  
   Komisyon mesleki eğitimden sorumlu şube müdürü başkanlığında ilgili okul yönetimi/alan temsilcileri, sektör/oda/işveren ve İŞKUR temsilcilerinden oluşur; sağlık sektörü için özel temsil yapısı uygulanır.

8. **Küçük işletmeler için okul komisyonu — Md.140/2**  
   3308 sayılı Kanunda belirtilen sayıdan az personel çalıştıran ve okula yazılı başvuran işletmeler için okul müdürlüğünce alan/bölüm, atölye-laboratuvar şefi ve alan öğretmeninden işletme belirleme komisyonu kurulur.

9. **İşletmenin uygunluğu ve kapasitesi — Md.141/1**  
   Mesleki eğitim/staj/tamamlayıcı eğitim yapacak işletmelerin eğitime uygunluğu ve öğrenci kapasitesi işletme belirleme komisyonunca tespit edilir; raporun örneği il MEM'e gönderilir.

10. **Yeni meslek alan/dalları — Md.141/2**  
    İldeki işletmelerde ihtiyaç duyulan yeni meslek alan/dalları İl İstihdam ve Mesleki Eğitim Kurulunca karara bağlanır ve Bakanlığa önerilir.

11. **İşletme uygunluk kriterleri — Md.142/1-a**  
    En az şu kontroller yapılır: programa uygun üretim/hizmet, programın en az **%80'ini** uygulayacak donanım, gerektiğinde eğitim birimi, yeterli usta öğretici/eğitici personel, öğrenci sosyal alanları, il dışı uygulamalarda konaklama-yemek, önceki yıl uygulama uygunluğu ve sağlık-güvenlik koşulları.

12. **Kontenjan dağılımı — Md.142/1-b**  
    Alan/dallara göre işletmede eğitim görecek resmî/özel okul toplam öğrenci sayısı ve okullara dağılım komisyonca belirlenir.

13. **Tutanak ve yıllık değerlendirme — Md.142/1-c,ç**  
    İşletme uygunluğu tutanakla belirlenir; ders yılı sonunda uygulama değerlendirilerek gelecek yıla ilişkin öneri raporu hazırlanır ve MEM'e teslim edilir.

14. **Yıllık uygunluk/kontenjan takvimi — Md.142/1-d, 2**  
    İşletme uygunluğu ve öğrenci sayıları **her yıl mayıs içinde**; yoğunlaştırılmış programlarda **şubat ayında** belirlenir. MEM, hangi işletmeye hangi alan/daldan kaç öğrenci gönderileceği raporunu **haziran sonuna kadar**; yoğunlaştırılmış programlarda **mart içinde** okullara gönderir.

15. **Coğrafi/sektörel koordinasyon — Md.142/3**  
    İşletme belirlemede yalnız il sınırı değil, sektörel yatırımların yoğunlaştığı bölgeler de dikkate alınır; gerektiğinde iller arası eşgüdüm kurulur.

## Sistem etkileri

- `MESEM_GROUP_MAX_12_PER_TRAINER` → L2 / CAPACITY
- `MESEM_ENTERPRISE_SELECTION_COMMISSION` → L2 / PROCESS
- `MESEM_PRIORITY_STUDENT_NO_RANKING` → L3 / ELIGIBILITY
- `MESEM_ENTERPRISE_FEBRUARY_NOTIFICATION` → L1 / ANNUAL_PARAMETER
- `MESEM_ENTERPRISE_MIN_PROGRAM_COVERAGE_80` → L3 / BLOCK_ENTERPRISE_APPROVAL
- `MESEM_ENTERPRISE_HEALTH_SAFETY_REQUIRED` → L3 / BLOCK_ENTERPRISE_APPROVAL
- `MESEM_ENTERPRISE_MAY_CAPACITY_REVIEW` → L1 / ANNUAL_PARAMETER
- `MESEM_MEM_JUNE_ALLOCATION_DEADLINE` → L1 / ANNUAL_PARAMETER

## Model notları

- Mayıs/Haziran/Şubat/Mart tarihleri kalıcı kod sabiti yerine sürümlü mevzuat parametresi olarak tutulmalı.
- İl/ilçe komisyonu ile okul bünyesinde oluşturulan küçük işletme komisyonu aynı kurul kaydına indirgenmemeli.
- Uygunluk kararı işletme + alan/dal bazında tutulmalı; tek bir işletme için bütün alanlara otomatik uygunluk verilmemeli.
- `%80 program coverage`, `usta_ogretici_var`, `isg_uygun`, `egitim_birimi_gerekli_ve_var` gibi kontroller kanıt/raporla ilişkilendirilmeli.
- Yeni/değişen kurallar staging → etki analizi → Super Admin onayı → yalnız gelecekteki/pending akışlar şeklinde yayımlanmalı.
- Tamamlanmış işletme uygunluk raporları ve geçmiş öğrenci yerleştirmeleri geriye dönük değiştirilmemeli.

## ARTICLE_VERIFIED sayacı

Resmî hükümler doğrulandı ancak 2.229 satırlık kalıcı masterdaki kesin `workflow_id` eşleşmeleri bu turda mevcut olmadığı için **ARTICLE_VERIFIED toplamı artırılmamıştır**.
