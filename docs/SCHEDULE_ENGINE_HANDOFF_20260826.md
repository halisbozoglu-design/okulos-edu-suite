# Okulos Ders Programı Motoru — Handoff (2026-08-26)

Bu dosya, ders programı modülünde bu sohbet boyunca yapılanları ve başka bir sohbette **yeniden keşif yapmadan** devam edilmesi gereken noktaları tek yerde toplar.

## 1. Hedef ürün davranışı

Hedef; Bilsa'nın manuel kullanım rahatlığını koruyan, ancak veriyi otomatik getiren ve aşağıdaki yetenekleri birlikte sunan hibrit bir ders programı sistemi:

- Otomatik resmi ders/müfredat verisi + gerektiğinde manuel müdahale.
- HARD / SOFT / KAPALI kural modeli.
- Mevzuat ve temel bütünlük kuralları HARD ise sessizce ihlal edilemez.
- Kullanıcı tercihleri, pedagojik kalite, boşluk, geç saat, tekrar, nöbet, atölye vb. SOFT puanlarla optimize edilir.
- Çoklu senaryo üretimi ve senaryoları yan yana karşılaştırma.
- Sıkışınca sadece "yerleşmedi" demek yerine neden + çözüm/gevşetme önerisi.
- Manuel değişikliklerde kilitleme, geri alma/restore point ve anlık hard validation.
- CPU/DB/GPU worker mantığı capability-aware olmalı; olmayan GPU varmış gibi gösterilmemeli.
- Birden fazla çözüm adayı paralel üretilebilmeli; en iyi senaryo seçilebilmeli.
- UI'da teknik karmaşa varsayılan olarak gizlenmeli; hızlı kullanım ana akış olmalı.

## 2. Mevcut ders programı UI yapısı — incelendi

İlgili route'lar:

- `src/routes/timetable.tsx` — çalışma alanı ve işlem akışı.
- `src/routes/schedule-preparation.tsx` — üretim öncesi veri/hard hazırlık kontrolü.
- `src/routes/schedule-solver.tsx` — senaryo üretimi, repair/backtracking, rescore ve uygulama.
- `src/routes/schedule-optimization.tsx` — optimizasyon profilleri, HARD/SOFT/KAPALI, pedagojik yük, atölye, nöbet ve repair audit.
- `src/routes/schedule-scenario-comparison.tsx` — senaryo karşılaştırma.
- `src/routes/schedule.tsx` — haftalık program + manuel düzenleme.
- `src/routes/schedule-validation.tsx` — final kontrol.
- `src/routes/schedule-history.tsx` — geçmiş / geri alma.
- `src/routes/schedule-reports.tsx` — rapor/çıktı.
- `src/routes/schedule-archive.tsx` — yayın/arşiv.

`timetable.tsx` zaten kullanıcıya şu ana akışı gösteriyor:

`Veri → kural → optimizasyon → üretim → karşılaştırma → doğrulama → rapor → yayın`

## 3. Mevcut solver motoru — bu sohbet sırasında doğrulandı

Cloud DB'de zaten şu mantıklar mevcut:

- `generate_schedule_scenarios_v2()`
- `repair_schedule_scenario_v2(scenario_id)`
- `rescore_schedule_scenario_v2(scenario_id)`
- `apply_schedule_scenario(scenario_id)`
- `get_schedule_preparation_readiness()`
- restore point mekanizması: `create_schedule_restore_point(label, reason)`
- hard/integrity kontrolleri
- yerleşmeyen ders teşhisleri `schedule_unplaced_items`
- senaryo bütünlük/hard issue kayıtları
- derslik kontrolü
- stale scenario / revision kontrolü

Yani sıfırdan solver yazılması gerekmiyor. Eksik olan ana alanlar: orkestrasyon, kullanıcı kolaylığı, worker capability yönetimi ve daha iyi çözüm önerileri.

## 4. Solver UI güncellemesi — YAPILDI

`src/routes/schedule-solver.tsx` geliştirildi.

Commit:

- `af24967bfc65b6b8d71a8bcbeb47ba67148754cd`

Temel değişiklikler:

