# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V90 CLOSED / V91 NEXT
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED yalnız exact master claim + güncel/uygulanabilir resmî otorite + exact article/paragraph/guide clause + actor/action/scope + row-ledger/dedupe ile değişir. Official sources: `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` units, `resmigazete.gov.tr`; archive/file-plan rules additionally use Devlet Arşivleri Başkanlığı. Current RG/current directive chain stale consolidation/handbook üstündedir. Handbook/checklist provenance is not automatically legal authority. Rollback only once after row-level material mismatch + historical count proof.

## Güncel kesin durum
- Master workflow: **2,229**
- ARTICLE_VERIFIED: **460 / 2,229 = 20.6371%**
- Remaining exact: **1,769**
- Closed support-atom pool: **24,005**
- Last closed batch: **V90**
- Next batch: **V91**
- Migration: **0**
- Lovable: **0**

## Locked carry-forward
### V86
HB-1771/1772/1773 broad `ALL + OÖİKY Md5/A` incorrect authority mappings rolled back once; 463 -> 460. MTAL 2026-2027 resolver: grade12 -> TTKB 2023-40; grades10-11 -> 2024-41; prep/grade9 -> 2026-62; framework authority separately versioned; `latest decision wins` prohibited.

### V87
HB-1774..1786 closed with 300 atoms. Current SSDP 02.01.2024, official-correspondence CB2646, 3071 Art7, 4982 Art11, classified-documents CB5529, conditional certified-copy Art29/2 and product-vs-authority guards locked.

### V88
HB-1787..1794 Öğretmenlik Uygulaması closed with 300 atoms. Current Md28 teacher-practice authority family locked; detailed operational rows remain on current-directive recovery queue. Application-school status and assignments are academic-year/version bound.

### V89
HB-1795..1802 Denetim/İzleme closed with 300 atoms. Current teacher-monitoring minimum is once per school year, not each term; Gelişim Planı report-receipt -> one month -> relevant MEM lifecycle locked; teftiş defteri/brifing file not treated as current universal statutory duties without exact authority.

## V90 CLOSED — HB-1803..HB-1825 Alan/Dal/Laboratuvar Şeflerinin Çalışmaları
Canonical:
- `docs/legal-article-verified-focused-deepening-batch-v90-phase1.md` — 160 atoms
- `docs/legal-article-verified-focused-deepening-batch-v90-phase2.md` — 140 atoms
- `docs/legal-article-verified-batch-v90.md`
- `docs/legal-verification-progress-v90-delta.json`

V90 total **300** support atoms. Promotions **0**, rollbacks **0**. ARTICLE_VERIFIED remains **460**. Closed pool **23,705 -> 24,005**.

### Exact boundary
Canonical File Library master confirms section 2.15 is exactly **HB-1803..HB-1825 (23 rows)**. HB-1826 starts `2.16 OKUL SAĞLIĞI`.

### V90 current-rule locks
1. Current OÖKY 84/84A/84B/84C family decides whether a chiefship legally exists, who may be appointed, appointment lifecycle and ending/cancellation conditions.
2. Appointment tasks must be generated only after a `chiefship_required` applicability decision. `vacancy=true` alone never means assignment is legally due.
3. Current chain includes RG **22.02.2025 / 32821** hard exception: where a school simultaneously uses another school's workshop/laboratory belonging to the same area/branch, no chief is appointed for that workshop/lab; an existing appointment is cancelled by governorate.
4. Therefore **HB-1805 `Boş şefliklere görevlendirme yapılmıştır` is overbroad** and cannot become a blanket automation.
5. HB-1803/1804/1806 remain strong conditional chiefship-creation candidates subject to current 84-family equipment/use/share conditions.
6. Current OÖKY Md85 directly/strongly supports a large portion of HB-1807..HB-1824: maintenance/readiness, movable/e-Taşınır operations, cleanliness, practical-operation guidance, machine cards/manuals/warnings, work division, equipment needs, revolving fund, zümre, materials/library, graduate and sector cooperation, applied education, shared equipment and protocol use.
7. Common chief duties, area-chief-only duties and workshop/lab-chief-only duties must be separate role matrices. They cannot be merged into generic `şef` permission inheritance.
8. HB-1808 requires actor normalization: application access or `yetkilendirme yapılan kişi` wording does not itself create legal authority; principal designation / current movable authority must be preserved where required.
9. HB-1810 is dual/multi-authority: OÖKY chief duty + OSH rules + special-needs safeguards. It must split into executable children rather than pretending Md85 alone exhausts OSH law.
10. HB-1814..1820 are area-chief-specific where the current Md85 role structure says so; HB-1821/1822 are workshop/lab-chief-specific.
11. HB-1816 activates only when a legally applicable revolving-fund operation exists.
12. HB-1817 cross-links the zümre engine; it must not create a duplicate parallel zümre legal model.
13. HB-1824 activates only when an active protocol covers shared use.
14. HB-1825 is only partial-exact at parent level: current Md85 has a monthly activity-report duty, but the legacy wording explicitly ties the report to weekly course distribution schedule `planlama bakım ve onarım`; that workload/report identity requires a separate exact authority lock.
15. Targeted repository search found no direct historical ARTICLE_VERIFIED ledger entries for HB-1803..1825; derivative `green/current/conditional` metadata is not counted legal proof, so no inferred rollback.

