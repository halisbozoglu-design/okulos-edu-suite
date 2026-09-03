# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V88 CLOSED / V89 NEXT
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
- Kapanmış support-atom pool: **23.405**
- Son kapanmış batch: **V88**
- Sıradaki batch: **V89**
- Migration: **0**
- Lovable: **0**

## V86 lock
V86 300 atomla kapandı. HB-1771/1772/1773 eski `ALL + OÖİKY Md5/A` yanlış otorite eşleşmeleri birer kez rollback edildi; ARTICLE_VERIFIED 463 -> 460. MTAL 2026-2027 resolver: 12 -> TTKB 2023-40; 10-11 -> TTKB 2024-41; hazırlık/9 -> TTKB 2026-62; framework authority versioned ve `latest decision wins` yasak.

## V87 lock
V87 HB-1774..1786'yı 300 atomla kapattı; delta 0. Current SSDP 02.01.2024, official-correspondence CB2646, petition 3071 Art7, information-access 4982 Art11, classified documents CB5529, conditional certified-copy Art29/2, product-vs-authority and row-ledger guards locked. Closed pool V87 sonunda 23.105.

## V88 CLOSED — HB-1787..HB-1794 Öğretmenlik Uygulaması
Canonical:
- `docs/legal-article-verified-focused-deepening-batch-v88-phase1.md` — 160 atoms
- `docs/legal-verification-progress-v88-phase1.json`
- `docs/legal-article-verified-focused-deepening-batch-v88-phase2.md` — 140 atoms
- `docs/legal-article-verified-batch-v88.md`
- `docs/legal-verification-progress-v88-delta.json`

V88 total **300** support atoms. Promotions **0**, rollbacks **0**. ARTICLE_VERIFIED **460**. Closed pool **23.105 -> 23.405**.

### Exact boundary
- HB-1787: uygulama okulu koordinatörü belirlenmesi.
- HB-1788: uygulama öğretmeni başına max 6, ders başına max 2 öğrenci + uygulama öğretim elemanıyla iş birliği.
- HB-1789: okul birimlerinin tanıtılması + etkinlik bilgisi.
- HB-1790: uygulama öğretmenleri/adaylarla toplantı + görev/sorumluluk bildirimi.
- HB-1791: uygulama öğretim elemanı + uygulama öğretmeniyle ortak etkinlik planlama.
- HB-1792: izleme + değerlendirme + rehberlik + önlem.
- HB-1793: sisteme işleme + değerlendirme + sonucu okul koordinatörüne teslim.
- HB-1794: devam + günlük ders programı + öğretim programı uyumu + disiplinsizlikte fakülte/yüksekokul bildirimi.

### V88 current-text / exactness locks
1. Current 2026 `Millî Eğitim Bakanlığı Yönetici ve Öğretmenlerinin Ders ve Ek Ders Saatlerine İlişkin Karar` Md28 teacher-practice authority family is locked from canonical legal-source artifacts.
2. Md28/4: each university gets a separate MEM application coordinator; participating application schools appoint **one of the deputy principals** as application-school coordinator; school/administrator/teacher counts are re-determined each academic year by province/district/school/branch under the directive.
3. Md28/2 recognizes implementation + Uygulama Öğrencisi Değerlendirme Sistemi entry and communication/coordination/guidance/consultancy duties; Md28/3 is extra-course/payment layer.
4. Md28 does not replace the detailed operational directive.
5. HB-1787 is a strong candidate but remains uncounted until strict live-current official-source + row-ledger/dedupe lock.
6. HB-1788..1794 require exact current directive clauses; no semantic promotion.
7. HB-1792/1793/1794 are compound and require child-action decomposition.
8. Targeted historical ARTICLE_VERIFIED searches recovered no direct row-level ledger entry for HB-1787..1794; no inferred rollback.
9. Derivative mappings in this range contain unsafe generic/wrong families (`GENEL_YONETIM`, `REHBERLIK`, `SOSYAL_ETKINLIK`, broad `ALL`); these are not legal evidence and cannot propagate.
10. Teacher-practice workflow requires application-school + university/arrangement + academic-year context; application status is snapshot/version bound.