- Ana kullanım sadeleştirildi.
- Varsayılan akış "Hızlı Dağıt" odaklı hale getirildi.
- Teknik ayarlar gelişmiş alana taşınacak/taşındı; kullanıcı ilk ekranda teknik solver ayrıntılarıyla boğulmuyor.
- 4 / 8 / 12 aday senaryo üretimi mantığı eklendi.
- Üretilen senaryolarda repair + rescore işleri istemci tarafında `Promise.all` ile paralel yürütülecek şekilde tasarlandı.
- Sıkışan senaryolarda çözüm/öneri gösterimi için yeni backend katmanı kullanılacak şekilde UI geliştirildi.
- Senaryo uygulanmadan önce otomatik restore point alınması eklendi.
- HARD problem, derslik problemi, yerleşmeyen ders ve stale veri güvenlik kapıları korunuyor.
- Manuel düzenlemeye doğrudan geçiş korunuyor.

> Not: Bu commit sonrası CI, aşağıda açıklanan **eski authority guard** nedeniyle build aşamasına ulaşamadı. Solver kodunun TypeScript/build temizliği henüz CI tarafından sonuna kadar doğrulanmış değildir. Bir sonraki sohbet bunu tamamlamalıdır.

## 5. Compute orchestration / hibrit worker altyapısı — CLOUD'A UYGULANDI + REPOYA YAZILDI

Production Lovable Cloud DB'ye compute orchestration altyapısı eklendi.

Repo commit:

- `0955efa5219a353c1d3fc5539ba2171c44566742`
- mesaj: `feat(schedule): add hybrid compute orchestration and repair suggestions`

İlk production SQL denemesi syntax hatasında tamamen rollback oldu; yarım veri kalmadı. Düzeltilen transaction daha sonra başarıyla uygulandı.

Kurulan mantık:

- Worker registry / compute capability katmanı.
- Çalıştırma modu: DB / CPU / GPU / AUTO / HYBRID benzeri capability-aware seçim için temel.
- Worker health / capability / load / latency alanları.
- Paralel çalışma kapasitesi.
- Sıkışma/repair önerisi kayıtları.
- Gerçek olmayan compute kaynağı oluşturulmaması.

Production'da doğrulanan gerçek worker:

- key: `db-native`
- ad: `Yerleşik DB Çözücü`
- type: `DB`
- health: `HEALTHY`
- `max_parallel = 4`
- `recommended = true`
- current load: `0`

**Önemli karar:** GPU mevcut değilse GPU worker kaydı oluşturulmayacak. Harici CPU/GPU worker daha sonra bağlandığında heartbeat + capability üzerinden registry'ye girecek. `AUTO/HYBRID` mod gerçek sağlıklı worker'lar arasında seçim yapacak.

## 6. Çözüm / öneri motoru — TEMEL KATMAN KURULDU

Sıkışma halinde sistemin sadece "yerleşmedi" dememesi hedeflendi.

Yeni yaklaşım:

- Yerleşmeyen dersin sebebi.
- Diagnostic sayaçları: öğretmen dolu, sınıf dolu, uygun değil, günlük limit, çalışma günü limiti, ardışık limit, ders zaman kuralı, aday pencere vb.
- En düşük etkili gevşetme/çözüm önerisi.
- HARD kurallar için "gevşet" önerisi verilmemeli; yalnız SOFT / kullanıcı tercihlerinde çözüm önerilmeli.
- Öneri uygulanmadan önce etkisi açıklanmalı.
- Mevzuat/hard güvenliği korunmalı.

Bu katmanın UI entegrasyonunun devamı yeni `schedule-solver.tsx` içinde başlatıldı.

## 7. Restore point / güvenli uygulama — YAPILDI

Cloud'da restore point RPC'si doğrulandı:

- `create_schedule_restore_point(p_label text, p_reason text)`

Solver'da senaryo uygulamasından hemen önce restore point oluşturma eklendi.

Hedef davranış:

1. Kullanıcı senaryo seçer.
2. Senaryo stale/applicable guard'ından geçer.
3. Otomatik restore point alınır.
4. Senaryo uygulanır.
5. Bütünlük tekrar doğrulanır.
6. Gerekirse History ekranından geri dönülür.

Bu davranış Bilsa benzeri manuel rahatlığı güvenli hale getirmek için korunmalıdır.

## 8. Manuel program ekranı — mevcut güçlü yönler

`src/routes/schedule.tsx` incelendi.

Mevcut yetenekler:

