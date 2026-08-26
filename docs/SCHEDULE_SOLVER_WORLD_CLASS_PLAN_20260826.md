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
6. Student sectioning tam kapanış — **NEXT**
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
- Öğrenci çakışması HARD değil MEDIUM objective; `allow_overlap=true` hariç tutulur; PRIMARY > ALTERNATIVE > SUBSTITUTE ve priority ağırlığı korunur.
- Canonical Cloud: `student_conflict_penalty`, `get_schedule_assignment_student_conflict_weights_v2`, `get_schedule_student_conflict_report_v2`, `get_schedule_scenario_student_conflict_summary_v1`.
- Local CPU/WebGPU ve server objective aynı MEDIUM semantiğini kullanır; senaryo karşılaştırma student conflict metriğini gösterir.
- Forward migrations: `20260826124000_schedule_student_conflict_objective_v1.sql`, `20260826124100_schedule_student_conflict_report_alignment.sql`.
- CI closure: run `32967079420`, head `695a5bb6b8ec97255ef688b10e516d179460d904`, SUCCESS.
- Reopen: request/enrollment semantiği değişirse veya regression/benchmark hata gösterirse.

## Bölüm 2 — Blok ders + LNS motoru — CLOSED
- Canonical block authority: `course_schedule_rules.block_pattern`, `get_schedule_activity_instances_v1`, current/scenario block guards. `[2]`, `[2,2]`, `[3]`, `[2,1]` activity-atomic.
- Manual move/swap, local search ve LNS blok component'i parçalayamaz; canonical batch preview/apply + rollback kullanır.
- LNS: TEACHER_DAY, CLASS_DAY, COURSE_BLOCK, CONFLICT_HOTSPOT, LOW_QUALITY_ZONE, RANDOM_SMALL; ruin/recreate fail-first/regret; HARD→MEDIUM→SOFT kabul; kötüleşmede rollback.
- CPU/WebGPU/external worker kontratı block-aware; sahte worker/hardware yok; server audit olmadan aday uygulanmaz.
- Migrations: `20260826164500_schedule_block_lns_closure.sql`, `20260826165500_schedule_block_atomic_wrappers.sql`, `20260826170500_schedule_external_lns_job_config.sql`.
- Kilitli-run regression hatası test tarafından yakalandı ve `c2a9602f724a24c27412f7d94e6fec39f264b94d` ile motor düzeltildi; guard gevşetilmedi.
- Reopen: block atomicity/HARD leakage/regression kanıtı.

## Bölüm 3 — Derin ejection-chain — CLOSED
- Bounded depth 3–5, expansion budget, signature/cycle prevention.
- Blocker modeli global slot doluluğu değil teacher/class/classroom/student-conflict resource çakışmasıdır.
- Her node `get_schedule_atomic_move_plan_v1`; her tamamlanmış chain `preview_schedule_batch_move_v1`; apply `move_schedule_slots_batch_v1` + restore point.
- Candidate order MEDIUM→SOFT→movement cost; `/schedule-ejection-chain` kullanıcı ekranı mevcut `/schedule` feature ailesindedir.
- Bölüm 3 yeni migration açmadı; mevcut canonical batch RPC'leri kullandı.
- Core commits: `07be50aa2c62ea78a3bb4a17c352b3e2ef493b07`, `222c788af3442228a6413e99e59f1c3785326e72`, `a10645e4a2a58023f3ac17ff61403eba697986d5`, `de55e8c2ab013c4c95ff636b64888b7483f62503`.
- CI closure: run `32993983161`, SUCCESS.
- Reopen: bounded-chain regression, block break veya canonical HARD leakage.

## Bölüm 4 — Generic constraint parity — CLOSED
- Canonical relation ontology 26 tip: SAME_TIME, DIFFERENT_TIME, SAME_START, SAME_DAY, DIFFERENT_DAY, OVERLAP, NOT_OVERLAP, MIN_GAP, MAX_GAP, MIN_DAYS, MAX_DAYS, ADJACENT, ORDERED, CONSECUTIVE, GROUPED, SAME_ROOM, DIFFERENT_ROOM, SAME_ROOM_IF_CONSECUTIVE, STARTS_DAY, ENDS_DAY, PREFERRED_START, PREFERRED_SLOT, FORBIDDEN_SLOT, MAX_SIMULTANEOUS, MAX_OCCUPIED_SLOTS, MAX_DIFFERENT_ROOMS.
- HARD/MEDIUM/SOFT/OFF; activity-level block semantics; unary/binary/n-ary set evaluation; local/server parity.
- Canonical objective vector: HARD → unplaced → MEDIUM → SOFT → legacy score.
- `/schedule-rules-relations` mevcut schedule.rules yetki ailesinde JSON gerektirmeyen form sunar.
- Migrations: `20260826231000_schedule_generic_constraint_parity.sql`, `20260826233000_schedule_generic_constraint_set_parity.sql`, `20260826234000_schedule_generic_constraint_series_cast_fix.sql`.
- Production smoke `PREFERRED_START != PREFERRED_SLOT`, ADJACENT ve cast semantiğini doğruladı. 42/42 test geçti.
- CI closure: run `33010428054`, SUCCESS; guardlar yeni authority'ye taşındı, gevşetilmedi.
- Reopen: activity-relation parity/regression/HARD leakage.

## Bölüm 5 — Oda/bina parity kapanışı — CLOSED

