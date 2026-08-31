# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-31
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. Annual talent-exam guide yalnız ilgili yıl/current-program child/snapshot için kullanılabilir.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **466 / 2.229 = %20,9062**
- Kalan exact: **1.763**
- Atom havuzu: **20.455**
- Son batch: **V80**
- Sonraki batch: **V81**

## V80 — 410 atom
- Integrity: `docs/legal-me-sem-denklik-talent-transfer-integrity-v80.md` — `33403f2a918dd9bceb54835e7fe811b36556a20f`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v80.md` — `af7cbdb8c04f7913d657f685018b0e86570f1219`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v80.md` — `047801e8779c5934c25efab191df439a8e0ff923`
- Progress: `docs/legal-verification-progress-v80-delta.json` — `be136236b620c9b8d5330611645860d8ff031f66`
- Support atoms: **410**, pool **20.045 -> 20.455**.
- ARTICLE_VERIFIED: **468 -> 466**, delta **-2**.

### V80 findings
- `HB-1711`: current OÖKY Md26/5 still supports low-count MESEM routing, but master threshold wording + current `AOL|HS` metadata are not exact MESEM scope. Withheld.
- `HB-1712`: foreign-study equivalency -> appropriate programme/class family; exact current Denklik provision lock pending.
- `HB-1713/HB-1714`: legacy Anadolu meslek -> Anadolu teknik transition workflows depended on OÖKY Md30. Current official MEB consolidated text marks Md30 repealed by RG 08.09.2023/32303. Retire/historical snapshot; no current promotion.
- `HB-1715`: legacy `Anadolu sağlık meslek lisesi` naming/fixed-34 statement requires current health-services programme rule.
- `HB-1716` ROLLBACK -1: old Batch02 used OÖİKY Md11/ALL. Current content maps to OÖKY Md31/4 but only vocational/mesleki field-branch scope; current workflow metadata still too broad.
- `HB-1717`: OÖKY Md31/6 exact contract + e-Mesem field/branch entry, but current workflow metadata is ALL/special-ed and wrong; scope correction before promotion.
- `HB-1718` ROLLBACK -1: old Batch02 used OÖİKY Md11/ALL; legacy monthly timing conflicts with current talent-school September/October model.
- `HB-1719`: talent-score admissions are current but admission/register details are programme/year scoped.
- `HB-1720`: current MEB talent guide supports open-contingent prep/9/10/11 transfers by talent exam in September/October last weeks and school-directorate applications; annual/current-program child.
- `HB-1721`: 18+ MESEM registration is an eligibility-state paraphrase; current OÖKY Md21/1 actually sets 14 minimum and age exceptions. Rewrite to normative model.
- `HB-1722`: master-specific employment-entry health report is not identical to OÖKY Md21/3 conditional health/health-board report; 6331/3308 source/object split required.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- REPEALED_ARTICLE_CANNOT_SUPPORT_CURRENT_WORKFLOW.
- HISTORICAL_TRANSITION_FORMULA_MUST_NOT_BE_GRANDFATHERED.
- TEXT_EXACT_BUT_SCOPE_METADATA_WRONG_REQUIRES_WITHHOLD_OR_ROLLBACK.
- TALENT_TRANSFER_MONTH_WINDOW_IS_ANNUAL/CURRENT_MODEL_FIELD.
- ELIGIBILITY_STATE_IS_NOT_IDENTICAL_TO_NORMATIVE_REGISTRATION_DUTY.
- HEALTH_SUITABILITY_REPORT_AND_EMPLOYMENT_ENTRY_REPORT_ARE_DISTINCT_OBJECTS.

## V81 priority — 300+ atoms
1. Continue `HB-1723+` exact master extraction after MESEM health-registration boundary.
2. Audit registration completion, contract/insurance, independent MESEM age/status, transfer and workplace agreement rules against current OÖKY/3308 chain.
3. Resolve HB-1712 with current official Denklik Yönetmeliği exact provision.
4. Stage correct MESEM/MTAL-specific metadata children for HB-1711/HB-1716/HB-1717; denominator unchanged until Super Admin publish.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V81** başlat; minimum **300 atom** hedefle.
