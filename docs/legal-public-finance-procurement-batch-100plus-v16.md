# Legal Public Finance & Procurement Batch V16

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Scope: 4734 Kamu İhale Kanunu + 5018 Kamu Malî Yönetimi ve Kontrol Kanunu + Merkezî Yönetim Harcama Belgeleri Yönetmeliği + doğrudan temin/ödeme/kanıt akışları.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Official source registry
- 4734 sayılı Kamu İhale Kanunu — official consolidated source: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4734.pdf
- 5018 sayılı Kamu Malî Yönetimi ve Kontrol Kanunu — official consolidated source: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5018.pdf
- Mevzuat Bilgi Sistemi root: https://www.mevzuat.gov.tr/
- Resmî Gazete root / annual amendments: https://www.resmigazete.gov.tr/
- Kamu İhale Kurumu annual threshold/limit source family: https://www.ihale.gov.tr/

## Source/version policy
- Kanun hükümleri primary authority.
- Annual monetary thresholds/limits are YEAR_PARAMETER and are never hard-coded into immutable workflow rules.
- Annual Public Procurement Communiqué values are child legal sources with effective year.
- Repealed/superseded monetary values are historical snapshots only.
- School/tenant practice cannot override 4734/5018 hierarchy.
- Exact paragraph-level final audit is deferred to the global correctness pass; this fast batch preserves article-family provenance and operational intent.

## A. 4734 Kamu İhale / procurement atoms (44)

P01 | 4734-Md5 | transparency is mandatory procurement principle | evidence=procurement record | impact=L3
P02 | 4734-Md5 | competition must be protected | evidence=market/offer record | impact=L3
P03 | 4734-Md5 | equal treatment is mandatory | evidence=criteria consistency | impact=L3
P04 | 4734-Md5 | reliability/güvenirlik principle applies | evidence=audit trail | impact=L2
P05 | 4734-Md5 | confidentiality must be protected where required | evidence=ACL | impact=L3
P06 | 4734-Md5 | public supervision/accountability must remain possible | evidence=complete file | impact=L3
P07 | 4734-Md5 | needs must be met appropriately and on time | evidence=need plan | impact=L2
P08 | 4734-Md5 | resources must be used efficiently | evidence=price/need justification | impact=L3
P09 | 4734-Md5 | naturally connected works cannot be split to evade thresholds | evidence=aggregation check | impact=L3
P10 | 4734-Md5 | procurement without appropriation/ödenek is blocked except lawful exceptions | evidence=appropriation check | impact=L3
P11 | 4734-Md6 | procurement commission is established by competent authority | evidence=commission decision | impact=L3
P12 | 4734-Md6 | commission membership and substitutes are recorded | evidence=member list | impact=L3
P13 | 4734-Md6 | commission must include required technical/financial competence | evidence=role qualification | impact=L3
P14 | 4734-Md6 | procurement file is delivered to commission members in time | evidence=file delivery | impact=L2
P15 | 4734-Md7 | procurement file must preserve all process documents | evidence=procurement_case_id | impact=L3
P16 | 4734-Md9 | estimated cost is calculated before procurement where applicable | evidence=approx_cost | impact=L3
P17 | 4734-Md9 | estimated cost basis/market data is documented | evidence=calculation attachments | impact=L3
P18 | 4734-Md9 | estimated cost confidentiality is protected where law requires | evidence=access control | impact=L3
P19 | 4734-Md10 | qualification criteria must be relevant and proportionate | evidence=criteria | impact=L3
P20 | 4734-Md10 | required eligibility documents are validated | evidence=qualification docs | impact=L3
P21 | 4734-Md11 | prohibited/ineligible tender participants are blocked | evidence=eligibility check | impact=L3
P22 | 4734-Md12 | technical specifications must describe need without unjustified restriction | evidence=specification | impact=L3
P23 | 4734-Md12 | brand/model restriction is blocked unless lawful exception exists | evidence=exception justification | impact=L3
P24 | 4734-Md13 | notice rules depend on procurement method/value | evidence=notice plan | impact=L3
P25 | 4734-Md19 | open procedure is recognized as a principal procurement method | evidence=method selection | impact=L2
P26 | 4734-Md20 | restricted procedure requires statutory conditions | evidence=method justification | impact=L3
P27 | 4734-Md21 | negotiated procedure requires statutory trigger | evidence=trigger/legal basis | impact=L3
P28 | 4734-Md22 | direct procurement is not a tender procedure but still requires lawful ground | evidence=22-bend | impact=L3
P29 | 4734-Md22 | direct procurement ground must be selected at subparagraph level | evidence=legal_basis | impact=L3
P30 | 4734-Md22/d | monetary direct-procurement threshold is YEAR_PARAMETER | evidence=annual limit source | impact=L3
P31 | 4734-Md22/d | annual limit is resolved by place/administration scope when applicable | evidence=parameter scope | impact=L3
P32 | 4734-Md22 | price research/market verification is retained as evidence where applicable | evidence=market research | impact=L3
P33 | 4734-Md22 | approval/olur and assigned purchaser/commission roles are retained | evidence=approval | impact=L3
P34 | 4734-Md22 | splitting purchases to remain below direct-purchase threshold is blocked | evidence=aggregation check | impact=L3
P35 | 4734-Md24 | notice content must match required fields | evidence=notice validator | impact=L2
P36 | 4734-Md27 | tender document content is controlled | evidence=tender_docs | impact=L3
P37 | 4734-Md30 | bids are submitted according to specified method/deadline | evidence=submission timestamp | impact=L3
P38 | 4734-Md36 | opening of bids follows commission procedure | evidence=opening minutes | impact=L3
P39 | 4734-Md37 | document/bid evaluation is recorded | evidence=evaluation minutes | impact=L3
P40 | 4734-Md38 | abnormally low bid process requires explanation/evaluation where triggered | evidence=explanation | impact=L3
P41 | 4734-Md39 | procurement may be cancelled under lawful conditions with reason | evidence=cancellation decision | impact=L3
P42 | 4734-Md40 | award decision and approval chain are recorded | evidence=award approval | impact=L3
P43 | 4734-Md41-42 | notification and contract invitation steps are deadline-controlled | evidence=notification/receipt | impact=L3
P44 | 4734-general | KİK annual communiqué values/thresholds are versioned child sources, never embedded permanently | evidence=legal_snapshot | impact=L3

