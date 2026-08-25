# OÖKY Gap-Scan — Assessment, Administration, Records and Year-Cycle Batch V8

Source of truth: Millî Eğitim Bakanlığı Ortaöğretim Kurumları Yönetmeliği (current MEB Mevzuat PDF)
Primary source: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
Status: STAGING_SUPERADMIN_APPROVAL
History policy: immutable; apply only to future/pending workflows after approval.
ARTICLE_VERIFIED policy: do not increment without exact durable workflow_id + current source + article/paragraph binding.

## Scope
New gap-scan coverage focused on previously untouched/underrepresented source articles: 23–35, 43–55, 60–68, 71–77, 79, 83–84/B, 87, 90–92, 96, 110–111, 153.

## Atomic rules (128)

### A. Student placement / transfer / registration governance — 23–35 (24 atoms)
1. OOKY-23-01 — Student placement/transfer commission is established at the end of each school year where multiple secondary institutions exist.
2. OOKY-23-02 — Commission chair is a branch director designated by the provincial/district national education directorate.
3. OOKY-23-03 — Commission membership must include the special education services board chair and one school principal from each relevant MEB general directorate family named in the article.
4. OOKY-23-04 — Foreign-student cases add an authorized representative of the relevant institution to the commission.
5. OOKY-23-05 — Commission mandate continues until the end of the following school year.
6. OOKY-23-06 — Placement to preference-based schools inside the secondary-school registration area must be balanced.
7. OOKY-23-07 — Students not placed inside their registration area are considered for other registration areas in the same central district/district when vacancies exist.
8. OOKY-23-08 — Such out-of-area placement is preference-based and ordered by OBP superiority.
9. OOKY-23-09 — Placement decisions must preserve current transition directive/guide constraints as delegated authority.
10. OOKY-24-01 — Registration/placement workflows must retain source placement channel and school admission type.
11. OOKY-24-02 — Student identity/placement evidence used at registration must be persisted as provenance, not overwritten by later transfers.
12. OOKY-25-01 — Admission prerequisites specific to school/program type must be evaluated before enrollment is finalized.
13. OOKY-25-02 — Program-specific health/fitness or talent conditions must be represented as explicit eligibility gates where the article requires them.
14. OOKY-26-01 — Boarding/day-student status is a separate enrollment attribute and must not be inferred from school type alone.
15. OOKY-27-01 — School capacity and quota controls are admission gates, not advisory metadata.
16. OOKY-28-01 — Transfer requests must preserve current grade/program/field/branch context.
17. OOKY-28-02 — Transfer evaluation must check vacancy and admission conditions before approval.
18. OOKY-29-01 — Transfer outcome must be recorded with decision date, target institution and legal basis.
19. OOKY-30-01 — Transfers across program types require explicit equivalence/deficiency review where applicable.
20. OOKY-31-01 — Student records arriving from another institution must preserve historical course/grade data rather than normalize it destructively.
21. OOKY-32-01 — Foreign-student placement cases must retain authority/decision provenance.
22. OOKY-33-01 — Special-condition placements must use the competent board/commission decision as evidence.
23. OOKY-34-01 — Registration cancellation/relationship termination actions require a reason code and source provision.
24. OOKY-35-01 — Enrollment/transfer statuses must be auditable as a timeline: requested → under review → decided → enrolled/rejected/cancelled.

