# Legal Fast Batch V15 — Kantin/Hijyen + Yangın/Acil Durum + İSG + Taşınır

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: fast >=100-atom coverage; global exact-clause/correctness/missing/duplicate audit deferred to final pass.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Official / primary-or-authoritative sources kept with provenance
- MEB Genelge 2020/8 — Okul Kantinlerinde Satılacak Gıdalar ve Eğitim Kurumlarındaki Gıda İşletmelerinin Hijyen Yönünden Denetlenmesi: https://mevzuat.meb.gov.tr/dosyalar/2050.pdf
- Tarım ve Orman Bakanlığı — Okul Kantinlerine Yönelik Resmî Kontrol ve Öğrenci Eğitim Çalışmaları: https://www.tarimorman.gov.tr/GKGM/Belgeler/DB_Gida_Kont/Okul_Kantinleri_Resmi_Kontrol.pdf
- Tarım ve Orman Bakanlığı — Okul Kantinlerine Dair Özel Hijyen Kılavuzu: https://www.tarimorman.gov.tr/GKGM/Belgeler/Uretici_Bilgi_Kosesi/Egitim/Hijyen_Kilavuz/okul_kantin_hijyen_kilavuzu.pdf
- ÇŞİDB — Binaların Yangından Korunması Hakkında Yönetmelik Kılavuzu (2024, mevzuata yardımcı resmî kaynak; yönetmelik üstün): https://webdosya.csb.gov.tr/db/meslekihizmetler/haberler/b-nalarin-yangin-korunmasi-hakkinda-yonetmel-k-28.03.2025-etk-les-m-20250328093036.pdf
- 6331 sayılı İş Sağlığı ve Güvenliği Kanunu (current primary law, final pass exact clause binding): https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf
- HMB Muhasebat — current Taşınır Mal Yönetmeliği publication/current-regulation index: https://muhasebat.hmb.gov.tr/yonetmelikler
- HMB Muhasebat — 2024 Taşınır Mal Yönetmeliği publication notice: https://muhasebat.hmb.gov.tr/haberler/tasinir-mal-yonetmeligi-resmi-gazetede-yayimlandi
- Resmî Gazete 10.10.2024 / 32688 — current Taşınır Mal Yönetmeliği: https://www.resmigazete.gov.tr/eskiler/2024/10/20241010-19.pdf
- OÖKY current source/cross-link: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf

## Authority/source notes
- MEB 2007 kantin genelgesi is MÜLGA_SOURCE_BLOCK for new decisions; 2020/8 is the active MEB operational circular used here.
- Tarım Bakanlığı hijyen kılavuzu is guidance/cross-check below regulation; it cannot override current regulation.
- ÇŞİDB fire guide is implementation guidance; Binaların Yangından Korunması Hakkında Yönetmelik is authority.
- 28.12.2006-era Taşınır Mal Yönetmeliği is REPEALED_SOURCE_BLOCK; current authority is 2024 regulation (RG 32688).
- Exact article/paragraph binding for atoms sourced through a circular/official guide is retained for final audit where not directly encoded below.

