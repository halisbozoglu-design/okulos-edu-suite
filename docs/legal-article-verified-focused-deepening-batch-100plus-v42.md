# Legal Fast Batch V42 — Canonical master recovery + HEM OAB/Eser exact bindings

Status: STAGING_SUPERADMIN_APPROVAL
Date: 2026-08-28
Mode: ARTICLE_VERIFIED_PRIORITY
Migration: 0

## Canonical master recovery
Historical progress metadata names `Mimaros_Master_Legal_Verification_Progress_v27.csv` as the latest reported master, but also records that it was not available in runtime/repo at that time. File Library recovery located the durable predecessor/master artifacts `Mimaros_Master_Is_Akisi_FINAL.jsonl` and related legal-control/module-filtered derivatives. These establish exact retained ID→title→scope mappings for HB-2223..HB-2227.

Recovered exact mappings:
- HB-2223 — Okul-Aile Birliği Genel Kurulu — scope: 3.5 HALK EĞİTİM MERKEZİ
- HB-2224 — Okul-Aile Birliği Yönetim Kurulu — scope: 3.5 HALK EĞİTİM MERKEZİ
- HB-2225 — Okul-Aile Birliği Denetleme Kurulu — scope: 3.5 HALK EĞİTİM MERKEZİ
- HB-2226 — Eser İnceleme ve Seçme Kurulu — scope: 3.5 HALK EĞİTİM MERKEZİ
- HB-2227 — Merkez Komisyon Kurulu — scope: 3.6 REHBERLİK VE ARAŞTIRMA MERKEZİ MÜDÜRLÜKLERİ

## Official/current sources
- MEB Okul-Aile Birliği Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1532.pdf
- MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği: https://mevzuat.meb.gov.tr/dosyalar/1850.pdf
- MEB Özel Eğitim Hizmetleri Yönetmeliği current ORGM source: https://orgm.meb.gov.tr/meb_iys_dosyalar/2021_09/13145613_Ozel_EYitim_Hizmetleri_YonetmeliYi_son.pdf
- MEB BİLSEM Yönergesi: https://mevzuat.meb.gov.tr/dosyalar/2193.pdf

## A. Canonical inventory recovery — 20 atoms
REC42-001|artifact|historical manifest explicitly names Mimaros_Master_Legal_Verification_Progress_v27.csv
REC42-002|artifact|historical manifest says runtime_master_available=false at that snapshot
REC42-003|artifact|File Library durable Mimaros_Master_Is_Akisi_FINAL.jsonl recovered
REC42-004|HB-2223|title=Okul-Aile Birliği Genel Kurulu
REC42-005|HB-2223|scope=HEM
REC42-006|HB-2224|title=Okul-Aile Birliği Yönetim Kurulu
REC42-007|HB-2224|scope=HEM
REC42-008|HB-2225|title=Okul-Aile Birliği Denetleme Kurulu
REC42-009|HB-2225|scope=HEM
REC42-010|HB-2226|title=Eser İnceleme ve Seçme Kurulu
REC42-011|HB-2226|scope=HEM
REC42-012|HB-2227|title=Merkez Komisyon Kurulu
REC42-013|HB-2227|scope=RAM
REC42-014|guard|retained master title beats guessed title
REC42-015|guard|raw handbook page remains source provenance, not final legal authority
REC42-016|guard|master scope retained separately from legal applicability scope
REC42-017|guard|duplicate title with different school scope can be separate workflow
REC42-018|guard|same workflow ID never counted twice
REC42-019|migration|0
REC42-020|snapshot|recovery evidence is immutable provenance

## B. HEM Okul-Aile Birliği exact bindings — 50 atoms
OAB42-001|OAB Md1|regulation applies to MEB schools and education institutions
OAB42-002|Md2|scope includes MEB school and education institutions
OAB42-003|Md4/ç|school definition includes official/private formal and non-formal school/institution
OAB42-004|Md4/e|membership expressly defines non-formal education institution members
OAB42-005|Md7/1|18+ course participants/apprentices/journeyman/master trainees can be natural members
OAB42-006|Md8/1|union organs are general assembly, executive board and audit board
OAB42-007|Md8/1-a|Genel Kurul named organ
OAB42-008|Md8/1-b|Yönetim Kurulu named organ
OAB42-009|Md8/1-c|Denetleme Kurulu named organ
OAB42-010|Md9/1|general assembly consists of union members
OAB42-011|Md9/1|ordinary meeting held annually
OAB42-012|Md9/1|deadline no later than end of October
OAB42-013|Md9/1|newly opened school/institution rule tied to opening + two months
OAB42-014|Md9/2|meeting/quorum rule established
OAB42-015|Md9/3|place/time/agenda notice at least 15 days before
OAB42-016|Md9/4|agenda order/majority amendment rule
OAB42-017|Md9/6|extraordinary general assembly triggers defined
OAB42-018|Md10|general assembly meeting procedure separately regulated
OAB42-019|Md11|general assembly duties separately regulated
OAB42-020|HB-2223|retained title exact matches Md8-9 organ
OAB42-021|HB-2223|HEM is non-formal education institution within Md2+Md4 scope
OAB42-022|HB-2223|exact parent provision Md9
OAB42-023|HB-2223|ARTICLE_VERIFIED eligible
OAB42-024|Md12|management board formation current provision
OAB42-025|Md12|board has five principal/five substitute members from eligible parent/member group as applicable
OAB42-026|Md12|first meeting after election establishes president/vice-president/treasurer/member duty split
OAB42-027|Md12|board term/eligibility provisions retained as current parameters
OAB42-028|Md13|management board duties and meeting/financial responsibilities supporting scope
OAB42-029|HB-2224|retained title exact matches Md8+Md12 organ
OAB42-030|HB-2224|HEM applicability established by Md1-4 and non-formal member definitions
OAB42-031|HB-2224|exact parent provision Md12
OAB42-032|HB-2224|ARTICLE_VERIFIED eligible
OAB42-033|Md14/1|audit board is three principal/three substitute members: one general-assembly-selected member + two teachers selected by teachers board
OAB42-034|Md14/1|audit board elects chair and division of work within first week
OAB42-035|Md14/2|term one year
OAB42-036|Md14/3|chair maximum three elections
OAB42-037|Md14/4|at least two audits per year
OAB42-038|Md14/4|interim reports to executive board
OAB42-039|Md14/4|final activity-period report to general assembly
OAB42-040|Md14/5|illegal/ultra vires activity may trigger extraordinary assembly
OAB42-041|HB-2225|retained title exact matches Md8+Md14 organ
OAB42-042|HB-2225|HEM applicability established by broad non-formal scope
OAB42-043|HB-2225|exact parent provision Md14
OAB42-044|HB-2225|ARTICLE_VERIFIED eligible
OAB42-045|guard|old candidate Md18/25 was finance-family similarity, not organ-formation exact article
OAB42-046|guard|ARTICLE_VERIFIED corrects candidate to Md9/Md12/Md14
OAB42-047|guard|HEM generic education-year-beginning timing is corrected to exact current organ timing
OAB42-048|guard|annual/new institution timing stored as parameterized branch
OAB42-049|migration|0
OAB42-050|snapshot|completed OAB instances immutable