## B. 5018 public financial management atoms (50)

F01 | 5018-Md5 | public financial management follows fiscal discipline | evidence=budget control | impact=L3
F02 | 5018-Md5 | public resources are acquired/used effectively, economically, efficiently | evidence=justification | impact=L3
F03 | 5018-Md7 | fiscal transparency applies | evidence=reporting | impact=L2
F04 | 5018-Md8 | officials are accountable for resources entrusted to them | evidence=responsibility mapping | impact=L3
F05 | 5018-Md9 | strategic plan/performance linkage is preserved where applicable | evidence=plan link | impact=L2
F06 | 5018-Md13 | expenditures require budget-law compliance | evidence=budget classification | impact=L3
F07 | 5018-Md20 | appropriations are used for assigned purpose | evidence=appropriation purpose | impact=L3
F08 | 5018-Md20 | expenditure cannot exceed available appropriation except legal cases | evidence=balance check | impact=L3
F09 | 5018-Md26 | no commitment/yüklenme without lawful authority and appropriation | evidence=commitment check | impact=L3
F10 | 5018-Md31 | expenditure authority belongs to lawful harcama yetkilisi | evidence=role authority | impact=L3
F11 | 5018-Md31 | expenditure-unit mapping controls competent harcama yetkilisi | evidence=unit mapping | impact=L3
F12 | 5018-Md32 | harcama talimatı/approval states service justification | evidence=approval | impact=L3
F13 | 5018-Md32 | approval contains subject, amount, duration and legal basis as applicable | evidence=approval fields | impact=L3
F14 | 5018-Md32 | harcama yetkilisi is responsible for legality and efficient use | evidence=responsibility | impact=L3
F15 | 5018-Md33 | realization/gerçekleştirme precedes payment | evidence=realization docs | impact=L3
F16 | 5018-Md33 | work/goods/services received must be documented | evidence=acceptance/delivery | impact=L3
F17 | 5018-Md33 | payment order is prepared after required checks | evidence=payment_order | impact=L3
F18 | 5018-Md33 | gerçekleştirme görevlisi duties are role-controlled | evidence=assignment | impact=L3
F19 | 5018-Md33 | supporting documents must substantiate expenditure | evidence=document package | impact=L3
F20 | 5018-Md34 | unpaid accrued expenditures are managed through lawful debt/budget process | evidence=debt record | impact=L2
F21 | 5018-Md35 | advance/prepayment requires statutory conditions | evidence=advance basis | impact=L3
F22 | 5018-Md35 | advance/credit limits are YEAR_PARAMETER where annually determined | evidence=annual parameter | impact=L3
F23 | 5018-Md35 | advances must be cleared/mahsup within legal period | evidence=settlement | impact=L3
F24 | 5018-Md35 | unused balance is returned | evidence=return receipt | impact=L3
F25 | 5018-Md40 | donations/aids are recorded and used for lawful purpose | evidence=donation record | impact=L3
F26 | 5018-Md41 | activity reporting is evidence-based | evidence=activity report | impact=L2
F27 | 5018-Md44 | movable/immovable transactions follow delegated regulations | evidence=asset transaction | impact=L3
F28 | 5018-Md45 | acquisition of assets requires legal/budget authority | evidence=acquisition basis | impact=L3
F29 | 5018-Md48 | asset management responsibility is assigned | evidence=asset custodian | impact=L3
F30 | 5018-Md49 | accounting records follow government accounting framework | evidence=accounting entry | impact=L3
F31 | 5018-Md50 | transactions are recorded at legally required time | evidence=record timestamp | impact=L3
F32 | 5018-Md51 | expenditure/revenue belongs to lawful fiscal year/period | evidence=fiscal year | impact=L2
F33 | 5018-Md55 | internal control is a continuous management process | evidence=control design | impact=L3
F34 | 5018-Md56 | internal control protects assets/resources | evidence=control | impact=L3
F35 | 5018-Md56 | internal control ensures lawful/regular activities | evidence=compliance check | impact=L3
F36 | 5018-Md56 | internal control ensures reliable financial information | evidence=reconciliation | impact=L3
F37 | 5018-Md56 | internal control supports efficiency/economy/effectiveness | evidence=control evaluation | impact=L2
F38 | 5018-Md57 | duties and authorizations must be segregated where required | evidence=RBAC | impact=L3
F39 | 5018-Md58 | transactions subject to prior financial control follow that route | evidence=control result | impact=L3
F40 | 5018-Md61 | accounting authority checks payment documents within legal responsibility | evidence=accounting check | impact=L3
F41 | 5018-Md63 | internal audit is risk-based independent assurance/consulting | evidence=audit plan | impact=L2
F42 | 5018-Md68 | external audit/Sayıştay evidence must be producible | evidence=audit package | impact=L3
F43 | 5018-Md70 | appropriation-overrun risk is blocked/escalated | evidence=budget control | impact=L3
F44 | 5018-Md71 | public loss/kamu zararı must be identified and tracked | evidence=loss case | impact=L3
F45 | 5018-Md71 | responsible persons and amount are traceably determined | evidence=liability record | impact=L3
F46 | 5018-Md71 | recovery/tahsil process is tracked separately | evidence=collection status | impact=L3
F47 | 5018-Md72 | unauthorized collection/payment is prohibited | evidence=authority check | impact=L3
F48 | 5018-Md75 | competent authorities may inspect financial management/control systems | evidence=audit access | impact=L3
F49 | 5018-Md76 | administrations must provide requested fiscal information/documents | evidence=request response | impact=L2
F50 | 5018-general | annual budget/limit changes create versioned legal parameters, not retroactive mutation | evidence=legal snapshot | impact=L3

