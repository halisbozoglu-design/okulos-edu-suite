# V61 — Official-source integrity audit

Date: 2026-08-29
Rule: exact verification uses only official sources approved by project policy: mevzuat.gov.tr, mevzuat.meb.gov.tr, meb.gov.tr official units, resmigazete.gov.tr. Secondary legal aggregators and school-site copies are excluded from ARTICLE_VERIFIED decisions.

## HB-1570 — NEW exact
Master action: taşımalı gelen öğrencilerin geliş ve gidiş saatine göre ders programının düzenlenmesi.
Official authority: Resmî Gazete 01.08.2024 / 32619, Millî Eğitim Bakanlığı Taşıma Yoluyla Eğitime Erişim Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik, amended Md13/1-ç.
Exact duty: taşıma hizmetinden faydalanacak öğrencilerin geliş-gidişlerine göre haftalık ders dağıtım ve günlük vakit çizelgesinin düzenlenmesini sağlamak.
Status: ARTICLE_VERIFIED_NEW.
Delta: +1.
Applicability: only transport-center school/institution and covered transport scheme school types; master ALL tag must be filtered by legal_applicability, as already used in Batch08.

## HB-1571 / HB-1572 — retained
HB-1571 remains exact under current Md13/1-e: healthy, safe and orderly lunch measures plus daily contract compliance control.
HB-1572 remains exact under current Md13/1-h: daily control/follow-up of contractor, drivers and guide personnel against School Service Vehicles Regulation, transport regulation and contract.
No duplicate delta.

## HB-1667 — rollback + school-type split
Master action: öğle arasında yapılan nöbet görevinin, nöbetçi müdür yardımcısı ve öğretmenlerin temel ihtiyaçları gözetilerek okul müdürü tarafından dönüşümlü ve dengeli düzenlenmesi.
Batch02 counted source was OÖİKY Md90/2; this is plainly unrelated.
Official current secondary authority: OÖKY Md91/2-i, inserted by RG 08.09.2023 / 32303: in single-shift schools lunch-period duty is arranged by principal rotationally and evenly considering basic needs of duty vice principal and teachers.
Official primary/lower-secondary authority is a distinct OÖİKY Md44 duty regime; the 2019 amendment has a similar but not identical lunch-duty rule, and the consolidated MEB text is institution-specific.
Because durable master scope is ALL and one universal exact parent does not cover all school/institution types, whole-row exactness fails.
Status: ROLLBACK_ARTICLE_VERIFIED + SCHOOL_TYPE_SPLIT_REQUIRED.
Delta: -1.

## HB-1483 / HB-1484 — official-source hold
Master actions:
- HB-1483: management and audit board reports discussed in General Assembly and discharged.
- HB-1484: revenues collected in bank account opened in name of the association.
MEB General Circular 2024/35 confirms the 2012 School-Family Association Regulation remains the governing instrument and notes the 01.12.2023 amendment.
The official MEB regulation PDF endpoint returned 404 during this pass, so exact article text was not promoted from secondary mirrors. Official MEB handbook evidence may be retained as L2 operational corroboration only.
Status: CURRENT_AUTHORITY_CONFIRMED + EXACT_PROVISION_RETRY_REQUIRED.
No counter delta.

## Source discipline
- Official MEB handbook is not sufficient for ARTICLE_VERIFIED where the governing regulation article cannot be read from an official current source.
- Search-engine snippets from non-official domains are not accepted.
- If the official consolidated PDF is stale but a newer Resmî Gazete amendment exists, the amendment chain controls current effect.
