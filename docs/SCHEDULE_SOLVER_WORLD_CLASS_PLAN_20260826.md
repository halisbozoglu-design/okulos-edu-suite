# OkulOS Ders Programı Motoru — World-Class Parity ve Üstünlük Planı

Tarih: 2026-08-26
Durum: authoritative execution plan

## Çalışma kuralı
Bir bölüm; veri modeli/Cloud, solver, canonical validator veya score, kullanıcı arayüzü/rapor, test/benchmark, CI ve handoff bağlantıları tamamlanmadan CLOSED sayılamaz. Bir bölüm CLOSED olmadan sonraki bölüme geçilmez. Uygulanmış migrationlar değiştirilmez; değişiklikler forward-only ve mümkün olan en küçük migrationlarla yapılır.

## Nihai hedef
Timefold + UniTime + aSc + FET + CP-SAT sınıfındaki sistemlerin toplam ders programı kabiliyetini kapsamak; MEB/MTAL/MESEM veri semantiği, mevzuat güvenliği, açıklanabilirlik ve operasyonel kullanımda daha ileri gitmek. “Dünyanın en iyisi” iddiası yalnız ortak ve tekrarlanabilir benchmark ile kullanılabilir. HARD ihlal bulunan hiçbir sonuç başarı sayılmaz.

## Bölüm sırası
1. Öğrenci çakışma optimizasyonu — **CLOSED 2026-08-26**
2. Blok ders + LNS motoru — **CLOSED 2026-08-26**
3. Derin ejection-chain — **CLOSED 2026-08-26**
4. Generic constraint parity — **CLOSED 2026-08-26**
5. Oda/bina parity kapanışı — NEXT
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

## Bölüm 2 — Blok ders + LNS motoru — CLOSED

### Canonical blok kimliği
- Yeni paralel blok tablosu açılmadı; mevcut `course_schedule_rules.block_pattern`, `normalize_schedule_block_pattern_v2`, `get_schedule_activity_instances_v1`, `schedule_current_block_matches_phase3_v1` ve scenario block guard canonical authority olarak korundu.
- `[2]`, `[2,2]`, `[3]`, `[2,1]` gibi patternler activity componentlere ayrılır.
- Local solver her component'e `activity_key` ve `activity_duration` verir; optimizasyon tek satır değil tüm activity üzerinde çalışır.
- Kilitli contiguous run gerçek pattern multisetinden düşülür; remaining componentler üretilir. Patternle uyuşmayan locked run HARD kaliteyi bozar ve aday complete olamaz.

### Atomik blok move / swap
- Local search duration>1 activityleri tek nesne olarak söker ve yeniden yerleştirir; blok içinden tek ders saati koparılamaz.
- Mevcut manuel UI RPC isimleri korunarak block-aware wrapper yapıldı: `preview_schedule_move_v1`, `move_schedule_slot_v1`, `preview_schedule_swap_v1`, `swap_schedule_slots_v1`.
- `get_schedule_atomic_move_plan_v1()` satırın normal activity mi blok component mi olduğunu belirler.
- Blok ise seçilen saatin component içi offsetini koruyarak tüm component hedefe taşınır.
- Tüm hareket `preview_schedule_batch_move_v1` / `move_schedule_slots_batch_v1` üzerinden canonical upsert validatorına gider; tek satır başarısız olursa transaction rollback.
- Hareket sonrası `schedule_current_block_matches_phase3_v1()` tekrar doğrulanır. Pattern bozulursa rollback.
- Hedefte aynı assignment'ın başka bloğuyla birleşip pattern bozma ihtimali `BLOCK_WOULD_MERGE` ile reddedilir.

### LNS motoru
Gerçek ruin-and-recreate portfolio:
- `TEACHER_DAY`
- `CLASS_DAY`
- `COURSE_BLOCK`
- `CONFLICT_HOTSPOT`
- `LOW_QUALITY_ZONE`
- `RANDOM_SMALL`

Ruin yalnız kilitsiz **activity** gruplarını kaldırır. Recreate mevcut fail-first / Regret construction, planning relations ve student-conflict MEDIUM objective'i kullanır.

Kabul sırası lexicographic:
1. HARD
2. MEDIUM
3. SOFT

