# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF — V86 CLOSED / V87 NEXT
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. School-type/program-specific provisions broad ALL metadata ile miras alınamaz. Thematic/adjacent article exact proof değildir.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **460 / 2.229 = %20,6371**
- Kalan exact: **1.769**
- Kapanmış support-atom pool: **22.805**
- Son kapanmış batch: **V86**
- Sıradaki batch: **V87**
- Migration: **0**
- Lovable: **0**

## V85 özeti
Canonical: `docs/legal-course-selection-integrity-v85.md`.
- ARTICLE_VERIFIED **466 -> 463**, delta -3.
- Rollback: HB-1762, HB-1763, HB-1766.
- OÖİKY Md5/A school-level/timing scope cannot validate secondary/MTAL ALL rows.

## V86 — 300 support atoms CLOSED
Phase docs:
- `docs/legal-article-verified-focused-deepening-batch-v86-phase1.md` — 40 atoms.
- `docs/legal-article-verified-focused-deepening-batch-v86-phase2.md` — 80 atoms.
- `docs/legal-article-verified-focused-deepening-batch-v86-phase3.md` — 180 atoms.
ARTICLE_VERIFIED summary: `docs/legal-article-verified-batch-v86.md`.
Progress: `docs/legal-verification-progress-v86-delta.json`.

### Exact master boundary recovered from File Library
Canonical 2,229-row master was recovered from `Mimaros_Master_Is_Akisi_FINAL.md/jsonl`, eliminating GitHub HB-ID index dependency.
- HB-1768: MTAL 11/12 branch elective vocational courses; coordinator + zümre + sector vocational-person cooperation.
- HB-1769: framework-program weekly schedule; branch, school type, year/grade; diploma-leading/supporting course construction.
- HB-1770: TTK decisions + weekly-schedule explanations; general elective / own field-branch / other field-branch selection.
- HB-1771: sector needs + zümre + coordinator + student demand + field/branch characteristics -> school administration determination.
- HB-1772: prerequisite/program sequence.
- HB-1773: weekly scheduled elective-hour requirement.
- HB-1774 begins a new family: EVRAK KAYIT DOSYALAMA VE SEVK.

### Current 2026-2027 MTAL elective cohort resolver
Official MTEGM Duyuru No 17 (`https://meslek.meb.gov.tr/duyurugoster.aspx?d_id=17`):
- Grade 12 -> **TTKB 2023-40**.
- Grades 10-11 -> **TTKB 2024-41**.
- Preparatory + Grade 9 -> **TTKB 2026-62**.
Official decision registry: `https://meslek.meb.gov.tr/kararlar`.
2026-85 is separately a framework-program authority beginning prep/Grade 9; elective-table and framework-program authority kinds must remain distinct.

Canonical resolver is now:
`education_year + grade/cohort + school/program + field + branch + authority_kind + TTKB_decision_version`

Forbidden: `latest decision wins` in phased transitions.

### V86 rollbacks
ARTICLE_VERIFIED **463 -> 460**, delta **-3**.
1. **HB-1771 ROLLBACK -1** — Batch02 used `ALL + OÖİKY Md5/A(2-4)` for an MTAL-specific sector/actor/field-branch determination workflow. No exact all-atom current replacement locked in V86.
2. **HB-1772 ROLLBACK -1** — Batch02 used `ALL + OÖİKY Md5/A(2-4)` for a program prerequisite/sequence rule. Similar official program wording is insufficient without applicable cohort/program/version lock.
3. **HB-1773 ROLLBACK -1** — Batch02 used `ALL + OÖİKY Md5/A(2-4)` for a weekly schedule/hour rule; applicable schedule/program version is required.
No prior rollback for HB-1771..1773 exists in canonical V85/V86 history; these are once-only.

HB-1768..1770 remain WITHHELD master parents; program/grade/cohort children may be promoted only after exact decision/annex match.

## Active guards — additions from V86
- MTAL_2026_2027_ELECTIVE_AUTHORITY_IS_GRADE_COHORT_SPECIFIC
- GRADE12_2026_2027_USES_2023_40_FOR_MTEGM_ELECTIVES
- GRADE10_11_2026_2027_USE_2024_41_FOR_MTEGM_ELECTIVES
- PREP_GRADE9_2026_2027_USE_2026_62_FOR_MTEGM_ELECTIVES
- PROGRAM_PREREQUISITE_RULE_CANNOT_INHERIT_OOIKY_5A
- WEEKLY_HOUR_RULE_REQUIRES_APPLICABLE_SCHEDULE_VERSION
- MTAL_SECTOR_ACTOR_RULE_CANNOT_BE_ALL_SCOPE
- WRONG_AUTHORITY_KIND_REQUIRES_ROLLBACK_OR_REPUBLISH
- MASTER_PARENT_AND_EXECUTABLE_CHILD_MUST_BE_SEPARABLE
- COURSE_DEPENDENCY_GRAPH_IS_VERSIONED
- MTAL_ELECTIVE_ELIGIBILITY_REQUIRES_TTKB_PROGRAM_LOCK
- LATEST_TTKB_DECISION_DOES_NOT_AUTOMATICALLY_WIN
- PHASED_TTKB_TRANSITION_REQUIRES_COHORT_RESOLUTION
- DELIVERY_PERMISSION_DOES_NOT_PROVE_COURSE_ELIGIBILITY
- ELECTIVE_TABLE_AND_FRAMEWORK_PROGRAM_ARE_DISTINCT_AUTHORITIES
- LEGACY_COHORT_MAY_RETAIN_PRIOR_TTKB_VERSION
- ALL_SCOPE_CANNOT_INHERIT_PROGRAM_SPECIFIC_MTAL_RULE
- OÖİKY_CANNOT_VALIDATE_MTAL_SPECIFIC_RULE_BY_THEME

## Tenant requirement
**Sosyal Sorumluluk Kulübü** tenant requirement remains active; ARTICLE_VERIFIED sayacına eklenmez. Canonical: `docs/tenant-required-social-responsibility-club.md`.

## V87 priority — HB-1774+ EVRAK KAYIT / DOSYALAMA / SEVK
Start row-level exact audit from master:
- HB-1774: evrak tesliminde usulüne uygun zimmet defteri.
- HB-1775: Standard Dosya Planına uygun dosyalama.
- HB-1776: resmî yazışmaların Belgenet/EBYS üzerinden yapılması.
- HB-1777: dilekçe veya bilgi edinme başvurularının işleme alınması ve zamanında cevap.
- HB-1778: master exact text recover first.
- HB-1779: Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmeliğe uygunluk.
- HB-1780: gizlilik niteliğindeki yazı/belgelerde gizlilik usulü.
- HB-1781: belge örneğinde `ASLI GİBİDİR`, yetkili ad/soyad/unvan/tarih/imza.
Then continue HB-1782+ bilişim/MEBBİS cluster after exact boundary extraction.

V87 target: large row-level batch; only exact claim + current official provision changes ARTICLE_VERIFIED. Audit legacy Batch02 broad mappings before new promotion. No migration unless schema truly requires it. Work mode remains reserved until all mevzuat verification is complete.

## Repo sınırı
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` dediğinde soru sormadan **V87**'ye proceed.