- Ders ekleme/düzenleme/silme.
- Öğretmen ve sınıf filtreleri.
- Derslik / subgroup seçimi.
- Kilitleme.
- e-Okul/Excel import.
- Anlık integrity raporu.
- Realtime DB değişikliklerini dinleme.
- Manuel kayıtlar `upsert_schedule_slot_v2()` üzerinden geçiyor.
- `upsert_schedule_slot_v2()` → `upsert_schedule_slot_permission_core_v2()` çağırıyor.
- DB trigger/kısıt motoru; öğretmen çakışması, sınıf çakışması, günlük limit, çalışma günü, ardışık limit, course day/period, derslik tipi/kapasite/donanım, subgroup vb. kontrolleri uyguluyor.

Bu yüzden manuel drag/drop da **aynı RPC/hard validation hattından** geçmelidir; client-side bağımsız ikinci bir kural motoru yazılmamalıdır.

## 9. Güvenli manuel drag/drop backend — PRODUCTION'A UYGULANDI + REPOYA EKLENDİ

Bu sohbetin sonunda, manuel sürükle-bırak için güvenli hareket backend'i production DB'ye uygulandı ve forward migration repoya eklendi.

Repo commit:

- `396b680b3a1e12c050683adc2b57a3c41589a742`

Amaç:

- Bir ders hedef hücreye bırakılmadan önce gerçek DB kısıtlarıyla deneme/preview yapılması.
- Preview ve gerçek uygulamanın aynı kural motorunu kullanması.
- HARD ihlal varsa hareketin reddedilmesi.
- Uygulama öncesi restore point mantığı.
- İleride hedef doluysa güvenli swap/takas mantığı eklenebilmesi.

**Açık UI işi:** `schedule.tsx` henüz bu backend ile görsel drag/drop'a bağlanmadı. Bir sonraki sohbet buradan devam etmeli.

## 10. Kullanıcı deneyimi hedefi — bir sonraki sohbet için net UI şartları

Ana ekran Bilsa kadar hızlı olmalı ama Okulos daha akıllı olmalı.

### Varsayılan kullanıcı akışı

1. Eğitim öğretim yılı / okul yapısı otomatik hazır.
2. Sınıflar, resmi ders çizelgesi ve haftalık saatler otomatik gelir.
3. Öğretmen atamaları yapılır veya içe alınır.
4. Derslikler / atölyeler / gruplar kontrol edilir.
5. Kullanıcı sadece gerekirse özel kural girer.
6. `Hazırlığı Kontrol Et`.
7. `Hızlı Dağıt`.
8. Sistem birkaç farklı aday üretir.
9. En iyi aday otomatik önerilir; diğerleri karşılaştırılabilir.
10. Sıkışma varsa neden + çözüm önerisi gelir.
11. Kullanıcı programı kabul eder veya elle sürükleyip düzeltir.
12. Her manuel hamle anında hard validation alır.
13. Final doğrulama.
14. Rapor/çıktı.
15. Yayın/arşiv.

### Manuel ekranda yapılacaklar

- Gerçek drag/drop.
- Dolu hücreye bırakmada: "taşı / takas et / iptal".
- Drop öncesi preview: yeşil = uygun, kırmızı = hard ihlal, sarı = soft kalite kaybı.
- Neden tooltip/popover.
- Çoklu seçim ve toplu kilitle/kilidi aç.
- Undo / redo veya restore point shortcut.
- Öğretmen / sınıf / derslik / branş görünümü arasında tek tık geçiş.
- Sol tarafta yerleşmeyen/eksik saat havuzu.
- Kullanıcının manuel değiştirdiği satırların ayrı görsel işareti.
- Otomatik solver'ın manuel kilitleri bozmasına izin verme.
- "Bu hamleden sonra yeniden optimize et" seçeneği: elle yapılan hamleyi kilitle, kalan programı yeniden optimize et.
- Mobilde tablo küçültmek yerine kart/agenda veya yatay scroll; masaüstünde yoğun grid.

## 11. Çoklu CPU / GPU / hibrit dağıtım için devam planı

Mevcut production'da yalnız DB-native gerçek worker var. Devam sırası:

