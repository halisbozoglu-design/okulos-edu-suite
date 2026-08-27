# OkulOS Ders Programı Motoru — World-Class Parity ve Üstünlük Planı

Tarih: 2026-08-26
Durum: authoritative execution plan

## Çalışma kuralı
Bir bölüm; veri modeli/Cloud, solver, canonical validator/score, UI/rapor, test/benchmark, CI ve handoff tamamlanmadan CLOSED sayılamaz. CLOSED olmadan sonraki bölüme geçilmez. Uygulanmış migrationlar değiştirilmez; yalnız forward-only ve mümkün olan en küçük migrationlar eklenir. Production DB Lovable Cloud PostgreSQL'dir; Lovable AI/chat kullanılmaz. HARD ihlal sessizce gevşetilmez.

## Nihai hedef
Timefold + UniTime + aSc + FET + CP-SAT sınıfındaki timetable kabiliyetini kapsamak; MEB/MTAL/MESEM semantiği, mevzuat güvenliği, açıklanabilirlik ve operasyonel kullanımda ileri gitmek. “Dünyanın en iyisi” yalnız ortak, tekrarlanabilir benchmark kanıtından sonra kullanılabilir.

## Bölüm sırası
1. Öğrenci çakışma optimizasyonu — **CLOSED 2026-08-26**
2. Blok ders + LNS motoru — **CLOSED 2026-08-26**
3. Derin ejection-chain — **CLOSED 2026-08-26**
4. Generic constraint parity — **CLOSED 2026-08-26**
5. Oda/bina parity kapanışı — **CLOSED 2026-08-26**
6. Student sectioning tam kapanış — **CLOSED 2026-08-27**
7. Substitution tam kapanış — **CLOSED 2026-08-27**
8. Zaman modeli: odd/even week, tarih/dönem, çoklu vardiya — **CLOSED 2026-08-27**
9. Incremental score & büyük okul performansı — **NEXT**
10. Adaptive/elite solver
11. Hybrid compute kapanışı
12. CP-SAT exact oracle
13. Dünya benchmark paketi
14. Release/açıklanabilirlik
15. Final parity audit ve superiority gate

---

## Bölüm 1 — Öğrenci çakışma optimizasyonu — CLOSED
- Öğrenci çakışması MEDIUM objective; `allow_overlap=true` hariç; PRIMARY > ALTERNATIVE > SUBSTITUTE + priority ağırlığı.
- Canonical Cloud: `student_conflict_penalty`, `get_schedule_assignment_student_conflict_weights_v2`, `get_schedule_student_conflict_report_v2`, `get_schedule_scenario_student_conflict_summary_v1`.
- Local CPU/WebGPU/server objective aynı semantiği kullanır.
- Migrations: `20260826124000_schedule_student_conflict_objective_v1.sql`, `20260826124100_schedule_student_conflict_report_alignment.sql`.

## Bölüm 2 — Blok ders + LNS motoru — CLOSED
- `[2]`, `[2,2]`, `[3]`, `[2,1]` activity-atomic; move/swap/local search/LNS blok parçalayamaz.
- LNS: TEACHER_DAY, CLASS_DAY, COURSE_BLOCK, CONFLICT_HOTSPOT, LOW_QUALITY_ZONE, RANDOM_SMALL.
- HARD→MEDIUM→SOFT lexicographic kabul; kötüleşmede rollback.
- Migrations: `20260826164500_schedule_block_lns_closure.sql`, `20260826165500_schedule_block_atomic_wrappers.sql`, `20260826170500_schedule_external_lns_job_config.sql`.

## Bölüm 3 — Derin ejection-chain — CLOSED
- Bounded depth 3–5, expansion budget, cycle prevention; blocker modeli teacher/class/classroom/student-conflict resource bazlıdır.
- Her node atomic move plan, her chain canonical batch preview; apply restore-point korumalıdır.
- UI `/schedule-ejection-chain`; CI run `32993983161` SUCCESS.

## Bölüm 4 — Generic constraint parity — CLOSED
- 26 canonical relation tipi; HARD/MEDIUM/SOFT/OFF; unary/binary/n-ary set evaluation.
- Objective: HARD → unplaced → MEDIUM → SOFT → legacy.
- UI `/schedule-rules-relations`.
- Migrations: `20260826231000_schedule_generic_constraint_parity.sql`, `20260826233000_schedule_generic_constraint_set_parity.sql`, `20260826234000_schedule_generic_constraint_series_cast_fix.sql`.
- CI run `33010428054` SUCCESS.

## Bölüm 5 — Oda/bina parity — CLOSED
- Canonical model: `schedule_buildings`, classroom building/floor, `schedule_period_breaks`, `schedule_building_travel`, `schedule_room_pools`.
- Shared/virtual room için tek authority `schedule_room_pools`.
- HARD: capacity, required room özellikleri, exact-room collision, pool simultaneous/aggregate capacity, break-aware building transfer.
- SOFT: preferred room/building/features, capacity waste, building changes.
- Migrations: `20260826235000_schedule_room_building_parity_v2.sql`, `20260826235500_schedule_room_reoptimize_v2.sql`.
- CI run `33014655258` SUCCESS.

## Bölüm 6 — Student sectioning — CLOSED
- PRIMARY / ALTERNATIVE / SUBSTITUTE; HOME_CLASS / OFFERING / CROSS_CLASS.
- Tek candidate authority: `get_student_section_candidates_v2`; online, fail-first batch, conflict repair ve explanation aynı semantiği tüketir.
- Locked enrollment korunur; capacity unknown tahmin edilmez; advisory lock capacity race'i engeller.
- UI `/student-sectioning`; migration `20260827000500_schedule_student_sectioning_v2.sql`.
- Final code CI `33015602242`, docs closure CI `33019041990`, SUCCESS.

