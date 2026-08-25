# Delegated Regulations Deepening — 100+ Batch V11

Date: 2026-08-25
Repository scope: `halisbozoglu-design/okulos-edu-suite`
Publication state: `STAGING_SUPERADMIN_APPROVAL`
History rule: immutable; apply approved changes only to future/pending workflows.
ARTICLE_VERIFIED increment: **0** (durable 2,229-row `workflow_id` binding is unavailable).
Migration count: **0**.

## Provenance contract
Every atom below preserves: `rule_code`, `source_name`, `source_url`, `article/paragraph`, `scope`, `role/audience`, `trigger`, `deadline/parameter`, `evidence/output`, `impact`, `authority_status`.

Authority status values used here:
- `DIRECT_CURRENT_OFFICIAL`: current Resmî Gazete text or current official MEB text.
- `OFFICIAL_ANNUAL/PERIODIC`: official annual/periodic guide; values must be versioned and never overwrite prior years.
- `CROSS_REFERENCE_ONLY`: a source-to-source dependency edge; not a substitute for the delegated regulation.

## Official sources
1. OÖKY — https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
2. İlköğretim ve Ortaöğretim Kurumlarında Parasız Yatılılık, Burs ve Sosyal Yardımlar Yönetmeliği — https://mevzuat.meb.gov.tr/dosyalar/716.pdf
3. MEB Taşıma Yoluyla Eğitime Erişim Yönetmeliği 2024 amendment, RG 32619 — https://resmigazete.gov.tr/eskiler/2024/08/20240801-2.htm
4. Eğitimde Erişim Modelleri Yönergesi — https://mevzuat.meb.gov.tr/dosyalar/2262.pdf
5. Özel Eğitim Hizmetleri Yönetmeliği, RG 30471 — https://resmigazete.gov.tr/eskiler/2018/07/20180707-8.htm
6. OÖKY 2023 amendment (special-education placement / RPD cross-reference), RG — https://resmigazete.gov.tr/eskiler/2023/09/20230908-2.htm
7. MEB Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği, RG 31213; MEB announcement — https://www.meb.gov.tr/rehberlik-ve-psikolojik-danisma-hizmetleri-yonetmeligi-yayimlandi/haber/21433/tr
8. MEB Açık Öğretim Kurumları Yönetmeliği, RG 32700 — https://resmigazete.gov.tr/eskiler/2024/10/20241022-2.htm
9. Devlet Arşiv Hizmetleri Hakkında Yönetmelik (delegated by current MEB regulations), RG 30922; official Devlet Arşivleri source family — https://www.devletarsivleri.gov.tr/varliklar/dosyalar/mevzuat/arsivhizmetleri.pdf
10. Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik (10.06.2020, 31151) — current regulation; detailed clause expansion remains a dedicated next batch.

---

## A. Pansiyon / parasız yatılılık / burs — 30 atoms
Source: 716.pdf, especially Md.18-20; OÖKY delegated boarding/burs interface. Authority: `DIRECT_CURRENT_OFFICIAL` unless an annual guide supplies a year parameter.

