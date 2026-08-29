# Okulos Ders Programı — Son Master Tamamlama Ağacı

Tarih: 2026-08-28

Bu dosya ders programı geliştirmesinin tek takip ağacıdır. Bundan sonra yeni yan plan açılmaz; her işlem bu ağaçtaki bir düğümü `🟡 -> ✅` yaparak ilerler.

Durumlar:
- ✅ tamamlandı ve kanıtlandı
- 🟡 aktif / doğrulama sürüyor
- ⬜ bekliyor
- ⚪ isteğe bağlı / dış karşılaştırma; ürün kapanışını bloke etmez
- 🔒 değişmez güvenlik/otorite kuralı

Temel ilke: aSc, Timefold, UniTime ve FET kodu Okulos'a gömülmez. Belgelenmiş/gözlemlenebilir ürün davranışları ve genel çözümleme fikirleri bağımsız olarak yeniden tasarlanır. Okulos kendi veri modeli, kısıt motoru, çözücüsü, skorlayıcısı, doğrulayıcısı, web uygulaması ve native masaüstü uygulamaları olan bağımsız üründür.

```text
OKULOS_DERS_PROGRAMI_FINAL
│
├── 00_OTORITE_VE_MIMARI
│   ├── ✅ 00.01 Tek canonical problem modeli
│   ├── ✅ 00.02 HARD / MEDIUM / SOFT / OFF ontolojisi
│   ├── ✅ 00.03 Objective: HARD -> unplaced -> MEDIUM -> SOFT
│   ├── ✅ 00.04 Server/canonical validator son otorite
│   ├── ✅ 00.05 Windows/Web ayrı solver authority olmayacak
│   ├── 🔒 00.06 HARD sessiz gevşetilemez
│   ├── 🔒 00.07 GPU final objective otoritesi olamaz
│   └── 🔒 00.08 Applied migration değiştirilmez; yalnız forward migration
│
├── 01_MEB_MTAL_MESEM_CANONICAL_MODEL
│   ├── ✅ 01.01 Öğretmen / sınıf / ders / assignment
│   ├── ✅ 01.02 Gün / ders saati / zil / mola
│   ├── ✅ 01.03 ALL / ODD / EVEN
│   ├── ✅ 01.04 Dönem / tarih aralığı / session scope
│   ├── ✅ 01.05 Blok ders / split component
│   ├── ✅ 01.06 Kilitli ders
│   ├── ✅ 01.07 Öğretmen availability
│   ├── ✅ 01.08 Öğretmen prefer / avoid
│   ├── ✅ 01.09 Derslik kapasite / tür / özellik
│   ├── ✅ 01.10 Bina / transfer süresi
│   ├── ✅ 01.11 Öğrenci conflict ağırlıkları
│   ├── ✅ 01.12 Öğrenci sectioning
│   ├── ✅ 01.13 MEB/MTAL/MESEM native provenance
│   └── ⬜ 01.14 Son model şema-diff audit: kullanılmayan/duplicate alan yok
│
├── 02_CONSTRAINT_COMPILER_VE_RELATION_ENGINE
│   ├── ✅ 02.01 40 canonical relation type
│   ├── ✅ 02.02 activity_tag selector
│   ├── ✅ 02.03 teacher/class/course/activity scope
│   ├── ✅ 02.04 Time + room + sequence + interval aileleri
│   ├── ✅ 02.05 Türkçe operator language
│   ├── ✅ 02.06 Rule isolation evaluator
│   ├── ✅ 02.07 Compiled relation dispatch çekirdeği
│   ├── ⬜ 02.08 Hot-loop entegrasyonu yalnız ölçülmüş hız kazancı varsa
│   ├── ⬜ 02.09 Bitset/compact index benchmark
│   └── ⬜ 02.10 Constraint compiler cache/invalidation benchmark
│
├── 03_ASC_DEN_ALINAN_BAGIMSIZ_MOTOR_FIKIRLERI
│   ├── ✅ 03.01 Fail-first / hardest-first construction
│   ├── ✅ 03.02 Backtracking tabanlı repair yaklaşımı
│   ├── ✅ 03.03 Heuristic candidate ordering
│   ├── ✅ 03.04 Çok çekirdekli paralel portfolio
│   ├── ✅ 03.05 Constraint pressure / Extended Tests karşılığı
│   ├── ✅ 03.06 Analyze-by-Generation karşılığı bottleneck analyzer
│   ├── ✅ 03.07 Draft/relaxation yerine güvenli diagnostic ladder
│   ├── ✅ 03.08 Effort profiles: Hızlı / Dengeli / Derin
│   ├── ✅ 03.09 Time-off görsel haritası
│   ├── ✅ 03.10 Locked cards
│   ├── ✅ 03.11 Manual green/blue/red benzeri güvenli ipuçları
│   ├── ✅ 03.12 Card relationships karşılığı canonical relations
│   ├── ✅ 03.13 Missing-room / room assignment açıklaması
│   ├── ✅ 03.14 Verification + click-to-fix
│   ├── ✅ 03.15 Master timetable / sectioning-only / two-phase modları
│   ├── ✅ 03.16 Substitution overlay
│   ├── ✅ 03.17 Restore/history
│   ├── ✅ 03.18 Import/export interoperability çekirdeği
│   ├── ⬜ 03.19 Supervision/duty constraint audit
│   ├── ⬜ 03.20 Multiple-teacher atomic lesson tüm UI yolları audit
│   └── ⬜ 03.21 aSc parity checklist final zero-open audit
│
├── 04_OKULOS_SEARCH_ENGINE_PLUS
│   ├── ✅ 04.01 First-fit / FFD / cheapest / regret construction
│   ├── ✅ 04.02 Candidate scarcity + dependency ordering
│   ├── ✅ 04.03 Bounded ejection-chain repair
│   ├── ✅ 04.04 LNS
│   ├── ✅ 04.05 Tabu Search
│   ├── ✅ 04.06 Simulated Annealing
│   ├── ✅ 04.07 Late Acceptance
│   ├── ✅ 04.08 Great Deluge
│   ├── ✅ 04.09 VND
│   ├── ✅ 04.10 Adaptive strategy allocation
│   ├── ✅ 04.11 Elite pool / diversity
│   ├── ✅ 04.12 Path relinking / restart
│   ├── ✅ 04.13 Parallel CPU workers
│   ├── ✅ 04.14 GPU/WebGPU yalnız candidate-ranking accelerator
│   ├── ✅ 04.15 GPU lexicographic safety guard
│   ├── ⬜ 04.16 Conflict-directed backjumping ölçümlü prototip
│   ├── ⬜ 04.17 Adaptive ejection depth / neighborhood sizing
│   ├── ⬜ 04.18 Hardest-instance automatic strategy switching
│   └── ⬜ 04.19 Son CPU/GPU benchmark tuning
│
├── 05_CANONICAL_SCORE_VALIDATION_EXPLAINABILITY
│   ├── ✅ 05.01 Incremental HARD score
│   ├── ✅ 05.02 Unplaced ayrı lexicographic seviye
│   ├── ✅ 05.03 Student conflict MEDIUM
│   ├── ✅ 05.04 Gap + late SOFT
│   ├── ✅ 05.05 Generic relation HARD/MEDIUM/SOFT score
│   ├── ✅ 05.06 Independent post-score external audit
│   ├── ✅ 05.07 Why here / why not
│   ├── ✅ 05.08 Root cause / bottleneck
│   ├── ✅ 05.09 Manual move/swap HARD preview
│   ├── ✅ 05.10 Manual relation-quality delta preview
│   ├── ✅ 05.11 Rollback-safe preview
│   └── ⬜ 05.12 Final score-vector consistency audit: DB/Web/native aynı sonuç
│
├── 06_ROOM_BUILDING_SECTIONING
│   ├── ✅ 06.01 Joint time+room variable
│   ├── ✅ 06.02 Capacity/type/features
│   ├── ✅ 06.03 Required/preferred/prohibited room
│   ├── ✅ 06.04 Shared room/pool
│   ├── ✅ 06.05 Building transfer
│   ├── ✅ 06.06 Room explanation UX
│   ├── ✅ 06.07 Student sectioning engine
│   ├── ✅ 06.08 Timetable-only
│   ├── ✅ 06.09 Sectioning-only
│   ├── ✅ 06.10 Two-phase timetable+sectioning truth
│   └── ⬜ 06.11 Final combined edge-case stress suite
│
├── 07_MANUAL_OPERATOR_UX
│   ├── ✅ 07.01 Drag/drop
│   ├── ✅ 07.02 Swap
│   ├── ✅ 07.03 Lock/unlock
│   ├── ✅ 07.04 Restore point
│   ├── ✅ 07.05 Unplaced pool
│   ├── ✅ 07.06 Teacher/class/room/subject views
│   ├── ✅ 07.07 Prefer/avoid heatmap
│   ├── ✅ 07.08 HARD-first preview
│   ├── ✅ 07.09 Advisory relation quality delta
│   ├── ✅ 07.10 Rule isolation UI
│   ├── ✅ 07.11 Verification click-to-fix
│   ├── ⬜ 07.12 Keyboard accessibility audit
│   ├── ⬜ 07.13 Large timetable virtualization/performance audit
│   └── ⬜ 07.14 Undo/redo sequence stress test
│
├── 08_WEB_RUNTIME
│   ├── ✅ 08.01 Browser CPU solver
│   ├── ✅ 08.02 Web Workers / parallel candidates
│   ├── ✅ 08.03 WebGPU optional acceleration
│   ├── ✅ 08.04 Server/remote accelerator contract
│   ├── ✅ 08.05 Failover
│   ├── ⬜ 08.06 Low-memory browser profile
│   ├── ⬜ 08.07 Mobile/tablet read/edit ergonomics
│   ├── ⬜ 08.08 Long solve reconnect/resume contract
│   └── ⬜ 08.09 Final Chrome/Edge/Safari/Firefox matrix
│
├── 09_WINDOWS_NATIVE
│   ├── ✅ 09.01 Tauri/Rust temel uygulama
│   ├── ✅ 09.02 Windows NSIS build hattı mevcut
│   ├── ✅ 09.03 Yerel CPU capability detection
│   ├── ✅ 09.04 Local SQLite/sync runtime çekirdeği mevcut
│   ├── ⬜ 09.05 Canonical solver native execution binding
│   ├── ⬜ 09.06 Native multi-core worker pool
│   ├── ⬜ 09.07 GPU capability detection + safe accelerator binding
│   ├── ⬜ 09.08 Offline solve
│   ├── ⬜ 09.09 Crash recovery/checkpoint
│   ├── ⬜ 09.10 Auto-update/signing
│   ├── ⬜ 09.11 Windows 11 x64 test
│   ├── ⬜ 09.12 Windows ARM64 plan/test if toolchain permits
│   └── ⬜ 09.13 Installer/uninstaller clean-state tests
│
├── 10_MACOS_NATIVE
│   ├── ⬜ 10.01 Tauri macOS target
│   ├── ⬜ 10.02 Apple Silicon arm64 build
│   ├── ⬜ 10.03 Intel x64 build veya support kararı
│   ├── ⬜ 10.04 Universal binary kararı
│   ├── ⬜ 10.05 Native CPU worker binding
│   ├── ⬜ 10.06 Metal/WebGPU accelerator capability
│   ├── ⬜ 10.07 Offline solve
│   ├── ⬜ 10.08 Code signing
│   ├── ⬜ 10.09 Notarization
│   ├── ⬜ 10.10 DMG/PKG release
│   └── ⬜ 10.11 macOS UI/keyboard/window lifecycle tests
│
├── 11_RESPONSIVE_EKRAN_VE_MONITOR
│   ├── ⬜ 11.01 1366x768 minimum desktop
│   ├── ⬜ 11.02 1920x1080
│   ├── ⬜ 11.03 2560x1440
│   ├── ⬜ 11.04 4K scaling
│   ├── ⬜ 11.05 Multi-monitor DPI/scaling
│   ├── ⬜ 11.06 Window resize without state loss
│   ├── ⬜ 11.07 macOS Retina scaling
│   └── ⬜ 11.08 Mobile/tablet responsive fallback
│
├── 12_LOVABLE_CLOUDDAN_KENDI_SERVERINA_GECIS
│   ├── ⬜ 12.01 Lovable Cloud dependency inventory
│   ├── ⬜ 12.02 PostgreSQL schema export/import plan
│   ├── ⬜ 12.03 Auth migration plan
│   ├── ⬜ 12.04 Storage migration plan
│   ├── ⬜ 12.05 Edge/server function inventory
│   ├── ⬜ 12.06 Self-host API boundary
│   ├── ⬜ 12.07 Canonical solver server worker
│   ├── ⬜ 12.08 Queue/job model
│   ├── ⬜ 12.09 Backup/PITR
│   ├── ⬜ 12.10 Monitoring/logging
│   ├── ⬜ 12.11 Zero/low-downtime cutover rehearsal
│   └── ⬜ 12.12 Lovable Cloud bağımlılığını kapatma doğrulaması
│
├── 13_KOD_KORUMA_VE_DAGITIM
│   ├── 🔒 13.01 Browser'a gönderilen JS tamamen gizlenemez
│   ├── ⬜ 13.02 Proprietary solver çekirdeğini server/native tarafa taşı
│   ├── ⬜ 13.03 Rust/native compiled solver package
│   ├── ⬜ 13.04 Release binary strip/LTO/optimization
│   ├── ⬜ 13.05 Debug symbols ayrı/private artifact
│   ├── ⬜ 13.06 Source map production policy: public kapalı/private saklama
│   ├── ⬜ 13.07 Secret/service keys binary içine gömülmez
│   ├── ⬜ 13.08 Code signing Windows
│   ├── ⬜ 13.09 Code signing/notarization macOS
│   ├── ⬜ 13.10 License/entitlement sistemi Okulos'a ait
│   ├── ⬜ 13.11 Tamper/integrity checks
│   └── ⬜ 13.12 Reverse-engineering yüzeyini azaltma audit
│
├── 14_GUVENLIK_VERI_YETKI
│   ├── ✅ 14.01 Tenant/auth guards mevcut
│   ├── ✅ 14.02 Server authority mevcut
│   ├── ⬜ 14.03 Self-host RLS/authorization equivalent
│   ├── ⬜ 14.04 Desktop token/key secure storage
│   ├── ⬜ 14.05 TLS/pinning kararı
│   ├── ⬜ 14.06 Audit log immutability
│   ├── ⬜ 14.07 Backup restore drill
│   └── ⬜ 14.08 Security dependency/SBOM scan
│
├── 15_EXTERNAL_SOLVER_KANITLARI
│   ├── ✅ 15.01 CP-SAT exact small-instance oracle
│   ├── ✅ 15.02 Timefold real external comparable objective
│   ├── ✅ 15.03 Timefold independent canonical parity
│   ├── ✅ 15.04 UniTime comparable objective adapter
│   ├── ✅ 15.05 UniTime fresh-JVM determinism probe
│   ├── ✅ 15.06 UniTime full 180-run final gate
│   ├── ✅ 15.07 Same-runner Okulos/FET/Timefold/UniTime final gate
│   ├── ✅ 15.08 FET 7.10.2 official executable/common-HARD
│   ├── ✅ 15.09 aSc 2027 executable/signature/hash probe
│   ├── ⚪ 15.10 aSc real GUI benchmark if reproducible environment exists
│   ├── ⚪ 15.11 aSc executable is NOT product dependency
│   └── ✅ 15.12 Freeze new evidence + truth-sync manifest/matrix
│
├── 16_TEST_MATRIX_SON_KAPILAR
│   ├── ✅ 16.01 Unit/regression suite
│   ├── ✅ 16.02 Parser tests
│   ├── ✅ 16.03 CP-SAT oracle
│   ├── ✅ 16.04 30-seed world benchmark
│   ├── ✅ 16.05 Migration/replay guards
│   ├── ✅ 16.06 Tenant/auth/route guards
│   ├── ✅ 16.07 Production Web build
│   ├── ✅ 16.08 TypeScript exact checks
│   ├── ✅ 16.09 100+ seed stress benchmark
│   ├── ✅ 16.10 Impossible/near-impossible instance suite
│   ├── ✅ 16.11 Large MTAL stress corpus
│   ├── ✅ 16.12 Large MESEM stress corpus
│   ├── ⬜ 16.13 Room/building extreme corpus
│   ├── ⬜ 16.14 Sectioning extreme corpus
│   ├── ⬜ 16.15 Determinism across repeated runs
│   ├── ⬜ 16.16 Web vs Windows score equivalence
│   ├── ⬜ 16.17 Web vs macOS score equivalence
│   ├── ⬜ 16.18 Windows release build/install test
│   ├── ⬜ 16.19 macOS release build/install/notarization test
│   ├── ⬜ 16.20 Self-host server integration/e2e
│   ├── ⬜ 16.21 Backup/restore/disaster recovery test
│   ├── ⬜ 16.22 Security/SBOM/dependency scan
│   ├── ⬜ 16.23 Performance regression thresholds
│   └── ⬜ 16.24 Final all-green release candidate gate
│
└── 17_RELEASE_KAPANISI
    ├── ⬜ 17.01 Capability matrix zero unintended PARTIAL/FAIL
    ├── ⬜ 17.02 External evidence truth-sync
    ├── ⬜ 17.03 Authoritative docs truth-sync
    ├── ⬜ 17.04 Web release candidate
    ├── ⬜ 17.05 Windows signed release candidate
    ├── ⬜ 17.06 macOS signed/notarized release candidate
    ├── ⬜ 17.07 Self-host deployment release candidate
    ├── ⬜ 17.08 Final migration policy GREEN
    ├── ⬜ 17.09 Final build + TS + CI GREEN
    ├── ⬜ 17.10 Final benchmark pack frozen
    └── ⬜ 17.11 DERS PROGRAMI CLOSED ✅
```

