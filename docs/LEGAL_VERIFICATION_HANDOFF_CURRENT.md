# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-31
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. Exact text yetmez; program/institution metadata scope da exact olmalıdır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact: **1.761**
- Atom havuzu: **20.455**
- Son batch: **V79**
- Sonraki batch: **V80**

## V79 — 410 atom
- Integrity: `docs/legal-mtal-field-branch-transition-integrity-v79.md` — `9ce4fb22d2cd7b92b0d6d09b4fe321b5fdc6a866`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v79.md` — `48f0dd7a8e0e678143da66f3494a3501a376067f`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v79.md` — `ac201fba546bd9e0141f402e53df0f44e5b63421`
- Progress: `docs/legal-verification-progress-v79-delta.json` — `3492df4d7051819d569f2fc6fc09c6a3d59cef8e`
- Support atoms: **410**, pool **20.045 -> 20.455**.
- ARTICLE_VERIFIED: **468 -> 468**, delta **0**.

### V79 MTAL/MESEM field-branch findings
- `HB-1701`: legacy timing mismatch. Current OÖKY Md31/1 uses Anadolu meslek field selection at end of grade 9 and branch placement at end of grade 10; master says grade 9 / beginning of grade 10. Rewrite required.
- `HB-1702`: OÖKY Md31/2-a supports preference + score superiority via e-Okul, but current stored metadata/program scope must be narrowed before count.
- `HB-1703`: master sentence is truncated and timing-stale; current Md31/2-b uses end of grade 10 + ability/success + sector need + student/parent requests + group counts + school directorate. Rewrite.
- `HB-1704`: strong text-level exact candidate under OÖKY Md31/3: minimum 10 students for field, 8 for branch, repeaters included. Do not count until Anadolu technical/meslek program scope is exactly published.
- `HB-1705`: current Md31/4 uses ability, health/disability, BEP-unit proposal and placement/transfer commission decision; master is broader and loses exact criteria/actor chain.
- `HB-1706`: current Md31/5 applies parent-owned workplace direct field/branch registration only in Anadolu meslek programs; master loses that qualifier. Scope correction required.
- `HB-1707`: master treats 34 as absolute maximum. Current Md25/1-b says 34 is the norm for listed programs but can increase to 40 under density/mandatory conditions. Rewrite.
- `HB-1708`: strong text-level exact candidate under Md25/1-ç for MESEM quota mechanism; requires MESEM-only metadata publication before count.
- `HB-1709`: OÖKY Md26/2 routes group formation to Norm Kadro Regulation; downstream exact norm provision required.
- `HB-1710`: Mesleki Açık Öğretim Lisesi legal family must be revalidated separately; OÖKY inheritance prohibited.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- FIELD_SELECTION_GRADE_AND_TERM_ARE_EXACTNESS_FIELDS.
- DEFAULT_BRANCH_SIZE_IS_NOT_ABSOLUTE_MAXIMUM.
- ANADOLU_MESLEK_PROGRAM_SCOPE_CANNOT_BE_DROPPED.
- TEXT_EXACT_BUT_METADATA_BROAD_REQUIRES_SCOPE_PUBLISH_BEFORE_COUNT.
- REFERENCED_REGULATION_REQUIRES_DOWNSTREAM_EXACT_PROVISION.
- SOURCE_TRUNCATED_MASTER_REQUIRES_REWRITE.

## V80 priority — 300+ atoms
1. Continue `HB-1711+` MESEM/MTAL registration and transition block from exact master text.
2. Reconcile low-enrolment MESEM continuation/transfer, overseas equivalency, Anadolu technical program transition, and program-score/tie-break rules against current OÖKY/RG chain.
3. Resolve current Mesleki Açık Öğretim Lisesi authority for HB-1710 using official source only; do not use legacy/repealed 443.pdf.
4. Stage scope-correct children for HB-1704/HB-1708 but keep denominator unchanged until Super Admin approval/publish.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V80** başlat; minimum **300 atom** hedefle.
