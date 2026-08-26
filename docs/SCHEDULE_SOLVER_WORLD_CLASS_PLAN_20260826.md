# OkulOS Ders Programı Motoru — World-Class Doğrulama Planı

Tarih: 2026-08-26

## Hedef
“Dünyanın en iyisi” iddiası yalnız tekrarlanabilir benchmark ile kabul edilir. HARD ihlal bulunan hiçbir sonuç başarı sayılmaz.

## Kapanmış temel
- Resmî MTAL/MESEM katalogları ve ders saatleri.
- Canonical HARD validator.
- Çoklu senaryo + repair + rescore.
- Restore point / undo.
- Safe drag/drop, swap, atomic batch move.
- Worker heartbeat, claim/complete/failover, stale reaper.
- Güvenli repair suggestion aksiyonu.
- DB-native fallback; sahte CPU/GPU yok.

## WP1 — Feasibility / doğruluk
- Teacher/class/room/subgroup çakışma test matrisi.
- Uygun değil saat, günlük limit, ardışık limit, ders zamanı, blok ders, kilit, tenant izolasyonu.
- Batch move all-or-nothing rollback.
- 100 tekrar seed fuzz test; hedef: 0 HARD kaçak.

## WP2 — Solver çekirdeği
- Fail-first / minimum remaining values ordering. [başladı]
- Regret ordering.
- Bounded ejection-chain repair.
- Tabu / late-acceptance veya simulated annealing karşılaştırması.
- Large-neighborhood search (LNS): teacher/day, class/day, course-block mahalleleri.
- Adaptive operator weights.
- Elite solution pool + path relinking.
- Deterministik seed/replay.

## WP3 — Objective / kalite
Lexicographic sıralama:
1. HARD violations = 0
2. unplaced = 0
3. mevzuat/resmî çizelge uyumu
4. öğretmen boşlukları
5. sınıf boşlukları
6. geç saat yükü
7. aynı ders günlük yoğunluk
8. öğretmen tercihleri
9. derslik/atölye tercihleri
10. günler arası yük dengesi

Her soft bileşen ayrı raporlanır; tek opak puan yeterli değildir.

## WP4 — Hybrid compute
- DB-native baseline.
- Browser CPU workers.
- WebGPU yalnız gerçekten destek varsa ranking/compute.
- Harici CPU worker protokolü.
- Harici GPU worker protokolü.
- AUTO/HYBRID: CPU+GPU+DB aynı candidate pool.
- Timeout, heartbeat, stale reaper, failover.
- Ortak canonical server audit + rescore.

## WP5 — Sıkışma çözüm motoru
- Diagnostic → root cause sınıflandırması.
- HARD gevşetme otomatik yasak.
- En küçük SOFT/operasyonel değişiklik önerisi.
- Preview impact.
- Apply → repair → rescore.
- Önce/sonra kalite ve değişen ders sayısı.
- Multi-step suggestion/ejection chain.

## WP6 — Benchmark veri setleri
A. Synthetic-small: 10 sınıf / 25 öğretmen.
B. Synthetic-medium: 30 sınıf / 60 öğretmen.
C. Synthetic-large: 80 sınıf / 150 öğretmen.
D. Dense/conflict: yüksek öğretmen paylaşımı ve dar uygunluk.
E. MTAL: alan/dal/atölye/grup dersleri.
F. MESEM.
G. Gerçek anonimleştirilmiş okul snapshotları.
H. Uygun biçime dönüştürülebilen ITC benchmarkları.

Her set: sabit seed listesi, donanım, süre bütçesi ve input hash ile kayıt edilir.

## WP7 — Rakip benchmark
Karşılaştırma hedefleri:
- OkulOS DB-native/hybrid
- Timefold Solver
- UniTime / ITC-compatible solver
- OR-Tools CP-SAT modeli (aynı normalize problem mümkün olduğunda)

Aynı veri, aynı HARD/soft semantiği, aynı wall-clock bütçesi. Uyuşmayan constraintler açıkça işaretlenir; adil olmayan skor birleştirilmez.

## WP8 — Ölçümler
- feasible_run_rate
- hard_violations
- unplaced
- normalized_soft_score
- gap_count teacher/class
- late_load
- runtime_ms p50/p95
- time_to_first_feasible
- time_to_best
- peak memory
- deterministic replay equality
- recovery/failover success

En az 30 seed/instance koşusu; medyan + p95 + dağılım raporu.

## WP9 — CI regression gate
- HARD violation > 0 => fail.
- Feasible-rate regresyonu => fail.
- Benchmark medyan kalite belirlenen toleranstan kötüleşirse fail.
- p95 süre belirlenen toleranstan kötüleşirse uyarı/fail.
- Benchmark sonuçları JSON artifact.

## WP10 — UX / operasyon
- Batch move UI → preview → tek onay → apply.
- Büyük grid virtualization.
- Öğretmen/sınıf/derslik/branş ayrı operasyon görünümü.
- “Neden yerleşmedi?” kartı.
- “En az değişiklikle düzelt” modu.
- Otomatik program sonrası kullanıcı kilitlerini koruyarak yeniden optimize.

## “Dünyanın en iyisi” kabul kapısı
İddia ancak şu koşullarla kullanılabilir:
1. 0 HARD ihlal.
2. Ortak benchmarklarda rakiplerden daha yüksek feasible-rate.
3. Aynı süre bütçesinde kalite açısından Pareto-üstün veya istatistiksel eşdeğer.
4. Büyük veri setinde kabul edilebilir p95 süre ve bellek.
5. En az 30 seed ile sonuç tekrarlanabilir.
6. Harici benchmark scriptleri ve sonuç JSON/CSV’si yayımlanabilir/audit edilebilir.
7. Türkiye/MEB/MTAL/MESEM özel kurallarında rakiplerin desteklemediği kapsam ayrıca ürün üstünlüğü olarak raporlanır; algoritmik üstünlükle karıştırılmaz.

## Şu anki doğrulanmış hüküm
OkulOS bugün güçlü bir domain-specific ders programı platformudur; ancak “dünyanın en iyi solverı” henüz kanıtlanmış değildir. Yerel worker 2026-08-26’da randomized greedy’den fail-first + max-consecutive hard check + local improvement seviyesine yükseltilmiştir. Sıradaki teknik odak ejection-chain/LNS ve reproducible benchmark harness’tır.
