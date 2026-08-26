# OkulOS Ders Programı Motoru — World-Class Parity ve Üstünlük Planı

Tarih: 2026-08-26
Durum: authoritative execution plan

## Çalışma kuralı
Bir bölüm; veri modeli/Cloud, solver, canonical validator/score, UI/rapor, test/benchmark, CI ve handoff tamamlanmadan CLOSED sayılamaz. CLOSED olmadan sonraki bölüme geçilmez. Uygulanmış migrationlar değiştirilmez; yalnız forward-only ve mümkün olan en küçük migrationlar eklenir. Production DB Lovable Cloud PostgreSQL'dir; Lovable AI/chat kullanılmaz. HARD ihlal sessizce gevşetilmez.

## Nihai hedef
Timefold + UniTime + aSc + FET + CP-SAT sınıfındaki toplam timetable kabiliyetini kapsamak; MEB/MTAL/MESEM semantiği, mevzuat güvenliği, açıklanabilirlik ve operasyonel kullanımda ileri gitmek. “Dünyanın en iyisi” yalnız ortak, tekrarlanabilir benchmark kanıtından sonra kullanılabilir.

## Bölüm sırası
1. Öğrenci çakışma optimizasyonu — **CLOSED 2026-08-26**
2. Blok ders + LNS motoru — **CLOSED 2026-08-26**
3. Derin ejection-chain — **CLOSED 2026-08-26**
4. Generic constraint parity — **CLOSED 2026-08-26**
5. Oda/bina parity kapanışı — **CLOSED 2026-08-26**
6. Student sectioning tam kapanış — **CLOSED 2026-08-27**
7. Substitution tam kapanış — **NEXT**
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
- Öğrenci çakışması HARD değil MEDIUM objective; `allow_overlap=true` hariç; PRIMARY > ALTERNATIVE > SUBSTITUTE + priority ağırlığı.
- Canonical Cloud: `student_conflict_penalty`, `get_schedule_assignment_student_conflict_weights_v2`, `get_schedule_student_conflict_report_v2`, `get_schedule_scenario_student_conflict_summary_v1`.
- Local CPU/WebGPU/server objective aynı MEDIUM semantiğini kullanır.
- Migrations: `20260826124000_schedule_student_conflict_objective_v1.sql`, `20260826124100_schedule_student_conflict_report_alignment.sql`.
- CI: run `32967079420`, SUCCESS.

## Bölüm 2 — Blok ders + LNS motoru — CLOSED
- Block authority: `course_schedule_rules.block_pattern`, `get_schedule_activity_instances_v1`, current/scenario block guards.
- `[2]`, `[2,2]`, `[3]`, `[2,1]` activity-atomic; move/swap/local search/LNS blok parçalayamaz.
- LNS neighborhoods: TEACHER_DAY, CLASS_DAY, COURSE_BLOCK, CONFLICT_HOTSPOT, LOW_QUALITY_ZONE, RANDOM_SMALL.
- HARD→MEDIUM→SOFT lexicographic kabul; kötüleşmede rollback.
- Migrations: `20260826164500_schedule_block_lns_closure.sql`, `20260826165500_schedule_block_atomic_wrappers.sql`, `20260826170500_schedule_external_lns_job_config.sql`.
- Kilitli-run düzeltmesi: `c2a9602f724a24c27412f7d94e6fec39f264b94d`.

## Bölüm 3 — Derin ejection-chain — CLOSED
- Bounded depth 3–5, expansion budget, cycle prevention.
- Blocker modeli teacher/class/classroom/student-conflict resource bazlıdır; global slot occupancy değildir.
- Her node `get_schedule_atomic_move_plan_v1`; her chain canonical batch preview; apply batch move + restore point.
- UI `/schedule-ejection-chain`; mevcut `/schedule` feature ailesinde.
- CI: run `32993983161`, SUCCESS.

## Bölüm 4 — Generic constraint parity — CLOSED
- 26 canonical relation tipi; HARD/MEDIUM/SOFT/OFF; activity-level block semantiği; unary/binary/n-ary set evaluation.
- Canonical objective: HARD → unplaced → MEDIUM → SOFT → legacy.
- UI `/schedule-rules-relations`.
- Migrations: `20260826231000_schedule_generic_constraint_parity.sql`, `20260826233000_schedule_generic_constraint_set_parity.sql`, `20260826234000_schedule_generic_constraint_series_cast_fix.sql`.
- 42/42 relation regression; CI run `33010428054`, SUCCESS.

