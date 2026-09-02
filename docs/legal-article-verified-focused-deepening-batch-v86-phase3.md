# Legal ARTICLE_VERIFIED Focused Deepening — V86 Phase 3

Date: 2026-09-02
Status: CLOSED / MTAL COURSE-SELECTION COHORT LOCK
Migration: 0
Lovable: 0

## Accounting
- Master workflow: 2,229
- ARTICLE_VERIFIED before Phase 3: 463
- Rollback: HB-1771, HB-1772, HB-1773 = -3
- ARTICLE_VERIFIED after Phase 3: 460
- Remaining exact: 1,769
- V85 closed support-atom pool: 22,505
- V86 Phase 1: 40
- V86 Phase 2: 80
- V86 Phase 3: 180
- V86 total: 300
- Closed canonical support-atom pool after V86: 22,805

## Exact master boundary recovered from File Library master
- HB-1768: MTAL 11/12. sınıf dal seçmeli meslek dersleri; koordinatör öğretmen + zümre öğretmenleri + sektör meslek elemanları iş birliği.
- HB-1769: Çerçeve Öğretim Programı Haftalık Ders Çizelgesinden dal özelliği, okul türü ve okutulacağı yıla göre ders seçimi; diplomaya götüren derslerde dalı destekleyici diğer derslerden de seçim.
- HB-1770: seçmeli derslerin TTK kararları ve haftalık ders çizelgesi açıklamalarına göre seçmeli genel bilgi, alan/dal veya diğer alan/dal derslerinden seçilmesi.
- HB-1771: sektör ihtiyacı + zümre + koordinatör + öğrenci talepleri + alan/dal özelliklerine göre okul yönetiminin alınabilecek seçmeli dersleri belirlemesi.
- HB-1772: devam/prerequisite sırası bulunan programlarda sıra ve önceden alınması gereken derslerin gözetilmesi.
- HB-1773: seçmeli dersin haftalık çizelgede belirtilen haftalık ders saati kadar alınması.
- HB-1774 ile konu evrak kayıt/dosyalama/sevk ailesine geçer; MTAL ders-seçim kümesi HB-1773'te biter.

## Current official cohort resolver — 2026-2027
MTEGM 16.07.2026 Duyuru No 17:
- Grade 12 elective authority: TTKB 2023-40 + ek çizelgeler.
- Grades 10-11 elective authority: TTKB 2024-41 + ekler.
- Preparatory + Grade 9 elective authority: TTKB 2026-62 + ekler.
MTEGM decisions portal additionally records 2026-85 framework curricula beginning prep/Grade 9 and phased retirement of older framework curricula.

Canonical resolution key remains:
`education_year + grade/cohort + school/program + field + branch + authority_kind + TTKB_decision_version`

`authority_kind` must distinguish at least `ELECTIVE_TABLE`, `FRAMEWORK_PROGRAM`, `WEEKLY_SCHEDULE`, `COURSE_INFO_FORM`, `REGULATION`.

## Rollback findings
### HB-1771 — ROLLBACK -1
Historical Batch02 tagged `ALL` and cited OÖİKY Md5/A(2-4). Claim is MTAL-specific and contains sector, zümre, coordinator, student-demand, field/branch and school-administration actors/criteria. OÖİKY Md5/A cannot prove any of these MTAL-specific atoms. No current exact all-atom replacement was locked in this pass. Re-promotion requires current cohort/program authority with exact actor/action/criteria match.

### HB-1772 — ROLLBACK -1
Historical Batch02 tagged `ALL` and cited OÖİKY Md5/A(2-4). Prerequisite/program sequence is a program/curriculum rule, not an elementary-school course-selection rule. Similar text exists in official MTEGM program documents, but ARTICLE_VERIFIED requires the applicable cohort/program/version to be locked. Therefore old count is removed now; scoped children may be promoted later.

### HB-1773 — ROLLBACK -1
Historical Batch02 tagged `ALL` and cited OÖİKY Md5/A(2-4). Weekly-hour obligation derives from applicable weekly schedule/program authority, not OÖİKY Md5/A. Exact cohort/program decision lock is required before re-promotion.

No previous rollback for HB-1771..1773 was found in canonical V85/V86 history; rollbacks are once-only.

## Phase 3 support atoms — V86-A121..A300

