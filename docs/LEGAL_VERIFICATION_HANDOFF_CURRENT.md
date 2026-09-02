# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF
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
- Atom havuzu: **22.505**
- Son batch: **V85**
- Sonraki batch: **V86**

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

## V86 priority — 300+ atoms
1. Continue exact master extraction from `HB-1771+`.
2. Immediately audit old Batch02 HB-1771/HB-1772 and nearby rows that were attached to OÖİKY Md5/A despite MTAL/sequence-specific content; rollback once only if proven.
3. Lock MTAL selected vocational course actor/sector/branch/program rules against current OÖKY and current TTK weekly-course schedule decisions.
4. Resolve HB-1768..1770 and stage program-specific children; denominator unchanged until Super Admin publish.
5. Continue AİHL HB-1760 exact-current parent search if official source lock is available.
6. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
7. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V86** başlat; minimum **300 atom** hedefle.