## C. Harcama documents / payment evidence atoms (32)

H01 | HARCAMA-Md5 | payment order and required supporting documents form the payment package | evidence=payment package | impact=L3
H02 | HARCAMA-Md5 | evidence set is expense-type dependent | evidence=document ruleset | impact=L3
H03 | HARCAMA-Md6 | commitment/taahhüt file is preserved for procurements requiring it | evidence=commitment file | impact=L3
H04 | HARCAMA-Md6 | tender/procurement approval is kept in commitment file | evidence=approval | impact=L3
H05 | HARCAMA-Md6 | tender/commission documents are linked to payment | evidence=procurement link | impact=L3
H06 | HARCAMA-Md6 | contract, where required, is linked to commitment/payment | evidence=contract | impact=L3
H07 | HARCAMA-Md7 | progress payment/hakediş report is required for relevant works/services | evidence=hakediş | impact=L3
H08 | HARCAMA-Md8 | payment recipient/payee identity is validated | evidence=payee | impact=L3
H09 | HARCAMA-general | invoice/e-invoice is matched with procurement and acceptance | evidence=invoice match | impact=L3
H10 | HARCAMA-general | delivery/inspection/acceptance evidence precedes payment where applicable | evidence=acceptance | impact=L3
H11 | HARCAMA-general | tax/statutory deductions are represented separately | evidence=deduction lines | impact=L3
H12 | HARCAMA-general | payment bank/account information is validated | evidence=bank validation | impact=L3
H13 | HARCAMA-Md42 | machine/equipment/vehicle maintenance payments retain service evidence | evidence=service report | impact=L2
H14 | HARCAMA-Md43 | communication/transport-type expense requires relevant invoice/service evidence | evidence=service evidence | impact=L2
H15 | HARCAMA-Md45 | rent payments require contract/lease and period evidence | evidence=lease | impact=L3
H16 | HARCAMA-Md46 | service purchases require procurement + realization evidence | evidence=service acceptance | impact=L3
H17 | HARCAMA-Md48 | consumable/demirbaş/machine purchases require acquisition evidence | evidence=invoice/asset receipt | impact=L3
H18 | HARCAMA-Md48 | asset purchases are linked to current movable-asset registration where applicable | evidence=asset record | impact=L3
H19 | HARCAMA-Md49 | electricity/water/gas payments are matched to subscription/invoice period | evidence=utility invoice | impact=L2
H20 | HARCAMA-Md54 | construction/repair expenditure requires applicable contract/hakediş/acceptance package | evidence=works package | impact=L3
H21 | HARCAMA-Md63 | 4734 Md22/d direct-procurement payments have a dedicated evidence pathway | evidence=22d package | impact=L3
H22 | HARCAMA-Md63 | 22/d annual monetary limit is external YEAR_PARAMETER | evidence=KİK annual source | impact=L3
H23 | HARCAMA-Md63 | market-price research evidence is linked to direct-purchase payment | evidence=price research | impact=L3
H24 | HARCAMA-Md63 | approval and acquisition assignment evidence are linked | evidence=approval/assignment | impact=L3
H25 | HARCAMA-Md64 | other documents required by public procurement legislation remain mandatory | evidence=dynamic checklist | impact=L3
H26 | HARCAMA-Md65 | transactions requiring visa/appropriate opinion cannot bypass required evidence | evidence=visa/opinion | impact=L3
H27 | HARCAMA-Md66 | movable-document exceptions are handled by current asset regulation mapping | evidence=asset-rule version | impact=L3
H28 | HARCAMA-Md67 | extraordinary/new expense situations require authorized regulatory basis | evidence=exception basis | impact=L3
H29 | HARCAMA-general | payment package is immutable after final accounting except traceable correction | evidence=audit history | impact=L3
H30 | HARCAMA-general | rejected payment records rejection reason and missing document | evidence=rejection | impact=L2
H31 | HARCAMA-general | correction/resubmission preserves previous version | evidence=version history | impact=L3
H32 | HARCAMA-general | final payment evidence inherits archive retention and confidentiality controls | evidence=archive link | impact=L3

