# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-01
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. 22.10.2024 Açık Öğretim Kurumları Yönetmeliği eski ayrı AÖO/AÖL/MAÖL yönetmeliklerinin current-authority rolünü kaldırmıştır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact: **1.762**
- Atom havuzu: **20.865**
- Son batch: **V81**
- Sonraki batch: **V82**

## V81 — 410 atom
- Integrity: `docs/legal-mesem-registration-open-education-integrity-v81.md` — `3651496a1498f513fd6af0ca4b4077ebe9648307`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v81.md` — `723cd2273b111a4978af0a7834d58a243361d90e`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v81.md` — `634f0233cb9039853238e0befc36d510c5f65805`
- Progress: `docs/legal-verification-progress-v81-delta.json` — `bb15e54181d66b1998ea532640ddfe83432b1041`
- Support atoms: **410**, pool **20.455 -> 20.865**.
- ARTICLE_VERIFIED: **466 -> 467**, delta **+1**.

### V81 findings
- `HB-1723` ARTICLE_VERIFIED +1: OÖKY Md21/4 explicitly excludes MESEM students from the marriage-based registration/relationship rule. Existing school-type scope = MESEM.
- `HB-1724`: legacy/open-registration timing + metadata mismatch; current post-2023 open/formal transition model must be atomically rewritten.
- `HB-1725`: OÖKY Md21/7 supports simultaneous AÖL/MAÖL/AÖİHL registration for MESEM students, but existing AOL|HS|MESEM metadata is broader than the exact source scope. Withheld until MESEM child/scope publish.
- `HB-1726`: old MAÖL/MESEM course-overlap face-to-face exclusion needs re-lock against the 22.10.2024 replacement Open Education Regulation; old MAÖL regulation/2020 circular alone cannot prove current exact effect.
- `HB-1727`: master says `31 Aralık sonrası`; current OÖKY Md22/9 official amendment chain says `ders yılının ikinci döneminde şubat ayından sonra`. Rewrite required; timing is exactness field.
- `HB-1728`: GSL max-10-invigilator/no-scoring sentence remains YEAR_PARAMETER/current-guide candidate until exact 2026 official guide clause is locked.
- `HB-1729`: school-first determination is OÖKY secondary-school family; generic ALL row not promotable.
- `HB-1730/1731`: diploma recipient/replacement-document rules require current school-type exact lock; no ALL inheritance.
- `HB-1732`: class-repeat rule varies by school type; generic ALL not exact.
- `HB-1733`: photo student-ID current format/digital-document recheck required.
- `HB-1734`: compound print + director approval + storage sentence cannot be inferred from current electronic archive provisions.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- MESEM_MARRIAGE_EXCEPTION_IS_SCHOOL_TYPE_SPECIFIC.
- REGISTRATION_WINDOW_DATE_IS_EXACTNESS_FIELD.
- OPEN_ED_2024_REPLACEMENT_OVERRIDES_OLD_SEPARATE_REGULATIONS.
- SIMULTANEOUS_OPEN_ED_ENROLLMENT_REQUIRES_MESEM_SOURCE_SCOPE.
- DIPLOMA_RECIPIENT_AND_DELIVERY_PROOF_ARE_EXACTNESS_FIELDS.
- ELECTRONIC_ARCHIVE_DOES_NOT_IMPLY_UNIVERSAL_PRINT_AND_WET_APPROVAL.

## V82 priority — 300+ atoms
1. Continue `HB-1735+` Student Operations from exact master boundary.
2. Audit class president/student representative, student ID/document, attendance/leave/transfer and school-type-specific student operation rules against current OÖKY/OÖİKY/open-education chain.
3. Resolve `HB-1729..1734` only with exact current school-type parents; no ALL inheritance.
4. Return to `HB-1725/1726` only after exact current Open Education/OÖKY semantic intersection is proven; no silent grandfathering of repealed MAÖL regulation.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V82** başlat; minimum **300 atom** hedefle.
