# Legal Batch V14 — Okul-Aile Birliği + Sosyal Etkinlikler

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Primary / current official sources
- MEB Okul-Aile Birliği Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
- 2023 OAB amendment / MEB General Circular 2024/35 cross-check: https://mevzuat.meb.gov.tr/dosyalar/2191.pdf
- OÖKY Md.215 delegation: https://mevzuat.meb.gov.tr/dosyalar/1657.pdf
- MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği (08.06.2017, RG 30090): https://mevzuat.meb.gov.tr/dosyalar/1850.pdf
- Resmî Gazete publication of current Social Activities Regulation: https://resmigazete.gov.tr/eskiler/2017/06/20170608-5.htm
- OÖKY current cross-reference / Md.115: https://resmigazete.gov.tr/eskiler/2023/09/20230908-2.htm

## Source status rules
- 2005 İlköğretim ve Orta Öğretim Kurumları Sosyal Etkinlikler Yönetmeliği is MÜLGA and blocked for new decisions: https://mevzuat.meb.gov.tr/dosyalar/333.pdf
- Current authority for school social activities is the 2017 Education Institutions Social Activities Regulation and its current amendments.
- OAB operations are delegated by OÖKY Md.215 to the current OAB Regulation.

## A. Okul-Aile Birliği operational atoms (60)

