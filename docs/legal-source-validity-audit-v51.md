# Source validity audit — V51

Date: 2026-08-29
Migration: 0

## Audit objective
Apply the V50 judicial-status guard to sources that can affect current legal verification.

## 1. 2020 RPD Regulation
Source: 14.08.2020 / RG 31213.
MEB still lists this Regulation in its current regulation inventory and ORGM current regulation page.
Judicial effect must be provision-specific: Article 14 was affected by the Danıştay case connected with the RAM Directive; surviving provisions continue to appear as current references in MEB 2026 inspection guidance.

Verdict: `CURRENT_DOCUMENT / PARTIAL_PROVISION_JUDICIAL_EFFECT`.
Policy: never mark the entire Regulation annulled.

## 2. 2020 RAM Directive
31.08.2020 RAM Directive.
MEB inspection material records judicial stay/annulment affecting the whole directive.

Verdict: `ANNULLED_CURRENT_AUTHORITY_FALSE`.
May be used only as historical/provenance evidence.

## 3. 2017 RAM Guide
MEB published the RAM Guide to standardize RAM operations. Current 2026 Teftiş Kurulu guidance continues to cite the RAM Guide for operational criteria.

Verdict: `CURRENT_OPERATIONAL_REFERENCE` but not a regulation/directive article.
Counter treatment: `NOT_ARTICLE_AUTHORITY` unless paired with an exact current higher norm.

## 4. 2026 RAM inspection guide
MEB Teftiş Kurulu official inspection guide for 2025-2026 / 2026 inspections.
It is strong current evidence for what MEB inspectors expect and which legal provisions they rely on.

Verdict: `CURRENT_OFFICIAL_INSPECTION_EVIDENCE`.
Counter treatment: evidence/cross-check only; it does not replace the underlying binding source.

## 5. 2026 Counseling Measure Communiqué
24.04.2026 / RG 33233 `Danışmanlık Tedbiri Kararlarının Uygulama Usul ve Esasları Hakkında Tebliğ`.
Current process authority for counseling-measure cases.

Verdict: `CURRENT_BINDING`.
Use for assignment/start/application/plan/session/review parameters rather than stale handbook rules.

## 6. 2019 Psychosocial Protection/Prevention/Crisis Intervention Directive
Current 2026 RAM inspection guide continues to cite its articles for psychosocial support work.

Verdict: `CURRENT_IN_USE_EVIDENCE`; judicial/repeal scan remains required before ARTICLE_VERIFIED promotion of any exact master row.

## 7. BİLSEM 2025 Directive
ORGM's current BİLSEM Directive includes the 05.11.2025 amendment and is the current named-organ parent used by prior V37-V44 verification.
No V51 evidence found that displaces this source.

Verdict: prior BİLSEM ARTICLE_VERIFIED rows remain unchanged in V51.

## Audit rule additions
Every source record gains logical fields without DB migration:
- `document_effect_status`
- `provision_effect_status`
- `judicial_status_checked_at`
- `replacement_source`
- `authority_layer` = L1 binding / L2 operational / L3 historical
- `article_counter_eligible`

These fields are represented in verification artifacts/config first; no schema migration in V51.

## Outcome
No additional rollback required beyond V50's HB-0138/HB-0395 rollback.
No new ARTICLE_VERIFIED promotion in V51.