## System modeling decisions
- Primary modules: PROC, PAY, ASSET, DOC, ARCH, OAB where relevant.
- `procurement_case_id` links need → approval → appropriation → estimated cost → method → commission/assigned purchaser → price research/tender → decision → contract/order → delivery/acceptance → invoice → realization → payment → asset registration → archive.
- 4734 Article 22/d and all annually updated monetary values use `legal_parameter(year, scope, value, currency, source_id, effective_from, effective_to)` semantics; no hard-coded migration is required.
- Splitting detection should aggregate same/similar need by tenant + category + reasonable period + funding unit and surface warning rather than silently block every repeat purchase.
- Harcama yetkilisi, gerçekleştirme görevlisi, muhasebe/ödeme role separation is stored by role/assignment and historical snapshot.
- Completed procurement/payment records are immutable; corrective transactions append history.
- Procurement/financial records inherit archive rules already staged in V12.
- No database migration in this batch; existing legal/workflow/role/evidence architecture is sufficient.

## Counts
- 4734 procurement atoms: 44
- 5018 finance/control atoms: 50
- expenditure-document/payment atoms: 32
- total atomized: 126
- ARTICLE_VERIFIED increment: 0
- migration: 0

## Final global audit flags
- Confirm every article/subparagraph against current consolidated official text.
- Confirm current 2026 KİK thresholds/direct procurement limits from annual official communiqué and store as YEAR_PARAMETER.
- Reconcile 2024 Taşınır Mal Yönetmeliği terminology with harcama-document references.
- Confirm current Merkezî Yönetim Harcama Belgeleri consolidated amendments and any renamed forms.
- Detect duplicate atoms with OAB/asset/procurement families before publishing.