## Güncel dış solver kanıt otoritesi

- İnsan-okunur özet: `docs/SCHEDULE_EXTERNAL_SOLVER_FINAL_EVIDENCE_20260828.md`
- Makine-okunur manifest: `docs/schedule-external-evidence-manifest-20260828.json`
- UniTime 180-run gate: workflow `33166069959`, PASS.
- Same-runner Okulos/FET/Timefold/UniTime gate: workflow `33166069957`, PASS.
- Timefold ve UniTime canonical objective karşılaştırılabilir; FET common-HARD kapsamındadır. Bu nedenle blanket superiority claim hâlâ yasaktır.

## Güncel 100+ seed stres kanıtı

- Makine-okunur kanıt: `benchmarks/world/stress-20260828.json`.
- Workflow `33183644783`, job `98890923394`, artifact `9690812668`, PASS.
- Altı profil × 101 deterministik seed = 606 koşu; feasible rate `1`, HARD `0`, unplaced `0`, deterministic replay ve 8 saniye bütçesi tüm profillerde PASS.
- Artifact SHA-256: `127b3a3b9d3ec87afd8489f54a0fae9396ad61d6e6a5292fad3e089bf9d58156`.
- Bu OkulOS-native stres kapısıdır; dış solver üstünlük iddiası üretmez.

