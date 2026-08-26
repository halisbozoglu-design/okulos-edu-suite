# Legal Fast Batch V18 — Bilgi Edinme + Dilekçe + KVKK + Etik/Şikâyet

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-26
Method: fast 100+ coverage; final global clause-level correctness/missing/duplicate audit deferred until all legal families are covered.
ARTICLE_VERIFIED increment: 0
Migration count: 0

## Official / primary source chain
- 4982 Bilgi Edinme Hakkı Kanunu — https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4982.pdf
- 4982 uygulama mevzuatı / kamu uygulaması cross-check — https://www.tbmm.gov.tr/BilgiEdinme/Mevzuat
- 3071 Dilekçe Hakkının Kullanılmasına Dair Kanun — https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3071.pdf
- TBMM kurumsal kanun listesi — https://www.tbmm.gov.tr/kurumsal-kanunlar
- 6698 Kişisel Verilerin Korunması Kanunu — https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6698.pdf
- KVKK resmî mevzuat/rehber/karar kaynakları — https://www.kvkk.gov.tr/
- Aydınlatma Tebliği — https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig
- Silme/Yok Etme/Anonimleştirme Yönetmeliği — https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK
- Veri Sorumluları Sicili Yönetmeliği — https://www.kvkk.gov.tr/Icerik/5442/VERI-SORUMLULARI-SICILI-HAKKINDA-YONETMELIK
- KVKK yurt dışı aktarım güncel rejimi — https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
- Kamu Görevlileri Etik Kurulu — https://www.etik.gov.tr/
- Etik Yönetmeliği resmî Kurul yayını — https://www.etik.gov.tr/media/iqclx4yp/etikrehber2019.pdf

## A. 4982 Bilgi Edinme workflow atoms (35)
A01 | INFO | equal/impartial/open access principle | src=4982 Md1 | L2
A02 | INFO | public institution activities in scope | src=4982 Md2 | L3
A03 | INFO | 3071 petition rights remain separately applicable | src=4982 Md2 | L2
A04 | INFO | distinguish information vs document vs access operation | src=4982 Md3 | L2
A05 | INFO | Turkish citizens can apply | src=4982 Md4 | L2
A06 | INFO | legal entities can apply | src=4982 Md4 | L2
A07 | INFO | foreigners subject to statutory reciprocity/interest conditions | src=4982 Md4 | L3
A08 | INFO | institution must take administrative/technical measures enabling access | src=4982 Md5 | L3
A09 | INFO | application requires statutory applicant identity/contact fields | src=4982 Md6 | L3
A10 | INFO | electronic application channel allowed under implementing rules | src=4982 Md6 | L2
A11 | INFO | request must concern records held or required to be held by institution | src=4982 Md7/1 | L3
A12 | INFO | institution need not create new research/analysis solely for request | src=4982 Md7/2 | L2
A13 | INFO | published/publicly disclosed information is routed to publication source | src=4982 Md8 | L2
A14 | INFO | request partially within exceptions => sever exempt portion if separable | src=4982 Md9 | L3
A15 | INFO | access can be copy/inspection/listening/viewing depending document form | src=4982 Md10 | L2
A16 | INFO | response default deadline = 15 business days | src=4982 Md11 | L3
A17 | INFO | statutory extended deadline requires qualifying condition | src=4982 Md11 | L3
A18 | INFO | extension reason and deadline must be notified before initial deadline expires | src=4982 Md11 | L3
A19 | INFO | access fee if applicable must follow lawful tariff/cost rule | src=4982 Md10-11 | L2
A20 | INFO | approval response must specify access method/location where relevant | src=4982 Md12 | L2
A21 | INFO | rejection must state reason and appeal path | src=4982 Md12 | L3
A22 | INFO | wrong-authority application should be transferred to competent authority where identifiable | src=implementation-regulation | L2
A23 | INFO | transfer must be traceable and applicant informed | src=implementation-regulation | L2
A24 | INFO | state secrets excluded | src=4982 exceptions | L3
A25 | INFO | national/economic security intelligence exclusions apply | src=4982 exceptions | L3
A26 | INFO | administrative investigation integrity exclusions apply | src=4982 exceptions | L3
A27 | INFO | judicial investigation/prosecution protection exclusions apply | src=4982 exceptions | L3
A28 | INFO | private-life confidentiality must be protected | src=4982 exceptions | L3
A29 | INFO | communication secrecy must be protected | src=4982 exceptions | L3
A30 | INFO | commercial secrets protected subject to statutory framework | src=4982 exceptions | L3
A31 | INFO | intellectual/artistic property rights protected | src=4982 exceptions | L2
A32 | INFO | internal opinions/notes/recommendations assessed under statutory exception rules | src=4982 exceptions | L2
A33 | INFO | recommendation/opinion requests not equivalent to existing-record access | src=4982 | L2
A34 | INFO | appeal/administrative-review evidence includes application, response, timestamps, attachments | src=4982/BEDK workflow | L3
A35 | INFO | completed information-access case remains immutable with source-version snapshot | system legal-history rule linked to 4982 | L3

