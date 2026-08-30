# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. MEB TKB rehberleri L2 operational evidence olabilir; primary exact provision yerine geçmez.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **474 / 2.229 = %21,2651**
- Kalan exact: **1.755**
- Atom havuzu: **17.995**
- Son batch: **V73**
- Sonraki batch: **V74**

## V73 — 410 atom
- Integrity: `docs/legal-human-resources-integrity-v73.md` — `b6c003b1f3a670f48c47a636dd4f6a9b95c11d9e`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v73.md` — `91c6e242f64e821dc8e8270dbb96a6f3a53294e8`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v73.md` — `958eb74590b09d9f3e03f8d27d2e5f02e60a0e41`
- Progress: `docs/legal-verification-progress-v73-delta.json` — `f7782a1b50894014893f9dbc383363dc106a36e1`
- Support atoms: **410**, pool **17.585 -> 17.995**.
- ARTICLE_VERIFIED: **474 -> 474**, delta **0**.

### V73 Human Resources findings
- `HB-1623`: current Norm Kadro legal family + 2026 TKB inspection criterion confirm norm-based sufficiency is audited, but master is an audit-state (`uygun sayıda öğretmen bulunmaktadır`), not an exact binding duty requiring every norm vacancy to be filled. `AUDIT_STATE_NOT_SAME_AS_BINDING_FILL_DUTY`.
- `HB-1624`: current 2026 MEB TKB guidance cites 657 Md109 for personnel files, but master `her çalışan` is broader than civil-servant scope. `EMPLOYMENT_STATUS_SCOPE_SPLIT_REQUIRED`.
- `HB-1625`: generic discipline row loses personnel status, disciplinary authority, process and sanction semantics. `DISCIPLINE_LEGAL_FAMILY_TOO_BROAD`.
- `HB-1626`: current MEB Personel inventory lists the Success/Superior Success/Award Directive, but master loses reward type, proposer, competent authority and conditions. `REWARD_TYPE_AND_AUTHORITY_SPLIT_REQUIRED`.
- `HB-1627`: 0/5-year mal-declaration renewal family remains candidate, but approved official current primary exact renewal provision was not directly locked in V73. `PRIMARY_RENEWAL_PROVISION_LOCK_PENDING`.
- `HB-1628`: principal duty division/notification must be school-type/role exact before broad ALL publication.
- `HB-1629`: absence replacement named in duty distribution; universal current exact parent not locked.
- `HB-1630`: in-service announcement is operationally current but exact school-principal duty parent not locked.
- `HB-1631`: personnel departure handover merges document/property/duty objects from different legal families.
- `HB-1632`: leave/report tracking is operationally current but employment-status sources differ; split required.
- `HB-1633` starts `2.3 ADAY ÖĞRETMENLİK`; Human Resources block ends at HB-1632.

## New integrity guards
- `AUDIT_STATE != BINDING_FILL_DUTY`.
- `EMPLOYEE != SINGLE_LEGAL_STATUS`.
- `PERSONNEL_FILE_SCOPE_MUST_MATCH_EMPLOYMENT_STATUS`.
- `DISCIPLINE_ACTION_REQUIRES_STATUS_ACTOR_PROCESS_SANCTION_EXACTNESS`.
- `REWARD_REQUIRES_TYPE_PROPOSER_AUTHORITY_CONDITION_EXACTNESS`.
- `HANDOVER_OBJECTS_MUST_NOT_BE_MERGED_ACROSS_LEGAL_FAMILIES`.

## Existing high-priority backlog
- HB-1611/1612/1617-1622 strategic-plan/service-standard split/rewrite chains.
- HB-1604..1608 and HB-1597..1603 DÖSE current-system/recipient/provision backlog.
- HB-1483/HB-1484 official OAB exact retry only.
- HB-1655..1665 and HB-1645..1647/HB-1667 school-type split staging.
- HB-1666 universal duty-book parent unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 semantics/split/exact-parent chains.
- HB-0138/HB-0395 L2 operational only.
- HB-2218/HB-2229 School Health scope.

## V74 priority — 300+ atoms
1. Start `HB-1633+` Aday Öğretmenlik from exact master text.
2. Reconcile legacy 2024 handbook candidate-teacher timing/forms with current 7528 Öğretmenlik Mesleği Kanunu + current 2026 MEB preparation/appointment regulations and current MEB candidate-teacher guidance.
3. Treat changed candidate-teacher model, evaluator roles, forms, day counts and training stages as amendment-chain fields; do not grandfather old handbook wording.
4. Roll back any previously counted legacy candidate-teacher row if actor/timing/form is no longer current.
5. Continue HB-1627 primary official mal-declaration exact search only if room.
6. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V74** başlat; minimum **300 atom** hedefle.
