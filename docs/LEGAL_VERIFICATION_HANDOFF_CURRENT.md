# Okulos Mevzuat Doğrulama — Sohbet Devam/Handoff Dosyası

Güncelleme: 2026-08-27
Durum: AKTİF — başka sohbette kaldığı yerden devam için kanonik handoff
Repo: halisbozoglu-design/okulos-edu-suite

## 1. Yeni sohbette ilk yapılacaklar

1. Yalnız bu repo üzerinde çalış: `halisbozoglu-design/okulos-edu-suite`.
2. Kullanıcı `Devam` / `Devam et` dediğinde soru sormadan bir sonraki mevzuat batchine başla.
3. Cevabın ilk satırı: `Kullandığım model: GPT-5.6 Sol`.
4. Önce bu dosyayı ve son progress delta dosyasını oku.
5. Son tamamlanmış batch V36'dır. V37 henüz oluşturulmadı.
6. Migration mümkünse 0; zorunlu değilse yeni migration açma.

## 2. Kesin güncel sayaç

- Master workflow toplamı: **2.229**
- ARTICLE_VERIFIED: **453 / 2.229 = %20,32**
- ARTICLE_VERIFIED kalan: **1.776**
- Büyük atomik mevzuat havuzu: **4.155**
- Son tamamlanan batch: **V36**
- Migration: **0**

Bu sayılar geriye alınmayacak ve eski sohbetlerdeki 390/410/420 vb. sayaçlara dönülmeyecek.

## 3. Son tamamlanan V36

Coverage:
- `docs/legal-article-verified-focused-deepening-batch-100plus-v36.md`
- commit: `f30bc4f2e261bf37bc72db12dcf0b88c72c1279e`

Verification:
- `docs/legal-article-verified-batch-v36.md`
- commit: `d028010fb7988d84d6544a3de2ed2e63582068ea`

Progress:
- `docs/legal-verification-progress-v36-delta.json`
- commit: `2a3f4ec5faead29c0d3b85688ff96c6dbdf7f378`

V36 yeni ARTICLE_VERIFIED:
- `HB-2209` — Şeflerin Belirlenmesi ve Teklifi Komisyonu (MTAL) → güncel OÖKY Md.84/B/3.

V36 sonunda:
- ARTICLE_VERIFIED = **453**
- atom havuzu = **4.155**

## 4. Bir sonraki tur: V37

Öncelik yeni mevzuat ailesi açmak değil, mevcut 4.155 atom ile 2.229 master workflow arasındaki exact bağları artırmaktır.

V37 önerilen odak:
- BİLSEM kurulları
- özel yetenek sınavı / değerlendirme komisyonları
- özel eğitim komisyonları
- kalan OÖKY/MTAL named commission kayıtları
- yüksek güvenli öğrenci işlemleri / kurul-komisyon kayıtları

Hedef:
- en az 100 yeni/destek atomu; ideal 120+
- ARTICLE_VERIFIED artışı sadece exact eşleşmede
- oranı temiz şekilde %20,5+ yönüne taşımak

## 5. ARTICLE_VERIFIED için değişmez kural

Sayaç SADECE şu üçü aynı anda varsa artırılır:

`workflow_id + güncel resmî kaynak + exact madde/fıkra`

Ek kurallar:
- Aynı workflow ikinci kez sayılmaz.
- Handbook/el kitabı tek başına son hukuki otorite değildir.
- Mülga/eski mevzuat current authority olarak kullanılmaz.
- Handbookta yazan ay/saat/tarih, güncel mevzuatta evrensel yükümlülük değilse ARTICLE_VERIFIED yapılmaz.
- Bir workflow birden fazla farklı hukuki işi birleştiriyorsa `WITHHELD/SPLIT` yapılır; sessizce normalize edilmez.
- Yıllık kılavuz, takvim, parasal limit, katsayı, kira/ihale eşikleri `YEAR_PARAMETER` veya versioned child olmalıdır.

## 6. Kaynak hiyerarşisi

`Kanun / CBK > güncel Yönetmelik > Yönerge/Usul-Esas > Genelge > yıllık kılavuz > yıllık çalışma takvimi > İl/İlçe yazısı > el kitabı/rehber`

Resmî kaynak önceliği:
- Resmî Gazete
- mevzuat.gov.tr
- MEB Mevzuat Sistemi
- MEB/ORGM/MTEGM/TKB resmî PDF ve kılavuzları
- ilgili resmî kurum siteleri

## 7. Bilinen kritik guard / bekleyen sorunlar