### Master-boundary and identity atoms A121-A140
- A121 HB-1768 is MTAL-specific.
- A122 HB-1768 explicitly names grades 11 and 12.
- A123 HB-1768 is about branch elective vocational courses.
- A124 HB-1768 names coordinator teacher.
- A125 HB-1768 names subject/field-group teachers.
- A126 HB-1768 names sector vocational personnel.
- A127 HB-1768 requires cooperation semantics, not unilateral selection.
- A128 HB-1769 explicitly references framework-program weekly schedule.
- A129 HB-1769 makes branch characteristics material.
- A130 HB-1769 makes school type material.
- A131 HB-1769 makes year/grade of delivery material.
- A132 HB-1769 contains diploma-leading-course semantics.
- A133 HB-1769 permits supporting-course consideration in the master sentence.
- A134 HB-1770 explicitly delegates selection to TTK decisions/schedule explanations.
- A135 HB-1770 distinguishes general elective knowledge courses.
- A136 HB-1770 distinguishes own field/branch courses.
- A137 HB-1770 includes other field/branch courses conditionally.
- A138 HB-1771 is the final multi-actor elective-determination claim before prerequisite rules.
- A139 HB-1772 is a prerequisite/order claim.
- A140 HB-1773 is a weekly-hour claim and closes the course-selection cluster.

### Cohort/version atoms A141-A175
- A141 Education year is a required resolver input.
- A142 Grade is a required resolver input.
- A143 Cohort is distinct from calendar year.
- A144 Program type is a required resolver input.
- A145 Field is a required resolver input.
- A146 Branch is a required resolver input.
- A147 Authority kind is a required resolver input.
- A148 Decision version is a required resolver input.
- A149 Grade 12 in 2026-2027 resolves elective authority to 2023-40.
- A150 Grade 10 in 2026-2027 resolves elective authority to 2024-41.
- A151 Grade 11 in 2026-2027 resolves elective authority to 2024-41.
- A152 Preparatory class in 2026-2027 resolves elective authority to 2026-62.
- A153 Grade 9 in 2026-2027 resolves elective authority to 2026-62.
- A154 2026-62 is not a universal all-grade replacement on day one.
- A155 2024-41 remains applicable to legacy 10/11 elective cohorts in 2026-2027.
- A156 2023-40 remains applicable to legacy Grade 12 elective cohort in 2026-2027.
- A157 Framework-program transition and elective-table transition must not be conflated.
- A158 2026-85 is a framework-program authority, not a substitute citation for every elective-table claim.
- A159 2026-62 is an elective-table authority, not a substitute for every field framework claim.
- A160 A later decision number does not globally invalidate earlier cohort authority.
- A161 Decision publication date alone cannot resolve applicable cohort.
- A162 School year + grade must be computed before displaying eligible courses.
- A163 Legacy upper grades may legitimately use older decision versions.
- A164 New Grade 9 may legitimately use a newer decision than Grade 10 in same school.
- A165 Same institution can concurrently carry multiple valid TTKB versions.
- A166 Cache key must include decision version.
- A167 Course eligibility cache must include grade/cohort.
- A168 Program cache must include field/branch.
- A169 Decision transition semantics must be stored with source metadata.
- A170 Effective-start semantics must be stored separately from publication date.
- A171 Phase-out semantics must be stored separately from repeal semantics.
- A172 Gradual retirement is not instantaneous repeal for legacy cohorts.
- A173 Current-source resolver must support simultaneous legacy/current branches.
- A174 Applicable authority must be chosen before exactness evaluation.
- A175 Cross-grade `ALL` publication is forbidden when decision versions differ.

