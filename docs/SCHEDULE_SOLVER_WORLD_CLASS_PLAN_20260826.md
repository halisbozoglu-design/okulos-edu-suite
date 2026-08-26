# OkulOS Ders Programı Motoru — World-Class Parity ve Üstünlük Planı

Tarih: 2026-08-26
Durum: authoritative execution plan

## Çalışma kuralı
Bir bölüm; veri modeli/Cloud, solver, canonical validator veya score, kullanıcı arayüzü/rapor, test/benchmark, CI ve handoff bağlantıları tamamlanmadan CLOSED sayılamaz. Bir bölüm CLOSED olmadan sonraki bölüme geçilmez. Uygulanmış migrationlar değiştirilmez; değişiklikler forward-only ve mümkün olan en küçük migrationlarla yapılır.

## Nihai hedef
Timefold + UniTime + aSc + FET + CP-SAT sınıfındaki sistemlerin toplam ders programı kabiliyetini kapsamak; MEB/MTAL/MESEM veri semantiği, mevzuat güvenliği, açıklanabilirlik ve operasyonel kullanımda daha ileri gitmek. “Dünyanın en iyisi” iddiası yalnız ortak ve tekrarlanabilir benchmark ile kullanılabilir. HARD ihlal bulunan hiçbir sonuç başarı sayılmaz.

## Bölüm sırası
1. Öğrenci çakışma optimizasyonu — **CLOSED 2026-08-26**
2. Blok ders + LNS motoru — NEXT
3. Derin ejection-chain
4. Generic constraint parity
5. Oda/bina parity kapanışı
6. Student sectioning tam kapanış
7. Substitution tam kapanış
8. Zaman modeli: odd/even week, tarih/dönem, çoklu vardiya
9. Incremental score & büyük okul performansı
10. Adaptive/elite solver
11. Hybrid compute kapanışı
12. CP-SAT exact oracle
13. Dünya benchmark paketi
14. Release/açıklanabilirlik
15. Final parity audit ve superiority gate

---

## Bölüm 1 — Öğrenci çakışma optimizasyonu — CLOSED

### Semantik
- Öğrenci ders çakışması HARD değildir; **MEDIUM objective** olarak HARD güvenlikten sonra, normal SOFT kalite tercihlerinden önce minimize edilir.
- `allow_overlap=true` olan talepler solver ağırlığına, mevcut-program raporuna ve senaryo affected-student hesabına girmez.
- Talep önemi request türü ve priority ile ağırlıklandırılır: primary > alternative > substitute.

### Cloud / veri / server score
- `schedule_generation_settings.student_conflict_penalty` eklendi; varsayılan 250, `schedule.rules` yetkili kullanıcı tarafından doğrulama ekranından yönetilebilir.
- `get_schedule_assignment_student_conflict_weights_v2()` ortak öğrenci taşıyan assignment çiftlerini student/severity ağırlığıyla üretir.
- `get_schedule_student_conflict_report_v2()` aktif programdaki gerçek öğrenci çakışmalarını raporlar.
- `get_schedule_scenario_student_conflict_summary_v1(uuid)` scenario bazında event/affected-student/weighted-conflict üretir.
- `calculate_schedule_scenario_score_v2()` student conflict penalty'yi canonical server score'a dahil eder.
- Authority pointer yeni forward score migrationına taşındı; guard gevşetilmedi.

### Local CPU / GPU solver
- Local solver student conflict pair ağırlıklarını Cloud RPC'den yükler.
- Candidate construction aynı saate ortak öğrenci taşıyan assignment koymayı MEDIUM maliyetle önler.
- Final local lexicographic score: HARD -> MEDIUM(student/relation) -> SOFT.
- CPU candidate seçimi medium sonra soft sıralar.
- WebGPU candidate ranking medium katmanını soft kalite öncesinde dikkate alır.

### UI / operasyon
- `/schedule-validation`: etkilenen öğrenci, conflict event, ders/zaman detayları ve score katsayısı görünür.
- Yayın yalnız HARD hatalarla bloke olur; öğrenci çakışması MEDIUM kalite metriği olarak açıkça gösterilir.
- `/schedule-scenario-comparison`: her senaryoda affected students, conflict events ve weighted conflict görünür.
- “Tümünü Yeniden Puanla” gerçek `rescore_schedule_scenario_v2()` çalıştırır.

### Test / kalite kapısı
- Deterministic local regression testinde ortak öğrenci taşıyan iki assignment mümkünse farklı saate yerleştirilir ve `score.medium=0` doğrulanır.
- Mevcut 30-seed benchmark, HARD leakage, block `[2,2]`, DIFFERENT_DAY ve ORDERED testleri korunmuştur.
- CI run `32967079420`, head `695a5bb6b8ec97255ef688b10e516d179460d904`: unit tests, migrations, replay safety, tenant, authority, Phase 2-5, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.

### Forward migrations
- `20260826124000_schedule_student_conflict_objective_v1.sql`
- `20260826124100_schedule_student_conflict_report_alignment.sql`

### Production smoke
- Cloud fonksiyonları ve `student_conflict_penalty=250` doğrulandı.
- Kontrol anında production verisinde conflict pair sayısı 0'dı; bu hata değildir, aktif enrollment/request çiftlerinde çatışma verisi bulunmadığını gösterir. Test için production'a sahte öğrenci verisi eklenmedi.