Recreate unplaced üretirse, HARD ihlal üretirse veya lexicographic kaliteyi kötüleştirirse tüm neighborhood rollback olur. Best-solution retention korunur.

### Metaheuristic + LNS bağlantısı
- Construction sonrası mevcut LA / Tabu / Simulated Annealing / Great Deluge / VND portfolio activity-atomic hale getirildi.
- LNS bu local-search katmanının ardından ikinci büyük-neighborhood iyileştirme fazıdır.
- Aynı seed deterministik replay verir.
- LNS telemetry: iterations, accepted, improved, rejected, ruinedActivities ve neighborhood sayaçları.
- Adaptive öğrenme bu telemetriyi ileride Bölüm 10'da kullanacak; bu bölümde gizli öğrenme yapılmaz.

### CPU / GPU / external / DB
- Browser CPU worker payload `enableLns` ve `lnsIterations` taşır; varsayılan güçlü akışta LNS açıktır.
- WebGPU candidate ranking aynı HARD -> unplaced -> MEDIUM -> SOFT semantiğini kullanır; GPU desteği yoksa sahte GPU ilan edilmez.
- External worker claim zaten `job.config` aldığı için mevcut protokol genişletilmeden `ADVANCED` job config içine `BLOCK_AWARE_V1` LNS policy, 6 neighborhood, locked/block preservation, lexicographic acceptance ve iteration budget yazılır.
- Harici worker yoksa planner mevcut davranışla db-native fallback yapar.
- Local/remote bulunan hiçbir aday server audit olmadan uygulanmaz: scenario import -> repair -> rescore -> hard/room/applicability status.

### UI / açıklanabilirlik
- Mevcut drag/drop ve swap arayüzü client tarafında ayrı blok kural motoru taşımadan backend wrapperlar sayesinde blok-atomik çalışır.
- `/schedule-validation` dedicated block integrity görünümü içerir: sınıf/ders/öğretmen, beklenen pattern, gerçek pattern ve UYGUN/BOZUK.
- Bozuk blok yayın hazır durumunu kapatır.
- LNS son kullanıcı için varsayılan güçlü optimizasyon davranışıdır; normal kullanıcıdan algoritma seçmesi beklenmez. `enableLns/lnsIterations` solver kontratında gelişmiş/benchmark kullanımına açıktır.

### Test / benchmark kapısı
Regression suite şu garantileri taşır:
- `[2,2]` local search + LNS boyunca iki contiguous çift ders olarak kalır.
- `[3]` hiçbir optimizasyon adımında parçalanmaz.
- Geçerli kilitli `[2]` component korunur, yalnız remaining `[2]` üretilir.
- LNS aynı baseline çözüme göre lexicographic olarak daha kötü sonuç döndüremez.
- Aynı seed deterministiktir.
- 30-seed medium suite HARD leakage=0 ve yüksek feasibility kapısını korur.
- Existing relation/student-conflict/import/voice regressionlar korunur.
- İlk CI denemesi kilitli-run ilk saatinin activityye eklenmediğini yakaladı; test gevşetilmedi, motor `c2a9602f724a24c27412f7d94e6fec39f264b94d` ile düzeltildi.
- Düzeltme sonrası unit/benchmark, migration/replay, tenant, authority, Phase 2-5, production build, route-tree ve TypeScript **SUCCESS**.

### Production Cloud / forward migrations
Cloud-first uygulanıp aynı SQL forward migration olarak repoya işlendi:
- `20260826164500_schedule_block_lns_closure.sql`
- `20260826165500_schedule_block_atomic_wrappers.sql`
- `20260826170500_schedule_external_lns_job_config.sql`

Production smoke'ta block atomic move/swap/integrity ve external-LNS planner fonksiyon imzaları doğrulandı. Test için production'a sahte timetable/job verisi eklenmedi.