### V88 guards
- TEACHER_PRACTICE_RULE_REQUIRES_APPLICATION_SCHOOL_CONDITION
- APPLICATION_SCHOOL_COORDINATOR_ROLE_REQUIRES_DEPUTY_PRINCIPAL
- TEACHER_PRACTICE_ASSIGNMENTS_ARE_ACADEMIC_YEAR_VERSIONED
- EXTRA_COURSE_MD28_DOES_NOT_REPLACE_OPERATIONAL_DIRECTIVE
- GENERIC_1739_FAMILY_DOES_NOT_VERIFY_TEACHER_PRACTICE_RULE
- DERIVATIVE_LEGAL_FAMILY_IS_NOT_ARTICLE_VERIFIED_EVIDENCE
- APPLICATION_STUDENT_IS_NOT_SCHOOL_ENROLLED_STUDENT_BY_DEFAULT
- SYSTEM_ENTRY_EVALUATION_AND_RESULT_DELIVERY_ARE_DISTINCT_ACTIONS
- CURRENT_DIRECTIVE_REQUIRED_BEFORE_ENFORCEMENT_AUTOMATION
- NUMERIC_SIMILARITY_IS_NOT_LEGAL_PROOF
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_ROLLBACK_OR_PROMOTION

## Open exact-source recovery queue
HB-1787..1794 stay on the current teacher-practice directive recovery queue. They may be promoted later only after official current directive/version + exact clause + actor/action/scope + row-ledger/dedupe. V88 accounting stays closed.

## V89 boundary — 2.14 DENETİM, İZLEME VE DEĞERLENDİRME
Exact master boundary recovered as **HB-1795..HB-1802 (8 rows)**. HB-1803 starts `2.15 ALAN/DAL/LABORATUVAR ŞEFLERİNİN ÇALIŞMALARI`.

- HB-1795: okulun teftiş/denetim defteri bulunması.
- HB-1796: denetim raporlarıyla ilgili yazıların özel dosyada saklanması.
- HB-1797: denetim raporu/tebliğindeki sorunlar için `Gelişim Planı` hazırlanması ve uygulanması.
- HB-1798: okul müdürünün her eğitim-öğretim döneminde öğretmenlerin dersini en az bir kez izlemesi ve kaydetmesi.
- HB-1799: okul müdürünün tüm personel çalışmalarını denetlemesi ve eksikliklerin giderilmesini izlemesi.
- HB-1800: brifing dosyasının hazırlanması ve her yıl güncellenmesi.
- HB-1801: stratejik plan doğrultusunda İzleme ve Değerlendirme Ekipleri kurulması ve sistem oluşturulması.
- HB-1802: okul müdürünün elektronik ortamda yürütülen iş/işlemleri takip ve denetlemesi.

### V89 preliminary integrity findings
- The handbook itself is a self-evaluation/checklist source; each item must be separately proven as a current binding duty.
- HB-1798 derivative metadata currently carries only generic `1739 + school regulation + annual circular` style authority and therefore is not exact proof of the unusually specific `each semester at least once + record` requirement.
- HB-1800 derivative metadata points broadly to MEB 2024-2028 Strategic Plan + inspection guides; that does not yet prove a universal annual briefing-file obligation.
- HB-1801 strategic-plan linkage is plausible but an exact requirement to establish an `İzleme ve Değerlendirme Ekibi` must be verified against current institutional strategic-planning authority; plan-level thematic relevance alone is insufficient.
- HB-1795/1796/1797 may depend on inspection/denetim process authority and record-retention rules rather than a universal school management provision.
- HB-1802 generic electronic-process supervision must be tied to exact school-principal actor authority and must not become an authority merely because a module exists.

## V89 priority
1. Lock current MEB inspection/education-inspector regulation and 2026 official inspection guides applicable to school/institution management.
2. Test HB-1795 `teftiş/denetim defteri` for current universal requirement vs legacy practice.
3. Test HB-1796 retention/file requirement against inspection + archive/SSDP authority.
4. Resolve HB-1797 `Gelişim Planı` trigger, actor and required output.
5. Resolve HB-1798 exact `each semester >=1 lesson observation + record` wording; no generic principal-duty inference.
6. Resolve HB-1799 staff-supervision/follow-up actor/action scope.
7. Resolve HB-1800 annual briefing-file requirement; do not convert institutional custom into statute.
8. Resolve HB-1801 strategic monitoring-team requirement and distinguish plan governance from statute.
9. Resolve HB-1802 electronic-process supervision.
10. Audit historical ARTICLE_VERIFIED ledger row-by-row and build V89 as a large >=300 support-atom batch without count inflation.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** tenant requirement remains active; ARTICLE_VERIFIED sayacına eklenmez.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` dediğinde soru sormadan **V89 / HB-1795..HB-1802 DENETİM, İZLEME VE DEĞERLENDİRME** ile devam et. Work mode tüm mevzuat doğrulaması tamamlandıktan sonra işleyiş/uygulama düzenleme aşamasında kullanılacak. Migration **0**, Lovable **0**.
