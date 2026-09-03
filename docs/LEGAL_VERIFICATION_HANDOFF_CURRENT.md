# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-03
Durum: AKTİF — V89 CLOSED / V90 NEXT
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
- Closed support-atom pool: **23,705**
- Last closed batch: **V89**
- Next batch: **V90**
- Migration: **0**
- Lovable: **0**

## Locked carry-forward
### V86
HB-1771/1772/1773 broad `ALL + OÖİKY Md5/A` incorrect authority mappings rolled back once; 463 -> 460. MTAL 2026-2027 resolver: grade12 -> TTKB 2023-40; grades10-11 -> 2024-41; prep/grade9 -> 2026-62; framework authority separately versioned; `latest decision wins` prohibited.

### V87
HB-1774..1786 closed with 300 atoms. Current SSDP 02.01.2024, official-correspondence CB2646, 3071 Art7, 4982 Art11, classified-documents CB5529, conditional certified-copy Art29/2 and product-vs-authority guards locked.

### V88
HB-1787..1794 Öğretmenlik Uygulaması closed with 300 atoms. Current Md28 teacher-practice authority family locked; detailed operational rows remain on current-directive recovery queue. Application-school status and assignments are academic-year/version bound. Closed pool became 23,405.

## V89 CLOSED — HB-1795..HB-1802 Denetim, İzleme ve Değerlendirme
Canonical files:
- `docs/legal-article-verified-focused-deepening-batch-v89-phase1.md` — 150 atoms
- `docs/legal-article-verified-focused-deepening-batch-v89-phase2.md` — 150 atoms
- `docs/legal-article-verified-batch-v89.md`
- `docs/legal-verification-progress-v89-delta.json`

V89 total **300** support atoms. Promotions **0**, rollbacks **0**. ARTICLE_VERIFIED remains **460**. Closed pool **23,405 -> 23,705**.

### Exact V89 boundary
- HB-1795 teftiş/denetim defteri.
- HB-1796 denetim raporu yazılarının özel dosyada saklanması.
- HB-1797 denetim sorunları için Gelişim Planı.
- HB-1798 every education term >=1 teacher lesson observation + record.
- HB-1799 all personnel supervision + deficiency follow-up.
- HB-1800 annual briefing-file update.
- HB-1801 strategic-plan monitoring/evaluation teams.
- HB-1802 generic electronic-process supervision.
- HB-1803 starts `2.15 Alan/Dal/Laboratuvar Şeflerinin Çalışmaları`.

### V89 current-source locks
1. Current official MEB `Öğretmenlerin Sınıf İçi Etkinlikleri ve Öğretim Faaliyetlerinin İzlenmesi, Değerlendirilmesi ve Geliştirilmesine İlişkin Yönerge`: `https://mevzuat.meb.gov.tr/dosyalar/2264.pdf`.
2. Md5/1-b + Md8/1: internal teacher monitoring/evaluation minimum is **once within a school year**, not once every term/semester.
3. Internal evaluator actor composition is contextual: principal alone or principal + zümre president/advisor teacher depending on teacher count/role.
4. Current monitoring/evaluation uses MEBBİS EK-1/EK-2/EK-3 forms/reports; generic paper-record assumptions do not override this.
5. Therefore HB-1798 is a **material stale master mismatch** and remains withheld. No rollback because direct historical ARTICLE_VERIFIED ledger proof was not recovered.
6. Current TKB `Denetim Rehberleri ve Denetim Esasları`: `https://tkb.meb.gov.tr/meb_iys_dosyalar/2024_01/01225115_genelesaslar.pdf`.
7. TKB §5.2.3 exact conditional lifecycle: inspection report reaches institution -> **within one month** development plan based on findings/solution proposals -> send to relevant il/ilçe MEM -> MEM follows implementation.
8. HB-1797 therefore has an exact conditional child but the broad parent remains withheld because it omits trigger/deadline/delivery/follow-up actor.
9. HB-1795 teftiş/denetim defteri has historical/handbook provenance but no current universal exact-duty lock.
10. HB-1796 `special file` is not a current universal retention category; SSDP/EBYS classification rules govern.
11. HB-1800 annual brifing file remains a current handbook checklist expectation, not ARTICLE_VERIFIED without a separate current exact authority.
12. HB-1801 strategic monitoring/evaluation is current, but named-team formation is version-bound to applicable school strategic-plan guide/approved plan and is not inferred from 5018 alone.
13. HB-1802 must split by actual system/module/authority.

