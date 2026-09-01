# OkulOS — AI Destekli Ölçme-Değerlendirme ve Kişisel Video Platformu

Bu alt sistem OkulOS içinde geliştirilir. Ayrı bir ürün/depo oluşturulmaz; kurum, kullanıcı, öğrenci, öğretmen, sınıf ve ders verileri OkulOS çekirdeğiyle ortak kullanılır.

## Değişmez ürün kuralları

1. Açık uçlu yazılı kağıdında resmi puan/rubrik değerlendirmesi öğretmen onayıyla kesinleşir.
2. Ödev, deneme, ünite sorusu, quiz ve diğer çalışmalarda öğretmen onay kuyruğu oluşturulmaz.
3. Video hiçbir çalışma için otomatik render edilmez. AI yalnız senaryo/highlight hazırlığını yapar; öğrenci/kağıt sahibi süre içinde isterse TTS + MP4 üretilir.
4. Okul kullanımında kimlik önce öğrenci listesi + okul numarasıyla doğrulanır; eşleşme yoksa uygun profil/üyelik verisine dönülür. Sesli hitap varsayılan olarak yalnız ilk isimdir.
5. OCR ile kağıttan okunan isim tek başına kimlik/hitap kaynağı değildir.
6. Öğrenci cevabı yalnız ayrılmış cevap kutusunda aranmaz; sayfanın tümü, taşan cevaplar ve sayfalar arası devam ilişkileri incelenir.
7. GPT öğretmenin kesinleştirdiği puanı veya onaylı rubriği değiştiremez.
8. Düşük güvenli/çelişkili OCR kritik alanları otomatik kesinleştirilmez.
9. Talep edilmeyen video için TTS, FFmpeg işi veya video depolaması açılmaz.
10. Üretilen video kullanıcının cihazına indirilir; sunucudaki geçici kopya saklama süresi sonunda silinir.

## Uygulama sırası

### P0
1. Kurum, kullanıcı, rol ve yetki sistemi
2. PostgreSQL/Supabase kalıcı veri modeli
3. Oturum, sahiplik ve API güvenliği
4. Dosya yükleme/indirme güvenliği

### P1
5. Gerçek OCR üretim kurulumu ve ortak polygon şeması
6. Türkçe el yazısı benchmark sistemi
7. Soru-cevap alanı ve taşan cevap eşleştirme motoru
8. Rubrik, puanlama ve yalnız yazılı kağıdı öğretmen onayı
9. GPT çıktı doğrulama/güven kapısı
10. İsteğe bağlı video üretimi ve dayanıklı iş kuyruğu
11. Ses-kelime-highlight senkronizasyon benchmarkı
12. Loglama, yedekleme, izleme ve pilot kabulü

### P2
13. Soru bazlı itiraz ve yeniden inceleme
14. Benzer cevap tutarlılığı + kör değerlendirme
15. Öğretmen zaman tasarrufu / yarışma kanıt paneli
16. Kurum bazlı GPT/OCR/TTS/video maliyet-kota motoru

## Geliştirme yöntemi

- Her basamak ayrı commit/PR olarak tamamlanır.
- Bir basamak kabul testini geçmeden sonraki basamağa başlanmaz.
- Üretim verisiyle geri dönüşü zor işlemler migration ve rollback planı olmadan yapılmaz.
- Lovable AI build mesajları kullanılmadan GitHub üzerinden kodlanabilir. Bu depo Lovable projesine bağlıdır; bağlı dala gönderilen commitler Lovable editörüne senkron olur.

## Çalışma dalı

`feature/assessment-ai-platform`

Onaylanan basamaklar PR ile `main` dalına alınır.