### Ana commitler
- `638b1b0aedccf0ffab607e1aa1501c1e05ef17a5` — atomic block-aware LNS core
- `4c7686449648f6e265c7d56986933cd33a4ad63b` — block/LNS regression gates
- `9b06aa67113047dcae44197b34ecae1644f1027d` — local LNS controls/telemetry
- `5daadd446f4c6a5180b86f41e6497727ba71a05c` — canonical block move + integrity RPCs
- `60cd611fad8efefd894dbd8cb8e284aee7c85078` — existing move/swap block-aware wrappers
- `490ac007ca11b4cd28655f5c3a0daa0efdfc462c` — validation UI block integrity
- `c419ee31ea2d9d4d34bcd24f9f407c15b6bcee41` — external worker LNS policy
- `c2a9602f724a24c27412f7d94e6fec39f264b94d` — locked-run correctness fix

### Tekrar açılma koşulu
Bölüm 2 yalnız yeni block-pattern semantiği, gerçek regression veya benchmarkta activity atomicity/LNS kabul hatası bulunursa açılır. Daha derin multi-activity ejection search Bölüm 3; adaptive neighborhood öğrenmesi Bölüm 10 kapsamıdır.

---

## Bölüm 3 — Derin ejection-chain — CLOSED

### Existing backend audit
- `repair_schedule_scenario_core_v2` yalnızca tek adımlık geri izleme (one-step backtracking) yapabiliyordu; çakışan ikinci/üçüncü dersi çözmek için yeterli değildi.
- `suggest_schedule_ejection_chain_v1` fiilen depth-2 çalışıyor ve blocker modeli olarak global aynı-saat doluluğunu (same-clock occupancy) kullanıyordu; gerçek okul ızgaralarında öğretmen/sınıf/derslik çakışması yerine boş olmayan her hücreyi blocker ilan ederek işe yaramaz öneriler üretiyordu.

### New planner: `src/lib/schedule-ejection-chain.ts`
- Sınırlandırılmış derinlik 3–5 arama; her düğümde expansion budget ve imza tabanlı cycle prevention.
- Bloker tespiti: aynı öğretmen, aynı sınıf, aynı derslik ve student-conflict ağırlıklarına göre yapılır; global slot occupancy artık blocker modeli değildir.
- Her arama düğümü `get_schedule_atomic_move_plan_v1()` çağırır; blok componentler atomik kalır ve Bölüm 2 invariant'ları bozulamaz.
- Her tam zincir yalnızca `preview_schedule_batch_move_v1` canonical HARD validasyonundan geçtikten sonra kabul edilir.

### Apply path
- `applyEjectionChain`: önce hedef zincir için immediate re-preview çalıştırır, ardından `move_schedule_slots_batch_v1` ile tek atomik transaction uygular.
- Otomatik restore point oluşturulur; mevcut undo/history path'i (`restore_schedule_restore_point`) korunur.

### Candidate ranking
- Önce MEDIUM: student-conflict çakışmaları ve planning-relation cezaları.
- Ardından SOFT: öğretmen/sınıf boşlukları, geç saat, planning soft penalties ve hareket/oda-değişimi maliyeti.

### UI / operasyon
- Yeni route `/schedule-ejection-chain`: kaynak ders, hedef gün/saat, depth 3/4/5 seçimi, sıralı aday listesi, her adayda depth/hamle sayısı/MEDIUM/SOFT/movement cost.
- Route mevcut timetable navigation'dan (`src/routes/timetable.tsx`) bağlandı: `Derin Ejection-Chain` ve `Zincir Düzeltme` etiketleriyle.
- `/schedule` feature ailesi altında sınıflandırıldı; yeni `system_feature_catalog` kaydı açılmadı.

### Test / kalite kapısı
- `tests/schedule-ejection-chain.test.ts` içinde yedi regression testi:
  - Çelişkili hedefleri aynı atomik satır için reddetme.
  - Atomik çok-satırlı blok satırının korunması.
  - Kaynak-bazlı (resource-aware) bloklama; global slot occupancy değil.
  - İlgisiz aynı-saat dersinin blocker sayılmaması.
  - Student-conflict ağırlıklarının blocker sinyali üretmesi.
  - Hipotetik `applyMoves` kaynak satırları mutasyona uğratmıyor.
  - `scoreEjectionCandidate` lexicographic uyumlu ve movement cost içeriyor.
