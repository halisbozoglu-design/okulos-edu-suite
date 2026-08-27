# OkulOS Schedule Engine — Bölüm 9 Performance Profile

Tarih: 2026-08-27
Durum: baseline profile

## Ölçek riski
Time-aware local solver küçük/orta okulda kabul edilebilir; büyük okulda aynı canonical score/feasibility semantiğini korurken tekrar taramalar kaldırılmalıdır.

## P0 hotspotlar
1. `overlappingRows(a)`: candidate evaluation sırasında `rows.filter(...)`; teacher/class occupancy, daily load ve consecutive kontrollerinde tekrar tekrar çağrılıyor.
2. `activities() -> groups()`: generic relation candidate evaluation için tüm activity listesi her aday hücrede yeniden materialize ediliyor.
3. `studentPenalty(...)`: adayın her occupied period'u için tüm `rows` tekrar taranıyor.
4. `scoreNow()`: student conflict hesabı tüm satır çiftlerini geziyor; worst-case O(n²).
5. `scoreNow()`: teacher/class day gap mapleri her move denemesinde baştan kuruluyor.

## Bölüm 9 optimizasyon sırası
- hotspot indexes: slot/teacher/class/day/course/activity/student-conflict adjacency
- incremental index mutation on place/remove
- delta score for move/LNS neighborhoods
- relation selector/cache invalidation
- partial recompute + authoritative full-score parity guard
- large-grid virtualization
- 100+ class deterministic benchmark with p50/p95/memory gates

## Güvenlik sözleşmesi
Optimization canonical semantics'i değiştiremez. HARD/MEDIUM/SOFT lexicographic order, block atomicity, time-scope overlap, student conflict and generic relation outcomes baseline ile bit-exact/equal kalmalıdır. Delta result periodically/full-final recompute ile doğrulanır; mismatch candidate reddedilir.
