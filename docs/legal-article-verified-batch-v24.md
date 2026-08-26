# ARTICLE_VERIFIED Batch V24

Date: 2026-08-26
Base verified: 400 / 2229
Increment: +5
Result: 405 / 2229 = 18.17%
Migration: 0

Verification rule: workflow_id + current official source + exact current article/paragraph must all be directly established. Candidate article values from the legacy queue are corrected when the current official text differs.

## Newly verified

1. HB-0495 — Öğrenci kayıt ve nakil işlemleri
   - Current source: MEB Bilim ve Sanat Merkezleri Yönergesi
   - URL: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf
   - Exact provisions: Md.12/1-5; registration documents Md.13/1-a,b as supporting evidence
   - Verification: VERIFIED_CURRENT

2. HB-0746 — Öğrenci kayıt ve nakil işlemleri
   - Current source: MEB Bilim ve Sanat Merkezleri Yönergesi
   - URL: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf
   - Exact provisions: Md.12/1-5; Md.13/1-a,b supporting registration evidence
   - Verification: VERIFIED_CURRENT

3. HB-0923 — Öğrenci kayıt ve nakil işlemleri
   - Current source: MEB Bilim ve Sanat Merkezleri Yönergesi
   - URL: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf
   - Exact provisions: Md.12/1-5; Md.13/1-a,b supporting registration evidence
   - Verification: VERIFIED_CURRENT

4. HB-0935 — Her kurs sonunda memnuniyet anketlerinin yapılması ve kursa ait görüşlerin raporlaştırılması
   - Current source: MEB Hayat Boyu Öğrenme Kurumları Yönetmeliği
   - URL: https://mevzuat.meb.gov.tr/dosyalar/1924.pdf
   - Exact provision: Md.75/6
   - Important correction: legacy queue candidate stated Md.75/7; current official consolidated text places the electronic end-of-course satisfaction survey/report duty in Md.75/6. ARTICLE_VERIFIED uses the corrected current clause.
   - Verification: VERIFIED_CURRENT_CORRECTED_ARTICLE

5. HB-1937 — Kurslarda öğrencilerin devamsızlıkları takip edilmektedir
   - Current source: MEB Destekleme ve Yetiştirme Kursları Yönergesi
   - URL: https://mevzuat.meb.gov.tr/dosyalar/2179.pdf
   - Exact provisions: Md.12/1-4 (mandatory attendance, 1/5 limit, yoklama/e-Kurs recording, parent notification/excuse-document deadlines)
   - Verification: VERIFIED_CURRENT

## Result
ARTICLE_VERIFIED = 405 / 2229 = 18.17%

## Not counted
- Generic BİLSEM/HEM atoms without a durable master workflow_id remain staging only.
- Candidate-only matches are not counted.
- Any legacy candidate article contradicted by the current official source is corrected first, then counted only if the underlying workflow itself remains legally supported.