### B. Measurement & evaluation — 43–55 (38 atoms)
25. OOKY-43-01 — Academic year consists of two complementary assessment periods.
26. OOKY-43-02 — Student achievement is assessed against curriculum learning outcomes.
27. OOKY-43-03 — Written exams are supported assessment instruments.
28. OOKY-43-04 — Applied exams are supported assessment instruments.
29. OOKY-43-05 — Performance studies are supported assessment instruments.
30. OOKY-43-06 — Projects are supported assessment instruments.
31. OOKY-43-07 — Workplace skill training/stage scores participate in achievement calculation when applicable.
32. OOKY-43-08 — Exam questions must derive from curriculum general/specific objectives and learning outcomes.
33. OOKY-43-09 — Teacher must continuously monitor whether intended knowledge/skills have been acquired.
34. OOKY-43-10 — Participation in lessons/activities is part of the evidence used to determine student status.
35. OOKY-43-11 — Assessment must value critical thinking.
36. OOKY-43-12 — Assessment must value creative thinking.
37. OOKY-43-13 — Assessment must value research/inquiry.
38. OOKY-43-14 — Assessment must value problem solving.
39. OOKY-43-15 — Assessment instruments must satisfy validity, reliability and usability expectations.
40. OOKY-43-16 — Appropriate scoring evidence such as answer key, rubric or checklist must be prepared for the instrument.
41. OOKY-44-01 — Written exam planning must be represented per course/term with date and responsible teacher/commission.
42. OOKY-44-02 — Common written exams must be distinguishable from teacher-level written exams.
43. OOKY-44-03 — Common-exam schedule conflicts require resolution before publication.
44. OOKY-45-01 — Applied-course evaluation must allow performance evidence beyond written testing.
45. OOKY-45-02 — Applied exam evidence must be attachable to the student/course assessment record.
46. OOKY-46-01 — Exam results must be entered into the official student information system within the legal/administrative timeline applicable to the exam.
47. OOKY-46-02 — Result corrections require reason, actor and audit trail.
48. OOKY-47-01 — Absence from an assessment must distinguish excused vs unexcused status.
49. OOKY-47-02 — Make-up assessment eligibility must be driven by documented excuse where required.
50. OOKY-48-01 — Project assignment must be traceable to course, student/group, advisor and due date.
51. OOKY-48-02 — Project evaluation evidence must be stored with the resulting score.
52. OOKY-49-01 — Performance study evaluation must be linked to observable criteria.
53. OOKY-49-02 — Group performance tasks must preserve individual student attribution where scores differ.
54. OOKY-50-01 — Term score calculation must use only legally eligible assessment components.
55. OOKY-50-02 — Missing assessment components must not silently default to zero unless the rule explicitly requires it.
56. OOKY-51-01 — Course pass/fail status is derived after term/year score calculation and applicable thresholds.
57. OOKY-51-02 — Responsibility status must be stored separately from direct pass status.
58. OOKY-52-01 — Responsibility exams require a dedicated exam instance, not reuse of ordinary written exam records.
59. OOKY-52-02 — Responsibility exam commission/gözetmen assignments require separate duty records.
60. OOKY-53-01 — Exam analysis must support question-level review.
61. OOKY-53-02 — Exam analysis must support class/section-level review.
62. OOKY-53-03 — Exam analysis outcomes should feed zümre/teacher improvement actions rather than alter historical scores.

### C. Promotion / preparation / completion — 60–68 (18 atoms)
63. OOKY-60-01 — In preparatory class, promotion is determined by first foreign language and Turkish achievement.
64. OOKY-60-02 — Other preparatory-class course success contributes to reward evaluation but not promotion gate.
65. OOKY-60-03 — Preparatory-class scores do not enter graduation score calculation.
66. OOKY-60-04 — Students unsuccessful in promotion courses at year-end are taken to proficiency exam under the article’s procedure.
67. OOKY-60-05 — Failure in the proficiency exam leads to one additional preparatory year.
68. OOKY-60-06 — Failure again in the second preparatory year terminates relationship with that preparatory school.
69. OOKY-60-07 — Such students are transferred to grade 9 of another secondary institution without preparatory class under transfer rules.
70. OOKY-60-08 — Direct passage request from preparatory class to grade 9 requires written parent application.
71. OOKY-60-09 — Application must be made at least 5 days before the proficiency exam.
72. OOKY-60-10 — Direct-passage proficiency exam is held in Turkish and first foreign language.
73. OOKY-60-11 — The exam is held in the first week of October.
74. OOKY-61-01 — Year-end achievement determination must preserve course-level pass/responsibility state.
75. OOKY-62-01 — Grade progression decisions must be reproducible from stored course results and applicable rule version.
76. OOKY-63-01 — Graduation eligibility must verify completion of all required program obligations.
77. OOKY-64-01 — Diploma eligibility and issuance are separate workflow states.
78. OOKY-65-01 — Graduation score calculation must exclude legally excluded preparatory scores.
79. OOKY-66-01 — Exceptional completion/special-status decisions require explicit authority evidence.
80. OOKY-68-01 — Completion records must retain the curriculum/program version under which the student graduated.

### D. Documents, workplace-opening, certificates — 71–77 (16 atoms)
81. OOKY-71-01 — Graduates of four-year programs in 3308-scope fields may receive independent workplace-opening certificate carrying mastery authority/responsibility.
82. OOKY-71-02 — Health-profession fields whose workplace-opening authority is governed by special laws are excluded.
83. OOKY-71-03 — Independent Workplace Opening Certificate is generated through e-Okul by the school of graduation.
84. OOKY-71-04 — MESEM workplace-opening certificate procedures follow MEB-determined procedures where delegated.
85. OOKY-72-01 — A student entitled to diploma but whose diploma is not yet issued may request a temporary graduation certificate.
86. OOKY-72-02 — Temporary graduation certificate requires diploma-entitlement verification before issuance.
87. OOKY-73-01 — Learning-status certificate is produced upon written student request.
88. OOKY-73-02 — The certificate includes identity information.
89. OOKY-73-03 — The certificate includes field/branch where applicable.
90. OOKY-73-04 — The certificate includes all courses studied.
91. OOKY-73-05 — The certificate includes weekly course hours.
92. OOKY-73-06 — The certificate includes obtained scores.
93. OOKY-73-07 — The certificate includes diploma information where applicable.
94. OOKY-73-08 — Lost diploma/master-trainer/mastery/workplace-opening/journeyman/learning-status document may be replaced once with a learning-status certificate.
95. OOKY-73-09 — A second request does not produce another replacement certificate; status is reported in writing to the requesting institution/organization.
96. OOKY-74/77-01 — Document issuance workflows must store issue number/date, signer set, source record and replacement history.

