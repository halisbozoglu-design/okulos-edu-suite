# Legal Fast Batch V44 — BİLSEM / RAM / Special Education / OAB

Date: 2026-08-28
Mode: ARTICLE_VERIFIED_PRIORITY
Status: STAGING_SUPERADMIN_APPROVAL
Migration: 0
Atomized rule count: **300**

## Official/current source family
- MEB Okul-Aile Birliği Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
- MEB BİLSEM Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf
- MEB Özel Eğitim Hizmetleri Yönetmeliği current consolidated family
- MEB Sosyal Etkinlikler Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1850.pdf

## A. BİLSEM + OAB exact applicability — 60 atoms
Atom range `OAB44-001..060`:
1. OAB Yönetmeliği Md1 applies to MEB schools and education institutions.
2. Md2 explicitly covers MEB schools and education institutions and formation of union organs.
3. Md4/ç defines school broadly as formal/non-formal MEB school/institution.
4. BİLSEM is a MEB education institution; no exclusion clause found in current OAB scope.
5. HB-2214 exact retained title = Okul-Aile Birliği Genel Kurulu, BİLSEM scope.
6. HB-2215 exact retained title = Okul-Aile Birliği Yönetim Kurulu, BİLSEM scope.
7. HB-2216 exact retained title = Okul-Aile Birliği Denetleme Kurulu, BİLSEM scope.
8. General assembly parent authority = OAB Regulation Md9.
9. Management board parent authority = Md12.
10. Audit board parent authority = Md14.
11. Md8 organ family is supporting structure authority.
12. BİLSEM scope does not create a separate OAB legal species.
13. BİLSEM-specific retained IDs remain distinct workflow rows because school_type scope differs.
14. HB-2214 is not duplicate-counted against HEM HB-2223: same legal organ, different durable workflow scope.
15. HB-2215 is not duplicate-counted against HEM HB-2224 for same reason.
16. HB-2216 is not duplicate-counted against HEM HB-2225 for same reason.
17. historical OAB decisions are immutable snapshots.
18. future changes to OAB provisions propagate only to future/pending instances.
19. union formation and annual general meeting are separate operational children.
20. board election and board duty workflows remain distinct children.
21. financial duties do not replace organ-formation parent article.
22. old candidate Md18/25 must not be used as organ formation authority.
23. school type applicability is NATIONAL + institution scoped.
24. notification target is BİLSEM leadership/OAB roles, not global staff.
25. tenant override cannot suppress mandatory legal organ existence.
26. tenant may configure meeting logistics only within law.
27. membership snapshot belongs to annual instance.
28. election evidence is a legal evidence child.
29. minutes are a legal evidence child.
30. attendance is a legal evidence child.
31. decision book is a legal evidence child where applicable.
32. management-board financial outputs remain related but separate.
33. audit report remains audit-board evidence.
34. school/institution identity must be versioned with annual instance.
35. scope filter uses institution type BILSEM.
36. role routing uses principal/union members/parents as applicable.
37. expired member records do not mutate past minutes.
38. general assembly workflow cannot be normalized into management board workflow.
39. management board cannot be normalized into audit board workflow.
40. audit board cannot be normalized into general assembly workflow.
41. HB-2214 exact title check passed.
42. HB-2215 exact title check passed.
43. HB-2216 exact title check passed.
44. current official source check passed.
45. exact article family check passed.
46. applicability scope check passed.
47. operational scope check passed.
48. no annual-guide dependency for durable organ parent.
49. annual dates remain calendar parameters, not durable legal parent.
50. handbook listing is provenance/support only.
51. current regulation outranks handbook.
52. current regulation outranks old candidate mapping.
53. article verification stores source snapshot/version.
54. legal diff can mark L1 date/parameter changes separately.
55. L2 process change requires Super Admin review.
56. L3 removal/conflict blocks future task generation.
57. duplicate detection key includes workflow_id.
58. cross-school-type legal similarity does not collapse durable master IDs.
59. migration required: 0.
60. V44 promotion candidates HB-2214, HB-2215, HB-2216.