- CI run `32993983161`, head `de55e8c2ab013c4c95ff636b64888b7483f62503`: unit tests, migrations, replay safety, tenant, authority, Phase 2-5, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.
- Bir önceki CI denemesinde 23/23 test geçmiş, yalnızca route classification hatası nedeniyle düşmüştü; `de55e8c2ab013c4c95ff636b64888b7483f62503` ile route mapping düzeltildi, guard'lar gevşetilmedi.

### Forward migrations
Bölüm 3 **0 yeni migration** ekledi; mevcut block-aware batch RPC'ler (`preview_schedule_batch_move_v1`, `move_schedule_slots_batch_v1`, `get_schedule_atomic_move_plan_v1`) yeniden kullanıldı.

### Ana commitler
- `07be50aa2c62ea78a3bb4a17c352b3e2ef493b07` — ejection-chain planner core
- `222c788af3442228a6413e99e59f1c3785326e72` — resource-aware blocker model + cycle prevention
- `a10645e4a2a58023f3ac17ff61403eba697986d5` — canonical batch preview integration
- `ba0918a1fec38b80eba3ccaee5d99de0777c08d2` — UI route and candidate ranking
- `de55e8c2ab013c4c95ff636b64888b7483f62503` — route classification fix and CI closure

### Tekrar açılma koşulu
Bölüm 3 yalnızca gerçek regression, canonical HARD leakage, atomik blok kırılması veya benchmark kanıtıyla bounded chain search'in yanlış olduğu gösterilirse yeniden açılır.

---

## Bölüm 4 — Generic constraint parity — CLOSED

### Canonical ontology ve activity semantiği
- Generic relation çekirdeği 26 canonical tipe genişletildi; bilinmeyen relation type production tanımına kabul edilmez.
- `[2]`, `[3]`, `[2,2]` gibi bloklarda satır değil **activity-level** değerlendirme yapılır; `block_key` varsa blok tek activity, yoksa satır tek activity kabul edilir.
- Selector kapsamları assignment, course, teacher ve class düzeylerinde çalışır.
- Relation seviyeleri `HARD`, `MEDIUM`, `SOFT`, `OFF` olarak ayrıdır; OFF hesaplanmaz.

### 26 canonical relation tipi
- Zaman: `SAME_TIME`, `DIFFERENT_TIME`, `SAME_START`, `SAME_DAY`, `DIFFERENT_DAY`, `OVERLAP`, `NOT_OVERLAP`, `MIN_GAP`, `MAX_GAP`, `MIN_DAYS`, `MAX_DAYS`, `ADJACENT`.
- Sıra/blok: `ORDERED`, `CONSECUTIVE`, `GROUPED`.
- Oda ilişkisi: `SAME_ROOM`, `DIFFERENT_ROOM`, `SAME_ROOM_IF_CONSECUTIVE`.
- Yerleşim: `STARTS_DAY`, `ENDS_DAY`, `PREFERRED_START`, `PREFERRED_SLOT`, `FORBIDDEN_SLOT`.
- Set-level: `MAX_SIMULTANEOUS`, `MAX_OCCUPIED_SLOTS`, `MAX_DIFFERENT_ROOMS`.
- `PREFERRED_START` yalnız başlangıç saatini, `PREFERRED_SLOT` ise activity'nin kapladığı tam slot kümesini değerlendirir.

### Local solver + canonical Cloud parity
- `src/lib/schedule-constraint-ontology.ts` canonical tip kataloğunu taşır.
- `src/lib/schedule-planning-relations.ts` unary, binary ve n-ary/set-level ilişkileri aynı semantikle puanlar.
- Candidate incremental scoring yalnız adayın eklediği yeni cezayı hesaplar; placed state mutasyona uğratılmaz.
- Cloud evaluator mevcut kanıtlanmış unary/binary evaluator üzerine v2 composition ile set-level ve gelişmiş ilişkileri ekler; eski v1 davranışı silinmedi.
- Scenario HARD audit `validate_schedule_scenario_v2` ve `get_schedule_scenario_hard_issues_v2` zincirine bağlandı.
- Manual batch preview/apply generic HARD assertion çalıştırır; transaction-sonu deferred HARD guard sessiz ihlali engeller.

### Objective vector
Server scenario seçimi düz integer toplam skora bırakılmadı. Authoritative karşılaştırma sırası:
1. HARD
2. unplaced
3. MEDIUM
4. SOFT
5. legacy score