OAB-001 | scope includes MEB schools/educational institutions including campus schools | module=OAB | evidence=school_type | impact=L2
OAB-002 | one school-family association is established for the institution under the Regulation | module=OAB | evidence=association_record | impact=L3
OAB-003 | association purpose is school-family cooperation and contribution to institutional educational aims | evidence=charter/context | impact=L1
OAB-004 | member population is role/type dependent; administrators, teachers and parents are tracked as eligible membership groups | evidence=member_registry | impact=L2
OAB-005 | nonformal-institution member categories remain separately configurable | evidence=member_type | impact=L2
OAB-006 | association organs must be represented as distinct governance entities rather than a single committee | evidence=organ_registry | impact=L3
OAB-007 | general assembly membership/attendance must be recordable | evidence=attendance | impact=L2
OAB-008 | general assembly meeting date must be versioned per academic year | evidence=meeting_instance | impact=L2
OAB-009 | general assembly agenda must be retained | evidence=agenda | impact=L2
OAB-010 | meeting invitation/announcement evidence must be retained | evidence=notice | impact=L2
OAB-011 | general assembly minutes must be retained | evidence=minutes | impact=L3
OAB-012 | election results for association organs must be retained | evidence=election_result | impact=L3
OAB-013 | principal/school administration role and association-organ role must remain distinct in RBAC | evidence=role_assignment | impact=L3
OAB-014 | executive-board membership must be versioned by term | evidence=board_term | impact=L3
OAB-015 | supervisory/audit organ membership must be versioned by term | evidence=audit_term | impact=L3
OAB-016 | vacancies/replacement members require traceable succession | evidence=membership_change | impact=L2
OAB-017 | decisions require numbered decision records | evidence=decision_no | impact=L3
OAB-018 | decision date and voting/approval evidence are immutable after execution | evidence=decision_log | impact=L3
OAB-019 | association can support educational quality/efficiency within legal purpose | evidence=activity | impact=L1
OAB-020 | association may support compulsory needs of financially disadvantaged students under legal conditions | evidence=need/support record | impact=L2
OAB-021 | donations are voluntary; system must not model donation as compulsory fee | evidence=payment_type | impact=L3
OAB-022 | donation acceptance must be separately receipted/accounted | evidence=receipt | impact=L3
OAB-023 | donor/payment source and transaction purpose must be auditable | evidence=ledger | impact=L3
OAB-024 | donations and other association revenues must be held/accounted under applicable association financial rules | evidence=bank/ledger | impact=L3
OAB-025 | cash/bank movement must be traceable to decision or lawful transaction basis | evidence=decision_link | impact=L3
OAB-026 | expenditure must be linked to school/association lawful purposes | evidence=expense_basis | impact=L3
OAB-027 | expenditure evidence/invoice/document must be retained | evidence=expense_doc | impact=L3
OAB-028 | payer/approver roles must be separated where Regulation requires governance separation | evidence=approval_chain | impact=L3
OAB-029 | annual income-expense reporting must be reproducible from ledger | evidence=annual_report | impact=L2
OAB-030 | audit/supervision findings must be retained and linked to corrective actions | evidence=audit_report | impact=L3
OAB-031 | unresolved audit finding blocks silent closure | evidence=corrective_action | impact=L3
OAB-032 | school canteen/buffet/tea room/cafeteria/yemekhane interfaces must be feature-flagged | feature=CANTEEN | impact=L2
OAB-033 | leasing/operation of canteen-like places must not be treated as ordinary donation income | evidence=contract/revenue_type | impact=L3
OAB-034 | canteen-related revenues must be classified separately | evidence=revenue_category | impact=L3
OAB-035 | revenue-distribution percentages must be legal-version parameters, not hardcoded constants | evidence=legal_parameter | impact=L3
OAB-036 | change in distribution percentage applies prospectively according to effective legal version | evidence=version | impact=L3
OAB-037 | completed historical distribution remains immutable | evidence=history | impact=L3
OAB-038 | procurement/purchase on behalf of school requires decision and financial evidence | evidence=purchase_file | impact=L3
OAB-039 | donated in-kind asset must be linked to school asset/intake workflow where applicable | relation=OAB->ASSET | impact=L2
OAB-040 | campaign income must be distinguished from ordinary donations | evidence=campaign_id | impact=L2
OAB-041 | social/cultural activity income must be distinguished from ordinary donations | evidence=activity_id | impact=L2
OAB-042 | course-related material contributions, where lawful, must be separately classified | evidence=course_context | impact=L2
OAB-043 | no OAB financial workflow may override higher-level public financial/procurement law | evidence=authority_hierarchy | impact=L3
OAB-044 | association records require school-year/term context | evidence=year | impact=L2
OAB-045 | association organ signatures must be stored with decision/minute evidence | evidence=signature | impact=L3
OAB-046 | electronic records may supplement/replace paper only where applicable law permits | evidence=record_mode | impact=L2
OAB-047 | OAB personal data access must be role-limited | evidence=ACL | impact=L3
OAB-048 | parent/member contact data use is limited to lawful OAB process | evidence=purpose | impact=L3
OAB-049 | association cannot create compulsory student/parent financial obligation without explicit legal basis | evidence=rule_guard | impact=L3
OAB-050 | school administration and OAB accounts/transactions must remain distinguishable | evidence=account_scope | impact=L3
OAB-051 | bank account changes require traceable authorized decision/process | evidence=bank_change | impact=L3
OAB-052 | financial-document numbering and retention must support later inspection | evidence=document_index | impact=L2
OAB-053 | annual handover between outgoing/incoming boards requires inventory/document/financial handover evidence | evidence=handover | impact=L3
OAB-054 | unresolved receivable/payable/contract items must be included in handover | evidence=handover_balance | impact=L3
OAB-055 | ongoing canteen/lease contracts must be linked to new board term without rewriting original contract history | evidence=contract_link | impact=L2
OAB-056 | 2023 amendment is a legal-version event and must be preserved in source history | evidence=legal_version | impact=L3
OAB-057 | 2024/35 MEB circular is implementation/cross-check guidance, subordinate to Regulation | evidence=source_rank | impact=L2
OAB-058 | OÖKY Md.215 creates explicit OOKY->OAB legal delegation relation | evidence=delegation_link | impact=L3
OAB-059 | source URL, regulation version and effective date are retained with each published OAB rule | evidence=provenance | impact=L3
OAB-060 | final publication requires Super Admin diff/approval; completed historical OAB records never mutate | evidence=publication_state | impact=L3

## B. Social Activities operational atoms (72)

