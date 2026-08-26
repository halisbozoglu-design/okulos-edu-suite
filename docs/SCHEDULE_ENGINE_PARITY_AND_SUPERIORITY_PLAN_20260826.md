# OkulOS Ders Programı Motoru — Parity + Üstünlük Planı

Updated: 2026-08-26
Status: AUTHORITATIVE TARGET

## Hedef
OkulOS yalnız bir otomatik ders dağıtıcı olmayacak. Timefold, UniTime, aSc Timetables, FET ve CP-SAT sınıfındaki çözücülerin okul çizelgelemede sunduğu kabiliyetlerin tamamını kapsayacak; Türkiye/MEB/MTAL/MESEM alan bilgisinde, güvenli manuel müdahalede, açıklanabilirlikte ve mevzuat doğruluğunda bunların üstüne çıkacak.

“Dünyanın en iyisi” yalnız benchmark ile kanıtlanır. Benchmark sonucu yoksa bu ifade kullanılmaz.

## Rakip kabiliyet matrisi

### Timefold parity
- HARD / MEDIUM / SOFT lexicographic score
- Construction Heuristics: First Fit, FFD, weakest/strongest fit, cheapest insertion, regret insertion
- Local Search
- Tabu Search
- Simulated Annealing
- Late Acceptance
- Great Deluge
- Step Counting Hill Climbing
- Variable Neighborhood Descent
- Çok fazlı solver: construction → metaheuristic → intensification
- Move selector / acceptor / forager benzeri operator mimarisi
- Best solution retention
- Deterministic seeds / reproducible runs
- Time/step/unimproved termination
- Benchmark/tuning ve regression gates
- Incremental score yaklaşımı

### UniTime parity
- Önce complete/feasible timetable, sonra preference optimization
- Time + room birlikte çözüm
- Room capacity/features/preferences
- Instructor availability/preferences
- Distribution constraints
- Student demand / projected demand / historical demand
- Student conflict minimization
- Student sectioning: batch + online
- Alternatives/substitutes/priorities/free-time requests
- Distance/travel conflicts
- Back-to-back room/building distance preference
- Section balancing
- Date patterns / odd-even / term patterns
- Interactive suggestions: bir hamle için zincirleme çoklu değişiklik önerileri
- Placement alternatives + conflict explanation
- Existing schedule preservation
- Reload changed input while retaining valid assignments
- Reports + export + saved/committed solutions

### aSc Timetables parity
- Güçlü otomatik ve cloud generation
- Planlama öncesi test
- Teacher/class/subject/classroom constraints
- 50+ advanced planning relationships seviyesinde generic relation engine
- Day/week/term/bell/break structures
- Double/multi-period lessons and break crossing rules
- Teacher max consecutive / gaps / free days
- Room capacities, shared room capacity, room alternatives
- Buildings + transfer times; break-length-aware travel
- Groups, joins, splits, seminars/courses, student picks
- Multiple users / online collaboration
- Substitution: absence, best cover suggestion, move/split/join/cancel/new lesson, chain teacher swaps, workload balancing
- Publishing/mobile/current schedule propagation

### FET parity
- Years/groups/subgroups incl. overlapping structures
- Teachers/subjects/activity tags/rooms/buildings/activities
- Split activities/components
- Time + space constraints with weighted preferences
- Preferred start/time slots, min/max days, gaps, consecutive, early/late, interval-day limits
- Same start / ordered / consecutive activity relations
- Max simultaneous activities and resource-specific constraints
- Home/preferred rooms; virtual rooms
- Very large activity/resource scale
- Multiple timetable generation + conflict ranking
- XML/CSV import/export semantics

### CP-SAT / exact baseline parity
- Boolean/integer model export for benchmarkable core problems
- Hard feasibility proof when model/time permits
- Objective lower/upper bounds and optimality gap where available
- Exact small-instance oracle for regression tests

## OkulOS üstünlük katmanı
- MEB/TTKB/MTEGM resmi haftalık ders çizelgesi ve MTAL/MESEM alan-dal/cohort verisi native
- Kaynak/provenance/version/karar no/uygulanma yılı korunur
- HARD mevzuat kuralları AI tarafından sessizce gevşetilemez
- HARD / MEDIUM / SOFT / OFF kural modu
- Her manuel move/swap/batch move aynı canonical DB validator üzerinden
- Preview → reason → apply → restore point → undo
- Atomic batch move
- Sıkışma root-cause → smallest safe action → rescore → before/after
- Human lock/pin korunarak remaining schedule reoptimization
- DB-native + browser CPU + WebGPU + gerçek external CPU/GPU worker yarışması
- Worker heartbeat, claim/complete/failover, stale-worker reaping
- MEB okul türleri için constraint presetleri ve resmi veriyle otomatik model kurulumu
- Açıklanabilir score breakdown ve mevzuat/source citation

