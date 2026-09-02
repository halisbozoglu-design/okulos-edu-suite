# Legal Course Selection Integrity V85

Date: 2026-09-02
Batch: V85
Support atoms: 410

## Exact master boundary
- HB-1760: AİHL mesleki uygulama eğitimi; imam-hatiplik/müezzinlik/vaizlik/Kur'an kursu öğreticiliği vb. ilgili kurumlarla iş birliği.
- HB-1761: ders seçimi açıklamalarının ikinci dönemin ilk haftasında okul müdürlüğünce duyurulması.
- HB-1762: ders seçiminin Şubat ayında öğrenci tarafından; veli, sınıf rehber öğretmeni ve rehberlik öğretmeni bilgisi dahilinde yapılması ve e-Okul + Kitap Seçim Modülüne işlenmesi.
- HB-1763: grup oluşmadığı için açılamayan derslerin duyurulması ve öğrencilerin açılan derslere yönlendirilmesi.
- HB-1764: süresinde seçim yapmayan öğrencinin derslerinin okul yönetimince belirlenmesi.
- HB-1765: 9. sınıfa yeni başlayanların ders seçim/değişiklik işlemlerinin ilk hafta yapılması.
- HB-1766: seçmeli derslerin en az 10 öğrenci talebiyle açılması.
- HB-1767: ders yılı içinde sayı azalsa da dersin sürdürülmesi.
- HB-1768..1770: MTAL dal seçmeli meslek dersi/program çizelgesi zinciri.

## Current-source integrity
28.07.2026 OÖİKY Md5/A is middle-school/IH-middle-school specific. It sets January-February announcement and selection, e-Okul/Kitap Seçim Modülü processing, unformed-course announcement/redirect, and first-week selection/change for new fifth-graders. This source cannot validate secondary-school February-only / ninth-grade master rows under ALL metadata.

## Rollbacks
1. HB-1762 ROLLBACK -1. Old Batch02 attached ALL metadata to OÖİKY Md5/A(2-4). Master says February only and is secondary-school language; current OÖİKY says January-February and applies to middle/IH middle schools. Wrong timing + wrong/broad scope.
2. HB-1763 ROLLBACK -1. The action exists in OÖİKY Md5/A(3), but old ALL metadata is broader than that provision and no exact common ALL parent was published. School-family split required.
3. HB-1766 ROLLBACK -1. Old Batch02 cited OÖİKY Md5/A(2-4), which contains no 10-student opening threshold. The source is merely thematic/adjacent, not duty-exact. Current secondary-school elective threshold family must be separately locked, including vocational/special-education exceptions.

No double rollback found for these IDs in current canonical history.

## Withheld/staging
- HB-1761: current secondary OÖKY course-selection parent candidate; ALL metadata cannot be retained.
- HB-1764: middle-school current Md5/A(3) supports no-selection -> school administration assignment, but secondary/common scope must be independently locked before promotion.
- HB-1765: ninth-grade wording cannot inherit OÖİKY fifth-grade rule.
- HB-1767: secondary current candidate; ALL blocked.
- HB-1768..1770: MTAL/program-specific; current TTK/weekly schedule and OÖKY exact scope needed.
- HB-1760: AİHL-specific operational/legal parent requires exact current provision before promotion.

## New guards
- JANUARY_FEBRUARY_IS_NOT_FEBRUARY_ONLY.
- FIFTH_GRADE_FIRST_WEEK_CANNOT_VALIDATE_NINTH_GRADE_FIRST_WEEK.
- COURSE_SELECTION_SAME_ACTION_ACROSS_LEVELS_REQUIRES_SCHOOL_FAMILY_SPLIT.
- THEMATIC_ARTICLE_DOES_NOT_PROVE_NUMERIC_COURSE_OPENING_THRESHOLD.
- ELECTIVE_GENERAL_AND_ELECTIVE_VOCATIONAL_THRESHOLDS_ARE_DISTINCT.
- COURSE_OPENING_THRESHOLD_EXCEPTIONS_ARE_EXACTNESS_FIELDS.
- AİHL_PROFESSIONAL_PRACTICE_IS_PROGRAM_SPECIFIC.
- TTK_WEEKLY_SCHEDULE_RULE_IS_VERSIONED_PROGRAM_AUTHORITY.

Migration: 0
Lovable: 0