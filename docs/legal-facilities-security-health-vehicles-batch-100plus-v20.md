# Legal Fast Batch V20 — Kamu Konutları + Özel Güvenlik + Tütün + Sivil Savunma/Acil Durum + Resmî Taşıtlar

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: prior fast >=100-atom coverage method. Final clause-level correctness/missing/duplicate audit remains deferred until end.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Primary / official sources
- 2946 Kamu Konutları Kanunu — https://www5.tbmm.gov.tr/tutanaklar/KANUNLAR_KARARLAR/kanuntbmmc066/kanunmgkc066/kanunmgkc06602946.pdf
- Kamu Konutları Yönetmeliği — current government implementation source / final article audit deferred
- 5188 Özel Güvenlik Hizmetlerine Dair Kanun — EGM current legislation index: https://www.egm.gov.tr/ozelguvenlik/mevzuat-ozel-guvenlik
- 4207 Tütün Ürünlerinin Zararlarının Önlenmesi ve Kontrolü Hakkında Kanun — https://www.tarimorman.gov.tr/TADAB/Belgeler/Kanunlar/kanun_4207.pdf
- 7126 Sivil Savunma Kanunu / MEB consolidated emergency-legislation bundle — https://edirne.meb.gov.tr/meb_iys_dosyalar/2015_03/31040322_afet_ve_acil_durumlara_iliskin_temel_mevzuat.pdf
- 237 Taşıt Kanunu — TBMM historical official text; current consolidated article audit deferred

## System rules
- Tenant feature filters: `LODGING`, `PRIVATE_SECURITY`, `TOBACCO_CONTROL`, `EMERGENCY`, `OFFICIAL_VEHICLE`.
- School without the feature does not receive operational task instances.
- Legal family provenance and effective-date snapshots remain immutable.
- Variable rents, fuel/maintenance limits and annual fiscal parameters are versioned; no hard-coded annual amounts.
- GPS/mobile transport implementation is excluded from this batch.

## A. Kamu konutları / lojman atoms (31)
A01 | 2946 | institution must determine whether assigned housing is within public-housing scope | impact=L3
A02 | 2946 | housing allocation type must be recorded | impact=L3
A03 | 2946 | service-assigned housing and sıra/tahsisli housing are not merged | impact=L3
A04 | 2946 | allocation authority/commission must be identified | impact=L3
A05 | 2946 | applicant eligibility must be checked before scoring/allocation | impact=L3
A06 | KKY | application date and application evidence are retained | impact=L2
A07 | KKY | spouse/public-housing conflict is checked | impact=L3
A08 | KKY | where one spouse has public housing, duplicate allocation is blocked subject to current regulation | impact=L3
A09 | KKY | service-assigned housing trigger is linked to eligible post/duty | impact=L3
A10 | KKY | sıra allocation uses current scoring criteria, not locally invented ranking | impact=L3
A11 | KKY | score components and evidence are auditable | impact=L3
A12 | KKY | allocation commission decision is required where regulation prescribes commission | impact=L3
A13 | KKY | commission membership/decision date is retained | impact=L2
A14 | KKY | allocation notification is issued to beneficiary | impact=L2
A15 | KKY | occupancy begins only after handover record | impact=L3
A16 | KKY | dwelling inventory/condition is recorded at handover | impact=L3
A17 | KKY | keys and fixture responsibility are tracked | impact=L2
A18 | 2946 | occupancy duration is bounded by current statutory/regulatory rule | impact=L3
A19 | KKY | duty/post change triggers continued-eligibility review | impact=L3
A20 | KKY | retirement/resignation/transfer/death triggers vacation/eligibility workflow where applicable | impact=L3
A21 | KKY | notice-to-vacate has explicit legal basis and date | impact=L3
A22 | KKY | forced vacation/eviction path is not performed without legal preconditions | impact=L3
A23 | 2946 | rent is assessed under current public-housing tariff/rules | impact=L3
A24 | KKY | monthly rent/utility components are separately traceable | impact=L2
A25 | KKY | annual rent/tariff changes are versioned parameters | impact=L2
A26 | KKY | beneficiary-caused damage is separated from ordinary maintenance | impact=L3
A27 | KKY | maintenance/repair responsibility is classified by current rules | impact=L3
A28 | KKY | common-area/service expenses are auditable | impact=L2
A29 | KKY | housing file includes allocation, handover, occupancy and vacation evidence | impact=L3
A30 | KKY | historical allocation decision is immutable after closure | impact=L3
A31 | KKY | final audit binds exact article/paragraph/scoring detail before ARTICLE_VERIFIED | impact=L3