### Batch02 integrity atoms A176-A205
- A176 Batch02 HB-1771 uses OÖİKY Md5/A(2-4).
- A177 Batch02 HB-1771 uses ALL scope.
- A178 OÖİKY Md5/A is not an MTAL field/branch rule.
- A179 OÖİKY Md5/A does not prove sector-need criterion.
- A180 OÖİKY Md5/A does not prove coordinator-teacher actor.
- A181 OÖİKY Md5/A does not prove MTAL zümre actor in HB-1771 sense.
- A182 OÖİKY Md5/A does not prove field/branch characteristics criterion.
- A183 OÖİKY Md5/A cannot support HB-1771 ARTICLE_VERIFIED.
- A184 HB-1771 old count must be removed once.
- A185 Batch02 HB-1772 uses OÖİKY Md5/A(2-4).
- A186 Batch02 HB-1772 uses ALL scope.
- A187 OÖİKY Md5/A does not prove prerequisite program sequencing.
- A188 OÖİKY Md5/A does not prove prior-course requirement.
- A189 HB-1772 exactness belongs to applicable program/curriculum authority.
- A190 Similar wording in an old/current official program family is insufficient without applicable-version lock.
- A191 HB-1772 old count must be removed once.
- A192 Batch02 HB-1773 uses OÖİKY Md5/A(2-4).
- A193 Batch02 HB-1773 uses ALL scope.
- A194 OÖİKY Md5/A does not prove a weekly-hour amount obligation.
- A195 Weekly-hour obligation belongs to applicable schedule/program authority.
- A196 HB-1773 old count must be removed once.
- A197 Wrong school family is a material exactness defect.
- A198 Wrong authority kind is a material exactness defect.
- A199 Wrong decision version is a material exactness defect.
- A200 Broad ALL scope is a material defect for MTAL-only rules.
- A201 Thematic proximity cannot preserve an old ARTICLE_VERIFIED label.
- A202 Historical task completion remains immutable despite source-status correction.
- A203 Legal status correction applies prospectively to future/pending instances.
- A204 Re-promotion is allowed after exact scoped source lock.
- A205 Re-promotion does not restore invalid ALL ancestry; it creates corrected scoped publication.

### HB-1768 exactness atoms A206-A230
- A206 HB-1768 cannot inherit generic secondary elective rules alone.
- A207 Grade 11 applicability must be independently resolved.
- A208 Grade 12 applicability must be independently resolved.
- A209 11/12 may use different TTKB decisions in 2026-2027.
- A210 Therefore HB-1768 cannot publish as one version-blind child.
- A211 Coordinator-teacher role is an exactness atom.
- A212 Zümre-teacher role is an exactness atom.
- A213 Sector-professional participation is an exactness atom.
- A214 Cooperation is an exactness atom.
- A215 Branch-elective-vocational-course object is an exactness atom.
- A216 MTAL institution scope is an exactness atom.
- A217 Anadolu Meslek vs Anadolu Teknik program may require separate children.
- A218 Named actor omission blocks exact promotion when master requires actor.
- A219 Sector actor cannot be inferred from generic course-choice provisions.
- A220 Coordinator actor cannot be inferred from field-placement provisions.
- A221 OÖKY Md138 delivery permission does not prove HB-1768 actor workflow.
- A222 OÖKY Md31 field/branch placement does not automatically prove elective-course actor workflow.
- A223 TTKB table may prove course options without proving local actor process.
- A224 Framework curriculum may prove course structure without proving every local actor.
- A225 Exact promotion needs a source set whose combined authoritative clauses cover all material atoms.
- A226 Multiple official authorities may form one evidence bundle if each atom is explicit.
- A227 Evidence bundle must remain cohort-applicable.
- A228 Evidence bundle cannot mix mutually inapplicable decision versions.
- A229 HB-1768 remains WITHHELD.
- A230 No ARTICLE_VERIFIED increment is booked for HB-1768 in V86.

### HB-1769 exactness atoms A231-A255
- A231 HB-1769 is not a generic course-selection claim.
- A232 Framework-program weekly schedule is the primary authority family.
- A233 Branch characteristic must resolve before course list generation.
- A234 School type must resolve before course list generation.
- A235 Grade/year must resolve before course list generation.
- A236 Diploma-leading course semantics must come from applicable framework.
- A237 Supporting-course selection semantics must come from applicable framework/schedule explanation.
- A238 An elective table alone may not prove diploma-leading branch structure.
- A239 A framework program alone may not prove the current general elective table.
- A240 Decision-kind separation is mandatory for HB-1769.
- A241 Grade 11 in 2026-2027 cannot silently inherit Grade 9 2026-85 framework.
- A242 Grade 12 cannot silently inherit 2024-41/2026-85 without cohort resolution.
- A243 Program field must be known before exact source selection.
- A244 Branch must be known before exact source selection.
- A245 Course-code/name normalization must follow authority version.
- A246 Removed course cannot survive stale cache for a new cohort.
- A247 Legacy-valid course cannot be removed from old cohort merely due new Grade 9 decision.
- A248 Diploma outcome mapping must be versioned.
- A249 Prerequisite graph must be versioned.
- A250 Weekly-hour graph must be versioned.
- A251 HB-1769 likely decomposes into multiple program-specific child rules.
- A252 Master parent remains a source-derived inspection claim, not one universal executable rule.
- A253 Exact children require TTKB decision ID in metadata.
- A254 HB-1769 remains WITHHELD pending field/branch child resolution.
- A255 No ARTICLE_VERIFIED increment is booked for HB-1769 in V86.