`get_schedule_scenario_objective_vector_v1` bu vektörü üretir. `/schedule-scenario-comparison` önerilen senaryoyu bu lexicographic sıra ile seçer.

### UI / operasyon
- `/schedule-rules-relations` mevcut `/schedule` feature ailesinde ve `schedule.rules` yetki modeli altında çalışır; yeni feature adası açılmadı.
- Kullanıcı JSON yazmadan ilişki tipi, seviye, sol/sağ kapsam, parametre, ağırlık ve açıklama seçebilir.
- Unary tiplerde sağ kapsam gizlenir; set-level ve parametreli tipler kendi form alanlarını açar.
- Ekran aktif programdaki generic HARD/MEDIUM/SOFT özetini gösterir.

### Test / parity kapısı
- `tests/schedule-planning-relations.test.ts` 26 tipin ontology, binary, unary, set-level, mode ayrımı ve candidate incremental davranışını kilitler.
- Özellikle `ADJACENT`, `SAME_ROOM_IF_CONSECUTIVE`, `PREFERRED_START != PREFERRED_SLOT`, `GROUPED`, `MAX_SIMULTANEOUS`, `MAX_OCCUPIED_SLOTS`, `MAX_DIFFERENT_ROOMS` regression altında.
- Son CI'da toplam **42/42 test** geçti.
- CI run `33010428054`, head `1c2b80b653e8058e6db7b284ee7c06286f857bd0`: migration/replay, tenant/route, timetable authority, edge-slot, Phase 2, Phase 3, Phase 4 testing, Phase 5 reporting, auth/delegated permission, production build, route-tree, TypeScript ve forward migration policy **SUCCESS**.
- Authority/Phase guardları kaldırılmadı; yeni canonical migration ve lexicographic sözleşmeye taşındı.

### Production smoke ve forward migrations
Production smoke'ta `ADJACENT`, non-adjacent ihlal, `PREFERRED_START` ve `PREFERRED_SLOT` ayrımı doğrulandı. `smallint -> generate_series` ambiguity gerçek smoke sırasında yakalandı; uygulanmış migration değiştirilmeden ayrı forward fix ile giderildi.

Forward-only migrationlar:
- `20260826231000_schedule_generic_constraint_parity.sql`
- `20260826233000_schedule_generic_constraint_set_parity.sql`
- `20260826234000_schedule_generic_constraint_series_cast_fix.sql`

### Ana commitler
- `1989626fb78e62390f4a527da63f78fe57483e21` — generic server parity
- `a954dfdc49ce5e260c425303ef67206841a9d710` — generic relation rules UI
- `939cd5a81eb838b41cd33ac307dd56d29e2c8f12` — lexicographic scenario comparison
- `59ec929f032c8e3daa2bb50dccff544610458c86` / `264937499818dc73f950869181d3b8e7d318f0d4` — 26-tip ontology/local evaluator
- `0a414e0afe95f21c6378eb7d53f2ef0c0e87b2f6` — set-level Cloud parity migration
- `968c83e81d92f538e8e0bb571da15f82eb2c8ba4` — 26-tip UI parity
- `4b4fb638e29bab41a1c24276f56e7c5308b22e91` — exhaustive relation regression
- `b462d0709551bbab15b7c272cecc396c9ae5250c` — generate_series cast forward fix
- `13c28530da88a81873470e5b7e0775bde6e41a4c` — route/feature classification
- `759d7ef3f5af3e6f5b2e3656f27e60e831ce201a` — authority pointers
- `eee3849cf1dbd1ef8d8a84e65c9825c8b12d79fe` / `1c2b80b653e8058e6db7b284ee7c06286f857bd0` — Phase guard alignment

### Tekrar açılma koşulu
Bölüm 4 yalnız yeni activity-relation semantiği, gerçek local/server parity hatası, HARD leakage veya rakip constraint auditinde activity-relation kategorisinde eksik bulunursa yeniden açılır. Oda kapasitesi, room feature/equipment, bina/floor/travel ve fiziksel kaynak uygunluğu Bölüm 5 kapsamıdır.

---

## Bölüm 5 — Oda/bina parity kapanışı — NEXT
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