## B. 5188 private-security / access-control atoms (31)
B01 | 5188 | private security is complementary to public security | impact=L2
B02 | 5188 | establishing private security unit/service requires current legal permission path | impact=L3
B03 | 5188 | permanent institutional private-security permission is distinct from event/emergency permission | impact=L3
B04 | 5188 | governor/commission authority route is recorded | impact=L3
B05 | 5188 | outsourced company and in-house unit are separate service models | impact=L3
B06 | 5188 | in-house unit does not bar lawful outsourced support where permitted | impact=L2
B07 | 5188 | maximum guard/weapons/equipment parameters follow authorized decision | impact=L3
B08 | 5188 | physical/electronic security measures can be tied to permission/commission decision | impact=L3
B09 | 5188 | guard identity/eligibility is validated before assignment | impact=L3
B10 | 5188 | private-security identity card status is tracked | impact=L3
B11 | 5188 | expired/suspended authorization blocks assignment | impact=L3
B12 | 5188 | armed/unarmed qualification is explicit | impact=L3
B13 | 5188 | school-specific restriction on armed deployment is checked against current law/permission | impact=L3
B14 | 5188 | duty location and protected area are defined | impact=L3
B15 | 5188 | guard powers are limited to statutory private-security powers | impact=L3
B16 | 5188 | search/control actions are recorded where legally required | impact=L3
B17 | 5188 | found/seized item workflow preserves chain of custody | impact=L3
B18 | 5188 | crime/event escalation to law enforcement is separately logged | impact=L3
B19 | 5188 | detention/hand-over event, when legally available, requires timestamp/evidence | impact=L3
B20 | 5188 | CCTV/access control is not treated as unlimited authority; KVKK link required | impact=L3
B21 | 5188 | visitor-access rules are subordinate to law and school security policy | impact=L2
B22 | 5188 | temporary event security has start/end scope | impact=L2
B23 | 5188 | security company authorization is validated | impact=L3
B24 | 5188 | service contract does not substitute statutory permission/licence | impact=L3
B25 | 5188 | training/certification requirements are tracked | impact=L3
B26 | 5188 | renewal/recertification deadlines create alerts | impact=L2
B27 | 5188 | weapon/equipment custody is inventory-controlled where applicable | impact=L3
B28 | 5188 | inspection findings create corrective-action tasks | impact=L3
B29 | 5188 | incident reports are archived and access-restricted | impact=L3
B30 | 5188 | historical guard assignment/security permission snapshots remain immutable | impact=L3
B31 | 5188 | final audit checks current 2025 amendments before ARTICLE_VERIFIED binding | impact=L3

## C. 4207 tobacco-control / school-health atoms (25)
C01 | 4207 | smoking/tobacco use is prohibited in covered public-service building indoor areas | impact=L3
C02 | 4207 | education-building covered areas are explicit no-use zones | impact=L3
C03 | 4207 | school administration must display required prohibition signage | impact=L3
C04 | 4207 | signage/notice evidence can be periodically checked | impact=L2
C05 | 4207 | tobacco advertising/promotion is prohibited under statutory scope | impact=L3
C06 | 4207 | institution event/sponsorship screening blocks tobacco promotion | impact=L3
C07 | 4207 | free distribution/promotional tobacco activity is blocked | impact=L3
C08 | 4207 | underage/student tobacco exposure is treated as high-risk school-health event | impact=L3
C09 | 4207 | vending/sales compliance around school is routed to competent authority where school lacks enforcement power | impact=L3
C10 | 4207 | school does not invent administrative fine authority beyond law | impact=L3
C11 | 4207 | violation observation creates incident evidence with location/time | impact=L2
C12 | 4207 | responsible enforcement/notification authority is role-routed | impact=L3
C13 | 4207 | employee tobacco violation may have separate HR/discipline implications but is not auto-merged | impact=L3
C14 | 4207 | student tobacco violation is handled under student regulation, not by copying employee sanction | impact=L3
C15 | 4207 | complaint/inspection record is retained | impact=L2
C16 | 4207 | indoor-air compliance is a facility-health control | impact=L2
C17 | 4207 | electronic cigarette/new product classification follows current law, not static product list | impact=L3
C18 | 4207 | tobacco-control education/awareness may be scheduled as preventive task | impact=L1
C19 | 4207 | tobacco-related promotional material is blocked from school channels | impact=L3
C20 | 4207 | school can record referral/counselling without exposing health data to unrelated roles | impact=L3
C21 | 4207 | personal/health data generated by intervention is KVKK-scoped | impact=L3
C22 | 4207 | violation location distinguishes indoor school area from external public-space jurisdiction | impact=L3
C23 | 4207 | repeated incidents can trigger risk-analysis/reporting | impact=L2
C24 | 4207 | completed enforcement/referral evidence remains immutable | impact=L3
C25 | 4207 | final audit verifies current amendment/product scope before ARTICLE_VERIFIED | impact=L3

