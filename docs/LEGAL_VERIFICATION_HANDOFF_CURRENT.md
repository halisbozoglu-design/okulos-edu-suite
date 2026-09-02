# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF — V86
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. School-type/program-specific current provisions cannot be inherited by broad ALL metadata. Thematic/adjacent article is not exact provision proof.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **463 / 2.229 = %20,7716**
- Kalan exact: **1.766**
- Atom havuzu kapanmış V85 itibarıyla: **22.505**
- Son kapanmış batch: **V85**
- Aktif batch: **V86**
- V86 Phase 1: **40 source/version support atom lock**, ARTICLE_VERIFIED sayacına eklenmedi.

## V85 — 410 atom
- Integrity: `docs/legal-course-selection-integrity-v85.md` — `fb0a4210d31483e6c1d11e9ace3fffd22edd3987`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v85.md` — `89a85fadfe85b71a0904456d5d87938ac522c202`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v85.md` — `362c15aad8dd9e1f565951a0c0572edcaedb163c`
- Progress: `docs/legal-verification-progress-v85-delta.json` — `c80b2bb1cbf0bfce008d1cdba6293c435ea97ed0`
- Support atoms: **410**, pool **22.095 -> 22.505**.
- ARTICLE_VERIFIED: **466 -> 463**, delta **-3**.

### V85 findings
- Exact HB-1760..1770 master boundary extracted.
- HB-1762 ROLLBACK -1: old Batch02 used OÖİKY Md5/A(2-4) + ALL. Master says February-only; current 28.07.2026 OÖİKY Md5/A says January-February and applies to middle/IH middle schools. Timing + scope mismatch.
- HB-1763 ROLLBACK -1: current OÖİKY Md5/A(3) supports unformed-course announcement/redirect for middle/IH middle schools, but old ALL scope has no published common exact parent.
- HB-1766 ROLLBACK -1: old Batch02 used OÖİKY Md5/A(2-4), which contains no minimum-10 course-opening threshold. Thematic adjacency is insufficient.
- HB-1761 secondary February-family announcement candidate; school-family lock required.
- HB-1764 current middle-school no-selection->school-assignment is supported by OÖİKY Md5/A(3); secondary/common scope separately required.
- HB-1765 ninth-grade first-week wording cannot inherit OÖİKY fifth-grade first-week rule.
- HB-1767 secondary/current continuation candidate; ALL blocked.
- HB-1768..1770 are MTAL/program-specific and require current OÖKY + TTK weekly-schedule/version exact lock.
- HB-1760 AİHL professional-practice workflow requires exact current AİHL-specific parent before promotion.

## V86 Phase 1 — MTAL source/version lock
Canonical doc: `docs/legal-article-verified-focused-deepening-batch-v86-phase1.md`.

### Official authority findings
- MTEGM Kurul Kararları portal is the current program/decision registry used for this V86 lock: `https://meslek.meb.gov.tr/kararlar`.
- **TTKB 2026-62**: 2026-2027 education year, preparatory and Grade 9 first, gradual implementation of the Mesleki ve Teknik Okul/Kurumlarda Uygulanacak Seçmeli Dersler Tablosu.
- **TTKB 2026-85**: 2026-2027 education year, preparatory and Grade 9 first, gradual implementation of 52 Anadolu Meslek / Anadolu Teknik field framework curricula.
- MTEGM explicitly records gradual retirement of **2024-41** beginning with preparatory and Grade 9 in 2026-2027. Therefore 2024-41 is not globally dead for all upper-grade legacy cohorts on day one.
- OÖKY **Md.138** proves elective vocational-course education may be carried out in enterprises and, when needed, intensified on weekend holiday, interim break, semester break and summer vacation. This is a delivery rule, not proof that a named field/branch course is eligible.

### V86 canonical resolver
MTAL elective-vocational result MUST resolve:

`education_year + grade/cohort + school/program + field + branch + TTKB_decision_version`

`latest decision wins` is forbidden during phased transitions.

### V86 current accounting
- Phase-1 support locks documented: **40**.
- No Phase-1 ARTICLE_VERIFIED promotion.
- No additional Phase-1 rollback booked.
- ARTICLE_VERIFIED remains **463 / 2.229**.
- HB-1768..1770 remain program-specific pending exact claim/source match.
- HB-1771+ legacy Batch02 rows with OÖİKY/ALL ancestry must be audited by exact claim text/scope before once-only rollback or promotion.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- JANUARY_FEBRUARY_IS_NOT_FEBRUARY_ONLY.
- FIFTH_GRADE_FIRST_WEEK_CANNOT_VALIDATE_NINTH_GRADE_FIRST_WEEK.
- COURSE_SELECTION_SAME_ACTION_ACROSS_LEVELS_REQUIRES_SCHOOL_FAMILY_SPLIT.
- THEMATIC_ARTICLE_DOES_NOT_PROVE_NUMERIC_COURSE_OPENING_THRESHOLD.
- ELECTIVE_GENERAL_AND_ELECTIVE_VOCATIONAL_THRESHOLDS_ARE_DISTINCT.
- COURSE_OPENING_THRESHOLD_EXCEPTIONS_ARE_EXACTNESS_FIELDS.
- AİHL_PROFESSIONAL_PRACTICE_IS_PROGRAM_SPECIFIC.
- TTK_WEEKLY_SCHEDULE_RULE_IS_VERSIONED_PROGRAM_AUTHORITY.
- MTAL_ELECTIVE_ELIGIBILITY_REQUIRES_TTKB_PROGRAM_LOCK.
- LATEST_TTKB_DECISION_DOES_NOT_AUTOMATICALLY_WIN.
- PHASED_TTKB_TRANSITION_REQUIRES_COHORT_RESOLUTION.
- DELIVERY_PERMISSION_DOES_NOT_PROVE_COURSE_ELIGIBILITY.
- ELECTIVE_TABLE_AND_FRAMEWORK_PROGRAM_ARE_DISTINCT_AUTHORITIES.
- LEGACY_COHORT_MAY_RETAIN_PRIOR_TTKB_VERSION.
- ALL_SCOPE_CANNOT_INHERIT_PROGRAM_SPECIFIC_MTAL_RULE.
- OÖİKY_CANNOT_VALIDATE_MTAL_SPECIFIC_RULE_BY_THEME.

## V86 priority — 300+ atoms
1. Extract exact master claim text from `HB-1771+`; do not rely only on GitHub HB-ID full-text indexing.
2. Audit old Batch02 HB-1771/HB-1772 and nearby MTAL/sequence-specific rows attached to OÖİKY Md5/A; rollback once only if exact mismatch is proven.
3. Match MTAL actor/sector/branch/program/course rules to current OÖKY plus cohort-applicable TTKB authority.
4. Resolve HB-1768..1770 and stage program-specific children; denominator unchanged until Super Admin publish.
5. Split any legacy ALL row whose exact parent differs by school/program family.
6. Continue AİHL HB-1760 exact-current parent search if official source lock is available.
7. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
8. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan V86 Phase 2'ye geç; minimum **300 support atom** hedefini sürdür fakat ARTICLE_VERIFIED sayacını yalnız exact claim + exact current/applicable authority eşleşmesiyle değiştir.