## A. Kantin / gıda / hijyen atoms (32)
K01 | CANTEEN | school food businesses include canteen/cafeteria/buffet/tea-room/yemekhane interfaces | source=MEB-2020/8 | evidence=business_type | impact=L2
K02 | CANTEEN | school administration maintains current food-business/operator identity | source=MEB-2020/8 | evidence=operator_registry | impact=L3
K03 | CANTEEN | food business must be subject to applicable registration/approval regime | source=MEB-2020/8 | evidence=registration_certificate | impact=L3
K04 | CANTEEN | food sold must comply with current school-food restrictions | source=MEB-2020/8 | evidence=product_checklist | impact=L3
K05 | CANTEEN | prohibited/noncompliant products must be blocked from sale | source=MEB-2020/8 | evidence=inspection_action | impact=L3
K06 | CANTEEN | expired products must not be sold/served | source=MEB-2020/8 | evidence=expiry_check | impact=L3
K07 | CANTEEN | product label/traceability information must remain inspectable | source=MEB-2020/8 | evidence=label_check | impact=L2
K08 | CANTEEN | storage conditions must protect food safety | source=MEB-2020/8+Tarim-guide | evidence=storage_check | impact=L3
K09 | CANTEEN | cold-chain products require appropriate temperature control | source=Tarim-guide | evidence=temperature_log | impact=L3
K10 | CANTEEN | raw/ready-to-eat cross-contamination risks must be controlled | source=Tarim-guide | evidence=hygiene_check | impact=L3
K11 | CANTEEN | food-contact surfaces must be cleanable and hygienically maintained | source=Tarim-guide | evidence=surface_check | impact=L3
K12 | CANTEEN | potable hot/cold water availability is a hygiene control | source=Tarim-guide | evidence=water_check | impact=L3
K13 | CANTEEN | hand-washing facilities must be suitable and supplied | source=Tarim-guide | evidence=handwash_check | impact=L3
K14 | CANTEEN | separate hygiene controls for dishwashing/food-prep areas are tracked | source=Tarim-guide | evidence=facility_check | impact=L2
K15 | CANTEEN | ventilation/odour/smoke controls must be suitable | source=Tarim-guide | evidence=ventilation_check | impact=L2
K16 | CANTEEN | floors/walls/ceilings must permit hygienic cleaning and maintenance | source=Tarim-guide | evidence=facility_check | impact=L2
K17 | CANTEEN | pest risks require preventive/control measures | source=Tarim-guide | evidence=pest_control | impact=L3
K18 | CANTEEN | waste must be collected/removed without contaminating food areas | source=Tarim-guide | evidence=waste_check | impact=L3
K19 | CANTEEN | chemicals/cleaning materials are kept separate from food | source=Tarim-guide | evidence=chemical_storage | impact=L3
K20 | CANTEEN | personnel hygiene status/training is a mandatory compliance item | source=MEB-2020/8+Tarim-control | evidence=training_record | impact=L3
K21 | CANTEEN | personnel requiring hygiene education must have evidence of education | source=MEB-2020/8 | evidence=hygiene_training | impact=L3
K22 | CANTEEN | personal protective/hygienic clothing requirements are tracked | source=Tarim-guide | evidence=personnel_check | impact=L2
K23 | CANTEEN | illness/contamination risk in food handler triggers work restriction/referral workflow | source=Tarim-guide | evidence=incident_record | impact=L3
K24 | CANTEEN | school food premises are subject to official controls | source=Tarim-control | evidence=inspection_report | impact=L3
K25 | CANTEEN | Tarım ve Orman control programme targets at least one inspection each semester / twice yearly | source=Tarim-control | evidence=inspection_dates | impact=L2
K26 | CANTEEN | inspection nonconformity creates corrective-action task | source=MEB-2020/8 | evidence=CAPA | impact=L3
K27 | CANTEEN | critical food-safety nonconformity can trigger immediate sale/use block | source=MEB-2020/8 | evidence=block_action | impact=L3
K28 | CANTEEN | food poisoning/suspected outbreak creates incident-notification workflow | source=MEB-2020/8 | evidence=incident_notice | impact=L3
K29 | CANTEEN | canteen hygiene evidence is linked to OAB/operator contract but food law controls remain independent | source=MEB-2020/8+OAB-link | evidence=relation | impact=L2
K30 | CANTEEN | inspection history is immutable and linked to operator/time period | source=systemization | evidence=audit_history | impact=L3
K31 | CANTEEN | annual/school-year product circulars or lists are versioned child sources, not hard-coded constants | source=MEB-2020/8 | evidence=legal_snapshot | impact=L2
K32 | CANTEEN | repealed 2007 MEB canteen circular cannot be active authority for new workflow | source=MEB-source-status | evidence=source_status | impact=L3

