# V46 — RAM Danışmanlık Tedbiri Reconciliation Manifest

Tarih: 2026-08-28
Migration: 0

## Kaynak sürüm kararı
Danışmanlık tedbirinde primary current source artık MEB ORGM'nin 11.05.2026 güncel mevzuat sayfasında yayımladığı, 24.04.2026 tarih ve 33223 sayılı Resmî Gazete Tebliği'dir.

Eski el kitabı / eski Tebliğ kopyaları yalnız history/provenance olarak kalır; 2026 metniyle çelişirse current authority değildir.

## Semantic groups
### G1 — `OFFICIAL_MEASURES_GENERIC`
Örnek existing IDs: HB-0137, HB-0513, HB-0762.
Text: `Öğrencilerin resmi tedbirlerinin alınması ve takip edilmesi`.
Status: `TEDBIR_SCOPE_REVIEW`.
Reason: `tedbir` kelimesi tek başına danışmanlık tedbiri, özel eğitim yerleştirme kararı veya başka bir resmî tedbiri uniquely tanımlamaz.

### G2 — `RAM_GENERAL_INTERVIEW + COUNSELING_MEASURE`
Örnek IDs: HB-0278, HB-0680, HB-0943, HB-0944 ve benzeri aylık kayıtlar.
Status: `SPLIT_REQUIRED`.
Children:
- GENERAL_RAM_COUNSELING_INTERVIEW
- COUNSELING_MEASURE_EXECUTION

### G3 — `COUNSELING_MEASURE + VIOLENCE_ACTION_PLAN`
Örnek IDs: HB-0206, HB-0600, HB-0763, HB-1040.
Status: `SPLIT_REQUIRED`.
Children:
- COUNSELING_MEASURE_EXECUTION
- VIOLENCE_ACTION_PLAN_IMPLEMENTATION

### G4 — `COUNSELING_MEASURE + LOCAL_MANAGER_MEETING`
Örnek: HB-0514.
Status: `SPLIT_REQUIRED`.

### G5 — Exact duplicate candidate
HB-0943 + HB-0944: same March scope and same text.
Status: `DUPLICATE_EXTRACTION_REVIEW`; do not double-count.

## Current counseling-measure parent
Canonical key: `COUNSELING_MEASURE_EXECUTION`
Trigger: court/child judge counseling-measure decision + responsible institution assignment.
Applicability: condition-triggered, not fixed-month.
Scope routing: school / RAM / other responsible institution according to current Tebliğ.
Evidence: assignment, first-contact record, implementation plan, interview records, monitoring criteria, quarterly reports, court correspondence, closure/continuation decision.
Versioning: source snapshot at task creation; future source changes affect future/pending items after Super Admin review.

## Current special-education board parent
Canonical key: `SPECIAL_EDUCATION_EVALUATION_BOARD_RAM`
Current source: Özel Eğitim Hizmetleri Yönetmeliği Md43-45.
Existing durable workflow: HB-2228.
Do not merge with counseling measure.

## Timing normalization
- handbook/month headings → calendar instance metadata
- `13:30` → LOCAL_TIME_PARAMETER
- current-law explicit workday limits remain LEGAL_DEADLINE
- court/decision trigger → CONDITION_TRIGGER

## Publication rule
Legacy compound IDs remain history-addressable. New atomic child semantics are staged first; no destructive migration is required. Runtime resolves legacy row to canonical legal parents + calendar instance + evidence schema.