- Eski pansiyon/yatılı kaynak `716.pdf` current authority olarak kullanılmayacak; güncel 2016+ konsolide yönetmelik esas.
- V11 içindeki eski `BOARD-*` kayıtları final audit'te `ESKİ KAYNAK/YÜRÜRLÜKTEN KALKMIŞ` olarak düzeltilmeli.
- `HB-0406`: komisyon doğru fakat legacy “Eylül” zamanlaması güncel Md.8'de evrensel süre değil → withheld.
- `HB-0431`: OAB genel kurul + yönetim + denetim tek satır → split tercih.
- `HB-0716`: legacy Ocak zamanlaması güncel OAB ilan hükmüyle uyuşmuyor → withheld.
- `HB-2204`: AÖİHL Yüz Yüze Eğitim Denklik Komisyonu başlığı 2024 Açık Öğretim Kurumları Yönetmeliği Md.25/2-a kapsamıyla birebir değil → withheld.
- `HB-2205`: “Alan/Dal Kontenjan Belirleme Komisyonu” organ adı güncel OÖKY ile birebir değil → withheld.
- `HB-2206`: koordinatör öğretmen komisyonu exact güncel hüküm hâlâ çözülmeli.
- `HB-2222`: HEM kurul adı güncel mevzuat organ adıyla birebir değil → withheld.
- `HB-2229`: Okul Sağlığı Yönetim Ekibi exact güncel kuruluş maddesi bulunmadan sayılmayacak.
- RAM handbookundaki “her gün 13:30” gibi sabit saatler yasal evrensel yükümlülük sayılmayacak.
- OÖKY Md.22/9 için eski/güncel konsolide metin çelişkisi görüldü; current Resmî Gazete zinciriyle reconcile edilmeden ARTICLE_VERIFIED yapılmayacak.

## 8. Yakın dönem ARTICLE_VERIFIED kilometre taşları

- V26: 414
- V27: 420
- V28: 425
- V29: 426
- V30: 429
- V31: 430
- V32: 435
- V33: 446
- V34: 451
- V35: 452
- V36: **453**

Bu zincir duplicate guard uygulanmış sayaçtır.

## 9. Genel işleme mimarisi

`GLOBAL SCAN → PARSE → CENTRAL LEGAL DIFF → SA REVIEW → SCHOOL TYPE FILTER → FEATURE FILTER → GEO FILTER → WORKFLOW/MODULE FILTER → ROLE/AUDIENCE ROUTE`

Mevzuat değişikliği:
`NEW DOCUMENT → PARSE → DRAFT/STAGING → CHANGE REVIEW → APPROVED → PUBLISHED`

Etki seviyeleri:
- L0 SAME/INFO
- L1 PARAMETER
- L2 PROCESS
- L3 REMOVED/CONFLICT
- NEW

Historical completed task/notice asla geriye dönük mutate edilmez.

## 10. Kurum/tenant mantığı

`MASTER WORKFLOW → SCHOOL TYPE → TENANT SETTINGS → ANNUAL CALENDAR → YEAR-SPECIFIC INSTANCES`

İlke: **Tarama global, işleme filtreli, bildirim hedefli.**

Roller önce, kişi sonra atanır. Tenant override immutable core/source'u değiştirmez.

## 11. Görev yaşam döngüsü

`Planlandı → Atandı → Devam ediyor → Kanıt/Çıktı → Onay → Tamamlandı`

Ek durumlar: gecikti / uygulanmaz.
Kanıt: tutanak, resmî yazı, fotoğraf, takvim, rapor, ekran görüntüsü vb.

## 12. Final audit — en sonda

Kapsam ve exact verification yeterli düzeye geldiğinde tüm 2.229 workflow için tek global audit yapılacak:

- DOĞRU
- EKSİK
- ESKİ KAYNAK
- ÇAKIŞMA
- YANLIŞ MADDE
- TAMAM

Final audit tamamlanmadan sistem “tam mevzuat doğrulanmış” sayılmayacak.

## 13. Yeni sohbette kullanılacak kısa devam komutu

Yeni sohbet bu dosyayı okuduktan sonra kullanıcı yalnızca `Devam` derse:

- V36'dan sonra V37 başlat.
- BİLSEM + özel yetenek/özel eğitim + OÖKY/MTAL named commission bloklarını tara.
- 100+ atom oluştur.
- Exact source/article/paragraph olan workflowları ARTICLE_VERIFIED yap.
- duplicate ve old-source guard uygula.
- yeni `legal-...-v37.md`, `legal-article-verified-batch-v37.md`, `legal-verification-progress-v37-delta.json` dosyalarını repo'ya yaz.
- final yanıtta atom sayısı, yeni ARTICLE_VERIFIED sayısı/oranı, kalan workflow, dosyalar, commit SHA'ları ve migration sayısını kısa ver.

## 14. Repo sınırı

Bu sohbetin mevzuat/doğrulama işleri SADECE:
`halisbozoglu-design/okulos-edu-suite`

`okul-kapisi` reposuna yazma. Servis GPS/mobil uygulama başka çalışma alanıdır; yalnız okul yönetimi mevzuatı açısından ilgiliyse burada hukuki kural olarak ele alınabilir.
