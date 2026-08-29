# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **12.655**
- Son tamamlanan batch: **V60**
- Sonraki batch: **V61**

## Integrity history
- V49 HB-0395/HB-0138 temporary promotion via annulled RAM Directive; V50 rollback.
- V53 HB-2038 rollback.
- V54 HB-2046/HB-2049 rollback; HB-2048/HB-2050 promotion.
- V55 HB-2047 privacy promotion.
- V56 HB-0310 compound rollback + HB-2051 promotion.
- V57 HB-2139 compound rollback.
- V58 HB-2137 promotion; connector semantics guard.
- V59 HB-2140 promotion; OAB/transport/discipline wrong-family corrections.
- V60 HB-1360 current Taşınır authority recovered; HB-1645 rolled back for school-type/action scope mismatch.

## V60 — 420 atom
- Integrity: `docs/legal-asset-schedule-integrity-reconciliation-v60.md` — `5386ed0fb85dffbd156e2a6915f075a51c111778`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v60.md` — `04e95808198a83845bcc48141cbd4fe181a7ad46`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v60.md` — `d811971215040da75ebdc50f09e197e16928e848`
- Progress: `docs/legal-verification-progress-v60-delta.json` — `2a8207a2ccdfa357fc3b5b64c383b43115f5c452`
- Support atoms: **420**; pool **12.235 -> 12.655**.
- ARTICLE_VERIFIED: **468 -> 467**.

### V60 retained/source-corrected
`HB-1360` — `Alınan malzemenin taşınır mal kayıt işlemleri yapılmıştır.`
Legacy Batch02 OÖİKY Md11 is wrong. Current exact legal family is the 2024 Taşınır Mal Yönetmeliği:
- Md10/1-a: accepted/delivered movable entries use Varlık İşlem Fişi subject to listed exceptions;
- Md11/1: entry/exit records and prescribed documents primarily electronic;
- Md12/1: all movable property and related transactions recorded, document-based.
Applicability must reflect public-administration/public-institution scope rather than pretending this is an OÖİKY registration/nakil rule.
Delta 0.

### V60 rollback
`HB-1645` — whole master text combines balanced/successive course distribution with PE/music first/last-day preference. Batch02 had wrongly attached OÖİKY Md90/2.
Current OÖİKY Md5/3 only provides the first/last-day PE/game/sport/music preference. Current OÖKY Md12/2-b provides the full secondary-school sentence including balanced course distribution. Durable master metadata is broad `ALL`; whole-row actor/scope/applicability therefore fails strict exactness.
Status: `ROLLBACK_ARTICLE_VERIFIED + SCHOOL_TYPE_SCOPE_REWRITE_REQUIRED`.
Delta -1.

### V60 withheld exact-text candidates
- HB-1646 -> OÖKY Md12/2-c, but durable broad school-type scope must be corrected/published before count.
- HB-1647 -> OÖKY Md12/2-ç, same scope issue.
- HB-1483 -> OAB Regulation Md11/1-c exact action candidate; institution/applicability review first.
- HB-1484 -> OAB Regulation Md16/1 exact action candidate; institution/applicability review first.

## ARTICLE_VERIFIED immutable gate
`workflow_id + current binding/current-valid source + exact provision + actor/action/object/recipient/timing/system/applicability + legal connector semantics`

Mandatory gate:
`SOURCE_FOUND -> DOCUMENT_EFFECT -> PROVISION_EFFECT -> JUDICIAL_STATUS -> REPEAL/AMENDMENT_CHAIN -> ACTOR/ACTION/OBJECT/RECIPIENT/TIMING/SYSTEM/SCOPE/SEMANTICS -> ARTICLE_VERIFIED`

Guards:
- official hosting != current legal effect.
- wrong-family source correction delta 0 only when same durable action has a current exact parent and applicability remains valid.
- a partially matching school-type provision cannot validate a broader whole sentence.
- broad `ALL` metadata cannot silently inherit a secondary-school-only provision.
- compound = WITHHELD/SPLIT; if already counted, rollback.
- named repealed source cannot be silently replaced without rewrite where source identity is part of master semantics.
- historical completed instances immutable.
- duplicate/calendar-instance second count forbidden.

## Açık kritik kayıtlar
- HB-1645 -> school-type rewrite/split after V60 rollback.
- HB-1646/HB-1647 -> exact OÖKY text but school-type applicability correction pending.
- HB-1483/HB-1484 -> OAB exact-action candidates, applicability review pending.
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

## V61 önceliği — 300+ atom
1. Audit HB-1483 onward against current OAB Regulation Md11, Md15-18, Md23 and identify which broad ALL rows need applicability correction vs source-correct/promotion.
2. Audit HB-1570/HB-1571/HB-1572 against current Taşıma Yoluyla Eğitime Erişim Yönetmeliği; distinguish school management duties, meal duties, route/service actors and year parameters.
3. Continue HB-1646/HB-1647/HB-1648 school-type split; never promote OÖKY-only text under ALL scope.
4. Audit HB-1667 and neighboring duty-roster rows currently tied to OÖİKY Md90/2.
5. Continue HB-2138/HB-2139 and unresolved HB-2053/HB-2045/HB-0602 chains.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V61** başlat; minimum **300 atom** hedefle.
