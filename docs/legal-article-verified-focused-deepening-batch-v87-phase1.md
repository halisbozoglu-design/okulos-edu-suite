# Legal ARTICLE_VERIFIED Focused Deepening — V87 Phase 1

Date: 2026-09-02
Status: ACTIVE / PHASE 1 COMPLETE
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Lovable: 0

## Accounting
- Master workflow: 2,229
- ARTICLE_VERIFIED before: 460
- Promotions: 0
- Rollbacks: 0
- ARTICLE_VERIFIED after: 460 / 2,229 = 20.6371%
- Remaining exact: 1,769
- Closed support pool through V86: 22,805
- V87 Phase 1 active support atoms: 130 (V87-A001..A130)
- Active atoms are not added to the closed pool until V87 closes.

## Exact master boundary recovered
V87 Phase 1 covers HB-1774..HB-1786. HB-1787 starts `2.13 ÖĞRETMENLİK UYGULAMASI`.

- HB-1774 — evrak tesliminde usulünce düzenlenmiş zimmet defteri.
- HB-1775 — dosyalama işlemleri Standart Dosya Planına uygun.
- HB-1776 — resmî yazışmalar Belgenet/EBYS doğrultusunda.
- HB-1777 — dilekçe veya bilgi edinme başvurularının işleme alınması ve zamanında cevap.
- HB-1778 — üst makamlardan gelen bilgi edinme başvurularına zamanında cevap.
- HB-1779 — resmî yazışmaların Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmeliğe uygunluğu.
- HB-1780 — gizlilik niteliğindeki yazı/belgelerde gizlilik usulleri.
- HB-1781 — belge örneğinde `ASLI GİBİDİR`, yetkili, ad-soyad, unvan, tarih, imza.
- HB-1782 — okul müdürünün elektronik kullanıcı grupları/yetkilendirmeleri.
- HB-1783 — bilgi sisteminde hata/usulsüzlüğü önleme-tespit-düzeltme güvenlik önlemleri.
- HB-1784 — MEBBİS modüllerine zamanında/doğru veri ve güncellik.
- HB-1785 — öğretmen sistem başvurularının incelenip onay/red edilmesi.
- HB-1786 — onaylanan başvuruların üç nüsha çıktısı: öğretmen + dosya + İlçe MEM.

## Current official-source locks

### Standart Dosya Planı
Devlet Arşivleri Başkanlığı updated the Saklama Süreli Standart Dosya Planı and put the updated plan into application from 02.01.2024. This is the current archive/file-plan family for HB-1775.
Official sources:
- https://www.devletarsivleri.gov.tr/Sayfalar/Sayfa.aspx?icerik=726&h=Saklama-Sureli-Standart-Dosya-Plani
- https://www.devletarsivleri.gov.tr/varliklar/dosyalar/mevzuat/Saklama_Sureli_Standart_Dosya_Plani.pdf

HB-1775 is a strong exact candidate but is WITHHELD in Phase 1 until canonical ARTICLE_VERIFIED dedupe/row-ledger confirmation.

### Resmî yazışma regime
Current authority family is `Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik`, Cumhurbaşkanı Kararı 2646, RG 10.06.2020/31151, effective 01.07.2020. Master title spelling in HB-1779 is normalized from old/singular `Yazışmada` to current `Yazışmalarda`; authority identifier wins over title typo.

HB-1781 has a near word-for-word semantic match in current Md29/2 (`ASLI GİBİDİR` + authorized official + name/surname/title/date/signature). Promotion remains WITHHELD until exact official RG clause text is locked in the canonical ledger rather than relying on a secondary consolidation.

HB-1776 must not be modelled as `Belgenet` brand lock. Legal executable rule is electronic document-management / official-correspondence compliance; provider/product name is configuration metadata.

HB-1774 cannot be treated as a universal physical-zimmet default. Current electronic-correspondence regime is electronic-first; physical delivery is a conditional route. An MEB-specific exact rule is required before the parent can be ARTICLE_VERIFIED.

### Information requests / petitions
4982 Bilgi Edinme Hakkı Kanunu Md11 separates deadline paths:
- default access: 15 business days,
- cases requiring another unit/institution opinion or multiple institutions: 30 business days,
- extension reason must be notified in writing before the initial 15-business-day period expires.