## B. Yangın / acil durum atoms (32)
F01 | FIRE | school buildings are within fire-regulation compliance scope | source=BYKHY-guide/regulation | evidence=facility_scope | impact=L3
F02 | FIRE | fire-risk controls apply to design/use/maintenance/operation lifecycle | source=BYKHY-guide | evidence=facility_controls | impact=L3
F03 | FIRE | emergency/evacuation planning is maintained for building use | source=BYKHY-guide | evidence=emergency_plan | impact=L3
F04 | FIRE | evacuation routes must remain usable/unobstructed | source=BYKHY-guide | evidence=route_check | impact=L3
F05 | FIRE | exits must not be locked/blocked contrary to safe egress | source=BYKHY-guide | evidence=exit_check | impact=L3
F06 | FIRE | fire doors/fire-resistant separations are not disabled by ordinary use | source=BYKHY-guide | evidence=door_check | impact=L3
F07 | FIRE | emergency-exit signs must remain visible/functional | source=BYKHY-guide | evidence=sign_check | impact=L2
F08 | FIRE | emergency lighting is checked where required | source=BYKHY-guide | evidence=lighting_check | impact=L3
F09 | FIRE | fire extinguishers are mapped by location/type | source=BYKHY-guide | evidence=extinguisher_registry | impact=L2
F10 | FIRE | extinguishers require periodic inspection/maintenance evidence | source=BYKHY-guide | evidence=maintenance_record | impact=L3
F11 | FIRE | fire detection/alarm systems are maintained where required | source=BYKHY-guide | evidence=alarm_test | impact=L3
F12 | FIRE | alarm faults create corrective-action workflow | source=BYKHY-guide | evidence=CAPA | impact=L3
F13 | FIRE | electrical/fire-risk technical rooms require access/control discipline | source=BYKHY-guide | evidence=room_check | impact=L3
F14 | FIRE | combustible storage near ignition/escape routes is controlled | source=BYKHY-guide | evidence=storage_check | impact=L3
F15 | FIRE | boiler/fuel/gas areas require applicable fire-safety controls | source=BYKHY-guide | evidence=technical_check | impact=L3
F16 | FIRE | hot-work/maintenance fire risk requires controlled authorization where relevant | source=BYKHY-guide | evidence=work_permit | impact=L3
F17 | FIRE | school fire safety responsibilities are role-based, not person-hardcoded | source=systemization | evidence=role_assignment | impact=L2
F18 | FIRE | emergency teams/members and duties are versioned per school-year/personnel period | source=emergency-interface | evidence=team_registry | impact=L2
F19 | FIRE | evacuation plan keeps floor/route/assembly-point evidence | source=emergency-interface | evidence=plan_attachment | impact=L3
F20 | FIRE | students/personnel requiring assisted evacuation are represented in plan | source=accessibility+emergency | evidence=assistance_plan | impact=L3
F21 | FIRE | emergency assembly area is defined and kept available | source=emergency-interface | evidence=assembly_point | impact=L2
F22 | FIRE | fire incident creates immediate response + notification + evidence workflow | source=BYKHY-guide | evidence=incident_record | impact=L3
F23 | FIRE | post-incident damage/risk blocks unsafe re-use until authorized | source=BYKHY-guide | evidence=closure_status | impact=L3
F24 | FIRE | drills retain date, scenario, participants, observations and corrective actions | source=emergency-interface | evidence=drill_report | impact=L2
F25 | FIRE | periodic drill/calendar rules are versioned from current applicable regulation/circular | source=systemization | evidence=calendar_rule | impact=L2
F26 | FIRE | fire-safety inspection finding is linked to corrective action and responsible role | source=BYKHY-guide | evidence=finding_link | impact=L3
F27 | FIRE | overdue high-risk finding triggers escalation | source=systemization | evidence=escalation | impact=L3
F28 | FIRE | fire equipment maintenance certificates/reports are document evidence | source=BYKHY-guide | evidence=document | impact=L2
F29 | FIRE | renovation/use change triggers re-evaluation of fire controls | source=BYKHY-guide | evidence=change_review | impact=L3
F30 | FIRE | fire-regulation source version is retained with each compliance snapshot | source=legal-engine | evidence=legal_snapshot | impact=L2
F31 | FIRE | CSB guide is guidance only and cannot override current fire regulation | source=CSB-guide | evidence=authority_level | impact=L3
F32 | FIRE | final audit must bind applicable exact fire-regulation article/paragraph to each facility-specific atom before ARTICLE_VERIFIED | source=verification-policy | evidence=article_ref | impact=L3

