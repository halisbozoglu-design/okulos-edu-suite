# SmartBoard platform + sınıf etkileşimi kanonik modeli

## 1. Temel karar

SmartBoard tek bir donanım nesline veya tek bir işletim sistemine bağlanmaz.

- Türkiye kurulumlarında ana hedef **Pardus/ETAP**.
- FATİH / ETAP faz 1, 2, 3, 4 ve farklı üretici donanımları tek yetenek modeli üzerinden çalışır.
- Eski cihazlarda özellikler sessizce kırılmaz; gerekirse `FALLBACK` seviyesine iner.
- Uluslararası kurulumlar için **Windows runtime ayrı ve eşdeğer bir platformdur**.
- Kullanıcı arayüzü sabit çözünürlük varsaymaz; ekranın gerçek genişlik, yükseklik, ölçek, dokunma ve GPU yeteneklerine göre davranır.
- Lovable token çalışma zamanında kullanılmaz.

## 2. Faz bağımsız çalışma

Her cihaz açılışta veya donanım değişiminden sonra kendi yetenek profilini bildirir:

```text
operating_system
os_version
fatih_phase
architecture
display_width / display_height / display_scale
touch_points
camera / microphone / speaker
wifi / ethernet / GPU
RTC / WOL / S5-WOL / AC Restore
WebRTC / Miracast / AirPlay bridge / Google Cast bridge
screen capture / remote control
```

Bunlardan `LEGACY / STANDARD / ENHANCED / PREMIUM` capability tier üretilir.

Kural:

```text
özellik donanımda native çalışıyorsa -> NATIVE
native değil ama güvenli alternatif varsa -> FALLBACK
hiç mümkün değilse -> DISABLED + yönetim uyarısı
```

Örnek:

- Eski Faz-1 tahta WebRTC'de zorlanıyorsa öğretmen yansıtması Local Hub üzerinden düşük FPS güvenli moda düşebilir.
- GPU yoksa beyaz tahta ve matematik araçları çalışmaya devam eder; yalnız ağır görsel efektler CPU-safe renderer'a düşer.
- RTC wake yoksa Local Hub WOL fallback kullanılır.
- WOL da yoksa yönetim ekranında cihazın sabah otomatik açılma kapasitesi eksik görünür.

Ama **beyaz tahta, temel matematik araçları, PDF, sunu, video, mesaj ve ders erişimi eski cihazlarda da fonksiyonel kalmalıdır.**

## 3. Öğretmen cihazı: şimdilik ana paylaşım modeli

İlk ürün davranışı, her öğrencinin ekranını sınıfça yönetmek yerine öğretmenin kendi cihazına odaklanır.

Öğretmen:

- tabletinden,
- dizüstü bilgisayarından,
- gerekirse telefonundan

kendi aktif dersinin SmartBoard'una ekranını yansıtabilir.

Tercih sırası cihaz yeteneklerine göre belirlenir:

```text
WebRTC / Local Hub
Miracast
AirPlay bridge
Google Cast bridge
Local Hub frame-stream fallback
```

Öğretmen ekranının SmartBoard'a yansıtılması, ders yetki motorundan bağımsız değildir. Sistem öğretmenin o anda hangi fiziksel odada dersinin olduğunu çözerek hedef tahtayı belirler.

`smartboard_cast_sessions` aşağıdakileri audit eder:

- öğretmen
- tahta
- ders
- kaynak cihaz türü
- transport
- başlangıç / bitiş
- negotiated resolution / FPS
- sonuç

## 4. Öğrenci telefonu: hafif katılım, ekran paylaşımı değil

Şimdilik öğrencinin telefonundan beklenen temel kullanım:

- A/B/C/D çoktan seçmeli cevap
- hızlı oylama
- anket
- doğru / yanlış
- “anladım / emin değilim / tekrar et” quick-check
- kısa metin cevap

Öğrencinin ekranını tahtaya yansıtması varsayılan değildir.

Öğretmen bir `classroom_response_session` açar. Sistem kısa bir katılım kodu üretir. Öğrenci telefonundan ilgili oturuma girip cevap verir. Öğretmen tahtada veya tabletinde canlı dağılımı görebilir.

Oturum türleri:

```text
POLL
MULTIPLE_CHOICE
QUICK_CHECK
SURVEY
```

Yanıtlar iki modda tutulabilir:

1. OkulOS hesabı varsa `respondent_user_id`
2. anonim/ephemeral kullanımda kişisel veri yerine tek oturumluk `participant_key`

Ham yanıtları öğretmen/yönetim görebilir; sınıf ekranında yalnız anonim toplu sonuç gösterilebilir.

## 5. SmartBoard Beyaz Tahta + matematik / ders araçları