## Çalışma paketleri

### WP1 — Constraint ontology + score contract
- Tek generic `schedule_constraint_catalog` semantiği
- scope: teacher/class/course/room/building/student/group/activity/resource/global
- relation: availability, overlap, order, same/different time/day/room, distance, capacity, spread, gaps, consecutive, min/max, preference
- mode: HARD/MEDIUM/SOFT/OFF
- weight + effective dates + source provenance
- lexicographic score: hard first, medium second, soft third

### WP2 — Construction engine
- Fail-first/MRV
- First Fit Decreasing
- Cheapest insertion
- Regret-2 / Regret-3 insertion
- scarcity/resource pressure ordering
- adaptive heuristic selection by benchmark history

### WP3 — Neighborhood/operator engine
- single move
- swap
- chain swap
- 2-opt-like day/time exchange
- block move
- teacher-day destroy/rebuild
- class-day destroy/rebuild
- room reassignment
- ejection chain
- ruin & recreate / LNS

### WP4 — Metaheuristics
- Late Acceptance
- Tabu (entity/value/move)
- Simulated Annealing
- Great Deluge
- Variable Neighborhood Descent
- adaptive operator weights
- elite pool / best solution retention
- intensification/diversification phases

### WP5 — Student demand/sectioning
- student course requests
- priorities, alternatives, substitutes
- capacities
- section choice
- free times
- overlap policy
- travel distance
- preserve existing assignment
- batch and online sectioning

### WP6 — Space/building model
- room capacity/features/type/equipment
- room sharing with aggregate capacity
- multiple/virtual room bundles
- building coordinates/travel matrix
- break-aware transfer feasibility
- home/preferred/required/prohibited rooms

### WP7 — Generic planning relations
At least aSc/FET breadth: same/different time/day/room, ordered, consecutive, min/max gaps, max simultaneous, interval constraints, free-day, spread, paired/block lessons, component constraints, activity tags, joins/splits.

### WP8 — Interactive suggestions
- selected lesson → all feasible placements
- conflict list and score delta
- bounded-depth ejection-chain suggestions
- full proposed assignment sequence before apply
- HARD safe by default; no UI switch to silently break legal HARD rules
- atomic apply + restore point

### WP9 — Substitution/day-of-operation
- absentee teacher/room/class
- ranked cover teachers
- qualification/branch/availability/workload/fairness
- teacher chain swaps
- move/split/join/cancel/create lesson
- daily version overlay without destroying base timetable
- notification/publishing hooks

### WP10 — Hybrid compute
- DB-native fallback
- browser CPU pool
- WebGPU scoring/search kernels
- external CPU/GPU workers
- AUTO/HYBRID distributes seeds/operators across all healthy workers
- common server-side hard audit/rescore before candidate acceptance

### WP11 — Benchmark laboratory
Datasets: synthetic-small, medium, large, dense, MTAL, MESEM, anonymized real schools, ITC-compatible datasets.
Metrics: hard violations, feasibility rate, medium/soft score, unplaced, student conflicts, teacher gaps, room quality, time-to-first-feasible, time-to-best, p50/p95 runtime, determinism, memory.
Competitors: OkulOS variants, Timefold, UniTime-compatible benchmark where model mapping is fair, FET where model mapping is fair, OR-Tools CP-SAT exact baseline.
Minimum 30 seeds for stochastic solvers; fixed hardware/time budget.

### WP12 — Release gate
- HARD leakage = 0
- migration/tenant/security/restore tests green
- CI solver regression green
- large-school performance budget green
- benchmark result cannot regress beyond defined tolerance
- “world-leading” label only after external parity benchmark evidence

## Immediate implementation order
1. Lexicographic score + Regret construction + LA/Tabu local search.
2. Batch-move frontend wiring.
3. Generic relation/constraint ontology audit against current DB; add only missing forward schema.
4. Room/building/travel parity.
5. Student demand/sectioning domain.
6. Interactive ejection-chain suggestions.
7. Substitution overlay parity.
8. AUTO/HYBRID all-worker pool.
9. CP-SAT benchmark adapter.
10. Timefold/FET/UniTime parity benchmark runners and final evidence report.