### Tekrar açılma koşulu
Bölüm 1 yalnız student request/enrollment semantiğinde resmi/ürün gereksinimi değişirse veya benchmark/regression gerçek hata gösterirse yeniden açılır. Sonraki solver bölümleri student-conflict objective'i tüketebilir ama bu bölümün semantiğini kopyalamaz.

---

## Bölüm 2 — Blok ders + LNS motoru — NEXT
Kapanış akışı:
1. Activity/block canonical representation audit.
2. Locked + generated block ownership/identity.
3. Atomic block move/swap operators.
4. Ruin-and-recreate neighborhoods: teacher-day, class-day, course/activity-block, room/building, conflict hotspot.
5. Repair/reinsert: regret + ejection-aware insertion.
6. LNS acceptance/portfolio: LA/Tabu/SA/Great Deluge/VND ile ortak lexicographic score.
7. Adaptive neighborhood statistics hazırlanır fakat Bölüm 10 öğrenme katmanına veri taşır.
8. Local CPU + external worker payload parity.
9. Canonical server audit/rescore sonrası candidate kabulü.
10. UI: optimize edilen kapsam ve blok bütünlüğü görünür; manuel kilitler korunur.
11. Unit/fuzz/benchmark: blok kopması=0, HARD leakage=0, dense instance quality regression yok.
12. CI + handoff yeşil olmadan CLOSED değil.

## Bölüm 3 — Derin ejection-chain
Akış: depth-2 mevcut backend audit -> bounded depth 3-5 search -> cycle prevention -> move cost -> student/room/relation-aware scoring -> canonical batch preview -> atomic apply -> UI öneri listesi -> undo -> tests -> CI.

## Bölüm 4 — Generic constraint parity
Akış: Timefold/UniTime/aSc/FET constraint matrisi -> canonical ontology -> selector/activity semantics -> HARD/MEDIUM/SOFT/OFF evaluator -> DB validation gerektiği yerler -> local/external solver parity -> kural UI -> explanations -> exhaustive tests -> parity audit -> CI.

## Bölüm 5 — Oda/bina parity kapanışı
Akış: physical/virtual/shared room audit -> features/capacity/equipment -> building/floor/travel -> break-aware transfer -> room preferences -> aggregate capacity -> solver assignment/score -> manual validator -> reports/UI -> tests -> CI.

## Bölüm 6 — Student sectioning tam kapanış
Akış: requests/alternative/substitute/free-time -> capacity -> batch solver -> online incremental resectioning -> balance -> timetable conflict feedback loop -> explanations -> UI -> tests -> CI.

## Bölüm 7 — Substitution tam kapanış
Akış: absence overlay -> qualification -> availability -> fairness -> direct cover -> chain swaps -> move/split/join/cancel/create daily overlay -> room/class impact -> notifications/audit -> UI -> tests -> CI.

## Bölüm 8 — Zaman modeli
Akış: week pattern/date range/term/calendar -> multiple sessions/shifts -> period durations/breaks -> activity applicability -> validator -> solver -> reports -> tests -> CI.

## Bölüm 9 — Incremental score & performans
Akış: profile -> hotspot indexes -> delta score -> cached relation/student conflict deltas -> partial recompute -> large-grid virtualization -> 100+ class benchmark -> memory/p95 gates -> CI.

## Bölüm 10 — Adaptive/elite solver
Akış: operator telemetry -> contextual bandit/weight update -> elite pool -> diversity metric -> path relinking/crossover -> restart policy -> reproducibility controls -> benchmark -> CI.

## Bölüm 11 — Hybrid compute kapanışı
Akış: DB/browser CPU/WebGPU/external CPU-GPU capability -> job budget -> candidate race -> heartbeat/load -> timeout/failover -> canonical server audit -> duplicate/stale result handling -> UI health -> tests -> CI.

## Bölüm 12 — CP-SAT exact oracle
Akış: normalized export -> same HARD semantics -> objective mapping -> exact/bound solve on small-medium instances -> gap calculation -> regression oracle -> unavailable constraints explicitly reported -> CI tooling.

## Bölüm 13 — Dünya benchmark paketi
Sets: synthetic small/medium/large, dense, MTAL, MESEM, anonymized real snapshots, compatible ITC. Rakipler: OkulOS, Timefold, UniTime/ITC-compatible, CP-SAT; FET/aSc için adil dış çalıştırma mümkün olan kapsam. Aynı input hash, hardware, wall-clock budget, >=30 seed. Ölçümler: feasible rate, HARD, unplaced, normalized objective vector, student conflicts, gaps, late load, runtime p50/p95, time-to-first-feasible, time-to-best, memory, deterministic replay.

## Bölüm 14 — Release ve açıklanabilirlik
Akış: “neden burada?”, “neden olmaz?”, objective delta, root cause, intervention count, restore/audit, publish gate, benchmark artifact, release regression gate, operator/admin UX, mobile/large grid.

## Bölüm 15 — Final parity audit
Rakip kabiliyet matrisi satır satır PASS/PARTIAL/FAIL. FAIL/PARTIAL varsa parity tamamlanmış sayılmaz. “Dünyanın en iyisi” yalnız ortak benchmarklarda 0 HARD, yüksek/eş feasible rate, aynı süre bütçesinde Pareto üstünlüğü veya istatistiksel eşdeğerlik ve MEB/MTAL/MESEM ürün üstünlüğü ayrı ayrı kanıtlandığında kullanılabilir.
