# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. School-type-specific current provisions cannot be inherited by broad ALL metadata.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **466 / 2.229 = %20,9062**
- Kalan exact: **1.763**
- Atom havuzu: **22.095**
- Son batch: **V84**
- Sonraki batch: **V85**

## V84 — 410 atom
- Integrity: `docs/legal-attendance-teaching-hours-integrity-v84.md` — `2c98c015fd246e93be8aa8719d87a90423b618b2`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v84.md` — `830bd61841e01073f4cd4d775da56e05f470287e`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v84.md` — `6398a5fd08ae2e47baec6e78ef051b701ea7cf39`
- Progress: `docs/legal-verification-progress-v84-delta.json` — `be7a763064eb4cf3a5904d2db057efdc5bb3d9d3`
- Support atoms: **410**, pool **21.685 -> 22.095**.
- ARTICLE_VERIFIED: **467 -> 466**, delta **-1**.

### V84 findings
- HB-1749 generic attendance-measures sentence remains non-atomic/withheld.
- HB-1750 maps to OÖKY Md36/3 activity-permission family, but ALL scope is too broad; current authority and maximum-total-duration qualifiers must be preserved.
- HB-1751 omits exact current notification thresholds (5/15/25; special categories 40/55). `belirtilen sürelerde` is not timing-exact.
- HB-1752 carries default >10 unexcused / >30 total failure + written guardian notice, but current Md36/5 has special 60-day exceptions and distinct MESEM theoretical/workplace limits. ALL/default-only row cannot swallow exceptions.
- HB-1753 is compound across own request, discipline, failure and continuous absence; split required.
- HB-1754 has OÖKY Md9/1 exact secondary commission core; ALL scope blocks promotion.
- HB-1755 old break model (20/15/10) conflicts with current OÖKY Md9/1 (inter-lesson >=10, lunch >=45, double-shift may be shorter); master rewrite required.
- HB-1758 ROLLBACK -1: historical ARTICLE used Education Boards and Subject Groups Directive Md9 + ALL. Current exact operational parent is OÖKY Md9/2 and secondary-school scope. No earlier rollback located; rolled back once.
- HB-1759 text-exact to OÖKY Md9/3 40/60-minute vocational practice/stage rule, but program-specific scope cannot remain ALL.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- ATTENDANCE_NOTICE_DAY_THRESHOLDS_ARE_EXACTNESS_FIELDS.
- EXCUSE_DOCUMENT_5_DAY_AND_20_DAY_EXTENSION_ARE_SEPARATE_TIMING_ATOMS.
- DEFAULT_10_30_ABSENCE_LIMIT_CANNOT_SWALLOW_60_DAY_EXCEPTION.
- MESEM_THEORETICAL_AND_WORKPLACE_ATTENDANCE_LIMITS_ARE_DISTINCT.
- OLD_TENEFUS_20_15_10_MODEL_IS_NOT_CURRENT_OOKY_MD9.
- BLOCK_LESSON_APPROVAL_IS_OOKY_MD9_NOT_GENERIC_ZUMRE_DIRECTIVE.
- BLOCK_LESSON_TWO_PERIOD_CAP_IS_EXACTNESS_FIELD.
- VOCATIONAL_40_60_MINUTE_RULE_IS_PROGRAM_SPECIFIC_NOT_ALL.
- ACTIVITY_PERMISSION_AUTHORITY_AND_MAX_TOTAL_DURATION_ARE_EXACTNESS_FIELDS.

## V85 priority — 300+ atoms
1. Continue exact master extraction from `HB-1760+`.
2. Audit night-time enterprise vocational education, intensive programme/week planning, AİHL vocational practice and subsequent programme/lesson-time workflows using current OÖKY/RG chain.
3. Stage corrected school-family children for HB-1750/1752/1754/1758/1759; denominator unchanged until Super Admin publish.
4. Search old ARTICLE batches for nearby ALL rows whose verification source is only thematic/adjacent; rollback once only when proven.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V85** başlat; minimum **300 atom** hedefle.