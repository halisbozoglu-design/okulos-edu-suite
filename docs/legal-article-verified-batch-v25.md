# ARTICLE_VERIFIED Batch V25

Date: 2026-08-26
Base ARTICLE_VERIFIED: 405 / 2229
Increment: 5
Result: 410 / 2229 = 18.394% (~18.4)
Migration: 0

## Exact bindings

1. HB-1494 — “Birlik Başkanı her ayın sonunda okul müdürünü okul-aile birliği gelirleri ve harcamalarına ilişkin yazılı olarak bilgilendirmektedir.”
   - Source: Millî Eğitim Bakanlığı Okul-Aile Birliği Yönetmeliği
   - Article: Md.18/5
   - Official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
   - Basis: Md18/5 explicitly requires the birlik başkanı to notify the school principal in writing at the end of every month about revenues, donations and expenditures made by board decisions.

2. HB-2214 — “Okul-Aile Birliği Genel Kurulu”
   - Source: Millî Eğitim Bakanlığı Okul-Aile Birliği Yönetmeliği
   - Article: Md.9/1-3
   - Official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
   - Basis: Md9 directly regulates the general assembly, annual meeting timing, quorum and announcement framework.

3. HB-2215 — “Okul-Aile Birliği Yönetim Kurulu”
   - Source: Millî Eğitim Bakanlığı Okul-Aile Birliği Yönetmeliği
   - Article: Md.12/1-3
   - Official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
   - Basis: Md12 directly defines board composition, one-year term and first-week duty distribution.

4. HB-2225 — “Okul-Aile Birliği Denetleme Kurulu”
   - Source: Millî Eğitim Bakanlığı Okul-Aile Birliği Yönetmeliği
   - Article: Md.14/1-7
   - Official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
   - Basis: Md14 directly regulates supervisory board composition, term, reporting and oversight duties.

5. HB-0977 — “Okul Aile Birliği gelir-gider raporunun ilan edilmesi”
   - Source: Millî Eğitim Bakanlığı Okul-Aile Birliği Yönetmeliği
   - Article: Md.13/10
   - Official source: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
   - Basis: current Md13/10 requires income/expense records to be announced at least once in each education term on the school notice board and website.

## Withheld
- HB-0716 has the same announcement action but legacy monthly timing = January. Current Md13/10 is term-based, not January-specific; therefore not promoted until the legacy timing is split/corrected.
- HB-0431 combines general assembly + creation of management and supervisory boards in one row. Exact clauses span Md9-14; split is preferred before ARTICLE_VERIFIED.
- Transport rows HB-0335/HB-0722 were already ARTICLE_VERIFIED in earlier master batch and are not double-counted.

## Rule
No workflow is counted unless the workflow_id text and current source clause directly support the same operational obligation. Timing mismatches are withheld rather than normalized silently.