1. Worker registry API/heartbeat kontratı çıkar.
2. Harici CPU worker bağlanırsa `worker_type=CPU` ve gerçek `max_parallel` ile kaydet.
3. GPU algoritması gerçekten uygulanırsa `worker_type=GPU` ekle. Sadece GPU donanımı bulunması yetmez; solver işinin GPU'ya uygun algoritması olmalı.
4. Scheduler: health + current load + avg latency + capability + estimated problem size üzerinden worker seçsin.
5. `AUTO`: en uygun tek worker/worker pool.
6. `HYBRID`: farklı seed/profil varyantlarını farklı worker'lara dağıt, tek sonuç havuzunda rescore et.
7. Bütün adaylar aynı canonical hard-validator'dan geçsin.
8. Worker başarısızsa failover: GPU → CPU → DB.
9. Kullanıcı teknik ayrıntıyı varsayılan ekranda görmesin; yalnız Gelişmiş bölümde "Hesaplama: Otomatik" vb. göster.

## 12. CI'de bu sohbet sırasında yapılan düzeltmeler

### Legacy duplicate migration guard

CI ilk olarak repo geçmişindeki iki tarihsel duplicate migration version nedeniyle kırılıyordu:

- `20260825011500`
- `20260825013000`

Applied migration dosyaları değiştirilmedi/yeniden adlandırılmadı.

`check-migrations.mjs` yalnız bu **iki exact legacy pair** için dar allowlist alacak şekilde güncellendi; yeni duplicate sürümler hâlâ hata verir.

Commit:

- `ad20232f95a1f1d8786af2e8d5e95e4bc3d5516d`

Sonraki CI'de migration kontrolü geçti:

- 255 migration file
- 253 unique version
- 2 exact historical allowlist pair

### Super Admin route classification

CI daha sonra `/super-admin-course-pool` route'unu unclassified buldu.

Bu route mevcut `/super-admin` feature family altında sınıflandırıldı.

Commit:

- `0031fa63a7cbf60e8a9e49c1ab3ecbcc9ba38ea4`

Sonraki CI'de şunlar geçti:

- unit/parser tests: 5/5
- migration integrity
- migration replay safety
- existing module tenant wiring
- authenticated entry gate
- route access map

## 13. Tamamlanan manuel UX paketi (2026-08-26 son tur)

- Güvenli drag/drop: hedef hücrede `preview_schedule_move_v1` ile canlı hard doğrulama (amber/emerald/red), stale cevap koruması, drop anında yeniden preview.
- Dolu hücrede tek kilitsiz ders varsa `preview_schedule_swap_v1` + `swap_schedule_slots_v1` ile onaylı takas.
- `Son Hamleyi Geri Al` (restore point) ve `/schedule-history` bağlantısı.
- Mobil agenda/kart görünümü, masaüstü grid `hidden md:block`.
- Öğretmen / sınıf / ders-branş / derslik filtreleri (AND).
- Çoklu seçim + toplu kilitle/kilidi aç.
- `source_kind` kaynak etiketi (Manuel / Sesli / İçe Aktarım).
- Görünüm modu: Genel / Öğretmen / Sınıf / Derslik / Branş; mod seçiminde diğer kapsam filtreleri temizlenir.
- Yerleşmeyen/eksik saat havuzu: `schedule_assignment_options.remaining_hours > 0`; tıklayınca editör ilgili atama ile açılır, kayıt yine `upsert_schedule_slot_v2` üzerinden.
- Klavye kısayolları: Ctrl/Cmd+Z geri al, Escape seçim/preview temizle, Ctrl/Cmd+L seçilileri kilitle.
- Performans: grid hücrelerinde per-cell filtre kaldırıldı; `day-period` anahtarlı memoized Map kullanılıyor.
- Heartbeat RPC repoya forward migration olarak eklendi: `heartbeat_schedule_compute_worker_v1` (service_role şartı, HEALTHY/DEGRADED, WORKER_NOT_FOUND).
- Solver compute kartı harici worker tipi/health/yük/latency gösteriyor; recommended=false olan worker "bayat/çevrimdışı" olarak işaretleniyor. GPU yoksa GPU ima edilmiyor.

## 14. Kalan açık işler

- Gerçek dış CPU/GPU worker bağlantısı, failover ve AUTO/HYBRID chooser'ın tamamlanması.
- Sıkışma önerilerinin tek tık uygulanabilir tam akışa dönüştürülmesi.
- Büyük okullarda grid virtualization ve ileri performans polisajı.

## 15. Migration kuralları — DEĞİŞMEZ

- Lovable Cloud production ana DB.
- Cloud first → audit → repo migration.
- Applied migration dosyası değiştirilemez.
- Forward-only, mümkün olduğunca idempotent migration.
- Eski duplicate migration dosyaları yeniden adlandırılmamalı.