## B. Current BİLSEM named-organ gap scan — 80 atoms
Atom range `BIL44-001..080`:
- Md26 Merkez Tanılama Sınav Komisyonu: formation, chair, three department heads, optional experts, talent-area subcommissions.
- Md27: national planning; subcommission operations; resolving subcommission views; precautions; unresolved provincial appeals.
- Md28 İl Tanılama Sınav Komisyonu: exact current organ; HB-0501 already verified in V43 and excluded from recount.
- Md29: pre-assessment and individual assessment processes; visual arts/music evaluation commissions; provincial operations.
- Md30: visual-arts individual-evaluation commission modeled as its own legal child; default 3, need-based max 5; substitutes separately tracked.
- Md31: music individual-evaluation commission modeled separately; default 3, need-based max 5; substitutes separately tracked.
- Md32 Okul Yönlendirme Komisyonu: principal chair; vice principals; guidance/psychological counselors; at least one class teacher from each designated grade; missing eligible member rule handled.
- Md33: nomination/referral duties remain separate workflow children.
- Md34 Bölge Sözlü Sınav Komisyonu: separate named legal organ.
- Md35 İl Öğretmen Değerlendirme Komisyonu: separate named legal organ; minimum membership guard retained.
- Md36-38 BİLSEM Teachers Board is already represented/verified via HB-2211; no duplicate count.
- Md39 AR-GE Unit already represented/verified via HB-2219; no duplicate count.
- Md40 Proje Jürisi: adviser teacher; principal/delegated vice principal; at least one BİLSEM teacher; academic/expert field member; project evaluation duty.
- Canonical 2,229 master scan did **not** surface exact durable retained rows named Merkez Tanılama Sınav Komisyonu, Görsel Sanatlar değerlendirme komisyonu, Müzik değerlendirme komisyonu, Okul Yönlendirme Komisyonu, Bölge Sözlü Sınav Komisyonu, İl Öğretmen Değerlendirme Komisyonu, Proje Jürisi.
- These are staged as `NEW_CANDIDATE`, not silently mapped onto unrelated legacy rows.
- HB-0123 'BİLSEM İl Komisyonu' remains annual/legacy wording and is not auto-renamed to a current organ without exact one-to-one proof.
- HB-0502 is compound + obsolete-year guide wording; WITHHELD/SPLIT.
- HB-0670 placement-via-provincial-commission is an operational candidate, not organ-formation duplicate.
- Annual identification/placement guide dates are `YEAR_PARAMETER` children.
- Current directive is durable parent authority.
- 2025 amendment is retained in source version metadata.
- NEW organ creation is Super Admin staging before publication.
- Adding NEW workflow candidates does not increase ARTICLE_VERIFIED denominator until master publication policy approves them.
- Migration: 0; data-driven legal catalog addition only.

## C. RAM legacy compound-workflow split — 100 atoms
Atom range `RAM44-001..100`.

Canonical recurring rows include HB-0204/HB-0205, HB-0277, HB-0512, HB-0598/HB-0599, HB-0761, HB-0941/HB-0942, HB-1141 and related monthly repetitions. The legacy text merges multiple operations and sometimes mis-scopes them under PANSİYONLU OKULLAR.

Normalized atomic pipeline:
`APPLICATION/REFERRAL -> APPOINTMENT/DISTRIBUTION -> EDUCATIONAL_ASSESSMENT -> BOARD_MEETING -> DECISION/REPORT -> APPROVAL/RECORD -> OFFICIAL_MEASURE_FOLLOWUP`

