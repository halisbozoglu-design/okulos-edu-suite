# V58 — Disiplin + Sosyal Etkinlik Integrity Reconciliation

Tarih: 2026-08-29
Migration: 0
Lovable: 0

## Disiplin zinciri

### HB-2135 — retained, source corrected
Master action: disiplin olayının öğrenilmesi üzerine durumun öncelikle rehberlik servisine intikal ettirilmesi.
Current exact parent: MEB Ortaöğretim Kurumları Yönetmeliği Md192/1.
Applicability guard: yalnız rehberlik servisi bulunan ortaöğretim kurumlarında bu öncelik doğrudan uygulanır; rehberlik servisi bulunmayan okulda Md192/2 farklı sevk zinciri kurar.
Action is retained with `HAS_RPD_SERVICE` applicability condition. Counter delta: 0.

### HB-2137 — NEW ARTICLE_VERIFIED
Master action: kurul başkanı öğrencilerin ve tanıkların ifadelerini alır, gerekli bilgi/belgeleri toplar, dosyayı düzenleyip kurula sunar.
Current exact parent: OÖKY Md193/1.
Actor/action/object/recipient match is exact. No prior ARTICLE_VERIFIED record found in Batch02 or current repo search.
Status: ARTICLE_VERIFIED.
Counter delta: +1.

### HB-2138 — WITHHELD wording mismatch
Master: `yazılı veya sözlü savunmaları alınmadan ceza verilmemektedir`.
Current Md194/1: öğrencinin **yazılı ve gerektiğinde sözlü** savunması alınır; sözlü savunma tutanağa geçirilir.
The master's OR construction can imply either channel alone is sufficient, which weakens the current duty. Do not promote until master rewrite:
`Kurula sevk edilen öğrencinin yazılı savunması alınır; gerektiğinde sözlü savunması da alınarak tutanağa geçirilir.`
Status: `MASTER_REWRITE_REQUIRED + WITHHELD_EXACT_SEMANTICS`.
Counter delta: 0 because it was not in the counted Batch02 set.

### HB-2139 — split remains required
V57 rollback remains valid. Current exact children:
1. reasoned decision written/attached to decision book -> OÖKY Md196/1;
2. all sanctions notified to parent under notification rules and proof of receipt retained in discipline file -> OÖKY Md169/5.
A File Library recall search did not reveal a durable standalone master row that cleanly replaces either child; only HB-2139 itself was returned for the compound wording. Do not assign new durable IDs before Super Admin approval.
Staging names only:
- `DISCIPLINE_DECISION_WRITE_TO_BOOK`
- `DISCIPLINE_SANCTION_NOTIFY_AND_RETAIN_PROOF`

## Social Activities source corrections

### HB-2079
Master includes participation certificate, achievement certificate, thank-you certificate, and optional OAB reward.
Exact parent: current Social Activities Regulation Md7/3.
Retain; delta 0.

### HB-2081
Master: student's selected club, work and documents are entered in e-Okul Social Activities Module.
Exact parent: current Social Activities Regulation Md8/5; role execution also supported by Md16/e and class-guidance entry duties.
Retain; delta 0.

### HB-2093
Master: flag ceremony at week start/end and before/after official/national/general holidays; speeches finish before National Anthem.
Exact parent: current Social Activities Regulation Md19/2 and Md19/4.
Retain; delta 0.

## Source quality
- Official current OÖKY source used: `https://mevzuat.meb.gov.tr/dosyalar/1657.pdf`.
- Official current Social Activities source used: `https://mevzuat.meb.gov.tr/dosyalar/1850.pdf`.
- The Social Activities PDF text endpoint was readable, but screenshot retrieval returned cache/internal errors in this pass; no screenshot success is claimed.

## Counter
V57 start: 466
HB-2137: +1
Other source corrections: 0
V58 result: 467 / 2,229.
