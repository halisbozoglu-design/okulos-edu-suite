# Rehberlik yıllık akış ↔ SmartBoard barkod erişimi

Kanonik kural: rehber öğretmen kendi OkulOS ekranından yıllık/aylık rehberlik akışına sınıf etkinliği ekler. Etkinlik; eğitim-öğretim yılı, rehber öğretmen, şube, fiziksel oda, tarih, başlangıç-bitiş saati ve etkinlik başlığıyla kaydedilir.

Örnek:

```text
12.10.2026 10:20-11:00
7/B
Derslik 203
Rehber öğretmen: X
Etkinlik: Akran Nezaketi Sınıf Çalışması
Hatırlatma: 30 dk önce
```

Sistem `guidance_activity_reminders` ile rehber öğretmene yaklaşan etkinliği hatırlatabilecek zamanlanmış kayıt üretir. Rehber öğretmen sınıfa geldiğinde o odadaki SmartBoard barkodunu OkulOS mobil arayüzünden tarar.

Sunucu aynı anda şu eşleşmeyi arar:

```text
kullanıcı = etkinliğin counselor_user_id
+ tarih = activity_date
+ saat = starts_at..ends_at
+ taranan SmartBoard'un physical_room_id = etkinliğin physical_room_id
+ etkinlik active=true
```

Eşleşme varsa ayrıca serbest metin gerekçe istenmez. Sistem audit gerekçesini otomatik üretir:

```text
Takvim: 7/B — Akran Nezaketi Sınıf Çalışması
```

Karar kodu `GUIDANCE_CALENDAR_ACTIVITY` olur ve `guidance_activity_id` açma loguna bağlanır. Böylece müdürlük ekranında rehber öğretmenin tahtayı neden açtığı sonradan tahmin edilmez; yıllık akıştaki gerçek etkinliğe bağlanır.

Takvimde eşleşen etkinlik yoksa önceki güvenlik kuralı korunur: ders öğretmeni/geçerli substitute o ders oturumunda tahtayı daha önce açmışsa rehberlik erişimi verilebilir; aksi halde rehber öğretmen manuel gerekçe girmeden tahtayı açamaz.

Müdür ve müdür yardımcısı için iki ayrı kullanım ayrılır. Genel cihaz yönetimi/uzaktan açma/yerinde serbest açma `DEVICE_ACCESS` olarak loglanır ve ders açılışı sayılmaz. Müdür veya müdür yardımcısı kendi ders programındaki derse giriyorsa ya da sistemde o ders için kayıtlı substitute olarak boş dersi dolduruyorsa barkod taraması `INSTRUCTIONAL` olarak loglanır; böylece yöneticilerin fiilen girdikleri ders saatleri de doğru tutulur.