## C. İş sağlığı ve güvenliği / school safety atoms (30)
O01 | OHS | school/public workplace OHS obligations are represented under 6331 applicability | source=6331 | evidence=scope | impact=L3
O02 | OHS | employer/administration has duty to ensure employee health and safety | source=6331 | evidence=duty_owner | impact=L3
O03 | OHS | risk assessment is a living controlled record | source=6331 | evidence=risk_assessment | impact=L3
O04 | OHS | hazards must be identified before risk scoring/control | source=6331 | evidence=hazard_registry | impact=L3
O05 | OHS | risk-control hierarchy is tracked rather than only recording risk score | source=6331 | evidence=control_plan | impact=L3
O06 | OHS | preventive/protective measures create responsible/deadline/evidence tasks | source=6331 | evidence=action_plan | impact=L3
O07 | OHS | work accident creates registration/investigation/notification workflow | source=6331 | evidence=accident_record | impact=L3
O08 | OHS | occupational-disease suspicion/notification is a distinct workflow | source=6331 | evidence=health_notice | impact=L3
O09 | OHS | near-miss events are recorded for preventive action | source=OHS-practice/current-framework | evidence=near_miss | impact=L2
O10 | OHS | employee OHS training is tracked by role/risk/task | source=6331 | evidence=training | impact=L3
O11 | OHS | required training validity/completion is checked before hazardous assignment | source=6331 | evidence=qualification_gate | impact=L3
O12 | OHS | employee information/instruction duties are evidence-linked | source=6331 | evidence=briefing_record | impact=L2
O13 | OHS | emergency preparedness links OHS risk data to emergency module | source=6331 | evidence=emergency_link | impact=L3
O14 | OHS | first-aid/fire/evacuation assignments are role/team records | source=6331-interface | evidence=team_assignment | impact=L3
O15 | OHS | workplace equipment periodic-control due dates are versioned | source=OHS-framework | evidence=periodic_control | impact=L3
O16 | OHS | expired mandatory equipment inspection can block equipment use | source=OHS-framework | evidence=use_block | impact=L3
O17 | OHS | electrical installations/panels are included in safety-control register | source=OHS-framework | evidence=electrical_check | impact=L3
O18 | OHS | lifting/elevator/pressure systems are tracked by applicable periodic-control family | source=OHS-framework | evidence=equipment_registry | impact=L3
O19 | OHS | laboratory/workshop machinery risk controls link to asset and facility records | source=OHS+OOKY-interface | evidence=asset_risk_link | impact=L3
O20 | OHS | chemical/SDS-related controls link substance inventory and training | source=OHS-framework | evidence=chemical_registry | impact=L3
O21 | OHS | PPE requirement is task/risk based | source=6331 | evidence=PPE_assignment | impact=L3
O22 | OHS | PPE issuance/availability is evidence, not merely a policy note | source=6331 | evidence=PPE_record | impact=L2
O23 | OHS | unsafe condition report creates corrective task without deleting original report | source=6331-systemization | evidence=report+Capa | impact=L3
O24 | OHS | serious/imminent danger requires escalation and protective action workflow | source=6331 | evidence=urgent_action | impact=L3
O25 | OHS | contractor/third-party work must be included in site safety coordination where applicable | source=6331 | evidence=contractor_coordination | impact=L3
O26 | OHS | employee participation/consultation evidence is retained where required | source=6331 | evidence=minutes | impact=L2
O27 | OHS | OHS committee/team conditions depend on applicable statutory thresholds/conditions; values are not hard-coded globally | source=6331+secondary-regs | evidence=condition_rule | impact=L3
O28 | OHS | risk assessment revision trigger includes material change/incident/new hazard where applicable | source=OHS-framework | evidence=revision_trigger | impact=L3
O29 | OHS | completed historical risk assessments remain immutable snapshots | source=legal-engine | evidence=history | impact=L2
O30 | OHS | exact secondary-regulation clause/schedule frequencies remain FINAL_AUDIT_REQUIRED rather than guessed | source=verification-policy | evidence=article_ref_status | impact=L3