SOC-001 | current authority is MEB Education Institutions Social Activities Regulation dated 08.06.2017 / RG30090 | evidence=source | impact=L3
SOC-002 | regulation applies to official/private formal and nonformal institutions | evidence=school_type | impact=L2
SOC-003 | social activities cover scientific, social, cultural, artistic and sportive fields | evidence=activity_category | impact=L1
SOC-004 | student club and community-service activities are core regulated activity families | evidence=activity_type | impact=L2
SOC-005 | activity must support self-confidence/responsibility and new interest areas | evidence=objective | impact=L1
SOC-006 | national, spiritual, moral, human and cultural values are recognized objectives | evidence=objective | impact=L1
SOC-007 | volunteer participation is without material expectation | evidence=volunteer_status | impact=L2
SOC-008 | volunteers may include parents/persons/universities/institutions/organizations under Regulation definition | evidence=volunteer_type | impact=L2
SOC-009 | volunteer participation must not silently create staff employment status | evidence=role_guard | impact=L3
SOC-010 | adviser teacher assignment is a formal role assignment | evidence=assignment | impact=L3
SOC-011 | adviser teacher carries guidance/advisory/supervision role | evidence=duty | impact=L2
SOC-012 | student club is a persistent school-year entity | evidence=club | impact=L2
SOC-013 | club representative is elected/selected from member students | evidence=representative | impact=L2
SOC-014 | club representative and adviser teacher responsibilities remain distinct | evidence=role_split | impact=L2
SOC-015 | student's chosen/assigned club must be recorded | evidence=club_membership | impact=L2
SOC-016 | club membership changes require history rather than overwrite | evidence=membership_history | impact=L2
SOC-017 | community service is a separate activity type from club work | evidence=activity_type | impact=L2
SOC-018 | community service may address disaster/emergency, environment, education, sport, culture/tourism, health and social-services areas | evidence=service_area | impact=L1
SOC-019 | community-service project/participation must be age/level appropriate | evidence=level_check | impact=L2
SOC-020 | social activities board is created to plan and coordinate activities | evidence=board | impact=L3
SOC-021 | OÖKY Md.115 requires social activities board for club/social responsibility duties | evidence=OOKY115 link | impact=L3
SOC-022 | social responsibility program rules issued by Ministry are separate subordinate implementation rules | evidence=delegated_rule | impact=L2
SOC-023 | social activities board membership must be versioned by school year | evidence=board_term | impact=L2
SOC-024 | board decisions/minutes must be retained | evidence=minutes | impact=L3
SOC-025 | annual social-activity planning requires traceable plan | evidence=annual_plan | impact=L2
SOC-026 | activities must consider student interests, wishes, talents and needs | evidence=student_interest | impact=L1
SOC-027 | environmental/local opportunities and conditions are planning inputs | evidence=context | impact=L1
SOC-028 | broad participation should be supported | evidence=participation | impact=L1
SOC-029 | students with disabilities must be enabled to participate according to interests/wishes | evidence=accommodation | impact=L3
SOC-030 | required accessibility/accommodation links to SPED/BEP where applicable | relation=SOC->SPED | impact=L2
SOC-031 | activities may be planned for out-of-class time | evidence=schedule | impact=L2
SOC-032 | class schedule/teaching program must be considered when planning | evidence=conflict_check | impact=L2
SOC-033 | social activity may be school-internal or external | evidence=location_scope | impact=L2
SOC-034 | activities can include collaboration with other schools/institutions | evidence=partner | impact=L2
SOC-035 | domestic/foreign school collaboration requires appropriate authorization where applicable | evidence=approval | impact=L3
SOC-036 | event location/date/time must be recorded | evidence=event_instance | impact=L2
SOC-037 | participating students must be identifiable | evidence=participant_list | impact=L2
SOC-038 | responsible adviser/supervising staff must be identifiable | evidence=responsible_role | impact=L3
SOC-039 | parent consent must be captured where required for off-campus/travel/student-specific participation | evidence=consent | impact=L3
SOC-040 | health/safety risks require pre-event risk/precaution evidence where applicable | evidence=risk_plan | impact=L3
SOC-041 | travel/gezi activity must link to the relevant permission workflow | relation=SOC->TRIP_PERMISSION | impact=L3
SOC-042 | event participation/achievement documents may be recorded in Social Activities Module | evidence=module_record | impact=L2
SOC-043 | Social Activities Module is within e-Okul and stores club/community-service/activity/document data | evidence=eokul_sync | impact=L3
SOC-044 | module entry must identify student + activity + year | evidence=unique_context | impact=L3
SOC-045 | activity documents/certificates must be versioned and traceable | evidence=certificate | impact=L2
SOC-046 | student's social-activity file is a persistent evidence container | evidence=social_file | impact=L2
SOC-047 | evidence uploaded to social-activity file must retain provenance | evidence=source_metadata | impact=L2
SOC-048 | activity cancellation must be recorded rather than deleting planned instance | evidence=status | impact=L2
SOC-049 | postponed activity keeps original planning history | evidence=reschedule_history | impact=L2
SOC-050 | adviser change must not rewrite historical responsibility | evidence=assignment_history | impact=L2
SOC-051 | volunteer contributions must be associated with specific activity/project | evidence=volunteer_activity_link | impact=L2
SOC-052 | volunteers' access to student data must be minimum/authorized | evidence=ACL | impact=L3
SOC-053 | student photographs/media consent and publication rights require separate lawful basis | evidence=media_consent | impact=L3
SOC-054 | sponsorship/donation does not convert sponsor into school decision authority | evidence=role_guard | impact=L3
SOC-055 | social activity income/expense, if any, must link to OAB/public-finance workflow rather than informal cash handling | relation=SOC->OAB | impact=L3
SOC-056 | competitions require separate event category and result records | evidence=competition_result | impact=L2
SOC-057 | exhibitions/concerts/panels/seminars/festivals/sport events can be represented under common event model | evidence=event_category | impact=L1
SOC-058 | event category may trigger additional legal requirements without duplicating core activity | evidence=related_workflow | impact=L2
SOC-059 | external venue activity requires venue/permission evidence where required | evidence=venue_approval | impact=L3
SOC-060 | out-of-province/abroad activities require higher authorization route where applicable | evidence=approval_route | impact=L3
SOC-061 | participation absence/leave status must integrate with attendance rules where applicable | relation=SOC->ATTENDANCE | impact=L2
SOC-062 | activity must not silently excuse absence unless relevant regulation/approval does so | evidence=leave_basis | impact=L3
SOC-063 | student achievement/participation data may feed guidance/student profile but not automated diagnosis | relation=SOC->GUIDANCE | impact=L2
SOC-064 | school-year end social-activity records remain historical/immutable | evidence=year_snapshot | impact=L3
SOC-065 | next-year club/activity plan is a new version, not mutation of previous year | evidence=plan_version | impact=L2
SOC-066 | current 2017 regulation supersedes and blocks the 2005 repealed regulation for new workflows | evidence=source_status | impact=L3
SOC-067 | source authority order: current Regulation > Ministry implementation rules/guides > institutional plan | evidence=source_rank | impact=L3
SOC-068 | OÖKY 2023 amendment linking Md.115 is retained as cross-regulation provenance | evidence=legal_link | impact=L3
SOC-069 | each published social-activity rule stores source URL + article/paragraph when available + effective-version snapshot | evidence=provenance | impact=L3
SOC-070 | annual/tenant configuration can narrow activity plan but cannot override Regulation | evidence=tenant_override_guard | impact=L3
SOC-071 | unresolved exact clause mapping remains STAGING and is flagged for final legal pass | evidence=article_ref_status | impact=L3
SOC-072 | final publication is STAGING->DIFF->SUPERADMIN->PUBLISHED and applies to future/pending instances only | evidence=publication_state | impact=L3

## Counts
- OAB atoms: 60
- Social activities atoms: 72
- Total atomized: 132
- New operational/source atoms: 132
- ARTICLE_VERIFIED increment: 0
- Migration count: 0

## Final-pass flags
- OAB exact paragraph mapping for financial percentages/election/quorum details will be rechecked against the current consolidated regulation and 01.12.2023 amendment before final publication.
- Social Activities exact article/paragraph mapping will be rechecked against the current consolidated 2017 Regulation and amendments.
- 2005 Social Activities Regulation is explicitly blocked as MÜLGA.
- No atom in this staging file should increase the 2,229 master ARTICLE_VERIFIED count without exact workflow_id binding.