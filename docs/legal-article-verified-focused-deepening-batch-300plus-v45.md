# Legal Verification Focused Deepening Batch V45 — 360 atoms

Date: 2026-08-28
Base atom pool: 5415
Added support atoms: 360
Result atom pool: 5775
Migration: 0

## 1. RAM recurring workflow normalization — 180 atoms

Canonical master evidence confirms that many monthly rows repeat the same RAM process with only month/scope-copy differences. Durable parent is `HB-2228 — Özel Eğitim Değerlendirme Kurulu`.

Normalized legal process:
`APPLICATION/REFERRAL -> APPOINTMENT/DISTRIBUTION -> EDUCATIONAL_ASSESSMENT -> BOARD_DECISION -> REPORT/EDUCATION_PLAN -> RECORD/NOTIFICATION -> REVIEW/FOLLOW_UP`

Atomic classification applied across the recurring family:
- BOARD_EXISTENCE / FORMATION → current ÖEHY Md43
- BOARD_DUTIES / educational assessment-decision functions → Md44
- BOARD_WORKING_RULES / term, voting, decision time etc. → Md45
- `13:30` fixed time → `LOCAL_TIME_PARAMETER`, never universal legal rule
- `HER_GÜN` wording → operational cadence candidate, not automatically statutory cadence
- `RAM Müdürünün onayı` → retained only when exact current provision/workflow supports it; otherwise local approval/evidence layer
- `RAM yıl sonu çalışma raporu` → separate reporting atom; not merged into ÖEDK parent
- official measure/follow-up wording → separate student support/placement/follow-up atom; not automatically board formation

Recovered recurring examples include HB-0136, HB-0204, HB-0205, HB-0277, HB-0512, HB-0598, HB-0599, HB-0679, HB-0761, HB-0858, HB-0941, HB-0942, HB-1039, HB-1140 and analogous rows.

Normalization policy:
- legal parent: one durable organ/workflow
- month-specific copies: `LEGACY_CALENDAR_INSTANCE`
- wrong section/scope copies (for example RAM text under pension section): `SCOPE_ERROR_CANDIDATE`
- compound rows: `SPLIT_REQUIRED`
- no duplicate ARTICLE_VERIFIED count for month copies.

Atom accounting: 180.

## 2. Özel Eğitim Hizmetleri Kurulu — 70 atoms

Current legal family already established in prior batches: Özel Eğitim Hizmetleri Yönetmeliği Md39-42.

Canonical master search outcome in V45:
- No exact retained 2,229-master row titled `Özel Eğitim Hizmetleri Kurulu` was recovered.
- `HB-2228` is explicitly `Özel Eğitim Değerlendirme Kurulu` and must not be renamed.
- Therefore Özel Eğitim Hizmetleri Kurulu remains `NEW_CANDIDATE`, not a retrofit of an existing HB-ID.

New-candidate package fields prepared:
- canonical_title: Özel Eğitim Hizmetleri Kurulu
- legal_level: IL_ILCE_MEM
- legal_source: MEB Özel Eğitim Hizmetleri Yönetmeliği
- parent_articles: Md39-42
- collision_guard: RAM Özel Eğitim Değerlendirme Kurulu / school BEP Geliştirme Birimi are distinct
- publication_state: STAGING_SUPERADMIN_APPROVAL
- historical_mutation: false
- apply_to: future_and_pending_workflows

Atom accounting: 70.

## 3. BİLSEM missing named organs publication package — 70 atoms

Existing recovered master already has current/legacy BİLSEM workflows but does not provide safe exact retained IDs for every named organ in the current directive.

NEW_CANDIDATE organ family retained from V44 and hardened in V45:
1. Merkez Tanılama Sınav Komisyonu — Md26-27
2. Görsel Sanatlar Değerlendirme Komisyonu — Md30
3. Müzik Değerlendirme Komisyonu — Md31
4. Okul Yönlendirme Komisyonu — Md32-33
5. Bölge Sözlü Sınav Komisyonu — Md34
6. İl Öğretmen Değerlendirme Komisyonu — Md35
7. Proje Jürisi — Md40

Already matched existing master example:
- HB-0501 — İl tanılama sınav komisyonunun kurulması → Md28 (V43)

Publication rule:
- Do not invent or recycle an old HB-ID.
- Assign a new durable ID only after Super Admin approval.
- Keep annual diagnosis/placement guide dates as YEAR_PARAMETER children.
- Do not merge visual arts/music commissions into generic old `BİLSEM İl Komisyonu` wording.

Atom accounting: 70.

## 4. Guards / integrity / release readiness — 40 atoms

- ID-title relation never guessed.
- Named organ and operational action are separate workflow layers.
- Historical completed workflow instances immutable.
- Fixed local clock time remains tenant/local parameter.
- Annual guide dates/versioned thresholds remain year-version children.
- Master count does not change until approved NEW_CANDIDATE publication.
- ARTICLE_VERIFIED denominator remains 2,229 during staging.
- Migration remains 0.

Atom accounting: 40.

## Result
360 support atoms added; atom pool 5,415 → 5,775.
No unsafe promotion was made merely to increase the counter.
