# Legal Deepening V12 — Arşiv + Resmî Yazışma

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-25
Scope: current official archive + official-correspondence rules, plus only directly related school workflow controls.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Primary official sources
- Devlet Arşiv Hizmetleri Hakkında Yönetmelik — 18.10.2019 / RG 30922 — https://www.devletarsivleri.gov.tr/varliklar/dosyalar/mevzuat/arsivhizmetleri.pdf
- Devlet Arşivleri Başkanlığı official publication page — https://www.devletarsivleri.gov.tr/Sayfalar/Haberler/Duyuru.aspx?ID=4164
- Resmî Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik — 10.06.2020 / RG 31151 — https://www.aile.gov.tr/media/49629/resm%C3%AE-yazismalarda-uygulanacak-usul-ve-esaslar-hakkinda-yonetmelik.pdf
- Current-government confirmation page — https://www.hmb.gov.tr/sgb-mevzuat
- MEB current training material quoting current Archive Regulation Md.10 — https://meslek.meb.gov.tr/upload/dersmateryali/pdf/A2025HDEI1004.pdf

## Source hierarchy / blocker policy
1. Current official regulation text is authority.
2. Government training/guidance material is cross-check, not superior authority.
3. 1988 archive regulation and 2015 official-correspondence regulation are REPEALED_SOURCE_BLOCK for new workflows.
4. Exact article/paragraph not directly recovered in this pass is retained with `article_ref_status=FINAL_CROSSCHECK_REQUIRED`; such items are not ARTICLE_VERIFIED.

## A. Archive workflow atoms (62)

