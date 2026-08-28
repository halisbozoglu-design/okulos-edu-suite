# V49 — RAM source-exact deepening

Date: 2026-08-29
Migration: 0
Support atoms added: 600

## Current source
Current authority used for RAM operational duties: Millî Eğitim Bakanlığı Rehberlik ve Araştırma Merkezi Yönergesi, especially Md.5/4-a.

## Exact duty atoms
- Md.5/4-a/1: educational institutions are given consultancy while preparing the school guidance and psychological counseling program.
- Md.5/4-a/2: programs sent through e-Rehberlik are reviewed, evaluated and feedback is provided.
- Md.5/4-a/3: where no counselor exists, general/local-target work is carried out.
- Md.5/4-a/4: educational institutions are visited and consultancy is provided to counselors, teachers and administration.
- Md.5/4-a/5: training activities are organized according to needs.
- Md.5/4-a/6: needs-analysis/e-Rehberlik data are assessed for local targets.
- Md.5/4-a/7: meetings with counselors in the responsibility area are held at least twice each school year, at the beginning and end.
- Md.5/4-a/8: beginning-of-year meeting plans work and forms needed teams/commissions/groups.

## Canonical master findings
### Generic consultancy family — no whole-row promotion
Repeated master rows with text `Resmi/özel okul ve kurumlara yönelik müşavirlik çalışmalarının yapılması` include at least:
- HB-0141 — Haziran
- HB-0208 — Temmuz
- HB-0280 — Ağustos
- HB-0396 — Eylül
- HB-0685 — Aralık
- HB-0767 — Ocak
- HB-0863 — Şubat
- HB-0948 — Mart

Reason withheld: current Md.5/4-a has several distinct consultancy actions. The legacy phrase is broader than a/1 and a/4 and does not identify program-preparation consultancy vs visit-based consultancy. These rows are calendar instances of a generic handbook action, not source-exact legal parents.

### Visit family — partial source match, not full promotion
Examples:
- HB-0764 — January school guidance-service visits
- HB-0946 — March school guidance-service visits
- HB-0947 — March responsibility-district school guidance-service visits
- HB-1143 — May responsibility-district school guidance-service visits

Md.5/4-a/4 requires both visiting the educational institution and providing consultancy to specified audiences. Legacy visit-only rows do not expressly include the consultancy output; classified `PARTIAL_EXACT_ACTION` and not counted ARTICLE_VERIFIED.

### School-program review family
- HB-0517 — October compound: program review + generic consultancy; `SPLIT_REQUIRED`.
- HB-0601 — November compound: program review/form return + generic consultancy; `SPLIT_REQUIRED`.
- HB-0602 — November atomic program-review/form-return row but wrongly scoped under PANSİYONLU section; operationally maps to Md.5/4-a/2 after scope correction. Status `SCOPE_CORRECTION_READY`, not ARTICLE_VERIFIED until correction publication.

### Exact annual meeting workflow promotion
1. HB-0395 — `Kurumumuz sorumluluk alanındaki ilçelerde görev yapan rehber öğretmenleri ile eğitim- öğretim yılının ilk toplantısının yapılması`
   - current source: RAM Yönergesi Md.5/4-a/7
   - scope: counselors in responsibility area
   - operation: beginning-of-school-year meeting
   - timing: beginning of year
   - status: ARTICLE_VERIFIED

2. HB-0138 — `Kurumumuzun sorumluluk alanındaki ilçelerdeki rehber öğretmenlerle yıl sonu toplantısının yapılması`
   - current source: RAM Yönergesi Md.5/4-a/7
   - scope: counselors in responsibility area
   - operation: end-of-school-year meeting
   - timing: end of year
   - status: ARTICLE_VERIFIED

Duplicate/instance guard:
- HB-0516 repeats the same beginning-of-year first-meeting concept in October and is not counted as a second legal parent.
- mid-year/semester meeting rows are not promoted under a/7 because a/7 mandates beginning and end, minimum two meetings; it does not independently require a mid-year meeting.

## Result
ARTICLE_VERIFIED: 467 -> 469
Remaining exact: 1760
Atom pool: 7215 -> 7815
Migration: 0
