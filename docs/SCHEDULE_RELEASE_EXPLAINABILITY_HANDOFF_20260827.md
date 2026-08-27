# OkulOS Ders Programı — Release / Explainability Handoff

Tarih: 2026-08-27
Durum: Section 14 closure candidate; docs CI yeşil olmadan CLOSED değildir.

## Authority
Explainability yeni bir solver veya kural otoritesi oluşturmaz. UI yalnız mevcut canonical server kaynaklarını tüketir:
- objective: `get_schedule_scenario_objective_vector_v1`
- nedenler: `schedule_scenario_explanations`
- müdahaleler: `schedule_repair_suggestions`
- yayın öncesi doğrulama: `get_schedule_integrity_report`
- yayın: `publish_current_schedule`
- yayın geçmişi: `get_schedule_publication_history`
- restore/audit: `create_schedule_restore_point`, `restore_schedule_restore_point`, `schedule_restore_points`

## Operator explainability
`/schedule-scenario-comparison` artık canonical veriden şunları gösterir:
- Neden burada?
- Neden daha iyi değil / neden değil?
- önerilen lexicographic adaya göre HARD / unplaced / MEDIUM / SOFT objective delta
- server explanation içindeki ilk negatif nedenden kök neden
- toplam ve HARD-safe müdahale sayısı
- güvenli müdahale başlıkları

Objective sırası değişmez: `HARD → unplaced → MEDIUM → SOFT → legacy quality`.

## Release / audit
`/schedule-archive` canonical integrity sonucunu görünür kılar; frontend yayın otoritesi değildir. `publish_current_schedule` nihai server gate olarak kalır. Solver senaryo uygulamadan önce restore point alır. Yayın geçmişi yürürlük zamanı, revision, row count ve schedule hash ile audit kanıtı taşır.

## Benchmark evidence
Release ekranında frozen baseline ve CI evidence görünür:
- `benchmarks/world/baseline-20260827.json`
- `schedule-world-benchmark-94368a072739d85cd6a59571948220610aabf6a1`

Timefold / UniTime / FET / aSc gerçek ortak kontrat altında çalıştırılmadığı sürece `NOT_RUN` kalır. Bu bölüm superiority iddiası açmaz.

## Regression gate
`tests/schedule-release-explainability.test.ts` şunları guard eder:
- canonical objective/explanation/repair authority tüketimi
- Why here / Why not / objective delta / root cause görünürlüğü
- canonical publish/integrity/history + restore bağlantısı
- frozen benchmark evidence görünürlüğü
- world benchmark, artifact upload, build ve TypeScript CI adımlarının korunması

Kod CI: `33094479926` — SUCCESS:
- unit/regression SUCCESS
- CP-SAT exact gate SUCCESS
- 30-seed world benchmark SUCCESS
- benchmark artifact upload SUCCESS
- migrations/static authority guards SUCCESS
- production build SUCCESS
- route tree SUCCESS
- TypeScript SUCCESS
- forward migration policy SUCCESS

## Migration
Section 14 için yeni migration gerekmedi. Mevcut canonical Cloud/data otoriteleri yeterliydi; duplicate authority yaratmamak için schema eklenmedi. Applied migration history değiştirilmedi.

## Reopen conditions
Section 14 yeniden açılırsa nedenlerden biri somut olmalıdır:
- frontend bağımsız skor/kural üretmeye başlarsa
- publish server integrity gate'i bypass edilirse
- restore/audit veya publication hash kaybolursa
- objective order değişirse
- explainability canonical server kaynağından koparsa
- benchmark evidence veya release regression gate CI'dan çıkarılırsa
- mobile/large-grid mevcut responsive/scroll davranışı release akışını kullanılamaz hale getirirse

Sonraki bölüm: **15 — Final parity + superiority gate**.