### V89 guards
- CURRENT_TEACHER_MONITORING_FREQUENCY_IS_SCHOOL_YEAR_NOT_EACH_TERM
- INTERNAL_EVALUATOR_ACTOR_COMPOSITION_IS_CONTEXT_DEPENDENT
- DEVELOPMENT_PLAN_TRIGGER_IS_REPORT_RECEIPT
- DEVELOPMENT_PLAN_DEADLINE_IS_ONE_MONTH_AFTER_RECEIPT
- DEVELOPMENT_PLAN_IS_SENT_TO_RELEVANT_MEM
- TEFTIS_DEFTERI_HISTORICAL_PROVENANCE_IS_NOT_CURRENT_UNIVERSAL_DUTY
- BRIEFING_FILE_HANDBOOK_CHECKLIST_IS_NOT_AUTOMATIC_LEGAL_AUTHORITY
- SSDP_EBYS_CLASSIFICATION_PREVAILS_OVER_GENERIC_SPECIAL_FILE_LABEL
- STRATEGIC_PLAN_MONITORING_TEAM_IS_VERSION_BOUND
- GENERIC_DIGITAL_OVERSIGHT_MUST_SPLIT_BY_SYSTEM
- MATERIAL_MISMATCH_WITHOUT_LEDGER_PROOF_DOES_NOT_AUTO_ROLLBACK
- ROW_LEVEL_LEDGER_REQUIRED_BEFORE_PROMOTION_OR_ROLLBACK

## V90 boundary — 2.15 Alan/Dal/Laboratuvar Şeflerinin Çalışmaları
Current handbook shows **23 checklist rows** in section 2.15. Provisional sequential mapping is **HB-1803..HB-1825**; HB-1826 begins `2.16 OKUL SAĞLIĞI`. Exact master-ID recovery must confirm before count changes.

Visible 2.15 themes include:
- area/department and workshop/laboratory chief assignments;
- physical space/equipment condition for chiefship formation;
- movable assets, e-Taşınır consumption entries;
- workshop materials/preparation/records;
- occupational safety and special-needs students;
- machine cards/manuals/warning signs;
- annual work division and school-principal approval;
- equipment/donatım needs and proposals;
- revolving-fund production;
- zümre chairmanship/meetings;
- scientific/technological materials;
- graduate/employer and sector collaboration;
- applied-training quality;
- shared equipment responsibility/protocol use;
- monthly planning-maintenance-repair report to school principal.

## V90 priority
1. Confirm exact HB-1803..HB-1825 master sentences and boundary.
2. Bind each row to current OÖKY Md84/B, Md84/C, Md85 and other exact current MTAL/asset/OSH authorities.
3. Detect stale chiefship-count/assignment rules and distinguish field chief vs workshop/lab chief duties.
4. Separate OÖKY exact duties from handbook wording expansions.
5. Audit `e-Taşınır`, revolving fund, occupational-safety and protocol-specific rows against their own authority families.
6. Historical ARTICLE_VERIFIED row-ledger audit before any promotion/rollback.
7. Build V90 as a large >=300 support-atom batch; do not inflate ARTICLE_VERIFIED.
8. Migration **0**, Lovable **0**.

## Tenant requirement
**Sosyal Sorumluluk Kulübü** remains an active tenant requirement; it does not increment ARTICLE_VERIFIED.

## Repo / execution boundary
Only `halisbozoglu-design/okulos-edu-suite`. User `Devam` => immediately execute **V90 / HB-1803..HB-1825 Alan/Dal/Laboratuvar Şeflerinin Çalışmaları**. Work mode is deferred until all legal verification is complete, then used to arrange implementation/operation.