## D. Taşınır / asset-management atoms (30)
T01 | ASSET | current authority is 2024 Taşınır Mal Yönetmeliği / RG 32688 | source=HMB+RG | evidence=source_status | impact=L3
T02 | ASSET | 2006/11545-era Taşınır Mal Yönetmeliği is blocked as repealed for new decisions | source=HMB-publication | evidence=source_status | impact=L3
T03 | ASSET | asset processes are maintained electronically where the current system/regulation requires | source=TMY-2024 | evidence=system_record | impact=L3
T04 | ASSET | acquisition creates a traceable asset-entry transaction | source=TMY-2024 | evidence=Varlik_Islem_Fisi | impact=L3
T05 | ASSET | Varlık İşlem Fişi replaces legacy Taşınır İşlem Fişi terminology/workflow under current regulation | source=HMB-publication | evidence=document_type | impact=L3
T06 | ASSET | asset classification uses current taşınır code/account structure | source=TMY-2024 | evidence=asset_code | impact=L3
T07 | ASSET | quantity/value/unit information is preserved at acquisition | source=TMY-2024 | evidence=transaction | impact=L2
T08 | ASSET | donation/grant entry is distinguished from purchase entry | source=TMY-2024 | evidence=acquisition_type | impact=L2
T09 | ASSET | transfer-in and transfer-out are linked transactions | source=TMY-2024 | evidence=transfer_pair | impact=L3
T10 | ASSET | issue-to-use/consumption is distinguished from custody/assignment | source=TMY-2024 | evidence=transaction_type | impact=L3
T11 | ASSET | durable asset assignment links asset to responsible user/location | source=TMY-2024 | evidence=assignment | impact=L3
T12 | ASSET | responsible-user/location changes retain transaction history | source=TMY-2024 | evidence=history | impact=L2
T13 | ASSET | asset return closes assignment without deleting prior custody history | source=TMY-2024 | evidence=return_record | impact=L2
T14 | ASSET | surplus/unused asset status is represented separately from disposal | source=TMY-2024 | evidence=status | impact=L2
T15 | ASSET | transfer/disposal requires authorized process and evidence | source=TMY-2024 | evidence=approval | impact=L3
T16 | ASSET | loss/damage/shortage creates incident/accountability workflow | source=TMY-2024 | evidence=incident | impact=L3
T17 | ASSET | count/inventory results are reconciled with records | source=TMY-2024 | evidence=count_report | impact=L3
T18 | ASSET | inventory differences create correction/investigation evidence rather than silent data edit | source=TMY-2024 | evidence=reconciliation | impact=L3
T19 | ASSET | usable/non-usable condition is retained as asset state | source=TMY-2024 | evidence=condition | impact=L2
T20 | ASSET | maintenance/repair history may be linked to durable asset without changing original acquisition history | source=systemization | evidence=maintenance_link | impact=L2
T21 | ASSET | asset-management roles are defined by duty/authority before named person assignment | source=TMY-2024-systemization | evidence=role_assignment | impact=L3
T22 | ASSET | separation of recording/control/accountability roles is retained where required | source=TMY-2024 | evidence=role_matrix | impact=L3
T23 | ASSET | handover on personnel/role change requires documented devir-teslim | source=TMY-2024 | evidence=handover | impact=L3
T24 | ASSET | school/tenant asset records retain owning administration/unit | source=TMY-2024 | evidence=owner_unit | impact=L3
T25 | ASSET | asset transaction cannot be backdated/altered silently after finalization | source=accountability-engine | evidence=audit_log | impact=L3
T26 | ASSET | financial/accounting integration retains transaction identifiers | source=TMY-2024 | evidence=accounting_ref | impact=L2
T27 | ASSET | annual/reporting outputs use current regulation formats/data, not repealed legacy forms | source=TMY-2024 | evidence=report_version | impact=L3
T28 | ASSET | regulation/source version is stored on asset-compliance workflow | source=legal-engine | evidence=legal_snapshot | impact=L2
T29 | ASSET | procurement process and asset registration are related but distinct workflows; acquisition approval does not substitute asset-entry evidence | source=TMY-2024+5018-interface | evidence=workflow_relation | impact=L3
T30 | ASSET | exact 2024 article/paragraph/form mapping for every transaction type is retained for final global audit; unresolved mappings do not increase ARTICLE_VERIFIED | source=verification-policy | evidence=article_ref_status | impact=L3

## Counts
- Kantin/hijyen: 32
- Yangın/acil durum: 32
- İSG/safety: 30
- Taşınır/asset: 30
- Total atomized: 124
- ARTICLE_VERIFIED increment: 0
- Migration: 0

## System effects
- Primary modules: CANTEEN, OHS, EMERG, SEC, ASSET, FAC, DOC, LEG, WF.
- Feature filters: `kantin`, `yemekhane`, `atolye_lab`, `kazan_dairesi`, `asansor`, `pansiyon`, `gida_isletmesi`.
- All inspection/report/maintenance records are evidence-linked and immutable after completion.
- High-risk nonconformity can block use/sale/operation pending authorized corrective closure.
- No GPS/mobile-service implementation is included.
- Procurement tender/direct-procurement thresholds and 4734/5018 detailed clauses are intentionally left to the next batch rather than mixed into asset accounting.

## Final audit markers
- Fast-batch atoms sourced from circular/official guidance remain subject to exact current regulation article/paragraph binding.
- Confirm current amendments/consolidated text for fire, school-canteen hygiene, OHS secondary regulations and 2024 TMY.
- Remove/merge duplicate controls discovered across prior OHS/MTAL/facility batches.
- Reject any rule contradicted by higher/current authority.
- Bind to ARTICLE_VERIFIED only with exact legacy workflow_id + current official source + clause.