1. `BOARD-001` Md.18/1 — eligible student request is required for parasız yatılı placement.
2. `BOARD-002` Md.18/1 — parasız yatılı eligibility conditions must be satisfied before placement.
3. `BOARD-003` Md.18/1 — placement to the student’s own school pansiyon depends on available capacity.
4. `BOARD-004` Md.18/1 — own-school placement ranking uses school-entry score where the regulation requires ranking.
5. `BOARD-005` Md.18/1 — school directorate is the decision actor for its own pansiyon placement in this route.
6. `BOARD-006` Md.18/1 — if capacity remains, students of other eligible schools may be considered.
7. `BOARD-007` Md.18/1 — cross-school placement actor is the il/ilçe yatılılık ve bursluluk komisyonu.
8. `BOARD-008` Md.18/1 — cross-school ranking must preserve the same regulatory placement basis.
9. `BOARD-009` Md.18/2 — after normal registration closes, remaining capacity may be filled.
10. `BOARD-010` Md.18/2 — remaining-capacity placement is a separate workflow state from the primary placement round.
11. `BOARD-011` Md.18/2 — remaining-capacity placement is executed by the il/ilçe yatılılık ve bursluluk komisyonu.
12. `BOARD-012` Md.18/2 — remaining-capacity route uses the regulation’s local-placement basis, not arbitrary selection.
13. `BOARD-013` Md.18/3 — multi-program schools must distinguish placement routes by school/program admission type.
14. `BOARD-014` Md.18/3-a — centrally/special-ability admitted students follow the score/capacity route.
15. `BOARD-015` Md.18/3-b — students without successful burs/boarding exam outcome may enter the local remaining-capacity route when allowed.
16. `BOARD-016` Md.19/1-a — exam result evidence is required where the student’s route depends on exam entitlement.
17. `BOARD-017` Md.19/1-b — health-report evidence is required for boarding where applicable.
18. `BOARD-018` Md.19/1-c — family financial-status declaration is a required evidence object where applicable.
19. `BOARD-019` Md.19/1-ç — discipline/class-success evidence is required where the clause applies.
20. `BOARD-020` Md.19/2 — document requirements must be conditionally suppressed for categories explicitly exempted by the regulation.
21. `BOARD-021` Md.19/3-a — protected-status placement requires official protection/court/institution evidence as applicable.
22. `BOARD-022` Md.19/3-b — absence of the relevant school in the residence area must be evidenced by il/ilçe MEM where this quota is used.
23. `BOARD-023` Md.19/3-c — teacher-child quota requires parent teacher-status evidence.
24. `BOARD-024` Md.20/1-a — prior parasız-yatılı completion evidence is accepted for the specified exam-free route.
25. `BOARD-025` Md.20/1-b — foreign-student placement under the specified route requires the competent authority’s permission evidence.
26. `BOARD-026` Md.20/2 — secondary-level exam-free boarding routes must collect the additional documents applicable to the legal ground relied on.
27. `BOARD-027` Md.20/2-a — war-invalid parent status is evidence-gated where that statutory category is invoked.
28. `BOARD-028` Md.20/2-b — statutory protected categories under referenced laws require official proof from competent authorities.
29. `BOARD-029` Md.20/2-c — disaster/war extraordinary-protection route requires evidence from the civil administration authority.
30. `BOARD-030` — system rule: each boarding/burs decision stores `capacity_snapshot`, `eligibility_snapshot`, `evidence_set`, `decision_actor`, `source_version`; historical placements are immutable.

## B. Taşıma yoluyla eğitime erişim — 32 atoms
Sources: RG 2024 amendment + 2262.pdf. Scope here is **legal/compliance only**; no GPS/mobile implementation.

