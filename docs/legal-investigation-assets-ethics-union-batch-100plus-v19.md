# Legal Fast Batch V19 — 4483 + 3628 + 5176 + 4688

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: prior fast >=100-atom coverage method. Final clause-level correctness/missing/duplicate audit remains deferred until end.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Primary / official sources
- 4483 Memurlar ve Diğer Kamu Görevlilerinin Yargılanması Hakkında Kanun — https://www.mevzuat.gov.tr/MevzuatMetin/1.5.4483.pdf
- 3628 Mal Bildiriminde Bulunulması, Rüşvet ve Yolsuzluklarla Mücadele Kanunu — https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3628.pdf
- 5176 Kamu Görevlileri Etik Kurulu Kurulması ve Bazı Kanunlarda Değişiklik Yapılması Hakkında Kanun — https://www.etik.gov.tr/media/uidnvdn5/1-5-5176.pdf
- Kamu Görevlileri Etik Kurulu resmi mevzuat sayfası — https://www.etik.gov.tr/mevzuat/etik-mevzuati/
- 4688 Kamu Görevlileri Sendikaları ve Toplu Sözleşme Kanunu — https://www.csgb.gov.tr/media/1316/4688-say%C4%B1l%C4%B1-kamu-goerevlileri-sendikalar%C4%B1-ve-toplu-soezle%C5%9Fmeler-kanunu.pdf

## System rules
- All authority routes are role-based and tenant-aware.
- Complaint, preliminary examination, permission, appeal and prosecution stages remain separate records.
- Asset declarations are confidential by default and access-restricted.
- Ethics review is not merged with discipline or criminal-investigation workflow.
- Union membership / representation data is separately permissioned from ordinary personnel data.
- Any annual monetary, membership, deduction or collective-bargaining rate/amount is versioned; no hard-coded annual value.

## A. 4483 investigation-permission / preliminary-examination atoms (38)

A01 | 4483 | scope gate: alleged offence must arise from duty and be committed because of duty | impact=L3
A02 | 4483 | determine whether person is within statutory public-official scope | impact=L3
A03 | 4483 | separate offences excluded by special-law exceptions from permission workflow | impact=L3
A04 | 4483 | determine competent permission authority by current office/status | impact=L3
A05 | 4483 | authority determination uses office at time of alleged act where statute requires | impact=L3
A06 | 4483 | complaint/notice must identify event sufficiently for preliminary assessment | impact=L2
A07 | 4483 | complaint should identify person where possible | impact=L2
A08 | 4483 | abstract/general allegations are not treated as sufficient factual notice | impact=L3
A09 | 4483 | duplicate previously concluded same-subject complaint is detected | impact=L2
A10 | 4483 | new evidence on same allegation can reopen intake assessment where legally relevant | impact=L2
A11 | 4483 | permission authority may order preliminary examination | impact=L3
A12 | 4483 | preliminary examiner assignment is recorded with authority basis | impact=L3
A13 | 4483 | examiner independence/conflict check is recorded | impact=L3
A14 | 4483 | preliminary examination may collect documents and statements within statutory limits | impact=L3
A15 | 4483 | examination file preserves complaint, evidence, statements and findings | impact=L3
A16 | 4483 | examination result distinguishes permission / no-permission recommendation | impact=L3
A17 | 4483 | permission authority makes final statutory decision; examiner does not replace authority | impact=L3
A18 | 4483 | decision must identify person and alleged act | impact=L3
A19 | 4483 | decision must contain reasoned legal/factual basis | impact=L3
A20 | 4483 | statutory decision period is tracked from authority receipt | impact=L3
A21 | 4483 | base preliminary-examination/decision period parameter = 30 days | impact=L3
A22 | 4483 | one-time extension may be used where necessary and reason recorded | impact=L3
A23 | 4483 | extension parameter = max 15 days | impact=L3
A24 | 4483 | deadline engine must prevent silent indefinite preliminary examination | impact=L3
A25 | 4483 | decision is notified to prosecutor where required | impact=L3
A26 | 4483 | decision is notified to complainant where legally entitled | impact=L3
A27 | 4483 | decision is notified to person investigated | impact=L3
A28 | 4483 | objection eligibility is tracked by decision type/person | impact=L3
A29 | 4483 | objection period parameter = 10 days | impact=L3
A30 | 4483 | competent objection authority/court is derived from permission authority/status | impact=L3
A31 | 4483 | objection filing suspensive/finality effect is represented according to statutory path | impact=L3
A32 | 4483 | final permission decision opens prosecution/investigation handoff only after legal finalization | impact=L3
A33 | 4483 | no-permission decision blocks criminal-investigation handoff under this regime unless overturned | impact=L3
A34 | 4483 | preliminary-examination file and final decision remain immutable historical evidence | impact=L3
A35 | 4483 | disciplinary process is not automatically merged with 4483 criminal-permission process | impact=L3
A36 | 4483 | urgent evidence preservation may be logged separately without prejudging permission outcome | impact=L2
A37 | 4483 | higher/special authority rules override generic school-chain assumptions | impact=L3
A38 | 4483 | exact article/paragraph final audit remains mandatory before ARTICLE_VERIFIED binding | impact=L3

