# V67 — School DÖSE accounting/integrity reconciliation

Date: 2026-08-30
Scope: HB-1587..HB-1594
Source policy: official MEB / mevzuat.meb.gov.tr / mevzuat.gov.tr / Resmî Gazete only for exact verification.

## Scope boundary
The 23.01.2021 / 31373 MEB Döner Sermaye İşletmeleri Yönetmeliği is not inherited into 3423-law school DÖSE merely because the topic is the same. School DÖSE remains a distinct 3423/OÖKY/current school-revolving-capital chain.

## Master rows and decisions
- HB-1587 — technical assistant principal + accountant handover. Compound actors and separate legal responsibilities. Current official exact provision for the whole sentence not locked. `COMPOUND_ACTOR_SPLIT + WITHHELD`.
- HB-1588 — previous-year balances/opening accounting records. Current MEB Teftiş Kurulu DÖSE inspection guide explicitly continues to inspect this action and points to Döner Sermayeli İşletmeler Bütçe ve Muhasebe Yönetmeliği / HMB accounting system. Exact binding article number not locked from an official current provision in this pass. `L2_CURRENT_OPERATIONAL_EXACT + ARTICLE_NUMBER_NOT_LOCKED`.
- HB-1589 — tax declarations completed and paid on time. Current MEB inspection guide continues the criterion under VUK, but the master merges multiple declaration/payment duties that vary by tax type. `CURRENT_OPERATIONAL + TAX_TYPE_PROVISION_SPLIT_REQUIRED`.
- HB-1590 — legacy wording `peşin gelir beyannamesi`. Current DÖSE documentation describes treasury/gross-revenue transfer and accounting treatment, but this master label was not matched to one current exact durable provision. `LEGACY_TERM_CURRENT_PARENT_REVIEW`.
- HB-1591 — DÖSE workers' wages paid on time. General employer/labour law may apply conditionally; no universal school-DÖSE-specific durable exact parent established. `WORKFORCE_SCOPE_REVIEW`.
- HB-1592 — workers' SGK declarations and payments. General social-security/employer law applies by actual worker status; master cannot be universalized to every DÖSE school without workforce condition. `WORKFORCE_SCOPE_REVIEW + GENERAL_EMPLOYER_LAW`.
- HB-1593 — parça başı recipients/wording differs from current official inspection formulation and current regulation actor set. `ACTOR_LIST_SEMANTICS_REWRITE_REQUIRED`.
- HB-1594 — master says minimum 5% profit + 25% activity expense. Current official MEB inspection guidance cites Regulation Md8/2 but explicitly notes activity expense is applied as 11% after the Treasury/gross-revenue share reduction from 15% to 1% under 20.12.2018/24650793 Minister Approval. `LEGACY_PARAMETER_MISMATCH + MASTER_REWRITE_REQUIRED`.

## Current official evidence
- MEB Teftiş Kurulu DÖSE Rehberlik ve Denetim Rehberi: current inspection criteria for school DÖSE, including opening entries, tax declarations, accounting roles, parça başı production and percentage note.
- DHGM İşletmeler Daire Başkanlığı current page (updated 24.02.2026): 3423 is listed in the school revolving-capital legal stack; the page separately exposes school-DÖSE operational documents and 02.01.2026 opening/closing/accountant processes.
- DHGM 2026 school-DÖSE establishment instructions explicitly state newly established school DÖSE is subject to 3423.

## Integrity guards added
1. `L2_CURRENT_OPERATIONAL != ARTICLE_VERIFIED` when exact binding article is not locked.
2. A tax/workforce master that merges distinct statutory duties must split by tax type / employment status before exact promotion.
3. A numeric parameter in the regulation text may be modified in current implementation by later legally operative approval/rate change; current effective parameter wins and legacy master must be rewritten before promotion.
4. Same topic/same role names do not bypass explicit scope boundaries.

## Numerical effect
ARTICLE_VERIFIED delta: 0.
No migration. Lovable usage: 0.
