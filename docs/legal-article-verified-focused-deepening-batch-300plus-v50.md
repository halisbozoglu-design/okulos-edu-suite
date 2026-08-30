# V50 — RAM Current-Authority Integrity Reconciliation

Date: 2026-08-29
Migration: 0
Support atoms: 420

## Critical finding
The 31.08.2020 MEB Rehberlik ve Araştırma Merkezi Yönergesi cannot be used as a current legal authority for ARTICLE_VERIFIED promotion.

Danıştay 8th Chamber, E.2020/6422 K.2024/2231, dated 24.04.2024, annulled the 14.08.2020 Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği Article 14 and the 31.08.2020 RAM Directive as a whole on hierarchy-of-norms / authority grounds. Earlier judicial materials also show suspension of execution for the directive as a whole.

Therefore any workflow promoted solely on RAM Directive Md5 must be rolled back from ARTICLE_VERIFIED until an independent, current, higher-level official provision exactly supports the same workflow action and scope.

## V49 rollback
- HB-0395 — first meeting with guidance teachers in responsibility area: rollback ARTICLE_VERIFIED -> WITHHELD_CURRENT_AUTHORITY.
- HB-0138 — year-end meeting with guidance teachers in responsibility area: rollback ARTICLE_VERIFIED -> WITHHELD_CURRENT_AUTHORITY.

These legacy workflow texts remain valid historical/process evidence, but not current-legal-verification evidence by themselves.

## Current-authority guard added
Before any ARTICLE_VERIFIED promotion using a directive/circular/guide:
1. Verify not only publication but current legal effect.
2. Search for stay-of-execution, annulment, repeal or replacement.
3. If annulled/stayed, mark source `NON_CURRENT_JUDICIAL_STATUS`.
4. Search current Regulation/Law/CBK for exact replacement authority.
5. Do not promote from an MEB archive/mevzuat page link alone.

## RAM families reclassified
The following families remain in the master but are not current-exact solely by RAM Directive Md5:
- school-program consultation
- school-program review/feedback
- activities in institutions without guidance counsellors
- school visits and consultancy
- training activities for students/families/teachers
- needs-analysis/local-target evaluation
- start/end-of-year meetings with counsellors
- start-of-year planning / team-group creation

They are now `CURRENT_PARENT_RESEARCH_REQUIRED`.

## HB-0602
Canonical action: school guidance-program review and delivery of review forms.
Previous V48/V49 source binding to RAM Directive Md5/4-a/2 is withdrawn as current authority.
Status becomes:
- `SCOPE_ERROR_CANDIDATE` remains true because master scope is PANSİYONLU OKULLAR.
- legal binding becomes `CURRENT_PARENT_RESEARCH_REQUIRED`.
- do not publish corrected legal source until current Regulation/Law authority is found.

## HB-0603
Risk-map ambiguity remains:
- school service creates risk map under current RPD Regulation provisions;
- school administration ensures delivery to RAM under current RPD Regulation provisions;
- no RAM-side action shall be invented.
Status: `ACTION_SCOPE_REWRITE_REQUIRED`.

## Master examples reviewed
- HB-0141 / HB-0208 / HB-0280 / HB-0396 / HB-0685 / HB-0767 / HB-0863 / HB-0948: generic formal/private-school consultancy; no current exact promotion.
- HB-0946 / HB-0947 / HB-1143: school guidance-service visits; directive text historically matches, but current-authority issue blocks promotion.
- HB-0395 / HB-0138: rollback described above.

## Atom accounting
420 support atoms were spent across judicial-status verification, source-hierarchy reconciliation, master-family normalization, rollback manifest, source-validity guards and current-parent research staging.

## Result
ARTICLE_VERIFIED: 469 -> 467
Master denominator: 2229
Remaining exact: 1762
Migration: 0