## B. 3071 petition/complaint atoms (12)
B01 | PETITION | citizens may petition competent authorities/TBMM on self/public matters | src=3071 Md1-3 | L3
B02 | PETITION | resident foreigners subject to statutory reciprocity/conditions | src=3071 Md3 | L3
B03 | PETITION | petition must contain name/surname/signature/address required by law | src=3071 Md4 | L3
B04 | PETITION | missing mandatory petition elements may prevent substantive processing | src=3071 Md4 | L3
B05 | PETITION | authority must assess competence first | src=3071 Md5 | L3
B06 | PETITION | petition submitted to wrong authority is sent to competent authority | src=3071 Md5 | L2
B07 | PETITION | applicant is informed of transfer | src=3071 Md5 | L2
B08 | PETITION | matters whose examination is legally impossible/outside statutory petition scope are separated | src=3071 Md6 | L3
B09 | PETITION | result or stage of process must be communicated within statutory 30-day period | src=3071 Md7 | L3
B10 | PETITION | answer must relate to actual petition/complaint, not generic closure | src=3071 purpose+Md7 | L2
B11 | PETITION | petition registration preserves receipt date/channel/attachments | evidence-control | L3
B12 | PETITION | 3071 complaint and 4982 information request are distinct case types even if same CIMER channel used | cross-law routing | L3

## C. 6698/KVKK core processing atoms (50)
C01 | PRIVACY | personal data = information relating to identified/identifiable natural person | src=6698 Md3 | L3
C02 | PRIVACY | processing includes collection/storage/change/disclosure/transfer/classification/restriction etc | src=6698 Md3 | L3
C03 | PRIVACY | controller determines purposes/means and record-system management | src=6698 Md3 | L3
C04 | PRIVACY | processor acts under controller authority/instructions | src=6698 Md3 + Kurul guidance | L3
C05 | PRIVACY | processing must be lawful and fair | src=6698 Md4 | L3
C06 | PRIVACY | data must be accurate and where necessary up to date | src=6698 Md4 | L3
C07 | PRIVACY | purposes must be specific, explicit and legitimate | src=6698 Md4 | L3
C08 | PRIVACY | processing must be relevant, limited and proportionate | src=6698 Md4 | L3
C09 | PRIVACY | retention only for period required by purpose/relevant law | src=6698 Md4 | L3
C10 | PRIVACY | every processing activity requires a valid Md5/Md6 condition | src=6698 Md5-6 | L3
C11 | PRIVACY | explicit consent is not default where another lawful basis exists | src=6698 Md5 + guidance | L2
C12 | PRIVACY | explicit consent must be specific/informed/freely given | src=6698 definitions/practice | L3
C13 | PRIVACY | statutory obligation basis is recorded explicitly | src=6698 Md5 | L3
C14 | PRIVACY | contract necessity basis limited to necessary processing | src=6698 Md5 | L3
C15 | PRIVACY | legal obligation basis tied to controller obligation | src=6698 Md5 | L3
C16 | PRIVACY | publicized-by-data-subject basis limited to intended publicization context | src=6698 Md5 | L3
C17 | PRIVACY | right establishment/exercise/protection basis documented | src=6698 Md5 | L3
C18 | PRIVACY | legitimate-interest processing requires rights-balance assessment | src=6698 Md5 | L3
C19 | PRIVACY | special-category classification includes health, biometric, genetic, criminal-conviction etc | src=6698 Md6 | L3
C20 | PRIVACY | special-category processing uses post-2024 Md6 conditions, not pre-2024 binary rule | src=7499 amendment/KVKK guidance | L3
C21 | PRIVACY | additional adequate safeguards required for special categories | src=6698 Md6 | L3
C22 | PRIVACY | obsolete pre-01.06.2024 Md6 interpretation is blocked for new decisions | legal-version rule | L3
C23 | PRIVACY | transfer to domestic recipient requires valid legal condition | src=6698 Md8 | L3
C24 | PRIVACY | recipient/purpose must be captured in transfer record | src=Md8+Md10 | L3
C25 | PRIVACY | overseas transfer uses post-01.06.2024 Md9 hierarchy | src=6698 Md9 amended | L3
C26 | PRIVACY | adequacy decision route is separate transfer basis | src=Md9 | L3
C27 | PRIVACY | appropriate-safeguard route requires Md5/Md6 condition + statutory safeguard | src=Md9 | L3
C28 | PRIVACY | standard contract is one appropriate-safeguard mechanism | src=Md9/KVKK 2024 | L3
C29 | PRIVACY | standard contract notification due within 5 business days after signature | src=Md9/KVKK transfer regime | L3
C30 | PRIVACY | binding corporate rules are separate appropriate-safeguard mechanism | src=Md9/KVKK | L3
C31 | PRIVACY | written undertaking route requires Board permission where statute requires | src=Md9 | L3
C32 | PRIVACY | incidental/exceptional overseas transfer cannot become regular transfer practice | src=Md9 | L3
C33 | PRIVACY | privacy notice required at data collection irrespective of consent/basis | src=6698 Md10 | L3
C34 | PRIVACY | notice identifies controller/representative | src=Md10 | L3
C35 | PRIVACY | notice states processing purposes | src=Md10 | L3
C36 | PRIVACY | notice states recipients and transfer purposes | src=Md10 | L3
C37 | PRIVACY | notice states collection method and legal reason | src=Md10 | L3
C38 | PRIVACY | notice states data-subject Md11 rights | src=Md10 | L3
C39 | PRIVACY | burden to prove notice completion belongs to controller | src=Aydınlatma Tebliği/Kurul | L3
C40 | PRIVACY | notice and explicit-consent collection must be separate operations | src=Aydınlatma Tebliği Md5 | L3
C41 | PRIVACY | consent cannot be forced merely as acknowledgement of notice | src=KVKK guidance | L3
C42 | PRIVACY | data subject may learn whether data processed | src=6698 Md11 | L2
C43 | PRIVACY | data subject may request processing information | src=Md11 | L2
C44 | PRIVACY | data subject may learn purpose and purpose-compliance | src=Md11 | L2
C45 | PRIVACY | data subject may learn domestic/foreign recipients | src=Md11 | L2
C46 | PRIVACY | correction right for incomplete/inaccurate data | src=Md11 | L3
C47 | PRIVACY | deletion/destruction request available under Md7/Md11 conditions | src=Md11 | L3
C48 | PRIVACY | correction/deletion may require notification to prior recipients | src=Md11 | L3
C49 | PRIVACY | objection to outcome produced exclusively through automated analysis must be routable | src=Md11 | L3
C50 | PRIVACY | compensation/general-law claims remain separate from administrative KVKK workflow | src=Md11/14 framework | L2

