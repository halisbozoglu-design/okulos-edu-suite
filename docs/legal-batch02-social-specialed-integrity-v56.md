# V56 — Batch02 Social Activities / Special Education Integrity Audit

Date: 2026-08-29
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Scope
Row-level audit only. No bulk rollback. Exact workflow identity, current legal effect, actor/action/object/timing/scope and compound-row integrity are checked independently.

## HB-0310 — explicit rollback
Canonical row combines four action families in one master item:
1. establish Social Activities Board,
2. annual social-activity planning,
3. teacher course distribution,
4. time/duty roster creation.

Current MEB Educational Institutions Social Activities Regulation Md6 directly supports board establishment/composition and annual September planning, but does not support teacher course distribution or duty/time rosters. The old Batch02 source mapped the whole row generically to OÖİKY Md9. Whole-row ARTICLE_VERIFIED therefore fails.

Status: `ROLLBACK_ARTICLE_VERIFIED + SPLIT_REQUIRED`.
Counter delta: -1.

Proposed atomic split for later SA publication:
- `SOCIAL_ACTIVITIES_BOARD_ESTABLISH`
- `SOCIAL_ACTIVITIES_ANNUAL_PLAN`
- `TEACHER_COURSE_DISTRIBUTION`
- `DUTY_TIME_ROSTER_BUILD`
Historical completed instances remain immutable.

## HB-0323 — retained, source corrected
Canonical: Social Activities Board work is evaluated at teachers-board meetings.
Current exact parent: Social Activities Regulation Md6/8: actions carried out by the board are evaluated at teachers-board meetings.
Status: `ARTICLE_VERIFIED_RETAINED_SOURCE_CORRECTED`.
Counter delta: 0.

## HB-2169 / HB-2190 — source correction family
Both are durable named `Sosyal Etkinlikler Kurulu` masters under different institution/school-type scopes. Current exact named-organ source is Social Activities Regulation Md6, not generic OÖİKY Md9.
- HB-2169: primary/pre-primary family scope; source correction required.
- HB-2190: secondary/special-education-school family; already corrected in earlier V34 exact audit; no duplicate increment.

## HB-2220 — HEM conditional applicability
Master scope: Halk Eğitim Merkezi.
Social Activities Regulation Md7/4 explicitly says social activities in HEM, vocational education centres and open education schools may be arranged optionally. Therefore board creation cannot be published as an unconditional annual duty for every HEM merely because the generic named board exists in Md6.
Status: `CONDITIONAL_APPLICABILITY_REVIEW`.
No counter change in V56.

## HB-2051 — new exact current promotion
Canonical: `Uyuşturucu kullanımı ve bağımlılıkla mücadele; 2014/20 sayılı genelge doğrultusunda yürütülmektedir.`
Official current-effect check:
- MEB/ORGM continues to host the 2014/20 circular under current guidance legislation pages.
- TTKB 2026 external-source/document inventory lists 15.09.2014, number 3938012, Circular 2014/20, `Uyuşturucu Kullanımı ve Bağımlılık ile Mücadele`, status `Sürekli`.
The master action explicitly references the same circular and topic.
Status: `ARTICLE_VERIFIED_NEW`.
Counter delta: +1.

## HB-2052 — legacy source superseded, no promotion
Canonical says violence/substance-abuse work is conducted pursuant to 2006/26.
Current 2024/56 Okullarda Şiddetin Önlenmesi Genelgesi explicitly repeals 24.03.2006 / 2006/26 and 21.01.2009 / 2009/09.
The workflow's legal policy already points toward 2024/56, but the retained master text itself still asserts 2006/26 as current authority.
Status: `LEGACY_SOURCE_REPEALED + MASTER_REWRITE_REQUIRED`.
Not ARTICLE_VERIFIED in V56. No rollback delta because no evidence was found that HB-2052 is in the current counted ARTICLE_VERIFIED set.

Future rewrite must preserve the operational intent while replacing the revoked source with current 2024/56 plus current addiction-prevention authority where applicable. Rewrite requires Super Admin review/publication; historical completed instances are immutable.

## HB-2053 — multi-provision candidate, withheld
Canonical combines:
- enough support education rooms being opened,
- necessary tools/equipment/materials being provided.
Current Special Education Services Regulation:
- Md25/1 and 25/1-c cover opening and multiple rooms according to student number,
- Md62 covers teaching materials, special equipment and equipment needs of support education rooms.
The action is substantively supported but combines two distinct legal acts/provisions. Keep as `MULTI_PROVISION_EXACT_CANDIDATE`; do not promote whole row until atomicity policy is resolved.

## HB-2054 / HB-2055 — retained exact
Existing Batch06 verification remains strong:
- HB-2054 -> Special Education Services Regulation Md23/1-ç (equal distribution; max two per class in full-time inclusion/integration).
- HB-2055 -> Md25/1-a (support-room weekly hours cannot exceed 40% of weekly total).
No duplicate increment.

## Integrity rules added
1. A current source cannot cure a master sentence that explicitly names a repealed source; master rewrite must publish first.
2. A compound row cannot be ARTICLE_VERIFIED when one subaction is outside the cited legal provision.
3. Optional institution applicability must not be converted into unconditional recurring duty.
4. Multiple exact provisions can support a candidate, but atomic split is preferred when each provision creates a separately executable task.
5. Source correction on an already-counted exact workflow does not increase the counter.