### E. School administration / duties / year-cycle — 79, 83–84/B, 87, 90–92 (20 atoms)
97. OOKY-79-01 — Head deputy principal is responsible to principal for planned and proper execution of education, administration, guidance and supervision.
98. OOKY-79-02 — Head deputy principal acts for principal when principal is on leave/duty.
99. OOKY-79-03 — Head deputy principal chairs student reward and discipline board.
100. OOKY-79-04 — Head deputy principal monitors deputy principals’ attendance/absence work.
101. OOKY-79-05 — Persistent/meaningful student absence triggers parent communication and, where needed, counselor collaboration.
102. OOKY-79-06 — Course distribution program is prepared and submitted for principal approval.
103. OOKY-79-07 — Teacher/student duty rosters are prepared for principal approval and duty execution is checked.
104. OOKY-79-08 — Salary, fee and social-assistance transactions are performed or ensured.
105. OOKY-79-09 — When assigned, head deputy principal serves as realization officer where principal is spending authority.
106. OOKY-79-10 — Personnel start/end of duty, leave, illness and attendance status are tracked and principal informed.
107. OOKY-79-11 — When assigned, head deputy principal chairs inspection-acceptance and counting boards.
108. OOKY-83-01 — In boarding schools, one deputy principal is assigned boarding/scholarship/social-assistance operations.
109. OOKY-83-02 — Detailed boarding duties are delegated to the current Boarding/Scholarship/Social Assistance/Pension regulation and relevant MESEM boarding rules.
110. OOKY-84A-01 — Field/department and workshop/laboratory chief assignments must preserve organizational unit and effective-date history.
111. OOKY-84B-01 — Chief duty termination/reassignment must be auditable and must not erase historical responsibility.
112. OOKY-87-01 — Administrators and teachers conduct professional work from course-end to first working day of July and from first working day of September to course start.
113. OOKY-87-02 — Professional-work program is announced by school administration one week in advance.
114. OOKY-87-03 — Professional work includes general culture, subject-area and pedagogical development.
115. OOKY-87-04 — Professional work includes problem-solving, new skills and student/environment need-based planning.
116. OOKY-87-05 — Professional work includes curriculum, legislation and practice review.

### F. Guidance, duty, symbols, class/section boards, employee training — 90–92, 96, 110–111, 153 (12 atoms)
117. OOKY-90-01 — Guidance counselor assignment follows the current Guidance and Psychological Counseling Services regulation.
118. OOKY-90-02 — Guidance counselors participate in professional-work periods with other teachers.
119. OOKY-90-03 — Guidance counselors may be assigned during holidays when higher-education guidance/preference work requires it.
120. OOKY-90-04 — Group guidance work may use lesson hours in which the course teacher is absent.
121. OOKY-91-01 — Teacher duty is performed according to duty roster.
122. OOKY-91-02 — Duty should be assigned on the teacher’s least-loaded day(s) where possible under the rule.
123. OOKY-91-03 — Duty normally begins 15 minutes before first lesson and ends 15 minutes after last lesson, subject to special transport/dual-shift provisions.
124. OOKY-96-01 — Turkish Flag handling/cleaning/protection/use follows Flag Law and delegated regulation.
125. OOKY-96-02 — An Atatürk corner is required at a visible suitable place near the administration entrance.
126. OOKY-110-01 — Class/section teacher boards meet in November and April and may convene additionally upon authorized request/approval.
127. OOKY-110-02 — Meeting agenda/date/place are announced via e-Kurul/Zümre and, except mandatory cases, at least 5 days in advance; meetings occur outside lesson hours.
128. OOKY-153-01 — Vocational education of employees may use all facilities of public/private schools and training centers under cooperation arrangements.

## System implementation notes
- No database migration created in this batch; existing legal-staging/document model is sufficient.
- Every atom is staged as unbound legal logic until durable 2,229-row workflow identifiers are available.
- Delegated regulations are linked as authority edges, not copied as if they were OÖKY text.
- Time parameters (5 days, one week, November/April, October first week, 15 minutes) should be versioned legal parameters rather than hard-coded constants in UI/business logic.
- Historical student decisions/documents remain immutable; later legal changes affect only future/pending instances after super-admin approval.

## Batch metrics
- atomized_rule_count: 128
- new_source_atom_count: 128
- article_verified_increment: 0
- migration_count: 0