## Güncel imkânsız/yakın-imkânsız vaka kanıtı

- Makine-okunur kanıt: `benchmarks/world/impossible-near-impossible-20260829.json`.
- Workflow `33213504020`, job `98991906525`, artifact `9702486381`, PASS.
- Beş gerçek imkânsız vaka fail-closed reddedildi; dört sınırda uygulanabilir vaka eksiksiz çözüldü.
- Native motor ve sabit OR-Tools `9.14.6206` CP-SAT oracle sınıflandırması 9/9 eşleşti; deterministik replay PASS, uygulanabilir vakalarda HARD `0` ve unplaced `0`.
- Artifact SHA-256: `57c06bae1f87d817a9a3d2265e6c8445642e3269931b81ea005bf2137b29826a`.
- Bu kapı yalnız doğruluk/fail-closed kanıtıdır; dış solver üstünlük iddiası üretmez.

## Güncel büyük MTAL corpus kanıtı

- Manifest: `benchmarks/mtal-large/manifest.json`; makine-okunur CI kanıtı: `benchmarks/mtal-large/evidence-20260829.json`.
- Workflow `33215378532`, job `98997696733`, artifact `9703162270`, PASS.
- Üç yapısal profil × yedi deterministik seed = 21 gerçek çözüm; 216-assignment karma MTAL, atölye blok/oda uygunluğu ve vardiya/izinli-saat profilleri kapsandı.
- 21/21 feasible; HARD `0`, unplaced `0`, atomik blok, oda türü/özellik, deterministik replay ve 8 saniye bütçesi PASS.
- GitHub p95 süreleri `1819 / 1781 / 1415 ms`; artifact SHA-256 `165cf10bb917d5472150301b95510a70d5f54ca3c0743f0a8eca76c33605c0d5`.
- Corpus açıkça sentetik MEB/MTAL yapısal veridir; gerçek kurum, öğretmen veya öğrenci kaydı içerdiği iddia edilmez.