## D. KVKK controller-security/request/disposal atoms (32)
D01 | PRIVACY | controller must prevent unlawful processing | src=6698 Md12 | L3
D02 | PRIVACY | controller must prevent unlawful access | src=Md12 | L3
D03 | PRIVACY | controller must ensure data preservation/security | src=Md12 | L3
D04 | PRIVACY | appropriate technical controls must be evidenced | src=Md12 | L3
D05 | PRIVACY | appropriate administrative controls must be evidenced | src=Md12 | L3
D06 | PRIVACY | controller remains jointly responsible for security where processor used as prescribed by law | src=Md12 | L3
D07 | PRIVACY | internal audit/check of compliance is required | src=Md12 | L3
D08 | PRIVACY | persons learning data by duty cannot disclose/use contrary to law after duty ends | src=Md12 | L3
D09 | PRIVACY | unlawful acquisition/data breach triggers notification workflow | src=Md12 | L3
D10 | PRIVACY | breach incident stores detection time, scope, affected data/subjects, measures and notifications | evidence-control | L3
D11 | PRIVACY | data-subject request first goes to controller for Board complaint route | src=6698 Md13-14 | L3
D12 | PRIVACY | controller response deadline max 30 days | src=Md13 | L3
D13 | PRIVACY | request generally free unless extra cost/tariff applies | src=Md13 | L2
D14 | PRIVACY | rejected request requires reason | src=Md13 | L3
D15 | PRIVACY | accepted request must be implemented, not merely acknowledged | src=Md13 | L3
D16 | PRIVACY | complaint after timely controller response: 30 days from learning response | src=Md14 + 2019/9 | L3
D17 | PRIVACY | no-response complaint outer deadline: 60 days from controller application | src=Md14 + 2019/9 | L3
D18 | PRIVACY | late controller response does not reset outer 60-day limit | src=2019/9 Kurul decision | L3
D19 | PRIVACY | Board corrective decision implemented without delay and max 30 days after notification | src=Md15/5 | L3
D20 | PRIVACY | Board may investigate ex officio on alleged breach | src=Md15 | L3
D21 | PRIVACY | widespread violation may generate principle decision | src=Md15/6 | L2
D22 | PRIVACY | VERBIS duty determined by current exemption/registration decisions, not assumed universally | src=Md16/Kurul decisions | L3
D23 | PRIVACY | controller inventory and VERBIS information must remain consistent where registration applies | src=Sicil Yönetmeliği | L3
D24 | PRIVACY | new registration obligation after status change normally triggers 30-day registration | src=Sicil Yön. Md8 | L3
D25 | PRIVACY | technical/legal impossibility extension request within 7 business days where applicable | src=Sicil Yön. Md8/3 | L3
D26 | PRIVACY | retention/disposal policy required where regulation makes controller subject | src=Disposal Yön. Md5 | L3
D27 | PRIVACY | disposal policy includes media, reasons, security measures, roles, retention schedule, periodic cycle | src=Disposal Yön. Md6 | L3
D28 | PRIVACY | all processing grounds gone => erase/destroy/anonymize ex officio or on valid request | src=Disposal Yön. Md7 | L3
D29 | PRIVACY | disposal actions logged and logs retained at least 3 years absent longer duty | src=Disposal Yön. Md7/3 | L3
D30 | PRIVACY | periodic disposal interval cannot exceed 6 months | src=Disposal Yön. Md11/2 | L3
D31 | PRIVACY | controller without policy duty completes ex-officio disposal within 3 months after obligation arises | src=Disposal Yön. Md11/3 | L3
D32 | PRIVACY | valid data-subject erasure/destruction request resolved max 30 days | src=Disposal Yön. Md12 | L3

