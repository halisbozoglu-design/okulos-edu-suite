# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-31
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. Annual talent-exam guide yalnız ilgili yıl child/snapshot için kullanılabilir.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **20.045**
- Son batch: **V78**
- Sonraki batch: **V79**

## V78 — 410 atom
- Integrity: `docs/legal-talent-exam-mtal-group-integrity-v78.md` — `ab8b3e3e1f7022115ca8585b60e479e64f8e2181`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v78.md` — `b07a8ac2896e331133e2b7e956efa88575513b5d`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v78.md` — `fe8d324229a23cc51ecf9230d58db81b5397554d`
- Progress: `docs/legal-verification-progress-v78-delta.json` — `14d4539b5cc9a6c909c4b8f564a4388544838c0d`
- Support atoms: **410**, pool **19.635 -> 20.045**.
- ARTICLE_VERIFIED: **466 -> 468**, delta **+2**.

### V78 Talent Exam / MTAL findings
- `HB-1690..1697` are talent-exam annual-guide workflows, not generic all-school registration duties.
- 2026 current MEB model: applications 1-26 June; application review/appointments 29-30 June; entrance documents by 30 June; exams 1-12 July; first central placement/asıl-yedek announcement 13 July; final registration 13-22 July; further reserve/additional placement in August.
- 2026 current model also uses max 3 preferences (5 in additional placement), success threshold 50, placement score = 70% talent exam + 30% OBP.
- `HB-1690/1691` have current operational annual support but remain YEAR_PARAMETER children, not durable statutory ARTICLE promotions.
- `HB-1692`, `HB-1696`, `HB-1697`: legacy school/website list-posting or generic reserve semantics do not map one-to-one to current central placement model; rewrite/recheck.
- `HB-1693`: generic `Yetenek Sınav Komisyonları` loses exact current composition and school/program applicability.
- `HB-1694`: `max four invigilators + invigilators do not evaluate` not found in current OÖKY parent; exact current annual-guide provision lock pending.
- `HB-1695`: scoring/ranking is current operationally but field/program criteria are annual parameters.
- `HB-1698`: current OÖKY Md21/3 requires health suitability and, when necessary, health/board report during field transition. Master shifts this to initial-registration report request; timing/object mismatch, no promotion.
- `HB-1699` ARTICLE_VERIFIED +1: OÖKY Md26/1, MTAL 9th-grade program with fewer than 10 students including repeaters does not form a class.
- `HB-1700` ARTICLE_VERIFIED +1: OÖKY Md26/3, when same field/branch lacks workshop/lab equipment and practical training occurs in workplaces, school administration assigns a teacher for a group of at least 8 students.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- ANNUAL_TALENT_EXAM_GUIDE_IS_YEAR_PARAMETER.
- GENERIC_TALENT_EXAM_COMMISSION_NAME_DOES_NOT_PROVE_CURRENT_COMPOSITION.
- RESULT_PUBLICATION_CHANNEL_IS_EXACTNESS_FIELD.
- CENTRAL_PLACEMENT_MODEL_CANNOT_BE_NORMALIZED_TO_LEGACY_SCHOOL_LIST_POSTING.
- HEALTH_SUITABILITY_AND_HEALTH_REPORT_REQUEST_ARE_DISTINCT_ATOMS.
- FIELD_TRANSITION_TIMING_CANNOT_BE_NORMALIZED_TO_INITIAL_REGISTRATION.
- MTAL_GROUP_THRESHOLD_IS_PROGRAM_SPECIFIC.

## V79 priority — 300+ atoms
1. Continue `HB-1701+` exact master extraction after the MTAL group-formation boundary.
2. Audit current field/branch transition, workplace practical education, grouping and program-specific thresholds using current OÖKY/RG chain.
3. Return to HB-1693/HB-1694 only if the 2026 official talent-exam PDF exact commission/invigilator clauses can be safely parsed; no inference from old regulations.
4. Continue staged secondary-school corrections HB-1682..1688 without denominator change until approval/publish.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V79** başlat; minimum **300 atom** hedefle.
