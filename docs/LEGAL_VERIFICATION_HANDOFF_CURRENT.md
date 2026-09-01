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
- Atom havuzu: **21.275**
- Son batch: **V82**
- Sonraki batch: **V83**

## V82 — 410 atom
- Integrity: `docs/legal-student-operations-integrity-v82.md` — `7c75beab93670eb391116a23c28cd4c452250ce9`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v82.md` — `13b7b04910ec20b24c9fe2195b2737d1ad7edbde`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v82.md` — `7da4bbd17ea2b2a574dc5fea96672ec20b441e14`
- Progress: `docs/legal-verification-progress-v82-delta.json` — `570099c2828f79679548931c4ff2a09f99f5ea4e`
- Support atoms: **410**, pool **20.865 -> 21.275**.
- ARTICLE_VERIFIED: **467 -> 467**, delta **0**.

### V82 findings
- HB-1735+ student-operation boundary entered.
- Repository code search did not provide sufficiently reliable exact master ID-title extraction for this boundary; canonical no-guess rule therefore blocked speculative promotions.
- Student representative/class-president roles must be school-type exact; OÖKY/OÖİKY semantics cannot be merged under ALL without a common exact parent.
- Attendance and leave are separate atoms; recipient/timing/notification channel are exactness fields.
- Electronic student documents do not imply wet-signature, print or physical archive requirements unless current provision explicitly requires them.
- Current open-education parent remains the 22.10.2024 Açık Öğretim Kurumları Yönetmeliği; repealed separate regulations are provenance only.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.
- Canonical tenant doc: `docs/tenant-required-social-responsibility-club.md`.

## New guards
- STUDENT_REPRESENTATIVE_ROLE_IS_SCHOOL_TYPE_SPECIFIC.
- ATTENDANCE_AND_LEAVE_ARE_DISTINCT_ATOMS.
- ATTENDANCE_NOTIFICATION_RECIPIENT_AND_TIMING_ARE_EXACTNESS_FIELDS.
- ELECTRONIC_STUDENT_DOCUMENT_DOES_NOT_IMPLY_WET_SIGNATURE.
- OPEN_ED_CURRENT_PARENT_OVERRIDES_REPEALED_SEPARATE_REGULATIONS.
- BROAD_ALL_STUDENT_OPERATION_REQUIRES_COMMON_EXACT_PARENT.

## V83 priority — 300+ atoms
1. Resume exact master extraction at HB-1735+ using canonical master artifacts/File Library when available; never guess ID-title mapping.
2. Lock student representative/class-president, attendance, leave, document and school-type student-operation rows to current OÖKY/OÖİKY provisions.
3. Audit nearby old ARTICLE batches for ALL rows that improperly inherited one school-type regulation.
4. Continue HB-1729..1734 only when exact current parents are proven.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V83** başlat; minimum **300 atom** hedefle.