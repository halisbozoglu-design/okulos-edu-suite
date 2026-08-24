# Okulos — MESEM Eğitim Birimi ve Personel Mevzuat Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynak

- MEB Mevzuat Sistemi — Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- İncelenen hükümler: Md.148, Md.149, Md.150, Md.151, Md.152

## Atomik kurallar

1. **Eğitim birimi asgari kapasitesi — Md.148/1**  
   Eğitim birimi en az 10 öğrencinin eğitim yapabileceği asgari standartlarda; eğitim-öğretime uygun, sağlık ve koruyucu güvenlik önlemleri alınmış ortamda oluşturulur.

2. **Donatım yeterliliği — Md.148/2**  
   Eğitim birimi beceri ve teorik eğitime uygun düzenlenir; meslek alanı/dalı ve eğitimin özelliğine göre gerekli ve yeterli araç-gereç işletme tarafından sağlanır.

3. **Ortak eğitim birimi — Md.148/3**  
   İki veya daha fazla işletme ortak eğitim birimi kurabilir.

4. **Ortak kullanım alanlarından yararlanma — Md.148/4**  
   Öğrenciler işletmenin ortak kullanım alanlarından yararlandırılır.

5. **Okul–işletme ortak planlaması — Md.148/5**  
   Eğitim birimindeki faaliyetler ilgili mevzuat ve okul–işletme planlaması doğrultusunda yürütülür; işletmenin kendi personeli için zorunlu tuttuğu uyum eğitimi öğrencilere de verilir.

6. **Eğitim kurulu oluşumu — Md.149/1**  
   Eğitim kurulu, işletme sahibi veya üst düzey yetkililerinin katılımıyla eğitim yöneticisi ve eğitim biriminde görev yapanlardan oluşur.

7. **Eğitim kurulunun görevleri — Md.149/1**  
   Kurul eğitimle ilgili iş ve işlemlerde karar alır; işletmenin eğitim politikasını ve ihtiyacını, eğitim yöntem ve ilkelerini belirler ve eğitim faaliyetlerinin sonuçlarını değerlendirir.

8. **Eğitim birimi personeli görevlendirmesi — Md.150/1**  
   İşletme sahibi/yöneticisi tarafından eğitimden sorumlu yönetici ile öğrenci sayısına göre yeterli sayıda eğitici personel/usta öğretici görevlendirilir.

9. **İşletmede yeterli personel yoksa öğretmen görevlendirmesi — Md.150/1**  
   İstenen nitelik ve sayıda eğitici personel/usta öğretici yoksa okullardan meslek dersleri öğretmenleri görevlendirilebilir.

10. **Eğitim yöneticisinin planlama sorumluluğu — Md.151/1**  
    Eğitim yöneticisi eğitim birimindeki tüm etkinliklerin planlanması, yürütülmesi ve sonuçlandırılmasını sağlar.

11. **Okulla koordinasyon — Md.151/2**  
    Eğitim yöneticisi iş birliği yaptığı okul müdürü/müdürleriyle koordineli çalışır.

12. **İşletme sahibine/yöneticisine karşı sorumluluk — Md.151/3**  
    Eğitim yöneticisi eğitimle ilgili iş ve işlemlerinden işletme sahibi/yöneticisine karşı sorumludur.

13. **Usta öğretici niteliği — Md.152/1-a**  
    Eğitim biriminde yeterli sayıda; ustalık yeterliğini kazanmış, mesleki ve teknik eğitim öğrencilerinin işyerindeki eğitiminden sorumlu, mesleki eğitim tekniklerini bilen ve uygulayan usta öğretici görevlendirilir.

14. **Eğitici personel niteliği — Md.152/1-b**  
    Mesleki yeterliğe sahip, öğrencilerin işyerindeki eğitiminden sorumlu, iş pedagojisi eğitimi almış, mesleki eğitim yöntem ve tekniklerini bilen ve uygulayan veya atölye/laboratuvar/meslek dersleri öğretmenliği yapabilme yetkisine sahip eğitici personel görevlendirilir.

## Önerilen sistem etkileri

- `ENTERPRISE_EDUCATION_UNIT_MIN_CAPACITY_10` → L2 / PROCESS
- `ENTERPRISE_EDUCATION_UNIT_SAFETY_AND_EQUIPMENT` → L3 / BLOCK_ELIGIBILITY
- `ENTERPRISE_EDUCATION_BOARD_REQUIRED` → L2 / PROCESS
- `ENTERPRISE_EDUCATION_MANAGER_REQUIRED` → L2 / PROCESS
- `ENTERPRISE_TRAINER_SUFFICIENCY_REQUIRED` → L3 / BLOCK_ELIGIBILITY
- `ENTERPRISE_TRAINER_SUBSTITUTE_TEACHER_ALLOWED` → L2 / PROCESS
- `ENTERPRISE_MASTER_TRAINER_QUALIFICATION` → L3 / BLOCK_ASSIGNMENT
- `ENTERPRISE_TRAINER_PEDAGOGY_QUALIFICATION` → L3 / BLOCK_ASSIGNMENT

## Uygulama modeli

- `education_unit` işletme uygunluk kaydından ayrı fakat ilişkili tutulmalı.
- Eğitim birimi kapasitesi, donanımı ve güvenliği işletme uygunluk denetiminin kanıt alanlarına bağlanmalı.
- Eğitim kurulu ve eğitim yöneticisi görevleri rol tabanlı atanmalı; kişi değişiklikleri tarihçeli tutulmalı.
- Usta öğretici/eğitici personel yeterlilik belgeleri sürümlü kanıt olarak saklanmalı.
- Yeterli işletme personeli bulunmaması halinde okuldan meslek dersi öğretmeni görevlendirmesi istisna akışı olarak modellenmeli.
- Yeni/yenilenen hükümler staging → diff → Super Admin onayı → gelecek/pending workflow zinciriyle yayımlanmalı; tamamlanmış eğitim/denetim kayıtları geriye dönük değiştirilmemeli.

## ARTICLE_VERIFIED sayacı

Resmî maddeler atomik seviyede doğrulandı. Ancak 2.229 master kaydındaki kesin `workflow_id` eşleşmeleri bu turda doğrulanamadığı için **ARTICLE_VERIFIED toplamı artırılmamıştır**.
