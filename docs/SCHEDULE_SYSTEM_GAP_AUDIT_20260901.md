# Okulos Ders Programı — Canlı Sistem Eksik Denetimi

Tarih: 2026-09-01  
Kapsam: Okulos ders programı sistemi (Web/Lovable Cloud, solver, veri katmanı, Windows/macOS hedefleri ve release kapıları)  
Kaynaklar: `docs/SCHEDULE_FINAL_MASTER_TREE_20260828.md`, `benchmarks/schedule-coverage/manifest.json`, PR #25 ve CI #1375.

## Güncel doğrulanmış durum

- PR #25 açık ve merge edilebilir.
- CI #1375 yeniden koşusu tamamen başarılıdır: unit/parser, CP-SAT oracle, 30-seed benchmark, migration/replay, tenant/auth/route guard, production build ve TypeScript.
- MTAL, MESEM, oda/bina extreme ve maksimum mesleki corpus workflow'ları aynı head üzerinde başarılıdır.
- Lovable AI/chat/agent kullanılmaz; Lovable token tüketimi sıfırdır. Lovable Cloud yalnız mevcut çalışma ortamıdır.
- HARD kurallar sessiz gevşetilmez; canonical server validator son otoritedir.
- Migrationlar küçük, forward-only ve idempotent tutulur.

## Yanlışlıkla eksik sayılmaması gereken tamamlanmış başlıklar

| Başlık | Durum | Kanıt özeti |
|---|---|---|
| Branş dışı manuel öğretmen ataması | DIRECT | Yalnız uyarı + açık onay; gerekçe/tarih/süre yok; diğer HARD kurallar korunuyor |
| Özel eğitim çizelgeleme kaynakları | DIRECT | Nötr bireysel destek katılımı, gerekli oda yetenekleri, öğrenci zaman çakışması |
| Çok haftalı zil çizelgesi | DIRECT | Tek/çift hafta, dönem ve tarih aralığına göre gerçek saat çözümü |
| Yardımcı/eş öğretmen çekirdeği | DIRECT | DB ve iki local solver çekirdeğinde gerçek öğretmen kaynağı; çakışma/uygunsuzluk/yük HARD |
| MTAL / MESEM / İmam Hatip / ilkokul-ortaokul corpus | DIRECT | Ayrı test ve benchmark kanıtları |
| Gözetim/nöbet solver çekirdeği | UYGULANMIŞ | HARD ders doluluğu, aynı-slot, uygunluk ve azami yük testleri mevcut; ürün entegrasyon auditi açık |

## Resmî coverage manifestindeki gerçek GAP'ler

Coverage manifestinde şu anda yalnız iki satır açık GAP'tir:

1. **SECTIONING_JOINT_OPTIMIZATION**
   - Bugün timetable üretimi ve öğrenci sectioning ardışık/two-phase çalışır.
   - Tek objective içinde zaman + derslik + öğrenci section seçimini birlikte optimize eden solver ve extreme corpus yoktur.
   - Kapanış kanıtı: canonical ortak problem modeli, HARD öğrenci çakışma doğrulaması, deterministik extreme corpus ve UI çalışma modu.

2. **VIRTUAL_COMPOSITE_SHARED_ROOM**
   - Mevcut room pool aynı havuzdaki toplam kapasite ve eşzamanlı etkinlik sayısını korur.
   - Her program satırı hâlâ tek `classroom_id` taşır.
   - Bir dersin aynı anda birden fazla fiziksel bileşeni zorunlu tutması (ör. laboratuvar + hazırlık alanı) modellenmemiştir.
   - Kapanış kanıtı: atomik room bundle modeli, tüm bileşenlerde çakışma/uygunluk kontrolü, solver domaini, açıklama UI'si ve migration testi.

## P0 — Web/Lovable Cloud çekirdeği için release blokajları

| ID | Eksik | Bugünkü gerçek durum | Kapanış ölçütü |
|---|---|---|---|
| P0.1 | Joint timetable-sectioning optimization | Two-phase var; joint optimizer yok | Manifest DIRECT + extreme corpus |
| P0.2 | Virtual/composite shared room | Pool var; atomik çoklu oda kaynağı yok | DB + solver + validator + UI + corpus |
| P0.3 | Yardımcı/eş öğretmen tüm UI yolları | Kaynak/solver DIRECT; ana program, rapor, import/export ve substitution görünürlüğü bütünsel kanıtlanmadı | Tüm okuma/yazma yolları audit + test |
| P0.4 | Gözetim/nöbet ürün entegrasyon auditi | Ayrı solver/test var | Canlı ders doluluğu girişi, persist/preview/report ve E2E |
| P0.5 | Son canonical şema-diff auditi | Model geniş; kullanılmayan/duplicate alanların sıfır olduğu kanıtlanmadı | Otomatik schema/reference raporu |
| P0.6 | Birleşik edge-case suite | Güçlü ayrı corpus'lar var | Sectioning + composite room + co-teacher + multi-week birlikte stress |
| P0.7 | DB/Web/native score-vector eşitliği | Web/DB kanıtları parçalı; native binding açık | Aynı fixture için aynı lexicographic skor |
| P0.8 | Tekrarlı determinism ve performans eşiği | Bazı corpus'larda determinism var | Tüm release corpus'larında tekrar + regresyon threshold |

