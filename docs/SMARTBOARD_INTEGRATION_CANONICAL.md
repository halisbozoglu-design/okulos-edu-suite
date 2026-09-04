# OkulOS EDU Suite ↔ SmartBoard kanonik entegrasyon modeli

Durum: AKTİF

## Değişmez kurallar

1. **OkulOS EDU Suite ana veri kaynağıdır.** Öğretmen, kullanıcı/rol, eğitim-öğretim yılı, haftalık ders programı, DYK/kurs, öğretmen devamsızlığı ve yerine görevlendirme OkulOS tarafından belirlenir.
2. **SmartBoard fiziksel cihaz/tahta çalışma katmanıdır.** Aynı öğretmen veya şube SmartBoard tarafında ikinci kez elle tanımlanmaz.
3. **Akıllı tahta şubeye değil fiziksel odaya bağlanır.** `smartboard_device -> physical_room` kalıcıya yakın ilişkidir.
4. **Şube adı kalıcı kimlik değildir.** Her eğitim-öğretim yılında yeni `section_instance` üretilir. 2026-2027 `9/A` ile 2027-2028 `9/A` aynı kayıt değildir.
5. Bir fiziksel oda bir sonraki eğitim-öğretim yılında tamamen farklı bir şube adı alabilir. Tahta yeniden eşleştirilmez; yeni yılın `section_room_placement` kaydı değişir.
6. Ders laboratuvar/atölye/konferans salonu gibi başka yerdeyse ders programındaki `physical_room_id` override'ı şubenin ana dersliğinin önüne geçer.
7. Yeni eğitim yılı başında önceki yılın şube→oda eşleşmesi **sessizce miras alınmaz**. Eksik yerleşimler readiness gate tarafından bloklanır.
8. **Lovable token/API token entegrasyon sözleşmesinde kullanılmaz.** Git repository/Lovable editörü geliştirme ortamı olabilir; çalışma zamanında SmartBoard↔OkulOS veri veya kimlik bağlantısı Lovable token'a bağlı olamaz.

## Çözüm zinciri

```text
OkulOS öğretmen hesabı
  -> teacher_schedule
  -> section_instance (o eğitim yılına ait)
  -> dersin explicit physical_room override'ı varsa onu kullan
  -> yoksa section_room_placement
  -> physical_room
  -> smartboard_room_binding
  -> SmartBoard cihazı
```

Örnek:

```text
2026-2027
9/A -> Oda 201 -> SB-201

2027-2028
10/B -> Oda 201 -> aynı SB-201

2028-2029
11/C -> Oda 201 -> aynı SB-201
```

Burada `SB-201` fiziksel oda ile bağlı kalır. `9/A`, `10/B`, `11/C` yıllık akademik yerleşimdir.

## Ders programı ve yetki

Bir ders slotunda SmartBoard'un açma yetkisi doğrudan "öğretmen X -> tahta Y" şeklinde tutulmaz. Yetki o an dinamik çözülür:

```text
schedule slot
 + tarih
 + section instance
 + room resolver
 + öğretmen bulunabilirliği
 + varsa substitute assignment
 + gerekiyorsa duty scope
 = o ders için yetkili aktörler ve hedef SmartBoard
```

Öğretmen raporlu/izinli/görevli ve yerine görevlendirme yoksa ders normal öğretmen oturumu olarak açılmaz. Yerine görevlendirme yapılırsa hedef tahta aynı oda çözümünden bulunur ve yetkili aktör replacement öğretmen olur.

## Barkodla tahta açma ve izin motoru

Her SmartBoard fiziksel cihaz kaydında benzersiz bir `barcode_public_id` bulunur. Fiziksel olarak tahtaya yapıştırılan barkod/QR bu kimliği taşır. Öğretmen OkulOS öğretmen arayüzünden kamerayı açar, barkodu okutur ve sunucu o anda **kim + hangi tahta + hangi ders + hangi yetki** olduğunu yeniden çözer. Barkod tek başına yetki vermez.

Her tarama `smartboard_unlock_events` tablosuna **sunucu zamanı** ile kaydedilir. Başarılı ve reddedilmiş denemeler birlikte audit edilir. Başarılı karar ayrıca `smartboard_device_commands` tablosuna kısa ömürlü bir unlock komutu üretir; Local Hub/tahta yalnız bu komutu tüketerek gerçekten açılır. Kullanıcının telefon saati karar verici değildir.

Kanonik izin matrisi:

