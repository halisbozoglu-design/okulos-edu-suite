# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V88 PHASE 1 COMPLETE / PHASE 2 NEXT
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED yalnız exact master claim + güncel/uygulanabilir resmî otorite + exact article/paragraph + actor/action/scope + row-ledger/dedupe ile değişir. Kaynaklar: `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri, `resmigazete.gov.tr`; arşiv/dosya planında Devlet Arşivleri Başkanlığı. Current RG chain stale consolidation/handbook üstündedir. Broad `ALL` metadata school/program/system-specific hükümleri miras alamaz. Thematic/adjacent hüküm exact proof değildir. Rollback yalnız row-level material mismatch kanıtlandığında ve bir kez yapılır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **460 / 2.229 = %20,6371**
- Kalan exact: **1.769**
- Kapanmış support-atom pool: **23.105**
- Son kapanmış batch: **V87**
- Aktif batch: **V88**
- V88 Phase 1 active support atoms: **160**
- Migration: **0**
- Lovable: **0**

## V86 lock
V86 300 atomla kapandı. HB-1771/1772/1773 eski `ALL + OÖİKY Md5/A` yanlış otorite eşleşmeleri birer kez rollback edildi; ARTICLE_VERIFIED 463 -> 460.
MTAL 2026-2027 resolver: 12 -> TTKB 2023-40; 10-11 -> TTKB 2024-41; hazırlık/9 -> TTKB 2026-62; framework authority ayrıca versioned ve `latest decision wins` yasak.

## V87 CLOSED — HB-1774..HB-1786
Canonical: `docs/legal-article-verified-focused-deepening-batch-v87-phase1.md`, `docs/legal-article-verified-focused-deepening-batch-v87-phase2.md`, `docs/legal-article-verified-batch-v87.md`, `docs/legal-verification-progress-v87-delta.json`.
V87 total **300** atom; ARTICLE_VERIFIED delta **0**, rollback **0**; closed pool **23.105**.

V87 locks: current SSDP 02.01.2024; Belgenet product not authority; official correspondence CB 2646; Art29/2 conditional ASLI GİBİDİR; Art33 document 5 business days / information-opinion 15 business days; 3071 Art7 petition 30 days; 4982 Art11 15/conditional 30 business days; classified-document authority CB 5529; generic physical zimmet and three-copy output withheld; MEBBİS/module names alone do not prove actor duties; row-level ledger required before promotion/rollback.

## V88 Phase 1 — HB-1787..HB-1794 Öğretmenlik Uygulaması
Canonical:
- `docs/legal-article-verified-focused-deepening-batch-v88-phase1.md`
- `docs/legal-verification-progress-v88-phase1.json`

Accounting: **160 active support atoms**, promotions **0**, rollbacks **0**, ARTICLE_VERIFIED **460**, closed pool remains **23.105** until V88 closes.

### Exact boundary
- HB-1787: application-school coordinator appointed.
- HB-1788: application teachers selected with max 6 students/teacher and max 2 students/lesson, in cooperation with application faculty members.
- HB-1789: application-school coordinator introduces school units and informs candidates about activities.
- HB-1790: meeting with application teachers and candidates; duties/responsibilities notified.
- HB-1791: candidate application activities planned jointly with application faculty member and application teacher.
- HB-1792: applications monitored/evaluated/guided and necessary measures taken.
- HB-1793: application teacher enters work in system, evaluates, delivers results to school coordinator.
- HB-1794: candidate attendance/daily schedule/curriculum compliance + disciplinary notification to faculty/higher school.
- HB-1795 begins `2.14 DENETİM, İZLEME VE DEĞERLENDİRME`.

### Current authority-family lock
Current 2026 text of `Millî Eğitim Bakanlığı Yönetici ve Öğretmenlerinin Ders ve Ek Ders Saatlerine İlişkin Karar` Md.28 was recovered from canonical project legal-source artifacts. Md.28 explicitly points to the MEB–YÖK coordination/cooperation protocol and teacher-practice directive.

- Md28/1 establishes teacher-practice assignment authority family.
- Md28/2 explicitly recognizes implementation + Uygulama Öğrencisi Değerlendirme Sistemi entry and communication/coordination/guidance/consultancy duties; weekly extra-course parameters: MEM application coordinator 4, application-school principal 2, application-school coordinator 2 hours.
- Md28/3 governs application-teacher extra-course hours and aggregate weekly 10-hour cap.
- Md28/4: separate MEM coordinator per university; in participating schools one of the deputy principals is appointed application-school coordinator; schools and assigned administrator/teacher counts are redetermined each academic year by province/district/school/branch under the directive.

### V88 Phase 1 legal decisions
1. **HB-1787 STRONG CANDIDATE / WITHHELD.** Md28/4 strongly supports coordinator appointment and adds the exact actor qualification `müdür yardımcılarından biri`; strict promotion deferred until live-current official source + row-ledger/dedupe lock.
2. **HB-1788 WITHHELD.** Numeric 6/2 limits are not proven by Md28; exact current directive clause required.
3. **HB-1789 WITHHELD.** Generic guidance does not prove school-unit orientation + activities information event.
4. **HB-1790 WITHHELD.** Generic communication/coordination does not prove a mandated meeting + duty notification.
5. **HB-1791 WITHHELD.** Exact joint-planning actor/action clause required.
6. **HB-1792 WITHHELD.** Compound action; monitoring/evaluation/guidance/measure children need actor binding.
7. **HB-1793 WITHHELD / SPLIT.** System entry, evaluation and result delivery are distinct children; Md28/2 supports system/evaluation family but not entire compound parent.
8. **HB-1794 WITHHELD / SPLIT.** Attendance, daily schedule, teaching-program compliance and disciplinary notification require separate exact clauses.
9. Current Md28 is an assignment/payment/coordination authority; it does **not** replace the operational directive.
10. Teacher-practice rules are conditional on the institution actually being a participating application school for the relevant academic year; legacy `ALL` mappings cannot survive exact review.

### V88 guards
- TEACHER_PRACTICE_RULE_REQUIRES_APPLICATION_SCHOOL_CONDITION
- APPLICATION_SCHOOL_COORDINATOR_ROLE_REQUIRES_DEPUTY_PRINCIPAL
- TEACHER_PRACTICE_ASSIGNMENTS_ARE_ACADEMIC_YEAR_VERSIONED
- EXTRA_COURSE_MD28_DOES_NOT_REPLACE_OPERATIONAL_DIRECTIVE
- GENERIC_1739_FAMILY_DOES_NOT_VERIFY_TEACHER_PRACTICE_RULE
- LEGACY_OGRETMEN_ADAYI_TERM_REQUIRES_CURRENT_UYGULAMA_OGRENCISI_NORMALIZATION
- SYSTEM_ENTRY_EVALUATION_AND_RESULT_DELIVERY_ARE_DISTINCT_ACTIONS
- COMMUNICATION_AUTHORITY_DOES_NOT_PROVE_MANDATED_MEETING
- PAYMENT_AUTHORITY_DOES_NOT_PROVE_OPERATIONAL_EVENT
- APPLICATION_SCHOOL_STATUS_IS_YEAR_BOUND
- CURRENT_TEXT_LOCKED_IS_NOT_LIVE_OFFICIAL_SOURCE_LOCK

## V88 Phase 2 priority
1. Lock current teacher-practice directive from official MEB/RG source with exact version/date.
2. Resolve HB-1788 `6 / 2` limits.
3. Resolve HB-1789 orientation and HB-1790 meeting/duty-notification clauses.
4. Resolve HB-1791 joint planning.
5. Atomize/resolve HB-1792.
6. Atomize HB-1793 system entry/evaluation/result delivery.
7. Atomize HB-1794 attendance/schedule/program/discipline-notification routes.
8. Audit historical ARTICLE_VERIFIED ledger for HB-1787..1794 before any promotion or rollback.
9. Bring V88 to a meaningful large-batch closure (target >=300 active support atoms) without inflating ARTICLE_VERIFIED.
10. Only after teacher-practice closure continue HB-1795+ inspection/monitoring family.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** tenant requirement remains active; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` dediğinde soru sormadan **V88 Phase 2 / HB-1787..HB-1794 current directive exact-clause lock** ile devam et. Work mode all mevzuat verification tamamlandıktan sonra işleyiş/uygulama düzenleme aşamasında kullanılacak. Migration **0**, Lovable **0**.