31. `TRANS-001` RG-2024 Md.1 — transport access exists to protect access to education for in-scope students/course participants.
32. `TRANS-002` RG-2024 Md.1 — scope includes primary education.
33. `TRANS-003` RG-2024 Md.1 — scope includes secondary education.
34. `TRANS-004` RG-2024 Md.1 — scope includes special-education school/institution/class participants.
35. `TRANS-005` RG-2024 Md.1 — scope includes in-scope special-education course participants in non-formal education.
36. `TRANS-006` RG-2024 Md.4-ç — temporary residence may arise from disaster-related displacement.
37. `TRANS-007` RG-2024 Md.4-ç — temporary residence may arise from seasonal work.
38. `TRANS-008` RG-2024 Md.4-ç — temporary residence may arise from education/other migration causes.
39. `TRANS-009` RG-2024 Md.4-e — transport application is day-trip access to designated official school/institution/special-education classes.
40. `TRANS-010` RG-2024 Md.4-e — free lunch is part of the transport application for eligible primary/secondary students, subject to stated exclusions.
41. `TRANS-011` RG-2024 Md.4-f — a school may become a source school because of insufficient student numbers/closure.
42. `TRANS-012` RG-2024 Md.4-f — a school may become a source school because of disaster or sudden life/property safety risks.
43. `TRANS-013` RG-2024 Md.4-f — strengthening/reconstruction status can trigger source-school eligibility.
44. `TRANS-014` RG-2024 Md.4-g — source settlement eligibility depends on the regulation’s settlement definition.
45. `TRANS-015` RG-2024 Md.4-g — absence of the needed school type in the settlement is a qualifying condition in the stated route.
46. `TRANS-016` RG-2024 Md.4-g — absence of public transport is a qualifying condition in the stated settlement route.
47. `TRANS-017` RG-2024 Md.4-ğ — eligible persons include continuously resident students in the source settlement.
48. `TRANS-018` RG-2024 Md.4-ğ — eligible persons may include temporarily resident students under the amended definition.
49. `TRANS-019` RG-2024 Md.4-ğ — special-education students/coursetakers are explicitly represented in the transport eligibility model.
50. `TRANS-020` RG-2024 Md.4-ğ — a BEP Development Unit may decide that specified students/course participants require accompaniment.
51. `TRANS-021` RG-2024 Md.4-ğ — accompaniment may be by parent/guardian or a person authorised in writing.
52. `TRANS-022` RG-2024 Md.4-m — school-service-vehicle inspection commission is created by governorate/district governorate.
53. `TRANS-023` RG-2024 Md.4-m — inspection commission membership includes national education representation.
54. `TRANS-024` RG-2024 Md.4-m — inspection commission membership includes police/gendarmerie/municipality representation as applicable.
55. `TRANS-025` RG-2024 Md.4-n — special-education transport may require guide personnel in the school service vehicle.
56. `TRANS-026` RG-2024 Md.5 — meal funds are transferred to the relevant school/institution account under the regulated meal model.
57. `TRANS-027` RG-2024 Md.5/3 — meal provision must follow applicable food/service legislation.
58. `TRANS-028` RG-2024 Md.5/3 — nutritional value must be protected in preparation/service.
59. `TRANS-029` RG-2024 Md.5/3 — hygiene/health compliance is mandatory in meal preparation/service.
60. `TRANS-030` RG-2024 Md.5/3 — meals must reach students on time.
61. `TRANS-031` RG-2024 Md.5/4 — students outside transport scope are normally excluded from transport-meal service, subject to the stated social-assistance exception.
62. `TRANS-032` 2262 Md.13-14 — where the access-model directive has no rule, Transport Access + School Service Vehicles legislation applies; guidance/inspection is performed by competent MEM/inspectors/linked school director.

## C. Özel eğitim değerlendirme / yerleştirme / uyarlama — 24 atoms
Sources: RG 30471 base regulation + RG 2023 OÖKY amendment + RG 2024 transport amendment.

63. `SPED-001` OEHY Md.1 — all special-education workflows must preserve the individual’s education right as the governing purpose.
64. `SPED-002` OEHY Md.2 — system scope covers delivery/execution of education services to special-education-needs individuals.
65. `SPED-003` OEHY Md.4-g — BEP is based on the programme the individual follows.
66. `SPED-004` OEHY Md.4-g — BEP uses individual developmental characteristics.
67. `SPED-005` OEHY Md.4-g — BEP uses educational needs.
68. `SPED-006` OEHY Md.4-g — BEP uses current performance.
69. `SPED-007` OEHY Md.4-g — BEP contains targeted objectives.
70. `SPED-008` OEHY Md.4-g — BEP includes the support-education services to be provided.
71. `SPED-009` OEHY Md.4-ı — support service may be directed to the student.
72. `SPED-010` OEHY Md.4-ı — support service may be directed to the family.
73. `SPED-011` OEHY Md.4-ı — support service may be directed to teachers.
74. `SPED-012` OEHY Md.4-ı — support service may be directed to other school staff.
75. `SPED-013` OEHY Md.4-i — support education room is an explicit environment type for eligible full-time inclusion/integration students.
76. `SPED-014` OEHY Md.4-i — support education room also serves eligible gifted students.
77. `SPED-015` OEHY Md.4-ö — inclusion/integration may be full-time with peers.
78. `SPED-016` OEHY Md.4-ö — inclusion/integration may be part-time in special-education classes where applicable.
79. `SPED-017` OEHY Md.4-ö — inclusion/integration must include support education services, not merely placement.
80. `SPED-018` OÖKY amendment 2023 Md.23/2-ç — secondary placement of full-time inclusion/integration students requires the Special Education Evaluation Board Report.
81. `SPED-019` same clause — valid disability health-board report or ÇÖZGER is an additional placement evidence source where required.
82. `SPED-020` same clause — residence address is an explicit placement input.
83. `SPED-021` same clause — disability status/characteristics are explicit placement inputs.
84. `SPED-022` same clause — placement within the defined secondary-school registration area must follow Special Education Services Regulation rules.
85. `SPED-023` same clause — the specified placement route limits full-time inclusion/integration placement to at most two such students per branch/class.
86. `SPED-024` transport amendment Md.4-ğ — BEP Development Unit accompaniment decisions must be stored as a distinct decision/evidence object linked to transport eligibility.

