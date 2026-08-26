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
7. Substitution tam kapanış — **CLOSED 2026-08-27**
8. Zaman modeli: odd/even week, tarih/dönem, çoklu vardiya — **NEXT**
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
- Requests: PRIMARY / ALTERNATIVE / SUBSTITUTE; `HOME_CLASS`, `OFFERING`, `CROSS_CLASS` scope; uppercase request-kind canonical.
- `get_student_section_candidates_v2` online/batch/explanation için tek feasibility authority; capacity unknown tahmin edilmez.
- `section_student_v2`, `section_students_batch_v2`, `repair_student_sectioning_conflicts_v2`; locked enrollment korunur, tenant advisory lock capacity race'i engeller.
- Student conflict objective Bölüm 1 authority'sini tüketir; ikinci conflict motoru açılmaz.
- UI `/student-sectioning`; route `/schedule` feature ailesinde.
- Migration: `20260827000500_schedule_student_sectioning_v2.sql`.
- Core/UI/tests: `ca08476f5e81597b9db64d6c9f7d167cc91f10cb`, `5e363a5bfa914342e1485b975e5faab105e55365`, `1db5568856b555bb45cc9953392ce805ef701956`, `5011af48c5ae745ff49bc5e36bf2c3111f90ad10`, `4521f613c37b63b1ebcbb0bd6d2aff58f25d040d`.
- Final code CI run `33015602242`, SUCCESS; authoritative docs closure run `33019041990`, SUCCESS.

## Bölüm 7 — Substitution tam kapanış — CLOSED

### Canonical date-scoped overlay
- Haftalık `teacher_schedule` source-of-truth olarak immutable kalır; günlük kriz/vekalet değişiklikleri `schedule_daily_overlays` içinde tarih bazlı tutulur.
- Operation vocabulary: `COVER`, `MOVE`, `SWAP`, `CANCEL`, `CREATE`, `SPLIT`, `JOIN`.
- `get_schedule_daily_effective_v1/v2` haftalık program + günlük overlay'i tek effective-day görünümünde birleştirir.
- SPLIT gerçek `effective_subgroup_id`; JOIN gerçek `effective_class_ids[]` taşır. JOIN en az iki kaynak + tam bir emit; SPLIT en az iki parça gerektirir.

### Exact absence snapshot ve candidate authority
- `absence_lessons` artık `source_schedule_id`, `course_id`, `classroom_id`, `subgroup_id` saklar; qualification subject-name tahminine bağlı değildir.
- `get_substitute_candidates_v4`: qualification, duty, absence, teacher unavailability, effective-day time conflict, weekly/monthly fairness ve building-transfer nedenlerini açıkça döndürür.
- HARD reasons: `ABSENT`, `UNAVAILABLE`, `TIME_CONFLICT`, `BUILDING_TRANSFER_NOT_ALLOWED`, `BUILDING_TRANSFER_TIME_INSUFFICIENT`.
- Yeterlilik doğrulanamayan öğretmen acil fallback olarak ağır cezalı kalır; HARD fiziksel/zaman ihlali olan aday uygulanamaz.

### Direct cover + chain
- `assign_substitutes_for_day_v4` her direct atamadan sonra effective-day programı yeniden değerlendirir.
- `suggest_substitution_chains_v4`: A yalnız kendi dersi nedeniyle meşgulse A'nın dersini feasible B'ye verip A'yı devamsız derse önerir.
- `apply_substitution_chain_v4` iki adımı tek transaction içinde yeniden doğrular ve uygular.

### HARD validator, room/building ve rollback
- `apply_schedule_daily_overlay_v1`: tenant/date advisory lock + all-or-nothing apply.
- `assert_schedule_daily_overlay_hard_v1`: teacher, class/subgroup, exact room, shared room-pool simultaneous limit, aggregate capacity ve building transfer authority'lerini enforce eder.
- JOIN edilen sınıfların öğrenci sayıları room-pool capacity hesabında toplanır; bilinmeyen kapasite tahmin edilmez.
- `revert_schedule_daily_overlay_v1`: operation-group bazlı atomik geri alma; bağlı vekalet kaydını pasifleştirir, absence durumunu yeniden açar ve HARD audit'i tekrar çalıştırır.
- `schedule_daily_overlay_audit` APPLY/REVERT izini tutar.

### Bildirim ve authority ayrımı
- `assign-substitutes` edge function artık vekil seçmez; `assign_substitutes_for_day_v4` Cloud authority'sini çağırır ve bildirilmemiş effective overlay görevlerini Web Push/Telegram'a taşır.
- Notification state overlay seviyesindedir; chain'deki A ve B dahil tüm effective öğretmen görevleri bildirilebilir.
- `report-absence` exact source IDs ile absence snapshot üretir.

### UI ve delegated permission
- `/substitutes`: day health, nedenli candidate listesi, qualification/duty/fairness, HARD rejection, chain öneri/apply, active overlay, notification state ve operation-group undo.
- `substitutes.manage` delegasyonu direct assignment, chain apply ve rollback için canonical DB yetkisidir; `schedule.edit` generic daily overlay müdahalesinde geçerlidir. Yetkisiz çağrı `NOT_AUTHORIZED` ile reddedilir.

### Forward migrations / commits
- `20260827002000_schedule_substitution_v4.sql` — `f16433123d5dc08b7776edebc0c6bb5179e2a503`.
- `20260827002500_schedule_substitution_split_join_v4.sql` — `b337c89c67b65432c399be162cb0e436948c19e2`.
- `20260827003000_schedule_substitution_permission_alignment_v4.sql` — `79e5b7e754adbd9a59cc3fa43ee298d0bed18ab2`.
- UI: `4d43e22c5ea438f185da0199b3d83f7abf407fc3`.
- Exact absence edge: `6db884416db2cbc7b604c5062fd50c14bb6d85f3`.
- Overlay notification edge: `9866533175a13b43ac7f50d7b01d6cc79e05633a`.
- Tests: `6239a47c951c26d91cb7233a2bdd234284fd581a`, `768d924f025dd6e5cab719ae65aeb9b42f70db09`, `c56dec1752d267130c536e39d2c96163cceb3eae`.

### Production smoke ve CI
- Lovable Cloud V4 introspection: 7 ana RPC mevcut; overlay operation/emits_event/notified_at kolonları mevcut.
- Kontrol anında bugün için 0 absence lesson ve 0 overlay vardı; production'a sahte kriz/öğretmen verisi eklenmedi.
- Final code head `c56dec1752d267130c536e39d2c96163cceb3eae`; CI run `33020382676`: unit/regression, migration/replay, tenant/route, timetable authority, Phase 2/3/4/5, auth/delegated permission, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.

### Tekrar açılma koşulu
Bölüm 7 yalnız absence snapshot, qualification/fairness, daily overlay, chain, SPLIT/JOIN, notification veya HARD teacher/class/room/building semantiğinde regression bulunursa yeniden açılır. Zaman pattern/date/shift genişlemesi Bölüm 8'de bu date-scoped overlay authority'yi tüketir; ikinci substitution motoru açılmaz.

---

## Bölüm 8 — Zaman modeli — NEXT
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