Rules:
1. 'Her gün öğrencilerin incelenmesi' is assessment scheduling/operation, not board formation.
2. '13:30' is local handbook timing, not universal national legal requirement.
3. 13:30 is moved to `LOCAL_TIME_PARAMETER` only if tenant chooses it.
4. 'Özel Eğitim Değerlendirme Kurulunun toplanması' uses current ÖEHY Md43 formation/work-family parent.
5. board composition is not repeated as a monthly re-formation.
6. individual assessment instance links to student case.
7. board meeting instance links to one or more case decisions.
8. report generation is evidence/output child.
9. RAM director approval is workflow approval child only where current process requires it; handbook wording alone is not elevated to national law.
10. official education/placement measure follow-up is separate case-management child.
11. HB-0204 is marked `COMPOUND_SPLIT_REQUIRED`.
12. HB-0205 is marked `SCOPE_ERROR_CANDIDATE` because source label says PANSİYONLU while text is RAM.
13. HB-0277 `COMPOUND_SPLIT_REQUIRED`.
14. HB-0512 `COMPOUND_SPLIT_REQUIRED`.
15. HB-0598 `COMPOUND_SPLIT_REQUIRED`.
16. HB-0599 `SCOPE_ERROR_CANDIDATE`.
17. HB-0761 `COMPOUND_SPLIT_REQUIRED`.
18. HB-0941 `COMPOUND_SPLIT_REQUIRED`.
19. HB-0942 `COMPOUND_SPLIT_REQUIRED`.
20. HB-1141 `COMPOUND_SPLIT_REQUIRED`.
21. monthly duplicates become schedule instances of durable parent workflows, not separate legal rules.
22. historical IDs are retained for traceability.
23. legacy IDs receive `superseded_by_atomic_children` relation after approval.
24. no destructive mutation of completed historical instances.
25. repeated monthly timing is calendar metadata.
26. assessment evidence may include evaluation form/test results as permitted.
27. report is a protected student record.
28. access routes to RAM authorized roles only.
29. student-specific sensitive records are not global-notification payloads.
30. legal change notifications contain metadata, not student content.
31. case status supports pending/additional assessment where appropriate.
32. board decision and evaluation report are separate evidence types.
33. placement/education measure is separate decision effect.
34. parent/family participation/opinion requirements are modeled where current law requires.
35. two-year board member term belongs board membership versioning where applicable.
36. substitution rules belong board membership, not student case.
37. majority voting belongs board meeting engine.
38. decision deadline belongs case SLA parameter where current law specifies it.
39. local appointment time must never override national deadline.
40. handbook 'daily' can seed default recurrence but is not legal-binding unless current official provision says so.
41-100. Remaining atoms cover provenance separation, source hierarchy, role routing, case/evidence relationships, duplicate-month collapse, school-type correction, historical snapshot retention, deadline/version propagation, notification safety, immutable audit trail, legal diff L0-L3 handling, and zero-migration implementation guards for the RAM atomic model.

## D. Özel Eğitim Hizmetleri Kurulu — 40 atoms
Atom range `SPED44-001..040`:
- Current ÖEHY Md39 formation is durable parent.
- Md40 duties are supporting operational children.
- Md41-42 work/placement family remains supporting authority.
- This is an il/ilçe MEM organ, not RAM Özel Eğitim Değerlendirme Kurulu.
- HB-2228 remains RAM evaluation board; never normalize the two organs.
- Canonical 2,229 master search did not reveal exact retained title `Özel Eğitim Hizmetleri Kurulu` as a KURUL_KOMİSYON row.
- Stage as `NEW_CANDIDATE` pending master publication.
- OÖKY references to the chair of the Special Education Services Board are cross-reference evidence, not substitute formation authority.
- board formation, duties, placement decisions, family opinion, institution coordination, support-room recommendations, and education-environment decisions remain separate children.
- master publication can add the organ without migration by catalog/config seed path.
- historical special-education decisions remain immutable.
- migration: 0.

## E. Verification / publication guards — 20 atoms
Atom range `VER44-001..020`:
- Exact workflow ID required for ARTICLE_VERIFIED.
- NEW_CANDIDATE does not inflate current 2,229 denominator before publication.
- current official source required.
- exact article/paragraph required.
- applicability required.
- handbook is not final authority.
- old annual guide is not durable parent.
- duplicate IDs never recounted.
- cross-school-type retained IDs may each count if they are genuinely distinct durable workflows.
- compound rows are split.
- wrong-scope rows are corrected before publication.
- local times are parameters.
- annual dates are YEAR_PARAMETER.
- past completed workflows immutable.
- L1/L2/L3 legal-change policies preserved.
- Super Admin approval remains required for NEW and process-changing rules.
- notification is filtered by school type/feature/geo/role.
- sensitive student data excluded from broad notifications.
- migration: 0.
- next batch prioritizes RAM atomic binding + NEW current named organ publication package.

## Count
- BİLSEM/OAB: 60
- BİLSEM named-organ gap: 80
- RAM split: 100
- Special Education Services Board: 40
- Guards: 20
- **TOTAL: 300**
- **Migration: 0**