## D. Rehberlik ve psikolojik danışma programme lifecycle — 22 atoms
Source authority: RG 31213; official MEB announcement confirms publication/current framework. Exact operational subclauses already staged in V10 remain authoritative; this batch adds lifecycle/data-model atoms from current definitions and OÖKY cross-reference.

87. `RPD-001` RPD Md.3-f — e-Rehberlik is the electronic programme-execution, reporting and monitoring system.
88. `RPD-002` RPD Md.3-f — system access/monitoring must be role/authority scoped.
89. `RPD-003` RPD Md.3-g — developmental/preventive services aim to support whole-person development.
90. `RPD-004` RPD Md.3-g — developmental/preventive services explicitly reduce risk factors.
91. `RPD-005` RPD Md.3-g — developmental/preventive services explicitly increase protective factors.
92. `RPD-006` RPD Md.3-ğ — a national/general target is set for each school year.
93. `RPD-007` RPD Md.3-ğ — prior-year data is an input to the general target.
94. `RPD-008` RPD Md.3-ğ — student developmental needs are an input to the general target.
95. `RPD-009` RPD Md.3-ğ — societal priority needs are an input to the general target.
96. `RPD-010` RPD Md.3-ğ — education institutions must include the general target in the school RPD programme.
97. `RPD-011` RPD Md.3-h — services must be data-based.
98. `RPD-012` RPD Md.3-h — services must be measurable.
99. `RPD-013` RPD Md.3-h — services must be sustainable and subject to accountability evaluation.
100. `RPD-014` RPD Md.3-ı — needs analysis may use psychological tests where legally/ethically appropriate.
101. `RPD-015` RPD Md.3-ı — needs analysis may use non-test techniques.
102. `RPD-016` RPD Md.3-k — school RPD programme must account for institution type/level/features.
103. `RPD-017` RPD Md.3-k — school RPD programme must account for student needs and developmental period.
104. `RPD-018` RPD Md.3-k — school RPD programme must account for students at risk.
105. `RPD-019` RPD Md.3-k — school RPD programme is implemented through shared understanding/cooperation.
106. `RPD-020` RPD Md.3-k — school RPD programme must be evaluated on an evidence basis.
107. `RPD-021` RPD Md.3-l — special target uses prior-year student/parent/teacher needs analysis, risk map and programme evaluation results.
108. `RPD-022` RPD Md.3-t — local target is based on prior-year data and student developmental needs and is set by the provincial RPD services executive commission.

## E. Açık öğretim / belge / arşiv interface — 24 atoms
Source: RG 32700, current MEB Open Education Institutions Regulation.

