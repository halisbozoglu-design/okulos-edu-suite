# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-31
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. Current RG amendment chain stale consolidated/handbook kaynakların üstündedir.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **466 / 2.229 = %20,9062**
- Kalan exact: **1.763**
- Atom havuzu: **19.635**
- Son batch: **V77**
- Sonraki batch: **V78**

## V77 — 410 atom
- Tenant requirement: `docs/tenant-required-social-responsibility-club.md` — `3ea53d1d369cadf7898d67179e229282d0254ea2`
- Integrity: `docs/legal-student-registration-transfer-integrity-v77.md` — `23e5a1af698a1279dee06b055ff7d065b2f0b452`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v77.md` — `250e71e6557fa4f3ccadcc6290017ed29fdb8c40`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v77.md` — `82a5d9f65dde902bf2c909582548fbf15e7999ca`
- Progress: `docs/legal-verification-progress-v77-delta.json` — `8c37f61765cc13a54df949ea6f9762b20c1b0b86`
- Support atoms: **410**, pool **19.225 -> 19.635**.
- ARTICLE_VERIFIED: **475 -> 466**, delta **-9**.

### V77 Student Registration / Transfer findings
- `HB-1681..HB-1689` old Batch02 entries were all attached to 28.07.2026 OÖİKY Md11 with `ALL` scope although the master sentences predominantly express OÖKY Md38+ secondary-school transfer rules. All nine were rolled back once.
- `HB-1681` has additional substantive mismatch: current 08.09.2023 OÖKY Md38/2 distinguishes central-exam and other-school base/cap quotas and uses max two special-needs students per branch; legacy 34/40/25/35 sentence is not current exact.
- `HB-1682`: e-Okul open-contingent publication has OÖKY Md38/3 parent; re-promotion requires secondary scope publication.
- `HB-1683..HB-1685`: application/forwarding/approval-rejection chain has OÖKY Md38/4-a parent but old source family + ALL metadata invalidate count.
- `HB-1686`: timing exception has OÖKY Md38/5 parent; requires secondary/special-education scope exactness.
- `HB-1687`: malformed master sentence + broad scope requires rewrite.
- `HB-1688`: OÖKY Md38/5 notification/evaluation chain candidate; scope/source correction required.
- `HB-1689`: generic `muafiyet ve sorumluluklar mevzuata uygun` is non-atomic; split required.

## Tenant requirement
- **Sosyal Sorumluluk Kulübü** ayrıca kurulacak ve aktif tenant kulübü olarak tutulacak.
- ARTICLE_VERIFIED sayacına eklenmez; öğrenci-kulüp atama, danışman öğretmen, yıllık çalışma planı, sosyal etkinlik/topluma hizmet ve belge akışlarına bağlanır.

## New guards
- WRONG_SOURCE_BUT_SIMILAR_TEXT_IS_NOT_EXACT.
- SECONDARY_TRANSFER_RULE_CANNOT_REMAIN_ALL.
- CURRENT_QUOTA_NUMBERS_AND_SPECIAL_ED_DISTRIBUTION_ARE_EXACTNESS_FIELDS.
- SOURCE_CORRECTION_REQUIRES_SCOPE_CORRECTION_WHEN_METADATA_IS_BROADER_THAN_PROVISION.
- MALFORMED_MASTER_TEXT_REQUIRES_REWRITE_BEFORE_PROMOTION.
- GENERIC_LEGAL_COMPLIANCE_SENTENCE_IS_NOT_ATOMIC_PROVISION.

## V78 priority — 300+ atoms
1. Continue `HB-1690+` Student Registration/Transfers from exact master text.
2. Resolve area/branch applications, publication lists, talent-exam commissions and school/program applicability using current official source chain.
3. Continue old Batch02 source-family cleanup; no double rollback.
4. Stage secondary-school-specific rewritten children for HB-1682..1688 but do not alter 2,229 denominator until Super Admin approval/publish.
5. Keep Sosyal Sorumluluk Kulübü tenant requirement active and separate from legal counter.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V78** başlat; minimum **300 atom** hedefle.