A01 | ARCHIVE | protect records from fire | evidence=facility/risk control | impact=L3
A02 | ARCHIVE | protect records from theft | evidence=access/security control | impact=L3
A03 | ARCHIVE | protect records from humidity | evidence=environment check | impact=L2
A04 | ARCHIVE | protect records from heat | evidence=environment check | impact=L2
A05 | ARCHIVE | protect records from water/flood | evidence=facility control | impact=L3
A06 | ARCHIVE | protect electronic records from cyber risk | evidence=IT/security control | impact=L3
A07 | ARCHIVE | preserve records in original order | evidence=classification structure | impact=L2
A08 | ARCHIVE | use institutional file plan | evidence=file plan code | impact=L3
A09 | ARCHIVE-Md10/1 | assign file code from institutional file plan | evidence=file_code | impact=L3
A10 | ARCHIVE-Md10/2 | multi-subject record uses dominant subject file code | evidence=classification decision | impact=L2
A11 | ARCHIVE-Md10/2 | copy may be placed in other relevant file | evidence=cross-reference | impact=L1
A12 | ARCHIVE-Md10/3 | incoming record file code is not automatically reused for reply | evidence=reply classification | impact=L2
A13 | ARCHIVE-Md10/4 | transaction-continuity records cannot receive a different code merely because another code exists | evidence=transaction link | impact=L3
A14 | ARCHIVE-Md10/5 | EBYS file code is mandatory metadata | evidence=metadata validation | impact=L3
A15 | ARCHIVE | maintain retention plans | evidence=retention_plan | impact=L3
A16 | ARCHIVE | retention periods must be versioned | evidence=legal_snapshot | impact=L2
A17 | ARCHIVE | records reaching retention end require disposition review | evidence=review record | impact=L3
A18 | ARCHIVE | archival-value records are not destroyed | evidence=archive-value decision | impact=L3
A19 | ARCHIVE | non-archival records may enter disposal process only after authorized review | evidence=commission decision | impact=L3
A20 | ARCHIVE | disposal is commission-based, not individual-user action | evidence=commission membership | impact=L3
A21 | ARCHIVE | disposal list must identify records sufficiently | evidence=imha_listesi | impact=L3
A22 | ARCHIVE | disposal approval/procedure must be completed before destruction | evidence=approval | impact=L3
A23 | ARCHIVE | electronic destruction must make recovery unauthorized/impracticable per approved method | evidence=destruction log | impact=L3
A24 | ARCHIVE | physical destruction requires controlled method | evidence=destruction log | impact=L3
A25 | ARCHIVE | archival transfer preserves provenance and original order | evidence=transfer list | impact=L3
A26 | ARCHIVE | transfer must have inventory/list evidence | evidence=devir_teslim_listesi | impact=L3
A27 | ARCHIVE | transferred records remain searchable by metadata | evidence=index/catalog | impact=L2
A28 | ARCHIVE | access permissions follow confidentiality classification | evidence=access policy | impact=L3
A29 | ARCHIVE | confidentiality is not removed merely by archival transfer | evidence=classification status | impact=L3
A30 | ARCHIVE | declassification requires authorized action | evidence=declassification approval | impact=L3
A31 | ARCHIVE | backup of electronic records is mandatory operational control | evidence=backup log | impact=L3
A32 | ARCHIVE | disaster recovery for electronic archive must be planned | evidence=DR plan | impact=L3
A33 | ARCHIVE | archive storage locations require physical-security controls | evidence=inspection | impact=L3
A34 | ARCHIVE | archive-location conditions require periodic inspection | evidence=checklist | impact=L2
A35 | ARCHIVE | records must remain accessible throughout retention period | evidence=retrieval test | impact=L3
A36 | ARCHIVE | archive access/action logs should be retained for accountable access | evidence=audit log | impact=L2
A37 | ARCHIVE | institution archive and unit archive roles must be distinguishable | evidence=role assignment | impact=L2
A38 | ARCHIVE | records closed in business process move into filing/archive lifecycle | evidence=closure status | impact=L2
A39 | ARCHIVE | active records must not be prematurely disposed | evidence=business status | impact=L3
A40 | ARCHIVE | legal hold blocks destruction | evidence=hold flag | impact=L3
A41 | ARCHIVE | investigation/litigation records remain protected while needed | evidence=hold reason | impact=L3
A42 | ARCHIVE | personal/sensitive data protection continues in archive | evidence=access controls | impact=L3
A43 | ARCHIVE | duplicate copies may be disposition candidates where original/authentic record is preserved | evidence=duplicate classification | impact=L2
A44 | ARCHIVE | superseded forms/publications may be disposition candidates after required exemplar retention | evidence=sample-retention decision | impact=L2
A45 | ARCHIVE | incomplete/open transactions are not disposal candidates | evidence=status check | impact=L3
A46 | ARCHIVE | records with unresolved audit findings are blocked from disposal | evidence=audit hold | impact=L3
A47 | ARCHIVE | transfer/destruction workflow must capture responsible person/commission | evidence=actor ids | impact=L2
A48 | ARCHIVE | transaction date is retained in archive metadata | evidence=metadata | impact=L2
A49 | ARCHIVE | originating unit is retained in archive metadata | evidence=metadata | impact=L2
A50 | ARCHIVE | record type/subject classification is retained in archive metadata | evidence=metadata | impact=L2
A51 | ARCHIVE | retention trigger date must be explicit | evidence=retention_start | impact=L2
A52 | ARCHIVE | disposition decision must be immutable after execution except corrective record | evidence=immutable audit | impact=L3
A53 | ARCHIVE | executed disposal keeps evidence even though source record is destroyed | evidence=imha record | impact=L3
A54 | ARCHIVE | archive transfer keeps legal snapshot/source basis | evidence=legal_snapshot | impact=L2
A55 | ARCHIVE | change in retention rule applies prospectively unless law requires otherwise | evidence=versioning | impact=L2
A56 | ARCHIVE | historical completed archive actions are immutable | evidence=history | impact=L3
A57 | ARCHIVE | Standart Dosya Planı is a required classification interface | evidence=SDP code | impact=L3
A58 | ARCHIVE | EBYS and archive lifecycle must exchange identifiers without losing original record id | evidence=record_id | impact=L3
A59 | ARCHIVE | original/authentic record must be distinguishable from copy | evidence=record status | impact=L3
A60 | ARCHIVE | archive export/transfer must preserve integrity verification | evidence=hash/signature where applicable | impact=L3
A61 | ARCHIVE | any unresolved exact paragraph mapping stays staging-only | evidence=article_ref_status | impact=L3
A62 | ARCHIVE | repealed 1988 regulation cannot be active authority for a new decision | evidence=source status | impact=L3