### Canonical fiziksel kaynak modeli
- `schedule_buildings`, `classrooms.building_id/floor`, `schedule_period_breaks`, `schedule_building_travel`, `schedule_room_pools` tek fiziksel kaynak modelidir.
- Exact classroom tekil kullanımını korur. Bir fiziksel alan birden fazla mantıksal/virtual oda olarak kullanılacaksa canonical authority **`schedule_room_pools`**'dur.
- `classrooms.max_simultaneous_activities` compatibility metadata olarak kalır; ikinci bir eşzamanlılık otoritesi değildir. Bu karar exact-room validator ile shared-room semantiğinin çelişmesini önler.

### HARD room/building feasibility
`get_schedule_scenario_room_candidates_v2` aynı anda şunları doğrular:
- öğrenci sayısı ≤ classroom capacity,
- required room type / department / hardware,
- avoided room list,
- exact-room time collision,
- shared pool `max_simultaneous_activities`,
- shared pool aggregate physical capacity,
- teacher'ın ardışık dersleri için building transfer,
- ilgili teneffüste `transfer_allowed=true`,
- break minutes ≥ `get_schedule_building_travel_minutes_v1`.
`validate_schedule_building_transfer_v1` current schedule üzerinde `BUILDING_TRANSFER_NOT_ALLOWED` ve `BUILDING_TRANSFER_TIME_INSUFFICIENT` HARD hatalarını enforce eder.
`get_schedule_scenario_room_issues_v2` ROOM_UNASSIGNED / ROOM_INFEASIBLE üretir ve `get_schedule_scenario_hard_issues_v2` zincirine dahildir.

### SOFT room objective
`lesson_room_rules` zorunlu alanların yanında preferred room type/department/hardware/building/room ve avoided rooms taşır. `schedule_generation_settings` room preference, building change ve capacity waste katsayılarını taşır.
`get_schedule_scenario_room_summary_v2` room HARD/SOFT üretir. Room SOFT, `get_schedule_scenario_objective_vector_v1` içindeki SOFT katmanına eklenir; HARD/MEDIUM'u asla ezemez.

### Otomatik oda optimizasyonu
- `assign_classrooms_to_scenario_core_v2` eski first-fit yerine fail-first çalışır: o anda en az feasible-room adayı olan satırı önce seçer, sonra en düşük SOFT penalty'li odayı atar.
- Uygun oda yoksa sahte oda oluşturmaz; `NO_SUITABLE_CLASSROOM` issue üretir.
- `optimize_classrooms_to_scenario_v2` mevcut unlocked oda atamalarını yeniden optimize eder; locked oda atamalarını varsayılan olarak korur.
- Time solver oda kural motorunu kopyalamaz: CPU/WebGPU/DB/external zaman çözümünden sonra tüm adaylar aynı canonical Cloud room optimizer/audit zincirinden geçer.

### UI / operasyon
- `/classrooms`: bina/kod, oda bina+kat, shared/virtual pool, pool kapasitesi/eşzamanlılık, building travel minutes, period-break minutes ve transfer_allowed, HARD room requirements, SOFT room/building preferences ve avoided rooms yönetilebilir.
- `/room-assignment`: eksik odaları atama, unlocked atamaları yeniden optimize etme, Room HARD ve Room SOFT görünümü.
- Kullanıcı bina/pool/transfer semantiği için SQL/JSON yazmak zorunda değildir; JSON yalnız donanım sözlüğü için korunmuştur.

### Forward migrations / commits
- `20260826235000_schedule_room_building_parity_v2.sql` — commit `af66418d223fcb007b869bc39b27c01d7a23ba67`.
- `20260826235500_schedule_room_reoptimize_v2.sql` — commit `d7ba3555829888474648f469a5770aa0183c0077`.
- UI: `0865249c22fc901b9d36ff16d1ade3880e728f60`, `85f64e9a0be11828c33fb16f86ea84a5c0942a12`.
- Regression: `354fb3d36d2e82bb56d30e9acad726b8cc21aed9`.
- Authority/Phase3 alignment: `5a2a5a7d7254ff509e2d8b6f75f186d72b36f885`, `be68d41d2a4f6115d102118709413bdf6796a326`.

### Production smoke ve CI
- Doğru Lovable Cloud project: `8b874ff1-ec9d-429d-a434-78fc22c88300`.
- Production introspection `room_pool`, `transfer_allowed`, room summary objective ve reoptimize RPC gövdelerini doğruladı.
- Kontrol anında 0 oda/bina/pool/scenario vardı; test için production'a sahte veri eklenmedi.
- `tests/schedule-room-building-parity.test.ts` HARD room/pool/transfer, SOFT objective, locked reoptimize ve UI contractlarını kilitler.
- CI run `33014420798`, head `be68d41d2a4f6115d102118709413bdf6796a326`: unit/regression, migration/replay, tenant/route, timetable authority, edge-slot, Phase 2/3/4/5, auth/delegated permission, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.

### Tekrar açılma koşulu
Bölüm 5 yalnız fiziksel oda/bina semantiği değişirse, room pool/travel/capacity HARD leakage bulunursa veya gerçek benchmark/production regression gösterirse yeniden açılır. Zaman/date/shift modelinin bina transferine etkisi Bölüm 8'de bu authority'yi tüketir; ikinci room motoru açılmaz.

---

## Bölüm 6 — Student sectioning tam kapanış — NEXT
Akış: requests/alternative/substitute/free-time → capacity → batch solver → online incremental resectioning → balance → timetable conflict feedback loop → explanations → UI → tests → CI → handoff.

## Bölüm 7 — Substitution tam kapanış
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
