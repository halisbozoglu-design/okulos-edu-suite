# ARTICLE_VERIFIED Batch V22 — Exact Archive Workflow Bindings

Date: 2026-08-26
Status: ARTICLE_VERIFIED
Binding master snapshot: `Mimaros_Master_Legal_Verification_Progress_v12.csv` (File Library; latest durable workflow-id master available in this session)
Baseline ARTICLE_VERIFIED: 390 / 2229
New exact bindings: 6
Result: 396 / 2229 = 17.77% (17.8%)
Migration count: 0

## Current primary authority
Devlet Arşiv Hizmetleri Hakkında Yönetmelik — RG 18.10.2019 / 30922
Official URL: https://www.devletarsivleri.gov.tr/varliklar/dosyalar/mevzuat/arsivhizmetleri.pdf
Exact-current clause staging cross-check: `docs/legal-archive-correspondence-deepening-batch-100plus-v12.md`

## Newly verified workflow bindings

| workflow_id | master task | exact current provision | verification |
|---|---|---|---|
| HB-1365 | Arşiv malzemelerinin zararlı tesir ve unsurlardan korunması için tedbir alınması | Md.5/1-a | ARTICLE_VERIFIED |
| HB-1366 | Arşiv malzemesi için ayıklama/imha komisyonu oluşturulması | Md.19/1-2 | ARTICLE_VERIFIED |
| HB-1367 | Evrakın Standart Dosya Planı esaslarına göre dosya/klasörlere yerleştirilmesi | Md.10/1 + Md.11/1-9 + Md.24/3 | ARTICLE_VERIFIED |
| HB-1368 | Klasör etiketinde birim/kod/konu/yıl vb. bilgiler | Md.12/1 | ARTICLE_VERIFIED |
| HB-1370 | İmha listesinin komisyon başkan ve üyelerince imzalanması | Md.21/2 | ARTICLE_VERIFIED |
| HB-1371 | İmha listesi, imha tutanağı ve ilgili belgelerin 10 yıl saklanması | Md.21/7 | ARTICLE_VERIFIED |

## Deliberately NOT verified in this pass
- HB-1364: old handbook wording `arşiv sorumluluğu` does not exactly equal current Md.6 `Kurum/Birim Belge Yöneticisi`; terminology patch/review needed.
- HB-1369: old handbook says `Aralık ayının son haftası`; current regulation instead has January conformity, February transfer and March commission schedule. Old timing is not verified and must be patched rather than preserved as current law.
- HB-1372: fire extinguisher/fire-protection requirement requires exact current fire-regulation clause binding; archive regulation Md.5/1-a alone is not enough for the extinguisher detail.
- HB-1373: `arşiv amacı dışında kullanılmama` wording was not promoted without an exact current clause.

## Safety rule
`ARTICLE_VERIFIED` is granted only where `workflow_id + current official source + exact article/paragraph` are all present. Similarity/candidate family matches do not count.