SmartBoard'un kendi beyaz tahta uygulaması Pardus ve Windows'ta aynı veri modelini kullanmalıdır.

Çekirdek özellikler:

- çoklu kalem / silgi
- şekiller
- seçim / taşıma / kopyalama
- katmanlar
- geri al / zaman çizelgesi
- PDF / ekran üstü anotasyon
- dışa aktarma
- ikinci ekran / presenter modu

Matematik araçları gömülü olmalıdır:

- cetvel
- açıölçer
- pergel
- koordinat düzlemi
- geometrik şekiller
- grafik çizimi
- kareli / noktalı / izometrik zemin

GeoGebra gibi uygulamalar cihaz tier'i uygunsa hazır bulunabilir; ancak SmartBoard'un temel matematik çizim araçları üçüncü taraf uygulama olmadan da çalışmalıdır.

## 6. Pardus gömülü eğitim paketi

Pardus/ETAP imajı ilk kurulumdan sonra öğretmenin temel sınıf ihtiyacı için ayrıca paket aramaya zorlamamalıdır.

Zorunlu çekirdek:

- SmartBoard Whiteboard
- SmartBoard Math Tools
- LibreOffice Writer
- LibreOffice Calc
- LibreOffice Impress
- PDF görüntüleme / anotasyon
- VLC
- ZIP / RAR / 7z
- tarayıcı

Önerilen / capability uygun:

- Xournal++
- GeoGebra
- fen / coğrafya / dil araçları
- ekran görüntüsü / basit medya dönüştürme yardımcıları

`smartboard_app_catalog` Pardus ve Windows paket karşılıklarını aynı mantıksal `app_code` altında tutar.

## 7. OTA / uzaktan uygulama gönderme

OTA iki ayrı hattır:

### SmartBoard uygulama OTA

Sık güncellenebilir:

- whiteboard
- matematik araçları
- board shell
- Local Hub agent
- signage
- cast istemcisi

Kanallar:

```text
PILOT -> BETA -> STABLE
```

### OS/system OTA

Daha kontrollü:

- Pardus sistem paketleri
- kernel
- sürücüler
- Windows agent/runtime güncellemeleri

Güncelleme:

- SHA-256 doğrulamalı
- imzalı
- health-check'li
- rollback destekli
- Local Hub cache ile okulda bir kez indirilen

olmalıdır.

Eski FATİH fazlarında yeni sürüm minimum capability tier'i karşılamıyorsa cihaz o sürüme zorlanmaz.

## 8. Çözünürlük ve ekran oranı

UI hiçbir zaman `1920x1080` varsayımına sabitlenmez.

`smartboard_resolution_profile()` çıktısı ile:

- gerçek width/height
- scale
- aspect bucket
- touch target
- GPU tercihi

hesaplanır.

Aspect bucket örnekleri:

```text
ULTRAWIDE
WIDE
LANDSCAPE
SQUARE_OR_PORTRAIT
UNKNOWN
```

Büyük dokunmatik ekranda minimum dokunma hedefi masaüstü web UI'dan daha büyük tutulur.

## 9. Yönetim ve içerik gönderme ile birliktelik

Bu model aşağıdaki cihaz komutlarıyla birlikte çalışmalıdır:

- WAKE
- LOCK / UNLOCK
- RESTART / SHUTDOWN / KEEP_AWAKE
- SCREEN_VIEW_START / STOP
- REMOTE_CONTROL_START / STOP
- OPEN_FILE
- OPEN_PRESENTATION
- PLAY_VIDEO
- SHOW_IMAGE
- SHOW_MESSAGE
- START_SIGNAGE
- START_SCHOOL_TV
- START_CAST_SESSION
- STOP_CAST_SESSION
- OTA_INSTALL

Dosya ve yayın hedefleri:

- tek tahta
- fiziksel oda
- o yılın şubesi (oda resolver üzerinden)
- kat
- cihaz grubu
- tüm kurum

olabilir.

## 10. Ürün önceliği

Şimdilik öncelik sırası:

1. öğretmen tablet/dizüstü -> kendi ders tahtasına güvenli yansıtma
2. öğrenci telefonu -> oylama / çoktan seçmeli / anket / quick-check
3. SmartBoard Whiteboard + matematik araçlarının Pardus içinde gömülü gelmesi
4. temel Pardus sınıf uygulamalarının imajda hazır olması
5. Pardus FATİH fazlarında capability-driven fallback
6. Windows runtime parity
7. otomatik çözünürlük / touch uyumu
8. OTA + uygulama paketi yönetimi
9. daha sonra isteğe bağlı moderasyonlu öğrenci ekran paylaşımı

Bu sıra öğretmenin günlük kullanımını sade tutar; her öğrencinin ekran paylaşmasını zorunlu hale getirmeden telefonları etkileşim aracı olarak değerlendirir.