Therefore HB-1777/HB-1778 generic `zamanında` cannot be implemented as one constant deadline. Petition (3071) and information-request (4982) routes must be distinct deadline engines. No promotion in Phase 1 until each parent is split/bound exactly.

### Classified documents
HB-1780 current family is not merely an old official-writing confidentiality paragraph. Primary specialized authority is `Gizlilik Dereceli Belgelerde Uygulanacak Usul ve Esaslar Hakkında Yönetmelik`, Cumhurbaşkanı Kararı 5529, RG 26.04.2022/31821. Exact classification/handling atoms require clause-level lock before promotion.

### Bilişim / MEBBİS
HB-1782..1786 are not safely ARTICLE_VERIFIED from a broad `MEB Bilgi ve Sistem Güvenliği Yönergesi` family label alone.
- HB-1782 requires exact actor/authority for user-group creation and authorization.
- HB-1783 requires exact information-security controls and scope.
- HB-1784 requires module-specific data-owner / timeliness authority; generic MEBBİS existence does not prove every module update duty.
- HB-1785 bundles different application regimes (transfer, exams, lodging, appointment, in-service training); must split by application type.
- HB-1786 three-copy physical-output rule is especially version-sensitive and cannot be inherited globally in digital workflows.

## Support atoms — 130

### V87-A001..A010 — HB-1774 physical delivery / zimmet
A001 electronic-first is distinct from physical-delivery exception; A002 physical route requires trigger; A003 zimmet book is not inferred from delivery; A004 MEB-specific rule required; A005 actor must be identified; A006 document class matters; A007 confidential-delivery route is separate; A008 courier/hand-delivery evidence is not automatically a `defter`; A009 legacy handbook practice cannot become national mandatory rule; A010 parent WITHHELD.

### V87-A011..A020 — HB-1775 file plan
A011 current SDP version is dated; A012 effective date 02.01.2024; A013 retention-period plan and file classification are related but distinct; A014 plan code is versioned; A015 administrative control is separate from filing action; A016 archive transfer is separate from initial filing; A017 institution-specific additions cannot override national hierarchy; A018 historical file code remains snapshot; A019 exact row dedupe before promotion; A020 strong candidate WITHHELD.

### V87-A021..A030 — HB-1776 EBYS
A021 electronic correspondence is authority concept; A022 Belgenet is product/configuration; A023 electronic signature rules are separate; A024 physical fallback separate; A025 KEP/electronic transmission channel separate; A026 document registration separate; A027 verification metadata separate; A028 product migration must not alter legal rule id; A029 school applicability requires official public-administration scope; A030 parent WITHHELD.

### V87-A031..A042 — HB-1777 petition/information
A031 petition and information request are distinct statutes; A032 4982 default 15 business days; A033 4982 conditional 30 business days; A034 extension notification before initial period ends; A035 deadline unit is business day; A036 route trigger must be stored; A037 transfer/referral handling separate; A038 applicant notification is evidence; A039 3071 deadline requires its own exact lock; A040 generic `zamanında` cannot be one constant; A041 combined parent requires atomization; A042 parent WITHHELD.

### V87-A043..A050 — HB-1778 superior-authority information requests
A043 incoming superior-authority writing is not necessarily a direct 4982 application; A044 source application deadline and inter-agency response deadline may differ; A045 covering-letter deadline cannot be inferred; A046 15/30 engine applies only when statutory conditions fit; A047 dispatch proof required; A048 receipt date required; A049 legal clock trigger must be explicit; A050 parent WITHHELD.

### V87-A051..A062 — HB-1779 official correspondence
A051 current title plural `Yazışmalarda`; A052 identifier 2646; A053 RG 31151; A054 effective 01.07.2020; A055 e-signature branch; A056 physical branch; A057 metadata/form rules separate; A058 distribution/addressee separate; A059 copy certification separate; A060 confidentiality has specialist overlay; A061 title typo is normalization not authority change; A062 parent is strong candidate but dedupe-first WITHHELD.

### V87-A063..A076 — HB-1780 confidentiality
A063 specialized authority 5529; A064 RG 31821; A065 classification level is data field; A066 classification authority is actor-bound; A067 handling depends on level; A068 transmission route depends on level; A069 access authorization separate; A070 reproduction separate; A071 storage separate; A072 destruction/return separate; A073 declassification/change separate; A074 2646 generic correspondence is not sufficient alone; A075 sensitive-document workflow requires least-privilege controls; A076 parent WITHHELD pending clause lock.