## E. Public ethics / complaint-administrative-interface atoms (18)
E01 | ETHICS | public-service awareness | src=Ethics Regulation Md5 | L2
E02 | ETHICS | service-to-public awareness | src=Md6 | L2
E03 | ETHICS | compliance with service standards | src=Md7 | L2
E04 | ETHICS | loyalty to purpose/mission | src=Md8 | L2
E05 | ETHICS | integrity and impartiality | src=Md9 | L3
E06 | ETHICS | conduct preserving dignity/public trust | src=Md10 | L2
E07 | ETHICS | courtesy and respect | src=Md11 | L2
E08 | ETHICS | report unethical/illegal conduct to authorized authorities when required | src=Md12 | L3
E09 | ETHICS | avoid/manage conflict of interest | src=Md13 | L3
E10 | ETHICS | authority may not be used for personal benefit | src=Md14 | L3
E11 | ETHICS | gift/benefit restrictions apply | src=Md15 | L3
E12 | ETHICS | public property/resources used only for public purposes | src=Md16 | L3
E13 | ETHICS | avoid waste and observe resource stewardship | src=Md17 | L2
E14 | ETHICS | binding statements/false declarations controlled under ethics principles | src=Md18+ | L2
E15 | ETHICS | managers bear ethics-leadership/responsibility duties | src=Ethics Regulation | L2
E16 | ETHICS | ethics complaint is separate from disciplinary complaint/investigation | authority-routing rule | L3
E17 | ETHICS | ethics-case evidence/savunma/decision history remains immutable | evidence-control | L3
E18 | ETHICS | ethics rule cannot replace 657 discipline, criminal, KVKK or petition procedure where those govern | hierarchy-routing | L3

## Counts
- 4982: 35
- 3071: 12
- 6698 core: 50
- KVKK security/request/disposal: 32
- ethics/admin interface: 18
- TOTAL: 147 atoms
- ARTICLE_VERIFIED increment: 0
- Migration: 0

## System integration notes
- Main modules: `DOC`, `NOTIF`, `LEG`, `SEC`, `ARCH`, `PERSON`, `GUID`, `STUDENT`, `WF`.
- Case types remain separate: `INFO_ACCESS`, `PETITION`, `COMPLAINT`, `DATA_SUBJECT_REQUEST`, `KVKK_BREACH`, `KVKK_BOARD_CASE`, `ETHICS_COMPLAINT`.
- Deadlines are legal parameters attached to `legal_version`, never tenant-editable defaults.
- Privacy record uses processing-purpose + legal-basis + data-category + subject-category + recipient + retention + transfer + security evidence.
- Student/parent/employee data should inherit least-privilege access and auditable disclosure/transfer logs.
- Cross-border rules use post-01.06.2024 Md9 model; pre-2024 overseas-transfer logic is historical-only.
- Final global pass must verify exact paragraph/bend coverage, any later amendments, duplicates against existing archive/security/personnel atoms, and exact legacy `workflow_id` binding before ARTICLE_VERIFIED changes.
