# ARTICLE_VERIFIED Batch V54

Date: 2026-08-29
Migration: 0

## Starting point
- Master workflows: 2,229
- ARTICLE_VERIFIED: 466

## Rollbacks
### HB-2046
Prior status: ARTICLE_VERIFIED via generic OÖİKY 2026 Md9.
Current finding: mismatch with RPD Regulation Md23/1-ı.
Legacy: school-year end -> RPD service.
Current: each term end -> education institution principal.
New status: WITHHELD_LEGACY_ACTION_MISMATCH.
Delta: -1.

### HB-2049
Prior status: ARTICLE_VERIFIED via generic OÖİKY 2026 Md9.
Current finding: no source-exact current parent for the stored e-Okul student-development-file/class-guidance-section duty; wording corresponds to superseded 2001 RPD model.
New status: WITHHELD_LEGACY_ACTION_PARENT_NOT_FOUND.
Delta: -1.

## New promotions
### HB-2048
Canonical: Bireyi tanıma teknikleri (BTT) uygulanarak değerlendirilmektedir.
Current exact parent: RPD Regulation Md21/2-b.
Status: ARTICLE_VERIFIED.
Delta: +1.

### HB-2050
Canonical: class guidance teacher + RPD-service cooperation + direction to student clubs/elective courses/social activities according to student attributes.
Current exact parent: RPD Regulation Md23/1-g.
Status: ARTICLE_VERIFIED.
Delta: +1.

## Source corrections with zero delta
- HB-2023 -> Md15/2-a
- HB-2024 -> Md15/2-b
- HB-2025 -> Md15/2-c
- HB-2029 -> Md16/8 (retained from V52 correction)
- HB-2036 -> Md21/4-a
- HB-2037 -> Md21/4-b/4

## Final
466 - 2 + 2 = 466
- ARTICLE_VERIFIED: 466 / 2,229 = 20.9062%
- Remaining exact verification: 1,763

## Count discipline
A rollback and a promotion in the same batch do not cancel each other operationally; both are preserved as distinct audit events even when the numerical total is unchanged.