## B. Official correspondence workflow atoms (64)

B01 | CORR | all school official correspondence follows current 2020 regulation | evidence=source snapshot | impact=L3
B02 | CORR | electronic and physical correspondence are distinct delivery/signature modes | evidence=mode | impact=L2
B03 | CORR | electronic record uses secure electronic signature where required | evidence=e-signature | impact=L3
B04 | CORR | physical record uses wet signature where electronic path not used/available | evidence=signature | impact=L3
B05 | CORR | document must identify sending administration | evidence=header | impact=L3
B06 | CORR | DETSIS/current institutional identity data must drive sender identity where applicable | evidence=identity mapping | impact=L3
B07 | CORR | every outgoing official document requires a number/record identity | evidence=number | impact=L3
B08 | CORR | file-plan component must be represented in document number/classification | evidence=file code | impact=L3
B09 | CORR | document date is mandatory metadata | evidence=date | impact=L3
B10 | CORR | electronic signature time/date must be preserved | evidence=signature timestamp | impact=L3
B11 | CORR | document subject must be present and concise | evidence=subject | impact=L2
B12 | CORR | addressee/muhatap must be explicit | evidence=recipient | impact=L3
B13 | CORR | prior related correspondence is represented through ilgi/reference section | evidence=reference links | impact=L2
B14 | CORR | body must be clear, concise and grammatically compliant | evidence=content validation/manual review | impact=L1
B15 | CORR | attachment list must match actual attachments | evidence=attachment validation | impact=L3
B16 | CORR | distribution list differentiates action and information recipients where applicable | evidence=distribution | impact=L2
B17 | CORR | signature block must match authorized signatory | evidence=authority check | impact=L3
B18 | CORR | delegated signature requires delegated-authority representation | evidence=delegation record | impact=L3
B19 | CORR | acting/vekil signatory must be validated against current assignment | evidence=assignment | impact=L3
B20 | CORR | approval/OLUR documents use approval chain, not ordinary outgoing-signature chain | evidence=approval workflow | impact=L3
B21 | CORR | preparer/paraf chain must be recorded where required | evidence=paraf | impact=L2
B22 | CORR | coordinator opinions/parafs must be captured for multi-unit matters where required by institution authority rules | evidence=coordination | impact=L2
B23 | CORR | legal basis cited in approval should be machine-linkable to legal source | evidence=legal link | impact=L2
B24 | CORR | document template is separate from business rule; template change does not rewrite completed documents | evidence=template version | impact=L2
B25 | CORR | electronic document authenticity/integrity must remain verifiable | evidence=signature/hash | impact=L3
B26 | CORR | signed electronic record cannot be silently edited | evidence=immutable signed blob | impact=L3
B27 | CORR | correction after signature creates a traceable new/corrective record rather than mutating history | evidence=version/audit | impact=L3
B28 | CORR | incoming records receive registration/tracking identity | evidence=incoming id | impact=L3
B29 | CORR | incoming physical document should be associated with electronic tracking when digitized/registered | evidence=scan/index | impact=L2
B30 | CORR | received electronic documents preserve original metadata/signatures | evidence=original package | impact=L3
B31 | CORR | routing/havale must identify responsible unit/person | evidence=routing record | impact=L2
B32 | CORR | deadline-bearing incoming documents create due-date controls | evidence=deadline | impact=L3
B33 | CORR | urgent/günlü status must be retained and surfaced | evidence=priority flag | impact=L3
B34 | CORR | confidentiality level must be retained during routing | evidence=classification | impact=L3
B35 | CORR | restricted correspondence requires access control | evidence=ACL | impact=L3
B36 | CORR | personal/sensitive correspondence should not be exposed beyond authorized roles | evidence=ACL | impact=L3
B37 | CORR | KEP/electronic delivery evidence must be retained when used | evidence=delivery receipt | impact=L3
B38 | CORR | physical delivery evidence must be retained when proof of service/receipt is required | evidence=delivery receipt | impact=L3
B39 | CORR | return/rejection reason must be recorded for nonconforming correspondence | evidence=rejection reason | impact=L2
B40 | CORR | document attachments inherit appropriate confidentiality/access restrictions | evidence=attachment ACL | impact=L3
B41 | CORR | attachment count/name/version must be bound to signed document | evidence=manifest | impact=L3
B42 | CORR | link-based electronic attachment must remain retrievable for required period or be captured in record package | evidence=package | impact=L3
B43 | CORR | outgoing document must be archived with its final signed version | evidence=final record | impact=L3
B44 | CORR | incoming document and reply must be relationally linked | evidence=thread/case link | impact=L2
B45 | CORR | official correspondence belongs to a file/transaction context, not isolated storage | evidence=case/file | impact=L2
B46 | CORR | system should prevent use of repealed 2015 official-correspondence regulation as active authority | evidence=source status | impact=L3
B47 | CORR | current authority is 09.06.2020 Decision 2646 / RG 10.06.2020-31151 | evidence=legal source | impact=L3
B48 | CORR | source URL and regulation version are stored with generated compliance rule | evidence=source_url | impact=L2
B49 | CORR | source snapshot is preserved for historical document generation | evidence=legal_snapshot | impact=L2
B50 | CORR | future regulation change creates staging diff, not direct mutation | evidence=legal_change | impact=L3
B51 | CORR | future-approved change applies only to future/pending correspondence | evidence=effective rule version | impact=L3
B52 | CORR | completed correspondence remains immutable under historical rule version | evidence=history | impact=L3
B53 | CORR | template validation should ensure required structural fields exist | evidence=template validator | impact=L2
B54 | CORR | role authorization should block unauthorized signature | evidence=RBAC | impact=L3
B55 | CORR | role authorization should block unauthorized approval | evidence=RBAC | impact=L3
B56 | CORR | delegation expiry blocks further delegated signatures | evidence=delegation end | impact=L3
B57 | CORR | organizational change should not retroactively alter prior header/signature metadata | evidence=historical snapshot | impact=L3
B58 | CORR | outgoing number uniqueness is enforced within configured numbering scope | evidence=unique constraint/business check | impact=L3
B59 | CORR | incoming number/reference values from external institution are preserved exactly as received | evidence=source metadata | impact=L2
B60 | CORR | audit trail records creation, paraf, signature, dispatch, receipt, routing and closure | evidence=audit log | impact=L3
B61 | CORR | printout of electronic document is not treated as original electronic signature container unless regulation permits certified copy treatment | evidence=record type | impact=L3
B62 | CORR | certified/aslı gibidir copy workflow is distinct from original-record workflow | evidence=copy certification | impact=L3
B63 | CORR | any unresolved exact paragraph mapping remains staging-only until final verification pass | evidence=article_ref_status | impact=L3
B64 | CORR | annual/tenant-specific imza-yetki rules are subordinate parameters and cannot override regulation hierarchy | evidence=authority hierarchy | impact=L3

## Counts
- archive atoms: 62
- official-correspondence atoms: 64
- total atomized: 126
- exact article anchors directly confirmed this pass: ARCHIVE Md.10/1-5 plus current-regulation publication identities; remaining article/paragraph mapping flagged for final cross-check where not directly recovered from primary full text in machine-readable form.
- ARTICLE_VERIFIED increment: 0
- migration: 0

## Final-pass checklist
- Resolve every `FINAL_CROSSCHECK_REQUIRED` item against primary current full text.
- Check 2019 archive amendments/current consolidated status.
- Check 2020 correspondence amendments/current consolidated status.
- Reject any atom contradicted by current higher authority.
- Bind only after exact legacy `workflow_id` is available.
