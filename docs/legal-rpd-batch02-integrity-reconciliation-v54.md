# V54 — RPD Batch02 Integrity Reconciliation

Date: 2026-08-29
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0

## Scope
This batch re-audits the neighbouring school-guidance records that were historically marked ARTICLE_VERIFIED by generic linkage to the 28.07.2026 Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği amendment. Current binding parent used for the substantive RPD duties is the current Millî Eğitim Bakanlığı Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği.

Current official inventory continues to list the 14.08.2020 / 31213 RPD Regulation. Judicial-effect handling remains provision-level: Md14 is affected; unrelated surviving provisions used below are not treated as invalid merely because Md14 was annulled.

## Source-exact corrections retained
### HB-2023
Canonical action: RPD service is located where student, parent, teacher and other personnel can easily reach it.
Correct parent: RPD Regulation Md15/2-a.
Historical generic OÖİKY Md9 mapping is superseded; counter delta 0.

### HB-2024
Canonical action: RPD service has suitable physical conditions.
Correct parent: Md15/2-b.
Counter delta 0.

### HB-2025
Canonical action: service is equipped with IT/communication, office materials and tools required for individual/group work.
Correct parent: Md15/2-c.
Counter delta 0.

### HB-2029
Already source-corrected in V52.
Correct parent: Md16/8.
Counter delta 0.

### HB-2036
Already source-corrected in V52.
Correct parent: Md21/4-a.
Counter delta 0.

### HB-2037
Already source-corrected in V53.
Correct parent: Md21/4-b/4.
Counter delta 0.

## Explicit rollbacks
### HB-2046 — ROLLBACK
Canonical master action: class guidance teachers give an activity report including needs and recommendations to the RPD service at the end of the school year.
Historical ARTICLE_VERIFIED parent: generic OÖİKY 2026 Md9/1-3.
Current RPD Regulation Md23/1-ı instead requires the class guidance teacher to submit the report **at the end of each term to the education institution principal**.
The current rule differs in both timing and recipient.
Status: `WITHHELD_LEGACY_ACTION_MISMATCH`.
Counter delta: -1.
Legacy wording strongly tracks repealed 2001 RPD Regulation Md51/f and must not be treated as current law.

### HB-2049 — ROLLBACK
Canonical master action: class guidance teachers fill the class-guidance sections of e-Okul student development files and cooperate with the RPD service when needed.
Historical ARTICLE_VERIFIED parent: generic OÖİKY 2026 Md9/1-3.
Current 2020 RPD Regulation does not reproduce the former 2001 Regulation Md51/c duty concerning maintaining student development files with the service. Current Md23 includes plan, needs, risk data, BTT, adaptation, direction, reporting and referral duties but no source-exact equivalent to this stored e-Okul development-file action.
Status: `WITHHELD_LEGACY_ACTION_PARENT_NOT_FOUND`.
Counter delta: -1.

## New exact promotions
### HB-2048 — ARTICLE_VERIFIED
Canonical action: `Bireyi tanıma teknikleri (BTT) uygulanarak değerlendirilmektedir.`
Current parent: RPD Regulation Md21/2-b.
The provision directly requires the guidance teacher/psychological counsellor to apply individual recognition techniques, report evaluations, provide feedback and share with relevant parties. Master action is a narrower compliance check inside the exact statutory action.
Counter delta: +1.

### HB-2050 — ARTICLE_VERIFIED
Canonical action: class guidance teachers, in cooperation with the RPD service, direct students to student clubs, elective courses and social activities according to academic achievement and personality characteristics.
Current parent: RPD Regulation Md23/1-g.
The provision directly names the class guidance teacher, cooperation with the guidance teacher/psychological counsellor, and direction to student clubs, elective courses and social activities according to interest, ability, values, academic achievement and personality traits. Master wording is narrower than, and fully contained in, the current action.
Counter delta: +1.

## Net counter
Start 466.
- HB-2046: -1
- HB-2049: -1
- HB-2048: +1
- HB-2050: +1
Final: 466.

## Additional withheld rows
- HB-2045 generic `e-Okul student development files are filled`: no current source-exact actor/action parent established.
- HB-2047 confidentiality: current Regulation defines protected client-file information, but this generic compliance wording is not promoted until a duty-level parent and privacy-control scope are locked.

## Integrity rule strengthened
A current regulation replacing an older regulation may preserve the policy area while changing actor, recipient, timing, data object or system. Old handbook wording is not grandfathered into ARTICLE_VERIFIED. Exact comparison must include these fields:
`actor + action + object + recipient + timing + system + scope`.