## D. 7126 / civil-defence and emergency-governance atoms (23)
D01 | 7126 | institution identifies civil-defence/emergency obligations applicable to facility | impact=L3
D02 | 7126 | AFAD/Provincial authority references supersede obsolete Civil Defence General Directorate references where law requires | impact=L3
D03 | 7126 | emergency organization/teams are role-based | impact=L3
D04 | 7126 | team assignments require current personnel | impact=L2
D05 | 7126 | emergency plans are versioned documents | impact=L3
D06 | 7126 | facility-specific risks are attached to plan | impact=L3
D07 | 7126 | evacuation routes and assembly areas are documented | impact=L3
D08 | 7126 | special-needs evacuation support is separately planned | impact=L3
D09 | 7126 | warning/alarm communication methods are documented | impact=L3
D10 | 7126 | emergency contact list is maintained | impact=L2
D11 | 7126 | rescue/fire/first-aid/civil-defence role boundaries are recorded | impact=L2
D12 | 7126 | drills create date, scenario, attendance and evaluation evidence | impact=L3
D13 | 7126 | drill finding creates corrective action | impact=L3
D14 | 7126 | emergency stock/equipment readiness is periodically controlled | impact=L2
D15 | 7126 | shelter/assembly-space feature is tenant/facility conditional | impact=L2
D16 | 7126 | emergency occurrence opens incident-command/event record | impact=L3
D17 | 7126 | authority notifications are timestamped | impact=L3
D18 | 7126 | employee/student accounting after evacuation is evidentiary control | impact=L3
D19 | 7126 | post-event damage/risk assessment is recorded | impact=L2
D20 | 7126 | emergency-plan updates do not overwrite historical drill/incident versions | impact=L3
D21 | 7126 | school plan is linked to fire/OHS plans without duplicating authoritative tasks | impact=L2
D22 | 7126 | obsolete organizational terminology is tagged `SUPERSEDED_REFERENCE` | impact=L3
D23 | 7126 | final audit reconciles current AFAD-era supersession and remaining delegated regulations | impact=L3

## E. 237 official-vehicle atoms (18)
E01 | 237 | determine whether vehicle/use is within Taşıt Kanunu scope | impact=L3
E02 | 237 | official vehicle is linked to owning/allocated institution | impact=L3
E03 | 237 | vehicle acquisition/lease route requires legal-budget authority | impact=L3
E04 | 237 | vehicle use must have official-service purpose | impact=L3
E05 | 237 | personal/private use is blocked unless expressly lawful | impact=L3
E06 | 237 | assignment/görev emri is linked where required | impact=L2
E07 | 237 | authorized driver status is validated | impact=L3
E08 | 237 | vehicle key/document custody is tracked | impact=L2
E09 | 237 | trip/use log preserves date, route/purpose and responsible person | impact=L2
E10 | 237 | fuel consumption/expense is auditable | impact=L2
E11 | 237 | maintenance and repair records are retained | impact=L2
E12 | 237 | inspection/insurance/mandatory vehicle documents create expiry controls | impact=L3
E13 | 237 | accident/incident creates separate damage/insurance/legal workflow | impact=L3
E14 | 237 | disposal/transfer links to current asset-management rules | impact=L3
E15 | 237 | official vehicle asset record links to current 2024 Taşınır regime where applicable | impact=L2
E16 | 237 | annual budget/rate/value constraints are versioned parameters | impact=L2
E17 | 237 | historical vehicle assignment/use records are immutable | impact=L3
E18 | 237 | final audit binds current consolidated articles and implementing circulars before ARTICLE_VERIFIED | impact=L3

## Counts
- public housing: 31
- private security/access: 31
- tobacco control: 25
- civil defence/emergency: 23
- official vehicles: 18
- total atomized: 128
- ARTICLE_VERIFIED increment: 0
- migration: 0

## Final-audit flags
- Resolve exact current Kamu Konutları Yönetmeliği article/score/vacation provisions and rent update source.
- Resolve the latest consolidated 5188 text including 2025 amendments.
- Cross-check 4207 current amendment scope and implementing enforcement rules.
- Reconcile 7126 references with current AFAD legislation and workplace-emergency/fire regulations.
- Bind 237 vehicle rules to current consolidated text and fiscal/asset secondary legislation.
- Deduplicate with existing OHS, emergency, security, asset and personnel workflows before master binding.