## P1 — Web üretim kalitesi

- Klavye ve ekran okuyucu erişilebilirlik auditi.
- Büyük çizelgede virtualization ve etkileşim performansı.
- Uzun undo/redo zinciri stress testi.
- Düşük bellekli tarayıcı profili.
- Mobil/tablet okuma ve güvenli düzenleme ergonomisi.
- Uzun solver işinde reconnect/resume.
- Chrome, Edge, Safari ve Firefox son matrisi.
- 1366×768, Full HD, QHD, 4K, DPI/multi-monitor, pencere resize ve Retina doğrulamaları.

## P2 — Solver performans/araştırma işleri

Bunlar doğruluk açığı değildir; ölçüm bir kazanç göstermedikçe üretim çekirdeğine alınmaz:

- Hot-loop compiled relation entegrasyonu.
- Bitset/compact index benchmarkı.
- Constraint compiler cache/invalidation benchmarkı.
- Conflict-directed backjumping prototipi.
- Adaptive ejection depth/neighborhood sizing.
- En zor instance için otomatik strateji geçişi.
- Son CPU/GPU tuning.

## P2 — Windows dalı

Mevcut Windows kabuğu, NSIS hattı, CPU capability detection ve SQLite/sync çekirdeği vardır. Açık işler:

1. Canonical solver native execution binding.
2. Native multi-core worker pool.
3. GPU capability detection ve güvenli accelerator binding.
4. Offline solve.
5. Crash recovery/checkpoint.
6. Auto-update ve code signing.
7. Windows 11 x64 doğrulaması.
8. ARM64 destek kararı/testi.
9. Temiz installer/uninstaller testleri.

### Windows dallanma iş akışı

PR #25 doğrudan Windows branch'ine taşınmaz. Önce merge edilir; her dilim güncel `main` üzerinden açılır:

```text
main
  -> codex/windows-09-05-native-binding
  -> codex/windows-09-06-worker-pool
  -> codex/windows-09-08-offline-checkpoint
  -> codex/windows-09-07-gpu-safe-binding
  -> codex/windows-09-10-signing-update
  -> codex/windows-09-11-release-matrix
```

Her branch tek bağımsız PR olur. Sonraki branch, önceki PR merge edilip `main` yeşil olduktan sonra açılır. Native binding PR'ı canonical fixture/score parity testini zorunlu taşır; signing anahtarları repoya yazılmaz.

## P3 — macOS hedefi

macOS hedefi henüz ürün seviyesinde başlamamıştır: Tauri target, Apple Silicon, Intel/universal kararları, native worker, Metal/WebGPU, offline solve, signing, notarization, DMG/PKG ve UI/window lifecycle testleri açıktır.

## P3 — Güvenlik, operasyon ve dağıtım

Mevcut Cloud tenant/RLS ve server authority uygulanmıştır. Açık kalan üretim kapıları:

- Audit log immutability.
- Backup restore drill.
- SBOM ve bağımlılık güvenlik taraması.
- Production sourcemap politikası.
- Proprietary solver için server/native dağıtım sınırı.
- Rust/native compiled package, strip/LTO ve private debug symbols.
- License/entitlement ve integrity/tamper denetimi.
- Desktop güvenli token/key saklama.
- TLS/pinning kararı.

## Gelecek hedef — Lovable Cloud'dan self-host'a geçiş

Bu başlık mevcut Cloud yayınının ön koşulu değildir. Tamamı gelecekteki ayrı programdır: dependency inventory, PostgreSQL/auth/storage taşıma planı, edge/server function envanteri, self-host API, solver worker, queue/job, PITR, monitoring, cutover provası ve Cloud bağımlılığı kapanış doğrulaması.

## Release kapanış kapıları

Aşağıdaki meta kapılar, yukarıdaki gerçek eksikler kapanmadan ayrıca yeşile çevrilemez:

- Capability matrixte istenmeyen PARTIAL/FAIL kalmaması.
- Authoritative docs ve evidence truth-sync.
- Web release candidate.
- Windows signed release candidate.
- macOS signed/notarized release candidate.
- Self-host release candidate (yalnız self-host hedefi aktive edilirse).
- Final migration policy, build, TypeScript ve CI.
- Final benchmark pack freeze.
- `DERS PROGRAMI CLOSED`.

## Sayımın doğru yorumu

Eski master tree'de 99 adet işaretlenmemiş kutu vardır. Bu, 99 bağımsız çekirdek hata olduğu anlamına gelmez: Windows/macOS/self-host hedefleri, aynı eksikleri tekrar doğrulayan test/release kapıları ve isteğe bağlı optimizasyon araştırmaları bu sayıya dahildir.

Bugünkü en net özet:

- Coverage manifestinde **2 gerçek GAP**.
- Web/Cloud release yolunda **8 P0 kapanış işi**.
- Windows'ta **9**, macOS'ta **11** açık hedef.
- Self-host geçişi mevcut Lovable Cloud kullanımı için **gelecek hedef**.
