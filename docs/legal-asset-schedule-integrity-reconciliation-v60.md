# V60 — Taşınır / Ders Programı Integrity Reconciliation

Tarih: 2026-08-29
Migration: 0
Lovable: 0

## HB-1360 — source correction, retained
Master: `Alınan malzemenin taşınır mal kayıt işlemleri yapılmıştır.`
Legacy Batch02 parent: OÖİKY Md11 — wrong legal family/action.

Current authority:
- 9/10/2024 tarihli 9014 sayılı Cumhurbaşkanı Kararı ile yürürlüğe konulan Taşınır Mal Yönetmeliği, RG 10/10/2024-32688.
- Md2: general-management public administrations and their movable property.
- Md10/1-a: accepted/delivered movable entries are documented with Varlık İşlem Fişi, subject to listed exceptions.
- Md11/1: all entry/exit records and prescribed books/documents/tables are primarily kept electronically.
- Md12/1: all movable property and related transactions must be recorded; records are based on documents.
- New 2024 Regulation repealed the former 2006/11545 Regulation via Md41.

Decision: `SOURCE_CORRECTED_CURRENT_EXACT`.
ARTICLE_VERIFIED delta: 0. Keep existing count, with applicability condition `PUBLIC_ADMINISTRATION / PUBLIC_SCHOOL_OR_INSTITUTION` rather than pretending OÖİKY Md11 is the parent.

## HB-1645 — rollback due whole-row scope/action mismatch
Master: `Dersler, özelliklerine göre üst üste ... dengeli ... bayrak törenleri dikkate alınarak beden eğitimi ve müzik derslerinin haftanın ilk ve son iş gününe ...`
Legacy Batch02: OÖİKY Md90/2 — unrelated playground/sport-field provision.

Current source split:
- OÖİKY Md5/3 (2026 amendment): only the PE/game, PE/sport and music first/last working-day preference for preschool/primary/lower-secondary regime.
- OÖKY Md12/2-b: secondary schools — courses distributed successively or balanced by days AND PE/music first/last-day preference.

The master whole sentence tracks OÖKY Md12/2-b, while the current master/school-type layer is `ALL`. Source title/action and institutional applicability do not match one durable ALL workflow.

Decision: `ROLLBACK_ARTICLE_VERIFIED + SCHOOL_TYPE_SCOPE_REWRITE_REQUIRED`.
Delta: -1.

## HB-1646 / HB-1647 — exact text but withheld until scope correction
- HB-1646 master: applied/practical courses consecutively without disrupting course integrity. Current OÖKY Md12/2-c says practical vocational courses are planned consecutively without disrupting course integrity where possible.
- HB-1647 master: where theoretical and practical courses occur same day, theory before noon and practice after noon. Current OÖKY Md12/2-ç exact.

Both are currently surfaced with broad/ALL school-type metadata. They are not promoted until durable school-type applicability is corrected/published. Status: `CURRENT_EXACT_TEXT + SCOPE_CORRECTION_REQUIRED`.

## HB-1483 / OAB neighborhood
HB-1483 master: previous-period management and audit-board activity reports are discussed and discharged by General Assembly. Current OAB Regulation Md11/1-c is an exact action candidate.
HB-1484 master: revenues collected in account opened in Union name. Current OAB Regulation Md16/1 is an exact action candidate.
These are staged for applicability verification rather than counted immediately because durable `ALL` metadata must not silently widen OAB scope to institution types where that organ is absent/different.

## Guard strengthened
A current provision matching most of a sentence is insufficient when another clause in the same master sentence belongs to a different school-type regulation. Whole-row ARTICLE_VERIFIED requires a single defensible applicability model or an approved split.