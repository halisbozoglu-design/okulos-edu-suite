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

## Güç yaşam döngüsü

SmartBoard günlük kullanım planı yalnız sabit okul açılış/kapanış saatine göre üretilmez. O cihazın fiziksel odasına çözülen bütün kullanım blokları birleştirilir:

- normal dersler
- DYK/kurs
- etüt
- sınav
- özel rezervasyon/etkinlik
- tatil/istisna takvimi
- öğretmen devamsızlığı ve replacement durumu

Günün ilk geçerli kullanımından önce lobby/wake zamanı; günün son geçerli kullanımından sonra kapanış sayacı hesaplanır.

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

Teneffüslerde masaüstü açık bırakılmak zorunda değildir; SmartBoard Okul TV/Akıllı Pano döngüsüne geçebilir. Sonraki dersin lobby zamanı geldiğinde yayın kesilir.

## Yeni eğitim yılı readiness gate

Yeni yıl yayına alınmadan önce en az şu kontroller sıfır hata vermelidir:

- aktif section instance'ların primary fiziksel oda yerleşimi var mı?
- bu fiziksel odaların SmartBoard binding'i var mı?
- teacher_schedule satırları yeni yıl section instance'larına normalize edildi mi?
- açık uçlu eski yıl placement'ları yeni yılı yanlışlıkla kapsamıyor mu?
- derslik override'ları geçerli fiziksel odalara bağlı mı?

`smartboard_academic_year_readiness(academic_year_id)` eksikleri döndürür. Eksik kayıt varsa SmartBoard otomasyonu tahmin yapmaz.

## Runtime kimlik ilkesi

Öğretmen SmartBoard için ikinci hesap açmaz. Web/mobil öğretmen yüzeyi OkulOS hesabı/kimliği ile ilişkilendirilir. Board ve Local Hub cihaz kimliği ayrı cihaz güvenlik kimliğidir; kullanıcı hesabının yerine geçmez.

Lovable token bu akışların hiçbirinde güven kökü, kullanıcı token'ı, servis credential'ı veya cihaz credential'ı değildir.
