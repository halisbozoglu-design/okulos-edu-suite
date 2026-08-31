# V79 — MTAL Alan/Dal Geçişi Integrity

Tarih: 2026-08-31
Migration: 0
Lovable: 0

## Resmî parent
Current MEB consolidated OÖKY, Md25, Md26, Md31. Exact parent: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf

## Sonuçlar
- HB-1701: LEGACY_TIMING_MISMATCH. Master `alan seçimi 9. sınıfta, dal seçimi 10. sınıfın başında`; current Md31/1 Anadolu meslek programlarında alan seçimini 9. sınıf sonunda, Anadolu teknik/meslek programlarında dala yerleştirmeyi 10. sınıf sonunda e-Okul üzerinden kuruyor. Rewrite required.
- HB-1702: current Md31/2-a `tercih ve puan üstünlüğü` atomunu destekliyor; ayrıca e-Okul ve puan formülü var. Existing workflow metadata/scope exactness publication recheck before count.
- HB-1703: master sentence is source-truncated and timing-stale (`10. sınıfın başında`). Current Md31/2-b uses 10. sınıf sonunda + ability/success + sector need + student/parent requests + group counts + school directorate. MALFORMED_MASTER + TIMING_MISMATCH; rewrite.
- HB-1704: current Md31/3 exact thresholds: Anadolu teknik/meslek programs; minimum 10 students for field and 8 for branch, repeaters included. Text-level exact candidate; school-type/program metadata must be narrowed before ARTICLE_VERIFIED.
- HB-1705: current Md31/4 supports special-education field/branch orientation using ability, health/disability characteristics, BEP unit proposal and placement/transfer commission decision. Master is broader/generic and also says `programına`; criteria/actor/decision atoms missing. WITHHELD_SEMANTIC_BROADENING.
- HB-1706: current Md31/5 supports parent-owned operating workplace route only in Anadolu meslek programs, with business/profession documented by relevant professional bodies and request condition. Master omits explicit Anadolu meslek program scope; scope correction required before count.
- HB-1707: current Md25/1-b says 34 is the norm for listed non-central programs and may increase to 40 under density/mandatory conditions. Master says `34'ü geçmemiştir`; this converts default into absolute maximum. PARAMETER_SEMANTIC_MISMATCH.
- HB-1708: current Md25/1-ç exactly supports MESEM quota determination from enterprise-reported trainee numbers by field/branch and quota-independent registration for student-found enterprise with director approval. Text-level exact candidate; institution metadata must be MESEM-only before promotion.
- HB-1709: current Md26/2 routes class group formation to Norm Kadro Regulation. Generic compliance statement exists but exact executable actor/threshold lives in referenced regulation; ARTICLE_VERIFIED withheld pending exact downstream norm provision.
- HB-1710: master explicitly references Mesleki Açık Öğretim Lisesi Yönetmeliği. Current authority/status and exact group-number provision must be revalidated; no inheritance from OÖKY.

## Guards
- FIELD_SELECTION_GRADE_AND_TERM_ARE_EXACTNESS_FIELDS
- DEFAULT_BRANCH_SIZE_IS_NOT_ABSOLUTE_MAXIMUM
- ANADOLU_MESLEK_PROGRAM_SCOPE_CANNOT_BE_DROPPED
- TEXT_EXACT_BUT_METADATA_BROAD_REQUIRES_SCOPE_PUBLISH_BEFORE_COUNT
- REFERENCED_REGULATION_REQUIRES_DOWNSTREAM_EXACT_PROVISION
- SOURCE_TRUNCATED_MASTER_REQUIRES_REWRITE

ARTICLE_VERIFIED delta: 0.