## B. 3628 asset-declaration / anti-corruption atoms (31)

B01 | 3628 | determine whether personnel/office is subject to asset-declaration obligation | impact=L3
B02 | 3628 | initial declaration trigger on appointment/election/assumption of duty | impact=L3
B03 | 3628 | initial declaration deadline parameter tracked separately | impact=L3
B04 | 3628 | periodic declaration cycle is tracked for statutory years ending 0 and 5 | impact=L3
B05 | 3628 | periodic declaration deadline = end of February of applicable year | impact=L3
B06 | 3628 | material/significant change in assets creates additional declaration trigger | impact=L3
B07 | 3628 | significant-change declaration deadline = one month | impact=L3
B08 | 3628 | leaving office creates final declaration trigger where applicable | impact=L3
B09 | 3628 | leaving-office declaration deadline = one month | impact=L3
B10 | 3628 | declaration authority/recipient derived from office category | impact=L3
B11 | 3628 | declaration records stored in personnel-specific restricted area | impact=L3
B12 | 3628 | asset declarations are confidential and not general-personnel-view data | impact=L3
B13 | 3628 | unauthorized disclosure/export is blocked and audited | impact=L3
B14 | 3628 | spouses and dependent children information handled only to statutory extent | impact=L3
B15 | 3628 | declaration completeness check is separated from substantive comparison | impact=L2
B16 | 3628 | previous and current declarations may be compared by authorized authority | impact=L3
B17 | 3628 | unexplained inconsistency creates escalation/review event | impact=L3
B18 | 3628 | failure to submit by deadline creates non-compliance event | impact=L3
B19 | 3628 | late submission does not erase original deadline breach | impact=L3
B20 | 3628 | false/incomplete declaration allegation is separately recorded from late filing | impact=L3
B21 | 3628 | anti-corruption notification path is separated from ordinary HR grievance | impact=L3
B22 | 3628 | bribery/corruption evidence can trigger competent judicial/administrative notification route | impact=L3
B23 | 3628 | documents related to corruption allegation receive legal-hold protection | impact=L3
B24 | 3628 | confidentiality continues during archive lifecycle | impact=L3
B25 | 3628 | Ethics Board access to declarations, where legally authorized, is separately logged | impact=L3
B26 | 3628 | access reason and requesting authority are mandatory audit metadata | impact=L3
B27 | 3628 | retention/destruction cannot occur while investigation/legal hold exists | impact=L3
B28 | 3628 | statutory declaration calendar is generated automatically for covered roles | impact=L2
B29 | 3628 | person changing office triggers recipient/authority re-evaluation | impact=L2
B30 | 3628 | historical declarations remain tied to legal version in force at filing date | impact=L2
B31 | 3628 | exact clause/subcategory mapping reserved for final global audit before workflow_id verification | impact=L3

## C. 5176 / public-ethics atoms (25)

C01 | 5176 | ethics framework applies to covered public bodies/personnel | impact=L3
C02 | 5176 | statutory exclusions are represented explicitly; system does not assume universal coverage | impact=L3
C03 | 5176 | core principles include transparency | impact=L2
C04 | 5176 | core principles include impartiality | impact=L2
C05 | 5176 | core principles include honesty/integrity | impact=L2
C06 | 5176 | core principles include accountability | impact=L2
C07 | 5176 | core principles include protection of public interest | impact=L2
C08 | 5176 | Ethics Board is a distinct external/high-level authority, not school discipline board | impact=L3
C09 | 5176 | Board composition is 11 members | impact=L2
C10 | 5176 | Board members are appointed/selected through current Presidential route | impact=L2
C11 | 5176 | Board may examine alleged ethical-principle violations on application | impact=L3
C12 | 5176 | Board may act ex officio where law permits | impact=L3
C13 | 5176 | ethics application intake remains separate from criminal complaint | impact=L3
C14 | 5176 | ethics application intake remains separate from disciplinary complaint | impact=L3
C15 | 5176 | Board can request information/documents from public institutions within legal authority | impact=L3
C16 | 5176 | requested institutional response/evidence must be traceable | impact=L3
C17 | 5176 | institution must route Board correspondence to authorized officials | impact=L3
C18 | 5176 | Board finding/result notification is linked to relevant authority without rewriting HR history | impact=L3
C19 | 5176 | Board contributes to public-sector ethics culture/training | impact=L1
C20 | 5176 | institution may schedule ethics awareness/training activities as compliance tasks | impact=L1
C21 | 5176 | Board may examine asset declarations under 3628 where legally necessary | impact=L3
C22 | 5176 | gift prohibition/assessment rules are linked to ethics framework | impact=L3
C23 | 5176 | upper-level gift-list request, where applicable, is its own annual evidence workflow | impact=L2
C24 | 5176 | 703 KHK post-2018 authority terminology supersedes obsolete Prime Ministry references | impact=L3
C25 | 5176 | exact regulation-level application procedure is cross-linked to current Ethics Behaviour Principles Regulation for final audit | impact=L3