109. `OPEN-001` Md.7/1-a — open-education unit transactions follow official-site announcements and system authorisations.
110. `OPEN-002` Md.7/1-b — learning documents are transferred into the information-management system for adaptation/recognition operations.
111. `OPEN-003` Md.7/1-c — requested student documents are issued through the information-management system where enabled.
112. `OPEN-004` Md.7/1-ç — a physical/electronic file is created when e-Okul data are missing or no e-Okul record exists.
113. `OPEN-005` Md.7/1-ç — registration evidence is scanned and uploaded to the information-management system.
114. `OPEN-006` Md.7/1-d — education-material need is identified and entered/distributed electronically in time.
115. `OPEN-007` Md.7/1-e — students receive guidance on registration and post-registration processes.
116. `OPEN-008` Md.7/1-f — transfer operations between open high schools are an explicit open-education-unit responsibility.
117. `OPEN-009` Md.7/2-b — written/practical/performance/project evaluation results are entered within 10 business days after the relevant exam/delivery date.
118. `OPEN-010` Md.7/2-c — face-to-face education completion transactions are entered within 10 business days after the period’s course end.
119. `OPEN-011` Md.7/2-ç — course passing and attendance records are maintained in the information-management system.
120. `OPEN-012` Md.7/2-d — military deferment, social-security and other student official correspondence are explicit institutional duties.
121. `OPEN-013` Md.10/2-c — deputy manager follows/updates electronic records in own responsibility area and submits approval-requiring documents to the manager.
122. `OPEN-014` Md.10/2-d — documents required to be kept are arranged/stored according to Devlet Arşiv Hizmetleri Hakkında Yönetmelik.
123. `OPEN-015` Md.10/2-j — notifications/service of documents must follow the applicable notification legislation.
124. `OPEN-016` Md.10/2-k — institutional document/book/chart/form operations have an assigned management responsibility and signature chain.
125. `OPEN-017` Md.16/1 — a registration-cancellation request in the registration period must be resolved before period exams; application documents are returned where applicable.
126. `OPEN-018` Md.16/2 — false/altered documents or false declarations trigger registration cancellation and competent-authority notification/legal process.
127. `OPEN-019` Md.16/2 — documents including diploma produced on the basis of invalid registration are cancelled.
128. `OPEN-020` Md.17/1 — no renewal for at least two consecutive periods moves the record to archived/waiting status.
129. `OPEN-021` Md.17/1 — renewal reactivates the waiting student under the regulation.
130. `OPEN-022` Md.18/1 — transfers between open high schools follow the destination school’s registration guide and official work calendar.
131. `OPEN-023` Md.59-60 — learning documents are issued on request; e-Devlet documents do not require seal/signature.
132. `OPEN-024` Md.61 — uploaded documents’ originals remain in the relevant institution/unit archive; student files, diploma/workplace-opening registers and other regulated records are retained/transferred under the regulation and archive rules.

---

## Counts
- Pansiyon / boarding / burs: 30
- Transport compliance: 32
- Special education: 24
- RPD lifecycle: 22
- Open education / document / archive interface: 24
- **Total new staged atoms: 132**
- `ARTICLE_VERIFIED` increment: **0**
- Migration count: **0**

## Architecture / impact notes
1. No schema migration is required. Existing `legal_sources / legal_versions / legal_provisions / entity_legal_links / legal_changes / legal_change_impacts / legal_change_staging / legal_snapshots` design can represent this batch.
2. Annual guide dates/thresholds are never hard-coded into timeless master rules; they are versioned legal parameters.
3. Transport atoms are compliance/workflow only. GPS/mobile application implementation is intentionally excluded from this repository conversation.
4. Pansiyon/burs evidence is condition-based; the system must not demand documents that the governing clause expressly exempts for a category.
5. Special-education health/evaluation documents are sensitive; access must be role-limited and evidence logs auditable.
6. RPD records retain confidentiality and role-scoped access; programme analytics must not turn counselling records into unrestricted administrative data.
7. Archive and official-correspondence detailed article-by-article expansion remains a dedicated next batch; this file records only directly verified delegate/interface rules and does not invent unsupported clause numbers.
8. All approved future executions retain a `legal_snapshot`; completed historical decisions remain immutable.
