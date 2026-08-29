# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **468 / 2.229 = %20,9960**
- Kalan exact doğrulama: **1.761**
- Büyük atomik mevzuat havuzu: **12.235**
- Son tamamlanan batch: **V59**
- Sonraki batch: **V60**

## Integrity history
- V49 HB-0395/HB-0138 temporary promotion via annulled RAM Directive; V50 rollback.
- V53 HB-2038 rollback.
- V54 HB-2046/HB-2049 rollback; HB-2048/HB-2050 promotion.
- V55 HB-2047 privacy promotion.
- V56 HB-0310 compound rollback + HB-2051 promotion.
- V57 HB-2139 compound rollback.
- V58 HB-2137 promotion; exact connector semantics guard added.
- V59 HB-2140 promotion; OAB/transport/discipline wrong-family source corrections expanded.

## V59 — 420 atom
- Integrity: `docs/legal-discipline-oab-transport-integrity-v59.md` — `256222fbae511bdcd1b591d324d3a8cd40f90fb9`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v59.md` — `536f632581af589ae1c992a99381f2b98be40777`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v59.md` — `e3c7da3ac3bd6f21349e01c29eb5e18014db1cef`
- Progress: `docs/legal-verification-progress-v59-delta.json` — `f2f491551b889de75439cddd9d8ce9218fd16ab2`
- Support atoms: **420**; pool **11.815 -> 12.235**.
- ARTICLE_VERIFIED: **467 -> 468**.

### V59 new exact
`HB-2140` -> current OÖKY Md189/1-ğ.
Okul Öğrenci Ödül ve Disiplin Kurulu; ders yılı/dönem içindeki disiplin olaylarının nedenleriyle alınan tedbirleri ve sonuçlarını tespit eder, ders yılı ve dönem sonunda rapor hâlinde okul yönetimine bildirir.
Delta +1.

### V59 source corrections retained, delta 0
- `HB-2111` -> OÖKY Md157/3.
- `HB-1569` -> Taşıma Yoluyla Eğitime Erişim Yönetmeliği Md13/1-c; execution complement Md13/2-c.
- `HB-1480` -> Okul Aile Birliği Yönetmeliği Md23/2 (karar defterinin noterce tasdiki zorunlu).
- `HB-1482` -> OAB Yönetmeliği Md18/1 + Md23/1-b (harcama yönetim kurulu kararı + karar defteri chain).

### V59 unresolved wrong-source row
`HB-1360` — pansiyonda alınan malzemenin taşınır kayıt işlemi. Batch02 OÖİKY Md11 parentı açıkça yanlış legal family/action. Exact current taşınır/pansiyon provision lock tamamlanmadan current count kararı verilmeyecek.
Status: `SOURCE_INVALIDATED + CURRENT_PARENT_RESEARCH`.

## OÖKY discipline authority chain
- Md189/1-ğ -> term/year-end school discipline report.
- Md197 -> principal objection + district board referral.
- Md198 -> school board cannot form/decide; first investigation file goes district board.
- Md199 -> district discipline board composition.
- Md200 -> district board duties/10-workday decisions/appeals.
- Md201 -> provincial discipline board composition.
- Md202 -> provincial duties + every-term province discipline evaluation.
- Md203 -> upper discipline board composition.
These cannot be merged into school-level workflows without actor/institution scope match.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding/current-valid source + exact provision + actor/action/object/recipient/timing/system/applicability + legal connector semantics`

Mandatory gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- wrong-family source correction has delta 0 only when same master action has a current exact parent.
- source invalidated rows do not stay verified merely because an old handbook repeats them.
- compound = WITHHELD/SPLIT; if counted, rollback.
- `ve`, `veya`, `gerektiğinde`, timing and recipient semantics are exactness fields.
- duplicate/calendar-instance second count forbidden.
- historical completed instances immutable.
- personal/contextual data requires exact authority and privacy/access/retention controls.

## Açık kritik kayıtlar
- HB-1360 -> current taşınır/pansiyon exact parent.
- HB-2138 -> master rewrite required (`written + where necessary oral`).
- HB-2139 -> split children staged; SA publication pending.
- HB-2045 -> school-type/current-parent split.
- HB-2052 -> 2006/26 repealed; rewrite required.
- HB-2053 -> multi-provision support-room candidate.
- HB-0602 -> PANSİYONLU scope error + RAM-side binding parent unresolved.
- HB-0603 -> atomic staging; SA publication pending.
- HB-0138/HB-0395 -> L2 operational only.
- HB-2218/HB-2229 -> School Health scope issues.
- HB-2227 -> RAM Merkez Komisyon Kurulu current authority unresolved.
- HB-2222 -> HEM legacy title mismatch.
- HB-2212 -> current BİLSEM Directive has no Sınıf/Şube Öğretmenler Kurulu.
- HB-2210 -> talent exam annual-guide dependent.
- HB-2204/2205/2206 -> title/scope reconciliation.
- HB-0502 -> obsolete guide + compound monthly report.

## V60 önceliği — 300+ atom
1. Resolve `HB-1360` using current Taşınır Mal Yönetmeliği + current pansiyon authority; source-correct if exact, rollback if actor/action/scope cannot be locked.
2. Audit neighboring Batch02 wrong OÖİKY-family rows, especially `HB-1483+`, `HB-1569+`, `HB-1645+` and remaining Md36/85/90 mappings.
3. Search current exact master matches for OÖKY Md197-204 workflows; promote only pre-existing uncounted durable IDs.
4. Continue HB-2138 rewrite staging and HB-2139 children search.
5. Continue HB-2053/HB-2045/HB-0602 unresolved chains.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V60** başlat; minimum **300 atom** hedefle.
