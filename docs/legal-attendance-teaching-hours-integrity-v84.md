# Legal Attendance & Teaching Hours Integrity V84

Date: 2026-09-02
Batch: V84
Support atoms: 410

Scope: HB-1749..HB-1759 — attendance, activity leave, guardian notifications, absence limits, student exit/relationship termination, daily teaching hours, block lessons and vocational practice duration.

## Current official anchors
- MEB Ortaöğretim Kurumları Yönetmeliği Md9/1: one secondary-school lesson = 40 minutes; start/end/lunch times are set by the principal-chaired commission of school zümre chairs + school student representative in conformity with provincial calendar and school/program/environment/transport conditions; inter-lesson break >=10 min, lunch >=45 min, double-shift exception permits shorter periods.
- Md9/2: block lessons require zümre teachers board proposal + school principal approval; each block max two lesson periods.
- Md9/3: vocational/technical secondary field-practice lesson duration = 40 min in school workshop/lab, 60 min in enterprises; internship = 60-min basis.
- Md36/3: authorised science/culture/sport/music/etc. activities are activity-permitted and not counted as absence, with authority and total-duration qualifiers.
- Md36/4: guardian attendance notices at 5th, 15th, 25th days; designated special groups also at 40th and 55th days.
- Md36/5: default failure threshold unexcused >10 and total >30, with written guardian notice; specified groups may reach total 60 while unexcused remains <=10; MESEM theoretical and workplace attendance have separate limits.
- Md36/6: guardian notice channel follows legislation via post/e-mail/information tools.
- Md36/7: excuse document/written guardian statement within max 5 business days after excuse day; school may extend up to 20 business days for unavoidable cases; e-Okul entry required.

## Workflow decisions
- HB-1749: generic `necessary measures for school attendance` is too broad/non-atomic; WITHHELD.
- HB-1750: master content has a direct OÖKY Md36/3 secondary parent, but existing broad ALL scope is not exact; WITHHELD until secondary-school child/scope publication.
- HB-1751: wording says guardian notice in `specified periods` but omits current exact 5/15/25 and special 40/55 thresholds; timing is an exactness field. Rewrite/split before promotion.
- HB-1752: master carries default 10/30 failure + written guardian notice. Current Md36/5 also contains special 60-day exceptions and separate MESEM limits. Existing ALL metadata is invalid; default-rule child must explicitly exclude/branch special populations before promotion.
- HB-1753: merges own request, discipline, failure and continuous absence exit/relationship processes. Different legal triggers and procedures -> COMPOUND/SPLIT.
- HB-1754: text-exact core to OÖKY Md9/1 secondary-school commission, but existing ALL scope is broader than provision; WITHHELD.
- HB-1755: master old single-shift break model (one >=20, others >=15; double-shift >=10) conflicts with current Md9/1 (inter-lesson >=10; lunch >=45; double-shift may be shorter). MASTER_REWRITE_REQUIRED.
- HB-1756: annual special days/weeks calendar requires exact Social Activities/current annual-calendar parent; not inferred from Md9.
- HB-1757: generic annual work calendar requires institution-family exact parent; not universalized.
- HB-1758: ROLLBACK ONCE. Historical ARTICLE record attached this workflow to Education Boards and Subject Groups Directive Md9 with ALL scope. Actual operational parent is current OÖKY Md9/2 and secondary-school scope. No prior rollback record for HB-1758 was found in the searched canonical artifacts. Re-promotion requires corrected secondary scope/current source publication.
- HB-1759: text-exact to OÖKY Md9/3, but vocational/technical secondary program-specific; existing ALL metadata invalid. WITHHELD pending MTAL/MESEM-appropriate scoped publication.

## Rollback
HB-1758: -1 ARTICLE_VERIFIED
Reason: WRONG_SOURCE + WRONG_SCOPE. Current correct family = OÖKY Md9/2, not generic zümre directive Md9.

## New guards
- ATTENDANCE_NOTICE_DAY_THRESHOLDS_ARE_EXACTNESS_FIELDS
- EXCUSE_DOCUMENT_5_DAY_AND_20_DAY_EXTENSION_ARE_SEPARATE_TIMING_ATOMS
- DEFAULT_10_30_ABSENCE_LIMIT_CANNOT_SWALLOW_60_DAY_EXCEPTION
- MESEM_THEORETICAL_AND_WORKPLACE_ATTENDANCE_LIMITS_ARE_DISTINCT
- OLD_TENEFUS_20_15_10_MODEL_IS_NOT_CURRENT_OOKY_MD9
- BLOCK_LESSON_APPROVAL_IS_OOKY_MD9_NOT_GENERIC_ZUMRE_DIRECTIVE
- BLOCK_LESSON_TWO_PERIOD_CAP_IS_EXACTNESS_FIELD
- VOCATIONAL_40_60_MINUTE_RULE_IS_PROGRAM_SPECIFIC_NOT_ALL
- ACTIVITY_PERMISSION_AUTHORITY_AND_MAX_TOTAL_DURATION_ARE_EXACTNESS_FIELDS

Sosyal Sorumluluk Kulübü remains an active tenant requirement and is separate from ARTICLE_VERIFIED.

Migration: 0
Lovable: 0