## Güncel büyük MESEM corpus kanıtı

- Manifest: `benchmarks/mesem-large/manifest.json`; makine-okunur CI kanıtı: `benchmarks/mesem-large/evidence-20260829.json`.
- Workflow `33240914332`, artifact `9711329682`, PASS; saklama süresi 90 gün.
- Üç yapısal profil × yedi deterministik seed = 21 gerçek çözüm; çok-birimli kurum kimliği, işletmede eğitim günlerinin okul-içi ders domaininden dışlanması, atölye/oda ve vardiya profilleri kapsandı.
- 21/21 feasible; HARD `0`, unplaced `0`, atomik blok, oda uygunluğu, Birim ID, işletme-günü dışlama, deterministik replay ve 8 saniye bütçesi PASS.
- GitHub p95 süreleri `1090 / 1245 / 293 ms`; artifact SHA-256: `fd45be13f606cf9f4528a6ddd8bbbf82ccde0a0debd83c63315f27b130e46a89`.
- Corpus açıkça sentetiktir; gerçek kurum, öğretmen, öğrenci, çırak veya işyeri kaydı içerdiği iddia edilmez.

## İlerleme raporlama kuralı

Her çalışma dalgasının sonunda yalnız bu biçim kullanılır:

```text
🔴 OKULOS DERS PROGRAMI MASTER TREE
├── ✅ 03_ASC_DEN_ALINAN_BAGIMSIZ_MOTOR_FIKIRLERI
├── 🟡 04_OKULOS_SEARCH_ENGINE_PLUS
│   ├── ✅ 04.16 Conflict-directed backjumping
│   └── 🟡 04.17 Adaptive ejection depth
├── ⬜ 09_WINDOWS_NATIVE
└── ⬜ 10_MACOS_NATIVE

Bu dalgada yeşile dönenler:
✅ 04.16 ...
✅ 05.12 ...

Kırmızı/bloke:
- ...

Sonraki aktif düğüm:
🟡 04.17 ...
```

Bir düğüm ancak kaynak + test + build + TypeScript + ilgili CI/benchmark kanıtı geçtiğinde ✅ olur. Sadece kod yazılmış olması yeterli değildir.

## Ürün kapanış tanımı

`17.11 DERS PROGRAMI CLOSED ✅` yalnızca şu zincir yeşil olduğunda verilebilir:

canonical model -> constraint engine -> solver -> scorer/validator -> rooms/sectioning -> manual UX -> Web -> Windows -> macOS -> self-host server -> code-protection/release packaging -> security -> stress/cross-platform tests -> final CI -> frozen evidence/docs.

External aSc executable benchmark, reproducible/lisanssız teknik ortam bulunamazsa `⚪ external-only` olarak kalabilir ve Okulos ürün kapanışını bloke etmez; aSc'den yararlı bağımsız ürün/motor fikirlerinin parity checklist'i ise kapanmalıdır.