## Bölüm 7 — Substitution — CLOSED
- Haftalık `teacher_schedule` immutable; tarih bazlı `schedule_daily_overlays` operation vocabulary: COVER/MOVE/SWAP/CANCEL/CREATE/SPLIT/JOIN.
- Exact absence snapshot: `source_schedule_id`, `course_id`, `classroom_id`, `subgroup_id`.
- Canonical V4 candidate authority qualification, availability, fairness, duty ve building-transfer nedenlerini açıklar.
- Direct + iki adımlı chain cover atomik apply edilir; teacher/class/subgroup/room/pool/building HARD audit ve operation-group rollback vardır.
- SPLIT gerçek subgroup, JOIN `effective_class_ids[]` taşır; bildirim overlay seviyesinde WebPush/Telegram dağıtımına ayrılmıştır.
- Delegated authority `substitutes.manage`; UI `/substitutes`.
- Migrations: `20260827002000_schedule_substitution_v4.sql`, `20260827002500_schedule_substitution_split_join_v4.sql`, `20260827003000_schedule_substitution_permission_alignment_v4.sql`.
- Final code CI `33020382676`, authoritative docs CI `33020566641`, SUCCESS.

## Bölüm 8 — Zaman modeli — CLOSED

### Canonical time domain
- `schedule_sessions` ve `schedule_period_definitions` çoklu vardiya/session modelidir.
- Canonical slot aralığı 1–24; `local_period` kullanıcıya vardiya içi ders numarasını gösterir.
- `schedule_time_profiles.week_parity_anchor` tek/çift hafta referansını belirler.
- `teacher_course_assignments`: `week_pattern` (`ALL/ODD/EVEN`), `valid_from`, `valid_to`, `term_no`, `schedule_session_id`.
- `school_classes`, `teacher_schedule`, `schedule_scenario_rows`, `teacher_unavailability` session-aware'dır.
- Production'da bilinmeyen gerçek ders saatleri tahmin edilmez; tek mevcut session legacy davranışı korur. Çoklu session için saat bilgisi eksikse health/preflight conservative davranır.

### Tarih ve applicability authority
- `is_teaching_day()` aktif akademik yıl + aktif time profile öğretim günleri + `school_calendar_events` üzerinden karar verir; Cumartesi gibi kuruma özel öğretim günü desteklenir.
- Assignment applicability; tarih aralığı, dönem, ALL/ODD/EVEN ve `week_parity_anchor` ile hesaplanır.
- ODD ve EVEN scope'lar aynı canonical slotu paylaşabilir; ALL↔ODD/EVEN, aynı dönem ve kesişen tarih aralıkları gerçek resource collision üretir.
- `schedule_calendar_slot_overrides` tarih/session/slot bazlı OPEN/CLOSED istisnaları taşır.

### HARD validator / solver parity
- Current schedule ve scenario teacher/class/room collision yalnız time scope'lar gerçekten kesişiyorsa HARD'dır.
- Session dışı canonical slot reddedilir; room-pool ve building-transfer guardları aynı scope semantics'i kullanır.
- DB-native generator günlük yük, çalışma günü, consecutive, teacher/class occupancy ve adjacency hesabını scope-aware yapar.
- Browser CPU/LNS worker `schedule-local-solver-time-core.ts` kullanır; assignment allowed periods + scope overlap + student conflict aynı canonical semantiğe bağlıdır.
- Student conflict summary/report ODD↔EVEN'i yanlış conflict saymaz; room candidate/objective yalnız overlapping scope satırlarını tüketir.

### Günlük operasyon entegrasyonu
- `get_teacher_schedule_for_date_v1` yalnız o tarihte uygulanabilir weekly rows'u döndürür.
- Substitution effective-day ve `report-absence` date-applicable authority'yi kullanır; ODD/EVEN veya dönem dışı ders için sahte absence lesson oluşmaz.

### UI / forward migrations / tests
- UI `/schedule-time-model`: week parity, session, canonical/local period, gerçek saat, class→session ve assignment hafta/dönem/tarih/session yönetimi.
- UI `/schedule-time-overrides`: tarih bazlı OPEN/CLOSED slot override; iki route da `/schedule` feature family altındadır.
- Migrations: `20260827010000_schedule_time_model_v1.sql`, `20260827010500_schedule_time_scope_validator_v1.sql`, `20260827011000_schedule_time_scope_solver_v1.sql`.
- Regression: `tests/schedule-time-model.test.ts`; ODD/EVEN sharing, ALL overlap, term/date disjointness, allowed session slots, server/local parity, absence applicability ve “fake clock yok” sözleşmeleri.
- Type contract fix: `a6a32ff9e84b4285e1514d2832ed1cbbb79ea491` (`schedule_session_id` undefined yerine canonical null).

### Production smoke / closure CI
- Tenant `774380`: 1 session; active class without session 0; active assignment without session 0; period definition 0 (bilerek, gerçek saat bilinmediği için sahte veri eklenmedi).
- Final code CI run `33027244816`: 80/80 tests, migration/replay, tenant/route, timetable authority, Phase guards, auth/delegated permission, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.

### Tekrar açılma koşulu
Bölüm 8 yalnız scope overlap, odd/even applicability, academic calendar/date override, session/period mapping, variable clock, room/building temporal collision veya substitution date applicability regression'ında yeniden açılır. Performans/delta-score optimizasyonu Bölüm 9'da bu canonical time domain'i tüketir; ikinci zaman motoru açılmaz.

---

## Bölüm 9 — Incremental score & performans — NEXT
Akış: profile → hotspot indexes → delta score → cached relation/student/room/time conflict deltas → partial recompute → large-grid virtualization → 100+ class benchmark → memory/p95 gates → CI.

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