```text
Dersin programlı öğretmeni
  -> yalnız o anda dersinin bulunduğu fiziksel oda/tahtayı açabilir
  -> GRANTED / SCHEDULED_TEACHER_CURRENT_LESSON

Müdür / Müdür yardımcısı
  -> kurumundaki herhangi bir tahtayı uzaktan veya yerinde istediği zaman yönetebilir/açabilir
  -> bu işlem DEVICE_ACCESS olarak loglanır ve ders açılışı sayılmaz
  -> ancak kendi programındaki derse giriyorsa barkod taraması INSTRUCTIONAL sayılır
  -> kayıtlı substitute olarak boş dersi dolduruyorsa yine INSTRUCTIONAL sayılır
  -> böylece yöneticinin fiilen girdiği ders ayrı, cihaz yönetimi ayrı tutulur

Rehber öğretmen
  -> yıllık/aylık rehberlik akışında kendisine tanımlı sınıf etkinliği varsa, etkinliğin tarih-saat-oda eşleşmesi barkodla otomatik çözülür
  -> gerekçe otomatik olarak `Takvim: <sınıf> — <etkinlik>` biçiminde doldurulur
  -> karar GUIDANCE_CALENDAR_ACTIVITY olur
  -> takvim etkinliği yoksa, aynı ders oturumunda ders öğretmeni/kayıtlı substitute daha önce açtıysa erişebilir
  -> öğretmen daha önce açmadıysa kendi ekranında gerekçe girmek ZORUNDADIR
  -> gerekçe yoksa DENIED / GUIDANCE_REASON_REQUIRED
  -> gerekçe varsa GRANTED / GUIDANCE_OVERRIDE_WITH_REASON

Nöbetçi öğretmen
  -> nöbetçi olması tek başına yetki vermez
  -> o dersin asıl öğretmeni sistemde devamsız/izinli/raporlu/görevli olarak kayıtlı olmalı
  -> aynı absence lesson için substitute_assignments kaydında bu nöbetçi öğretmen açıkça görevlendirilmiş olmalı
  -> ancak o zaman GRANTED / DUTY_TEACHER_RECORDED_SUBSTITUTE
```

Rehberlik takvim kaydı `guidance_class_activities`, hatırlatma kaydı `guidance_activity_reminders` üzerinden yürür. Etkinlik; eğitim yılı, rehber öğretmen, şube, fiziksel oda, tarih, saat ve etkinlik başlığı ile bağlanır. Rehber öğretmenin mobil/öğretmen ekranında yaklaşan etkinlik gösterilebilir ve varsayılan olarak etkinlikten önce hatırlatma üretilebilir.

Rehber öğretmenin gerekçeli açması **normal ders öğretmeninin yerine görevlendirilmesi değildir** ve dersin öğretmen kaydını değiştirmez. Audit üzerinde takvimli erişim `GUIDANCE_CALENDAR_ACTIVITY`, takvim dışı zorunlu gerekçeli erişim `GUIDANCE_OVERRIDE_WITH_REASON` olarak ayrı kalır.

Müdür/müdür yardımcısının normal cihaz yönetimi de ders logunu kirletmez. `access_purpose=DEVICE_ACCESS` ve `counts_as_lesson_open=false` tutulur. Yöneticinin kendi dersi veya kayıtlı boş-ders görevlendirmesi için yaptığı barkod taraması ise `access_purpose=INSTRUCTIONAL` ve `counts_as_lesson_open=true` olur.

Açma logunda en az şunlar bulunur:

```text
smartboard_device_key
physical_room_id
barcode_public_id
actor_user_id
actor_kind
decision / decision_code
reason
schedule_id
lesson_date / period
class_name / subject
access_purpose
administrative_role
counts_as_lesson_open
guidance_activity_id
occurred_at
client_context
```

Bu sayede müdürlük ekranında “hangi tahta kim tarafından, hangi saatte, hangi ders/etkinlik için ve hangi yetki sebebiyle açıldı?” eksiksiz raporlanabilir. Reddedilmiş denemeler de silinmez; güvenlik/audit amacıyla görünür kalır.

## Günlük kullanım planı

`smartboard_day_activities(institution_code, device_key, date)` ilgili fiziksel tahta için o gün gerçekten kullanılacak blokları üretir.

Kaynaklar:

- haftalık `teacher_schedule` + `institution_period_times`
- DYK/kurs
- etüt
- sınav
- özel rezervasyon/etkinlik
- rehberlik sınıf etkinlikleri
- tatil/özel gün baskılama kaydı
- öğretmen devamsızlığı
- substitute assignment

`institution_schedule_events` normal haftalık ders dışında kalan DYK/kurs/etüt/sınav/etkinlik kullanımının ortak OkulOS zamanlama projeksiyonudur. SmartBoard üzerinde yeniden kullanıcı girişi yapılmaz.