## C. HEM Eser İnceleme ve Seçme Kurulu — 30 atoms
SOC42-001|Social Activities Md1|purpose explicitly covers formal and non-formal education institutions
SOC42-002|Md2|scope explicitly covers formal and non-formal education institutions
SOC42-003|Md4/c|education institution definition includes formal and non-formal school/institution
SOC42-004|Md7/4|HEM social activities may be organized optionally
SOC42-005|Md12/1|education institutions may publish social-activity publications
SOC42-006|Md12/2-a|Eser İnceleme ve Seçme Kurulu is created for this purpose
SOC42-007|Md12/2-a|chair principal or delegated vice principal
SOC42-008|Md12/2-a|two teachers members
SOC42-009|Md12/2-a|relevant social-activities club adviser member
SOC42-010|Md12/2-a|representative student member
SOC42-011|Md12/2-b|board responsible for publications
SOC42-012|Md12/2-b|responsible for content
SOC42-013|Md12/2-b|responsible for review
SOC42-014|Md12/2-b|responsible for selection
SOC42-015|Md12/2-c|number/types of publications determined by social activities board and approved by principal
SOC42-016|Md12/2-ç|review/evaluation/selection records retained
SOC42-017|Md12/2-ç|published work copies retained
SOC42-018|Md12/2-ç|removed wall-newspaper copies retained
SOC42-019|Md12/2-ç|retention period two years
SOC42-020|HB-2226|retained title exact match
SOC42-021|HB-2226|retained scope HEM
SOC42-022|HB-2226|HEM explicitly non-formal and Md7/4 applicability exists
SOC42-023|HB-2226|workflow applicability conditional on relevant publication/social-activity purpose
SOC42-024|HB-2226|exact parent provision Md12/2-a
SOC42-025|HB-2226|supporting duties Md12/2-b-ç
SOC42-026|HB-2226|ARTICLE_VERIFIED eligible
SOC42-027|guard|do not hardcode 'education-year beginning'; trigger is publication/social-activity need
SOC42-028|guard|HB-2217 is distinct scope/workflow and is not recounted
SOC42-029|migration|0
SOC42-030|snapshot|evidence retention two years versioned

## D. RAM/BİLSEM unresolved exact guards — 20 atoms
VER42-001|HB-2227|retained title confirmed Merkez Komisyon Kurulu
VER42-002|HB-2227|retained scope confirmed RAM
VER42-003|HB-2227|current ÖEHY has Özel Eğitim Değerlendirme Kurulu, not Merkez Komisyon Kurulu
VER42-004|HB-2227|no current exact named organ established; WITHHELD
VER42-005|BİLSEM Md26|Merkez Tanılama Sınav Komisyonu current organ
VER42-006|BİLSEM Md28|İl Tanılama Sınav Komisyonu current organ
VER42-007|BİLSEM Md40|Proje Jürisi current organ
VER42-008|guard|HB-2227 Merkez Komisyon Kurulu must not be renamed to BİLSEM Merkez Tanılama Sınav Komisyonu
VER42-009|guard|RAM scope and BİLSEM scope differ
VER42-010|guard|similar 'Merkez ... Komisyonu' wording insufficient
VER42-011|SPED Md39|Özel Eğitim Hizmetleri Kurulu current il/ilçe MEM organ
VER42-012|guard|no recovered HB-2223..2227 row matches Özel Eğitim Hizmetleri Kurulu
VER42-013|guard|HB-2228 already verified Özel Eğitim Değerlendirme Kurulu and not recounted
VER42-014|school-health|HB-2218/HB-2229 remain unresolved scope split
VER42-015|duplicate|HB-2223/24/25 are distinct HEM scoped workflows despite same organ titles existing in other school-type rows
VER42-016|duplicate|distinct scope allowed only because retained workflow IDs are distinct and applicability exact
VER42-017|source|handbook is provenance only
VER42-018|source|current regulations/directives are legal authority
VER42-019|migration|0
VER42-020|next|use recovered master artifacts to resolve remaining high IDs

## Counts
- Canonical recovery: 20
- HEM OAB: 50
- HEM Eser: 30
- Guards: 20
- TOTAL: 120
- Migration: 0
