# V51 — Current RAM authority deepening

Date: 2026-08-29
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0
Support atoms: 520

## Purpose
V51 removes the false binary assumption that the 2020 RPD Regulation is either wholly current or wholly annulled. Current effect is resolved provision-by-provision.

## Current authority findings
1. MEB current regulations inventory continues to list the 14.08.2020 / 31213 `Millî Eğitim Bakanlığı Rehberlik ve Psikolojik Danışma Hizmetleri Yönetmeliği`.
2. Judicial material recorded by MEB inspection guidance establishes that Article 14 and the 31.08.2020 RAM Directive were stayed/annulled; the whole RPD Regulation was not thereby removed.
3. MEB Teftiş Kurulu 2026 RAM inspection guidance actively cites surviving Regulation provisions, including Md16/4, Md18/1-m and Md13/1-a.
4. Therefore current verification must be provision-level, not document-level.

## Authority layers
### A — CURRENT_ARTICLE_AUTHORITY
A surviving Regulation/Law provision with exact actor/action/scope may support ARTICLE_VERIFIED.

### B — CURRENT_OPERATIONAL_EVIDENCE
Current MEB inspection guide / RAM Guide / e-Rehberlik implementation material may prove that an operation is currently expected, but does not by itself satisfy ARTICLE_VERIFIED when no durable exact article is identified.

### C — HISTORICAL_ONLY
A workflow whose only exact legal parent is the annulled 2020 RAM Directive remains historical evidence and is not current authority.

## Current surviving examples
- RPD Regulation Md16/4: for schools without a counsellor, planning for participation of a counsellor from RAM or another school in the responsibility area in the RPD services executive commission.
- Md18/1-m: school principal sends the school risk map created by the RPD service to the attached RAM during November.
- Md13/1-a: needs-analysis / local-target evaluation linkage used by the 2026 inspection guide.

Official/current supporting surfaces:
- https://www.meb.gov.tr/mevzuat/
- https://orgm.meb.gov.tr/www/yonetmelik/icerik/1958
- https://tkb.meb.gov.tr/meb_iys_dosyalar/2026_05/6a01bce6330ae552730781_15-Rehberlik_ve_Ara%C5%9Ft%C4%B1rma_Merkezleri_Denetim_Rehberi.pdf

## Master reconciliation
### HB-0602
Canonical action: school RPD programs received from schools are examined and review forms returned.
- Existing scope label is wrong (`PANSİYONLU OKULLAR`).
- 2026 inspection guide still expects program examination/evaluation/feedback, but cites RAM Guide + older implementation letter rather than a surviving exact Regulation paragraph for this RAM-side action.
- Status: `SCOPE_ERROR_CANDIDATE + CURRENT_OPERATIONAL_EVIDENCE + ARTICLE_PARENT_NOT_FOUND`.
- No ARTICLE_VERIFIED promotion.

### HB-0603
Canonical action: `Okul risk haritalarının uygulanması`.
- Current Regulation has exact school-side actions: create risk map and send it to RAM in November.
- 2026 RAM inspection guide has exact RAM-side expectation: collect risk-at-student data from responsibility-area schools in November, citing Md18/1-m.
- The legacy verb `uygulanması` does not identify create/send/collect actor precisely.
- Status: `ACTION_SCOPE_REWRITE_REQUIRED`.
- Proposed atomic children after Super Admin approval:
  1. `SCHOOL_RISK_MAP_CREATE`
  2. `SCHOOL_RISK_MAP_SEND_TO_RAM`
  3. `RAM_RISK_DATA_RECEIVE_COLLECT`
- No whole-row promotion.

### HB-0138 / HB-0395
- 2026 inspection guide currently expects responsibility-area counsellor meetings at school-year start, mid-year and year-end.
- That criterion is grounded in the RAM Guide, not a surviving exact Regulation paragraph equivalent to old RAM Directive Md5/4-a/7.
- Status: `CURRENT_OPERATIONAL_EVIDENCE / ARTICLE_PARENT_NOT_FOUND`.
- V50 rollback remains correct.

## Program/risk-map current Regulation atoms
The current RPD Regulation still supplies school-side exact atoms independent of the annulled RAM Directive:
- May needs analysis — Md8.
- special/local/general target structure — Md9.
- school RPD program content — Md10.
- commission formation / no-counsellor planning — Md16.
- commission duties — Md17.
- principal program approval/sending to RAM — Md18/1-ğ.
- principal November risk-map sending — Md18/1-m.
- counselling-measure school responsibility — Md18/1-n, read together with the 2026 Counseling Measure Communiqué for current process parameters.
- school counsellor risk-map creation — Md21/4-b/3.
- class counsellor November risk-data delivery to school RPD service — Md23/1-d.

## Judicial-status guard refinement
Document state is now two-dimensional:
`DOCUMENT_STATUS + PROVISION_STATUS`.

A document may be current while one provision is annulled. A directive may be fully annulled while the parent Regulation continues except for one provision.

Required gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/SCOPE -> ARTICLE_VERIFIED`

## Result
ARTICLE_VERIFIED remains 467/2229. No unsafe promotion was made. The main gain is recovery of valid surviving Regulation parents and separation of article authority from guide-only operational evidence.
