# Okulos — MESEM Önceki Öğrenmelerin Tanınması / Denklik Staging

Durum: **STAGING / Super Admin onayı gerekli**  
Kaynak kontrol tarihi: **25.08.2026**

## Resmî kaynaklar

- MEB Ortaöğretim Kurumları Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf — Md.63/A
- MEB Önceki Öğrenmelerin Tanınması, Denklik ve Ölçme Değerlendirme İşlemleri Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/1872.pdf — özellikle Md.5-7

## Atomik kurallar

1. **Önceki öğrenme kapsamı — OÖKY Md.63/A/1**  
   Örgün, yaygın veya serbest öğrenme yoluyla edinilmiş bilgi, beceri ve yetkinlikler kalfalık/ustalık eğitiminde denklik ve ölçme-değerlendirme yoluyla tanınabilir.

2. **Alan/dal kapsamı — Md.63/A/2**  
   Belgelendirme yalnız 3308 sayılı Kanun kapsamındaki alan/dallarda yürütülür.

3. **Sınav zamanı — Md.63/A/2**  
   Denklik sonucunda kalfalık/ustalık sınavına hak kazananların sınavı ders yılı sonu beceri sınavları veya ikinci dönemin ilk haftasındaki sorumluluk sınavı döneminde yapılır.

4. **Yetkili kurum — Md.63/A/3**  
   Hizmetler il millî eğitim müdürlüğünün belirlediği kurumlarca yürütülür; izleme/değerlendirme il millî eğitim müdürlüğündedir.

5. **Belge sonucu — Md.63/A/4**  
   Süreç sonunda başarılı adaya 3308 sayılı Kanun kapsamında seviyesine uygun belge verilir.

6. **Referans standart — Md.63/A/5**  
   Öncelikli referans yayımlanmış ulusal meslek standartları ve ulusal yeterliliklerdir.

7. **Komisyon/usul — Md.63/A/6**  
   Denklik ve sınav komisyonlarının kuruluşu ile değerlendirme kriterleri Bakanlıkça belirlenen usul ve esaslara tabidir.

8. **Değerlendirilebilir belge havuzu — Yönerge Md.5**  
   Diploma, öğrenim durum belgesi, MYK belgesi, kurs/sertifika, hizmet belgesi ve Yönergede sayılan diğer resmî belgeler önceki öğrenmenin doğrulanmasında değerlendirilebilir; eşleşme otomatik belge=muafiyet şeklinde kurulmaz.

9. **Ölçme referansı — Yönerge Md.5**  
   Denklik; ulusal meslek standartları, ulusal yeterlilikler ve ilgili alan/dal öğretim programındaki öğrenme kazanımları esas alınarak yapılır.

10. **Başvuru — Yönerge Md.6**  
    Başvuru Kalfalık/Ustalık Sınavı Başvuru Formu ile MESEM programı uygulayan okul/kuruma yapılır. Yönergede sınav dönemi başlangıcından en az bir ay önce başvuru şartı bulunur; süresi geçen başvuru sonraki sınav dönemine kalır.

11. **Tekrar sınav başvurusu — Yönerge Md.6/3**  
    Sınava katılmayan veya başarısız aday yeniden sınava girmek için yeni sınav döneminden en az bir ay önce dilekçe ile başvurur.

12. **Kalfalık sınavına erişim — Yönerge Md.7**  
    Mesleki deneyim ve/veya önceki eğitimi Yönergede öngörülen belgelerle doğrulanan aday, ilgili alan/dalın öğrenme kazanımları yönünden değerlendirilerek kalfalık sınavına alınabilir.

## Sistem etkileri

- `PRIOR_LEARNING_RECOGNITION_ENABLED` → L2 / PROCESS
- `PRIOR_LEARNING_SCOPE_3308_ONLY` → L3 / BLOCK_OUT_OF_SCOPE
- `PRIOR_LEARNING_APPLICATION_DEADLINE` → L2 / PARAMETERIZED_DEADLINE
- `PRIOR_LEARNING_DOCUMENT_EVIDENCE` → L2 / EVIDENCE
- `PRIOR_LEARNING_EQUIVALENCE_COMMISSION` → L2 / ROLE_WORKFLOW
- `PRIOR_LEARNING_EXAM_WINDOW` → L2 / CALENDAR
- `PRIOR_LEARNING_CERTIFICATE_AFTER_SUCCESS` → L3 / COMPLETION_GATE

## Uygulama notları

- Belge yüklenmesi doğrudan kalfalık/ustalık belgesi üretmemeli; **başvuru → belge doğrulama → denklik → sınav hakkı → sınav → sonuç → belge** zinciri korunmalı.
- Yaş, eğitim seviyesi, deneyim süresi, sınav yöntemi ve belge türü gibi ayrıntılar koda sabit gömülmemeli; yürürlükteki Yönerge/sınav kılavuzu sürümünden parametrelenmeli.
- Eski sınav kılavuzları yalnız tarihsel snapshot olarak tutulmalı; güncel dönem parametresi kabul edilmemeli.
- Yeni/yenilenen kurallar staging → diff → Super Admin onayı → yalnız gelecek/pending işlemler modeline tabidir.

## ARTICLE_VERIFIED

Resmî hükümler doğrulandı; ancak 2.229 master içindeki kesin `workflow_id` eşleşmesi bu turda mevcut olmadığı için **ARTICLE_VERIFIED sayacı artırılmamıştır**.