### V87-A077..A090 — HB-1781 certified copies
A077 `ASLI GİBİDİR` phrase is exactness-sensitive; A078 authorized official required; A079 name required; A080 surname required; A081 title required; A082 date required; A083 signature required; A084 physical-copy condition matters; A085 electronic-copy verification route is distinct; A086 original-equivalent legal effect is separate; A087 requester/output context matters; A088 old copy-certification custom cannot override current Md29; A089 strong exact candidate but official-clause lock/dedupe required; A090 parent WITHHELD Phase1.

### V87-A091..A100 — HB-1782 authorization
A091 user group and individual role distinct; A092 creator actor must be exact; A093 school principal authority cannot be presumed for every system; A094 least privilege; A095 role change requires revocation/update; A096 account lifecycle separate; A097 audit log separate; A098 module owner may impose special rules; A099 generic security directive family is not clause proof; A100 parent WITHHELD.

### V87-A101..A110 — HB-1783 information security
A101 prevention control; A102 detection control; A103 correction/remediation control; A104 incident logging; A105 access security; A106 integrity; A107 availability; A108 auditability; A109 control owner/scope required; A110 parent WITHHELD pending exact MEB current clause.

### V87-A111..A118 — HB-1784 MEBBİS data quality
A111 timeliness and accuracy distinct; A112 update obligation module-specific; A113 responsible actor module-specific; A114 source-of-truth system matters; A115 stale-data detection separate; A116 evidence timestamp separate; A117 generic MEBBİS label is insufficient; A118 parent WITHHELD.

### V87-A119..A124 — HB-1785 teacher applications
A119 transfer application has separate authority; A120 exam application separate; A121 lodging separate; A122 appointment separate; A123 in-service training separate; A124 mixed parent cannot receive one article and is WITHHELD.

### V87-A125..A130 — HB-1786 three-copy output
A125 three-copy count is version-sensitive; A126 physical output cannot be presumed in digital application; A127 teacher copy separate; A128 personnel-file copy separate; A129 district-MEM dispatch copy separate; A130 no global current exact proof, parent WITHHELD.

## Phase 1 guards added
- PHYSICAL_ZIMMET_IS_NOT_GLOBAL_DEFAULT_IN_EBYS_REGIME
- STANDARD_FILE_PLAN_VERSION_IS_EFFECTIVE_DATE_BOUND
- BELGENET_PRODUCT_NAME_IS_NOT_THE_LEGAL_RULE
- INFORMATION_REQUEST_TIMELY_IS_15_OR_CONDITIONAL_30_BUSINESS_DAYS
- PETITION_AND_INFORMATION_REQUEST_DEADLINES_MUST_BE_SEPARATE
- SUPERIOR_AUTHORITY_COVER_LETTER_DEADLINE_IS_NOT_INFERRED_FROM_4982
- CURRENT_OFFICIAL_WRITING_AUTHORITY_USES_YAZISMALARDA_TITLE
- SOURCE_TITLE_TYPO_DOES_NOT_CHANGE_AUTHORITY_IF_IDENTIFIER_IS_LOCKED
- CLASSIFIED_DOCUMENT_RULE_USES_SPECIALIZED_5529_OVERLAY
- ASLI_GIBIDIR_REQUIRES_EXACT_CURRENT_MD29_ROUTE
- GENERIC_MEBBIS_EXISTENCE_DOES_NOT_PROVE_MODULE_UPDATE_DUTY
- MIXED_TEACHER_APPLICATION_PARENT_REQUIRES_SUBTYPE_SPLIT
- THREE_COPY_OUTPUT_IS_NOT_A_GLOBAL_DIGITAL_WORKFLOW_RULE

## Phase 2 priority
1. Lock official RG clause text for 2646 Md29 and determine HB-1781 exact promotion/dedupe status.
2. Lock 3071 petition response deadline/article and split HB-1777.
3. Resolve 5529 exact handling provisions for HB-1780.
4. Audit canonical historical ARTICLE_VERIFIED ledger for HB-1774..1786 before any promotion/rollback.
5. Resolve current MEB Information and System Security directive/provisions for HB-1782/1783.
6. Split HB-1785 application types; investigate whether HB-1786 three-copy rule remains in any current special process.
7. Continue HB-1787+ teacher-practice boundary only after the Phase1 exact audit ledger is stabilized.
