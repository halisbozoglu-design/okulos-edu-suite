# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-09-02
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir. 22.10.2024 Açık Öğretim Kurumları Yönetmeliği eski ayrı AÖO/AÖL/MAÖL yönetmeliklerinin current-authority rolünü kaldırmıştır.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact: **1.762**
- Atom havuzu: **21.685**
- Son batch: **V83**
- Sonraki batch: **V84**

## V83 — 410 atom
- Integrity: `docs/legal-student-operations-integrity-v83.md` — `c9f2f99c7de7d6df799c139aa0e81d2c3f3500e2`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v83.md` — `2a13d68a2ec801ca3129fb7250042e8208d8f1c6`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v83.md` — `dca451640d1826ce7b33a017ffde7e1dcd5356eb`
- Progress: `docs/legal-verification-progress-v83-delta.json` — `abb8b48e2f5066ad1c6b448de75a37b640effa5d`
- Support atoms: **410**, pool **21.275 -> 21.685**.
- ARTICLE_VERIFIED: **467 -> 467**, delta **0**.

### V83 findings
- Exact canonical master ID/text was recovered for HB-1735..HB-1748 from File Library artifacts.
- HB-1735..1737 map text-exact to current OÖKY Md32/1-3 class presidency family; existing ALL scope is too broad, so promotion is withheld until HS/secondary scope publish.
- HB-1738..1741 map text-exact to OÖKY Md33/1-2 student-duty family. HB-1740 also has an OÖİKY candidate, but common semantic equivalence must be independently proven before COMMON publication.
- HB-1742/HB-1743 have exact guardian/custody parents in OÖKY Md34/1,5 and OÖİKY Md17/1,5. This proves multiple school families, not universal ALL.
- HB-1744/HB-1746 map to OÖKY Md35; secondary-specific late-arrival model.
- HB-1745 mixes statutory five-late-arrivals rule with a parenthetical e-Okul automation assertion not found in the regulation; split required.
- HB-1747/HB-1748 map to OÖKY Md36/2-a,b. OÖİKY uses a different attendance actor model, so ALL cannot survive.
- No safe duplicate rollback found for HB-1735..1748 in the searched verified batches.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- CLASS_PRESIDENCY_OOKY_MD32_IS_NOT_ALL.
- STUDENT_DUTY_OOKY_MD33_IS_NOT_ALL.
- GUARDIAN_RULE_CAN_SHARE_MULTIPLE_SCHOOL_FAMILIES_WITHOUT_BECOMING_GLOBAL_ALL.
- EOKUL_AUTOMATION_ASSERTION_REQUIRES_SYSTEM_SOURCE_NOT_JUST_REGULATION.
- PRIMARY_MIDDLE_ATTENDANCE_ACTOR_MODEL_DIFFERS_FROM_SECONDARY.
- LATE_ARRIVAL_THRESHOLD_AND_CONVERSION_RULE_ARE_SCHOOL_TYPE_SPECIFIC.

## V84 priority — 300+ atoms
1. Continue exact master extraction from HB-1749+.
2. Audit attendance notification thresholds, excuse-document deadlines, maximum absence limits, relationship termination and MESEM theoretical-course attendance against current official OÖKY/RG chain.
3. Stage school-family scope children for HB-1735..1748; denominator unchanged until Super Admin publish.
4. Search old ARTICLE batches for any nearby ALL rows already counted with only one school-type parent; rollback once only if found.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V84** başlat; minimum **300 atom** hedefle.