## D. 4688 union / collective-bargaining atoms (31)

D01 | 4688 | determine whether worker is public employee under 4688 rather than worker-status labour law | impact=L3
D02 | 4688 | determine applicable service branch for institution/person | impact=L3
D03 | 4688 | union membership is voluntary | impact=L3
D04 | 4688 | no forced union membership is permitted | impact=L3
D05 | 4688 | membership application/acceptance record kept separately from ordinary personnel preference | impact=L3
D06 | 4688 | union membership data is access-restricted personnel data | impact=L3
D07 | 4688 | resignation from union is a distinct workflow with effective-date rules | impact=L3
D08 | 4688 | membership termination must preserve historical membership intervals | impact=L2
D09 | 4688 | simultaneous/invalid membership conflicts are detected under statutory rules | impact=L3
D10 | 4688 | union dues/deduction requires valid membership and current legal basis | impact=L3
D11 | 4688 | payroll deduction start/stop follows verified membership effective dates | impact=L3
D12 | 4688 | annual/monthly deduction amounts/rates are versioned if changed by current legal framework | impact=L2
D13 | 4688 | unauthorized union deduction is blocked | impact=L3
D14 | 4688 | union representative/workplace representative status is separately recorded | impact=L3
D15 | 4688 | representative-protection rules are linked to assignment/transfer workflow | impact=L3
D16 | 4688 | representative duties do not silently alter underlying cadre/personnel record | impact=L2
D17 | 4688 | union leave/time-off entitlement is handled through separate lawful parameterized workflow | impact=L3
D18 | 4688 | service-branch determination affects competent union/representation routes | impact=L3
D19 | 4688 | institution cannot discriminate because of lawful union membership/activity | impact=L3
D20 | 4688 | union activity data is not exposed to unrelated managers/modules | impact=L3
D21 | 4688 | collective agreement outcomes create effective-dated legal parameters | impact=L3
D22 | 4688 | collective-agreement financial/social rights never overwrite historical periods | impact=L3
D23 | 4688 | new collective agreement applies to its legally defined term | impact=L3
D24 | 4688 | disputes/interpretation are linked to competent statutory mechanisms, not locally invented rules | impact=L3
D25 | 4688 | authorized union/confederation status must be based on current official determination | impact=L3
D26 | 4688 | membership/representation counts used for official reporting preserve snapshot date | impact=L2
D27 | 4688 | personal union-choice secrecy/confidentiality is enforced in UI and exports | impact=L3
D28 | 4688 | union communications/requests are routed to institution authority with audit trail | impact=L2
D29 | 4688 | lawful union notices are archived as official correspondence | impact=L2
D30 | 4688 | strike/work-stoppage or collective-action questions are never auto-decided solely from union membership record; current legal/collective decision source required | impact=L3
D31 | 4688 | final global audit will bind exact article/paragraph for each operational union atom before ARTICLE_VERIFIED | impact=L3

## Counts
- 4483 atoms: 38
- 3628 atoms: 31
- 5176 atoms: 25
- 4688 atoms: 31
- total atomized: 125
- ARTICLE_VERIFIED increment: 0
- migration: 0

## Final-audit flags
- Verify exact current article/paragraph for all deadline and competent-authority atoms against consolidated official full text.
- Check amendments affecting 4483 competent authority, 3628 declaration recipients, 5176 post-2018 terminology and 4688 collective-bargaining provisions.
- Prevent duplicate mapping with 657 discipline, 6698 privacy, 5018 accountability and existing complaint workflows.
- Bind to legacy master only when durable `workflow_id` is available.
