# Okulos Ders Programı — Canlı Sistem Eksik Denetimi

Tarih: 2026-09-02
Kapsam: Okulos ders programı sistemi (Web/Lovable Cloud, solver, veri katmanı, Windows/macOS hedefleri ve release kapıları)  
Kaynaklar: `docs/SCHEDULE_FINAL_MASTER_TREE_20260828.md`, `benchmarks/schedule-coverage/manifest.json`, PR #25 ve CI #1395.

## Güncel doğrulanmış durum

- PR #25 açık ve merge edilebilir.
- P0.4 head `ed816cd` için CI #1405 tamamen başarılıdır: unit/parser, CP-SAT oracle, 30-seed benchmark, migration/replay, tenant/auth/route guard, timetable authority, production build ve TypeScript. Impossible, MESEM, MTAL, room-building ve vocational-max corpus workflow'ları da aynı head üzerinde başarılıdır.
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
| Yardımcı/eş öğretmen tüm yolları | DIRECT | Atomik yönetim UI'si, ana program, filtre, rapor/CSV/Excel/PDF/e-Okul ve substitution; DB ile iki local solver çekirdeğinde gerçek HARD öğretmen kaynağı |
| Joint timetable-sectioning | DIRECT | Tek lexicographic arama, HARD öğrenci/free-time çakışması, staged enrollment planı ve canonical timetable validator üzerinden atomik apply |
| Sanal/bileşik/paylaşımlı derslik | DIRECT | Ana oda + tüm fiziksel destek bileşenleri atomik demet; mixed collision/pool HARD, local+joint import/apply, solver ve yönetim UI |
| MTAL / MESEM / İmam Hatip / ilkokul-ortaokul corpus | DIRECT | Ayrı test ve benchmark kanıtları |
| Gözetim/nöbet ürün zinciri | DIRECT | Canlı ana/eş öğretmen doluluğu + uygunsuzluk, solver önizleme, tenant-scoped taslak, server revalidation, idari onay, stale-safe yayın, rapor ve E2E sözleşmesi |

## Resmî coverage manifestindeki gerçek GAP'ler

Coverage manifestinde açık `GAP` kalmadı. Bu yalnız manifestteki tanımlı HARD ailelerinin doğrudan kanıtlandığı anlamına gelir; aşağıdaki ürün, parity, stress ve release kapıları ayrıca açıktır.

## P0 — Web/Lovable Cloud çekirdeği için release blokajları

| ID | Eksik | Bugünkü gerçek durum | Kapanış ölçütü |
|---|---|---|---|
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

- Coverage manifestinde **0 açık GAP**.
- Web/Cloud release yolunda **1 açık P0 kapanış işi**. P0.7, ortak fixture ve gerçek native Rust testiyle kapandı: DB, Web ve native katmanları `[HARD, unplaced, MEDIUM, SOFT]` sırasını kullanır; Web'de `unplaced` artık `HARD` içine katlanmaz. Kalan tek madde P0.8 tekrarlı determinism ve performans eşiğidir.
- Windows'ta **9**, macOS'ta **11** açık hedef.
- Self-host geçişi mevcut Lovable Cloud kullanımı için **gelecek hedef**.