## Bölüm 5 — Oda/bina parity kapanışı — CLOSED
- Canonical physical resource model: `schedule_buildings`, classroom building/floor, `schedule_period_breaks`, `schedule_building_travel`, `schedule_room_pools`.
- Shared/virtual room için tek authority `schedule_room_pools`; `classrooms.max_simultaneous_activities` ikinci otorite değildir.
- HARD: capacity, required room type/department/hardware, avoided room, exact-room collision, pool simultaneous/aggregate capacity, break-aware building transfer.
- SOFT: preferred room type/department/hardware/building/room, capacity waste, building changes.
- `assign_classrooms_to_scenario_core_v2` fail-first + minimum room cost; `optimize_classrooms_to_scenario_v2` unlocked atamaları reoptimize eder.
- UI `/classrooms` ve `/room-assignment`.
- Migrations: `20260826235000_schedule_room_building_parity_v2.sql`, `20260826235500_schedule_room_reoptimize_v2.sql`.
- CI run `33014655258`, SUCCESS.

## Bölüm 6 — Student sectioning tam kapanış — CLOSED

### Canonical request ve scope modeli
- `student_course_requests`: PRIMARY / ALTERNATIVE / SUBSTITUTE, priority, alternative_group, allow_overlap.
- `scope_mode`: `HOME_CLASS` varsayılan güvenli scope; `OFFERING` aynı offering_rule_id kapsamı; `CROSS_CLASS` kurum içi aynı course section'ları.
- Normal sınıf dersi başka şubeye yanlış section edilemez; ortak/seçmeli offering explicit scope ile paylaşılabilir.
- `request_kind` semantiği uppercase constraint ile hizalandı; eski lowercase importance karşılaştırması kaldırıldı.

### Candidate authority
`get_student_section_candidates_v2(request_id)` online/batch/explanation için tek canonical feasibility kaynağıdır. Her adayda:
- timetable var/yok,
- capacity bilinmiyor/dolu,
- locked section,
- HARD free-time,
- mevcut enrollment time conflict,
- MEDIUM/SOFT free-time penalty,
- section balance/load,
- mevcut section'ı koruma/stability penalty,
- explicit rejection reasons (`NO_TIMETABLE`, `CAPACITY_UNKNOWN`, `SECTION_FULL`, `LOCKED_SECTION`, `HARD_FREE_TIME`, `TIME_CONFLICT`).
Unknown capacity tahmin edilmez.

### Online + batch + repair
- `section_student_v2`: tek öğrenci online/incremental resectioning.
- `section_students_batch_v2`: fail-first batch; en az feasible seçeneği olan öğrenciyi önce işler.
- `repair_student_sectioning_conflicts_v2`: timetable değişince yalnız conflict yaşayan öğrencileri tekrar section eder.
- Locked enrollment korunur.
- Tenant advisory lock aynı kapasitenin eşzamanlı iki online çağrıda aşılmasını önler.
- Alternative-group içinde başarılı alternatif bulunduğunda önceki çözülmüş issue temizlenir.
- Gereksiz section değişimi stability SOFT maliyetiyle engellenir.

### Timetable feedback loop
- Candidate feasibility doğrudan aktif `teacher_schedule` kullanır.
- Student conflict report timetable değişiminden sonra gerçek çakışmayı gösterir.
- Repair path yalnız conflict setini değiştirir; tüm öğrencileri sebepsiz yeniden dağıtmaz.
- Student conflict objective Bölüm 1'in MEDIUM authority'sini tüketir; ikinci conflict motoru açılmaz.

### UI / açıklanabilirlik
- `/student-sectioning`: request, scope, alternative/substitute group, HARD/MEDIUM/SOFT free-time, section capacity, candidate açıklaması, tek öğrenci resection, tüm okul batch ve conflict repair.
- Candidate UI neden uygun/uygun değil bilgisini açıkça gösterir.
- Senaryo karşılaştırmadan `/student-sectioning` ekranına doğrudan geçiş vardır.
- Route mevcut `/schedule` tenant/feature ailesindedir; yeni bağımsız feature açılmadı.