`smartboard_daily_plan(...)` cihazın Local Hub/board üzerinde cache edebileceği tek günlük payload üretir. Payload içinde en az şunlar bulunur:

```text
wakeAt
lobbyAt
wolFallbackAt
activities[]
lastUsageEndsAt
shutdownWarningAt
shutdownAt
breakDisplayMode
shortBreakMaxMinutes
longGapShutdownMinutes
afterDayAction
```

Bu payload internet kesilse dahi Local Hub ve tahta tarafından kullanılabilir.

## Güç yaşam döngüsü

SmartBoard günlük kullanım planı yalnız sabit okul açılış/kapanış saatine göre üretilmez. O cihazın fiziksel odasına çözülen bütün kullanım blokları birleştirilir.

Örnek:

```text
08:30 ilk ders
08:15 kilitli ders lobby
08:10 RTC wake hedefi
08:11-08:14 Local Hub WOL fallback
...
17:00-18:30 DYK
18:30 "5 dakika sonra kapanacak" uyarısı
18:35 güvenli shutdown
```

Teneffüslerde masaüstü açık bırakılmaz; politika `SIGNAGE`, `SCHOOL_TV`, `CLOCK` veya `SLEEP` olabilir. Sonraki dersin lobby zamanı geldiğinde yayın kesilir.

Boşluk davranışı:

```text
kısa boşluk -> pano/Okul TV
uzun boşluk -> enerji tasarrufu
çok uzun boşluk -> politika izin veriyorsa suspend/shutdown
son kullanım -> kapanış uyarısı + shutdown
```

Aktif ders oturumu, acil yayın veya kritik OTA işlemi varsa çalışma katmanı planlanan kapanışı güvenli biçimde erteleyebilir; fakat bu erteleme audit olayına dönüşmelidir.

## Sabah açılış güvenlik zinciri

Kanonik sıra:

1. cihaz kapanırken ertesi gün `wakeAt` RTC alarmına yazılır;
2. Local Hub `wolFallbackAt` itibarıyla WOL tekrarları yapar;
3. BIOS/UEFI `Restore on AC Power Loss` destekleniyorsa elektrik kesintisi sonrası ek fallback sağlar;
4. cihaz hedef lobby saatinde online değilse yönetim alarmı oluşur;
5. fiziksel elektrik tamamen kesilmiş G3 durumda yazılımın cihazı açamayacağı açıkça raporlanır.

RTC/WOL/AC restore gerçek donanım davranışı model/BIOS bazında saha doğrulamasına tabidir.

## Tatil ve DYK önceliği

`institution_calendar_days.suppress_weekly_lessons=true` normal haftalık dersleri kapatır. Bu, tatil gününde açıkça tanımlanmış DYK/sınav/etkinliği otomatik silmez. Böylece örneğin pazar günü yalnız dört odada DYK varsa yalnız o dört odanın SmartBoard günlük planı kullanım içerir.

## Yeni eğitim yılı readiness gate

Yeni yıl yayına alınmadan önce en az şu kontroller sıfır hata vermelidir:

- aktif section instance'ların primary fiziksel oda yerleşimi var mı?
- bu fiziksel odaların SmartBoard binding'i var mı?
- teacher_schedule satırları yeni yıl section instance'larına normalize edildi mi?
- açık uçlu eski yıl placement'ları yeni yılı yanlışlıkla kapsamıyor mu?
- derslik override'ları geçerli fiziksel odalara bağlı mı?

`smartboard_academic_year_readiness(academic_year_id)` eksikleri döndürür. Eksik kayıt varsa SmartBoard otomasyonu tahmin yapmaz.

## Runtime kimlik ve cihaz kimliği

Öğretmen SmartBoard için ikinci hesap açmaz. Web/mobil öğretmen yüzeyi OkulOS hesabı/kimliği ile ilişkilendirilir. Board ve Local Hub cihaz kimliği ayrı cihaz güvenlik kimliğidir; kullanıcı hesabının yerine geçmez.

Board/Local Hub üzerinde `SUPABASE_SERVICE_ROLE_KEY` bulunmaz. `smartboard_integration_devices` cihaz bazlı, döndürülebilir ve son kullanma tarihli secret hash'i tutar. `smartboard-daily-plan` Edge Function gelen cihaz secret'ını SHA-256 ile doğrulayıp yalnız ilgili kurum+cihaz günlük planını döndürür.

Lovable token bu akışların hiçbirinde güven kökü, kullanıcı token'ı, servis credential'ı veya cihaz credential'ı değildir.