### V90 guards
- CHIEFSHIP_EXISTENCE_PRECEDES_ASSIGNMENT
- VACANCY_DOES_NOT_IMPLY_ASSIGNMENT_DUE
- 2025_SHARED_WORKSHOP_EXCEPTION_IS_HARD_OVERRIDE
- AREA_CHIEF_ROLE_MATRIX_IS_DISTINCT
- WORKSHOP_LAB_CHIEF_ROLE_MATRIX_IS_DISTINCT
- COMMON_CHIEF_DUTIES_DO_NOT_ERASE_ROLE_SCOPE
- E_TASINIR_ACCESS_IS_NOT_AUTHORITY
- MOVABLE_AUTHORITY_REQUIRES_CURRENT_DESIGNATION_RULE
- REVOLVING_FUND_CHILDREN_REQUIRE_FEATURE_APPLICABILITY
- ACTIVE_PROTOCOL_REQUIRED_FOR_SHARED_USE_TASK
- OSH_SPECIAL_AUTHORITY_REMAINS_SEPARATE
- AREA_CHIEF_ZUMRE_ROLE_CROSSLINKS_BOARD_ENGINE
- MD85_MONTHLY_REPORT_AND_PBO_REPORT_STAY_SEPARATE_UNTIL_EXACT_LOCK
- DERIVATIVE_GREEN_STATUS_IS_NOT_ARTICLE_VERIFIED
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_COUNT_CHANGE

## Open exact-source recovery queue
- HB-1787..1794 current Teacher Practice Directive exact clauses.
- V90 strong direct-text rows under current OÖKY 84/85 await strict live-official consolidated clause/version + row dedupe before any later promotion.
- HB-1825 workload/report identity requires extra-course/workload authority resolution.

## V91 boundary / priority — 2.16 OKUL SAĞLIĞI
HB-1826 begins with legacy claim: `Okulun, bir idareci, bir öğretmen, bir okul aile birliği üyesinden oluşan Okul Sağlığı Yönetim Ekibi vardır. (Rehber öğretmen ekibin doğal üyesidir.)`

V91 actions:
1. Recover exact HB-1826+ master rows and determine full 2.16 boundary.
2. Verify the legacy `Okul Sağlığı Yönetim Ekibi` name, composition and natural-member claim against current MEB + Ministry of Health school-health authority.
3. Distinguish `Beyaz Bayrak`, nutrition/physical activity, hygiene, chronic disease/emergency, environmental health and other program-specific constructs from universal legal duties.
4. Do not inherit old project/protocol team structures after their protocol/version expires.
5. Audit current 2026 school-health circulars/protocols/guides and exact effective dates.
6. Historical ARTICLE_VERIFIED ledger audit before promotion/rollback.
7. Build V91 as a large >=300 support-atom batch; continue into next family if 2.16 is too small.
8. Migration **0**, Lovable **0**.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** remains an active tenant requirement; it does not increment ARTICLE_VERIFIED.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` => immediately execute **V91 / HB-1826+ OKUL SAĞLIĞI**. Work mode remains deferred until all legal verification is complete; then it is used to arrange implementation/operation.