### Forward migration / commits
- `20260827000500_schedule_student_sectioning_v2.sql` — commit `ca08476f5e81597b9db64d6c9f7d167cc91f10cb`.
- UI: `5e363a5bfa914342e1485b975e5faab105e55365`.
- Regression: `1db5568856b555bb45cc9953392ce805ef701956`.
- Tenant/feature classification: `5011af48c5ae745ff49bc5e36bf2c3111f90ad10`.
- Scenario→sectioning navigation: `4521f613c37b63b1ebcbb0bd6d2aff58f25d040d`.

### Production smoke ve CI
- Production kontrolünde request/enrollment/free-time sayıları 0; test için sahte öğrenci/section eklenmedi.
- Candidate RPC ve health RPC boş veri üzerinde temiz döndü.
- Regression sözleşmesi HOME_CLASS isolation, uppercase request-kind, locked preservation, advisory capacity lock, alternative resolution ve timetable feedback davranışını kilitler.
- Final code head CI: run `33015602242`, head `4521f613c37b63b1ebcbb0bd6d2aff58f25d040d`; unit/regression, migration/replay, tenant/route, timetable authority, Phase 2/3/4/5, auth/delegated permission, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.

### Tekrar açılma koşulu
Bölüm 6 yalnız request/offering/section semantiği değişirse, capacity/locked/HARD free-time leakage bulunursa veya production/benchmark regression gösterirse yeniden açılır. Student demand'in timetable üretimine daha ileri çift yönlü entegrasyonu mevcut conflict objective üzerinden geliştirilir; sectioning authority kopyalanmaz.

---

## Bölüm 7 — Substitution tam kapanış — NEXT
Akış: absence overlay → qualification → availability → fairness → direct cover → chain swaps → move/split/join/cancel/create daily overlay → room/class impact → notifications/audit → UI → tests → CI.

## Bölüm 8 — Zaman modeli
Akış: week pattern/date range/term/calendar → multiple sessions/shifts → period durations/breaks → activity applicability → validator → solver → room/building travel authority → reports → tests → CI.

## Bölüm 9 — Incremental score & performans
Akış: profile → hotspot indexes → delta score → cached relation/student/room conflict deltas → partial recompute → large-grid virtualization → 100+ class benchmark → memory/p95 gates → CI.

## Bölüm 10 — Adaptive/elite solver
Akış: operator telemetry → contextual bandit/weight update → elite pool → diversity metric → path relinking/crossover → restart policy → reproducibility controls → benchmark → CI.

## Bölüm 11 — Hybrid compute kapanışı
Akış: DB/browser CPU/WebGPU/external CPU-GPU capability → job budget → candidate race → heartbeat/load → timeout/failover → canonical server audit → duplicate/stale result handling → UI health → tests → CI.

## Bölüm 12 — CP-SAT exact oracle
Akış: normalized export → same HARD semantics → objective mapping → exact/bound solve on small-medium instances → gap calculation → regression oracle → unavailable constraints explicitly reported → CI tooling.

## Bölüm 13 — Dünya benchmark paketi
Sets: synthetic small/medium/large, dense, MTAL, MESEM, anonymized real snapshots, compatible ITC. Rakipler: OkulOS, Timefold, UniTime/ITC-compatible, CP-SAT; FET/aSc için adil dış çalıştırma mümkün olan kapsam. Aynı input hash, hardware, wall-clock budget, >=30 seed. Ölçümler: feasible rate, HARD, unplaced, normalized objective vector, student conflicts, room/travel feasibility, gaps, late load, runtime p50/p95, time-to-first-feasible, time-to-best, memory, deterministic replay.

## Bölüm 14 — Release ve açıklanabilirlik
Akış: “neden burada?”, “neden olmaz?”, objective delta, root cause, intervention count, restore/audit, publish gate, benchmark artifact, release regression gate, operator/admin UX, mobile/large grid.

## Bölüm 15 — Final parity audit
Rakip kabiliyet matrisi satır satır PASS/PARTIAL/FAIL. FAIL/PARTIAL varsa parity tamamlanmış sayılmaz. “Dünyanın en iyisi” yalnız ortak benchmarklarda 0 HARD, yüksek/eş feasible rate, aynı süre bütçesinde Pareto üstünlüğü veya istatistiksel eşdeğerlik ve MEB/MTAL/MESEM ürün üstünlüğü ayrı ayrı kanıtlandığında kullanılabilir.
