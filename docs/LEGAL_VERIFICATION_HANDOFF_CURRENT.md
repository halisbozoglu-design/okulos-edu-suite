# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-30
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**
Lovable usage: **0**

## Kaynak politikası
ARTICLE_VERIFIED için yalnız `mevzuat.gov.tr`, `mevzuat.meb.gov.tr`, resmî `meb.gov.tr` birimleri ve `resmigazete.gov.tr`. MEB rehberi/FAQ L2 veya tarihsel operasyon kanıtı olabilir; current Resmî Gazete hükmünün yerine geçmez.

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **475 / 2.229 = %21,3100**
- Kalan exact: **1.754**
- Atom havuzu: **18.405**
- Son batch: **V74**
- Sonraki batch: **V75**

## V74 — 410 atom
- Integrity: `docs/legal-candidate-teacher-transition-integrity-v74.md` — `81c9f82fed8e133bb5439832fc58c916eef71007`
- Coverage: `docs/legal-article-verified-focused-deepening-batch-400plus-v74.md` — `84a9212daa6b2af47726c175f7c3b597ce974c6f`
- ARTICLE_VERIFIED: `docs/legal-article-verified-batch-v74.md` — `271f5d18f64f4c21eb5002b382ff7ba5337f6f12`
- Progress: `docs/legal-verification-progress-v74-delta.json` — `9af39a6d5204961d7742f12d262964eb937bdacc`
- Support atoms: **410**, pool **17.995 -> 18.405**.
- ARTICLE_VERIFIED: **474 -> 475**, delta **+1**.

### V74 Aday Öğretmenlik findings
- `HB-1633` ARTICLE_VERIFIED +1: 21.12.2024 / 32759 current Regulation Md6/1 + Md8/2-a requires education institution principal to assign advisor teacher in first five workdays; same-field selection is primary with explicit fallback. Applicability must carry Md5 transition-cohort condition.
- Current Md5 limits this candidate-teacher Yetiştirme Programı regime to persons already candidate teachers on 18.10.2024 and persons employed as candidate/contract teachers from 18.10.2024 until 01.09.2025. Do not generate it unconditionally for every new teacher in 2026.
- `HB-1634..HB-1640`: legacy handbook performance model contains 60-workday threshold, Ek-3 Performance Evaluation Form, three evaluations, inspector role, three-copy Ek-3 and telafi-after-60-day semantics. These are not in the current 2024 Regulation model. Current Md7-9 uses Yetiştirme Programı completion + one-year service; candidacy is removed by governorates. Rewrite/retire/historical snapshot required.
- `HB-1639`: current Md7/4 requires completion of Yetiştirme Programı, but master `(hazırlayıcı ve temel eğitim)` object naming is stale; no exact promotion.
- `HB-1641`: non-teacher candidate personnel is outside candidate-teacher Regulation; route to 657 candidate civil servant training family.
- Current Regulation Md20 explicitly repeals the 12.05.2022 candidate-teacher/career Regulation. Old FAQ/handbook cannot restore superseded actor/form/timing semantics.

## New integrity guards
- `TRANSITIONAL_COHORT_SCOPE_IS_EXACTNESS_FIELD`.
- `LEGACY_PERFORMANCE_FORM_DOES_NOT_SURVIVE_WITHOUT_CURRENT_PROVISION`.
- `OLD_FAQ_OR_HANDBOOK_CANNOT_OVERRIDE_CURRENT_RG`.
- `CANDIDATE_TEACHER_AND_CANDIDATE_CIVIL_SERVANT_ARE_SEPARATE_LEGAL_FAMILIES`.

## Existing high-priority backlog
- HB-1634..1640 candidate-teacher master rewrite/retire/historical snapshot.
- HB-1641 candidate civil-servant exact family.
- HB-1611/1612/1617-1622 strategic-plan/service-standard split/rewrite chains.
- HB-1604..1608 and HB-1597..1603 DÖSE current-system/recipient/provision backlog.
- HB-1483/HB-1484 official OAB exact retry only.
- HB-1655..1665 and HB-1645..1647/HB-1667 school-type split staging.
- HB-1666 universal duty-book parent unresolved.
- HB-2138/HB-2139, HB-2045/HB-2052/HB-2053/HB-0602/HB-0603 semantics/split/exact-parent chains.
- HB-0138/HB-0395 L2 operational only.
- HB-2218/HB-2229 School Health scope.

## V75 priority — 300+ atoms
1. Start `HB-1642+` Ders Programları from exact master text; do not inherit candidate-teacher law.
2. Reconcile OÖKY/OÖİKY and other school-type schedule rules; broad ALL rows require common parent or school-type split.
3. Revisit HB-1645..1647 and HB-1667 staged school-type corrections with current official RG amendment chain before any count.
4. Resolve HB-1641 candidate non-teacher personnel under current official 657 candidate-civil-servant training source if room.
5. Migration **0**, Lovable **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış. Kullanıcı `Devam` dediğinde soru sormadan **V75** başlat; minimum **300 atom** hedefle.