### HB-1770 exactness atoms A256-A275
- A256 HB-1770 explicitly invokes TTK decisions.
- A257 HB-1770 explicitly invokes weekly-schedule explanations.
- A258 It cannot be validated by OÖİKY.
- A259 General electives and vocational electives are distinct authority objects.
- A260 Own field/branch elective is a distinct selection class.
- A261 Other-field/branch elective is a distinct selection class.
- A262 Availability of another-field course may be conditional by program/decision.
- A263 Grade 12 2026-2027 elective table must resolve to 2023-40.
- A264 Grades 10/11 2026-2027 elective table must resolve to 2024-41.
- A265 Prep/Grade 9 2026-2027 elective table must resolve to 2026-62.
- A266 A single HB-1770 child with one decision ID cannot cover all 2026-2027 grades.
- A267 HB-1770 must be split by cohort/grade where authority differs.
- A268 Program scope must be MTAL/eligible mesleki school type, not ALL.
- A269 Course group categorization must be authority-versioned.
- A270 Course eligibility is not inferred merely from historical master wording.
- A271 Current MTEGM Duyuru 17 is an applicability resolver, not alone the full content of each course rule.
- A272 Underlying TTKB decision/annex supplies course content/options.
- A273 HB-1770 remains WITHHELD as unsplit master parent.
- A274 Scoped children are promotion candidates after decision-annex match.
- A275 No ARTICLE_VERIFIED increment is booked for HB-1770 in V86.

### HB-1771..1773 reconstruction atoms A276-A300
- A276 HB-1771 must be MTAL scoped before republication.
- A277 HB-1771 sector-need criterion needs explicit current authority.
- A278 HB-1771 zümre input needs explicit current authority.
- A279 HB-1771 coordinator input needs explicit current authority.
- A280 HB-1771 student-demand input needs explicit current authority.
- A281 HB-1771 school-administration final determination needs explicit current authority.
- A282 Partial match cannot restore HB-1771 ARTICLE_VERIFIED.
- A283 HB-1772 must be program/version scoped.
- A284 HB-1772 prerequisite relation should be modeled as a directed course dependency.
- A285 Dependency edges must include authority version.
- A286 Dependency edges may differ by field/branch/cohort.
- A287 HB-1772 can be re-promoted only where current applicable program explicitly carries the sequence/prerequisite rule.
- A288 HB-1773 must be schedule/version scoped.
- A289 Weekly-hour value/option is a versioned parameter.
- A290 Weekly-hour amount may differ by grade/program/course.
- A291 HB-1773 should resolve actual hour from schedule rather than freeze prose globally.
- A292 Exact schedule row/annex is preferred evidence for executable weekly-hour value.
- A293 Generic statement can be a parent only if no false ALL applicability is implied.
- A294 Parent inspection text and executable child parameter must remain separable.
- A295 Source URL alone is insufficient; decision number + annex + applicability are required.
- A296 Evidence snapshot must preserve decision/version used when task instance was generated.
- A297 Future legal diff may create L1/L2/L3 impact depending parameter/eligibility change.
- A298 V86 closes with 300 support atoms.
- A299 V86 ARTICLE_VERIFIED closes at 460 after three integrity rollbacks.
- A300 Next canonical batch is V87, starting HB-1774 evrak kayıt/dosyalama/sevk exactness audit.

## New guards
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

## Close
V86 is closed. Phase 1 + Phase 2 + Phase 3 = 300 support atoms. Closed support pool becomes 22,805. ARTICLE_VERIFIED is 460 / 2,229. Next: V87 — HB-1774+ evrak kayıt, dosyalama, sevk, EBYS, dilekçe/bilgi edinme, gizlilik and certified-copy workflows, using exact current official provisions.