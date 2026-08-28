# Okulos Mevzuat Doğrulama — Kanonik Handoff

Güncelleme: 2026-08-29
Durum: AKTİF
Repo: `halisbozoglu-design/okulos-edu-suite`
Mode: `ARTICLE_VERIFIED_PRIORITY`
Migration: **0**

## Güncel kesin durum
- Master workflow: **2.229**
- ARTICLE_VERIFIED: **467 / 2.229 = %20,9511**
- Kalan exact doğrulama: **1.762**
- Büyük atomik mevzuat havuzu: **7.215**
- Son tamamlanan batch: **V48**
- Sonraki batch: **V49**

## V47
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v47.md` — `710ba3feb128a1ddeb18adc27ea263fc50513834`
- Verification: `docs/legal-article-verified-batch-v47.md` — `c3b17ce2ee9e4758c3f17e7febe1ac6b774d3299`
- Progress: `docs/legal-verification-progress-v47-delta.json` — `329a092db6a80e4fd9d9c96f1845676dd8e210ae`
- Result: **467/2229**; atom pool **6.675**.
- Current 2026 counseling authority: 24.04.2026 Resmî Gazete daily issue **33233**. ORGM listing `33223` is treated as metadata typo.

## V48 — 540 atom
- Coverage: `docs/legal-article-verified-focused-deepening-batch-300plus-v48.md` — `ec7f56f5ef008d71260f9d6e82bf398679c43db7`
- RAM counseling parent manifest: `docs/legal-ram-counseling-parent-manifest-v48.md` — `8d1aae8993398ab704b685ad3a80ac9c92e9f890`
- Super Admin corrections: `docs/legal-superadmin-scope-family-corrections-v48.md` — `ca96a90c436346c0aaaab261ac7c2136cfd6e6c6`
- Progress: `docs/legal-verification-progress-v48-delta.json` — `1aeeb0fac6f362984b595c33a41b5d1a6b48fb6d`
- **540 support atoms** added.
- ARTICLE_VERIFIED increment: **0**; result remains **467/2229 = %20,9511**.
- Atom pool: **6.675 -> 7.215**.

### Counseling-measure normalization
Legacy RAM monthly row is split into:
`GENERAL_RAM_INTAKE_INTERVIEW + COUNSELING_MEASURE_CASE + optional VIOLENCE_ACTION_PLAN`
Counseling durable state machine:
`DECISION_RECEIVED -> ASSIGNEE_RESOLVED -> FAMILY_CONTACTED -> PROCESS_STARTED -> FIRST_INTERVIEW -> IMPLEMENTATION_PLAN -> COURT_SUBMISSION -> SESSIONS -> 3_MONTH_EVALUATION -> CONTINUE/MODIFY/END -> FINAL_RECORD`
Current legal parameters are versioned instead of hardcoded by month: assignment 5 workdays; start 3 workdays; family application 10 days; plan-to-court 5 workdays after first interview; 15-day interval; minimum 8 sessions; 3-month review; max 15 active files/counselor; conditional online-session rule.

Known compound/duplicate family:
- `HB-0278`, `HB-0680`, `HB-0943`, `HB-0944`: general interview + counseling measure.
- `HB-0943/HB-0944`: same page/lines/month/text -> `DUPLICATE_EXTRACTION_REVIEW`.
- `HB-0206`, `HB-0600`, `HB-0763`, `HB-1040`: counseling/general interview + Şiddet İl Eylem Planı -> `SPLIT_REQUIRED`.
- `HB-0514`: additional local-manager-meeting semantics -> split.

### HB-0602
Canonical text: `Okullardan gelen okul rehberlik programlarının incelenmesi ve inceleme formlarının okullara ulaştırılması`.
Master scope incorrectly says PANSİYONLU OKULLAR.
Current official ORGM RAM Yönergesi Md5/4-a establishes RAM school-RPD-program examination/evaluation/feedback duty.
Status: `SCOPE_CORRECTION_READY`.
Do **not** ARTICLE_VERIFY until corrected RAM scope is Super Admin approved/published.

### HB-0603
Canonical text: `Okul risk haritalarının uygulanması`.
Current RPD Regulation distinguishes school risk-map creation (Md21/4-b/3) and education-institution delivery to RAM (Md18/1-m). `uygulanması` does not identify actor/action exactly.
Status: `ACTION_SCOPE_REWRITE_REQUIRED`.
Potential atomic children only after source-provenance confirmation:
`SCHOOL_RISK_MAP_CREATE`, `SCHOOL_RISK_MAP_SEND_TO_RAM`, and RAM review only if exact RAM authority exists.
No invented RAM duty.

### Current RAM source family
ORGM official current guidance-legislation page lists the 2020 `Rehberlik ve Araştırma Merkezi Yönergesi`; ORGM 2025 information report also states the 2020 directive remains the RAM operational instrument while update work continues.

## ARTICLE_VERIFIED değişmez kuralı
Sayaç yalnız `workflow_id + güncel resmî kaynak + exact madde/fıkra + matching operational/applicability scope` birebir olduğunda artar.

Guardlar:
- ID-title ilişkisi tahmin edilmez.
- duplicate/calendar-instance ikinci kez sayılmaz.
- yanlış scope/legal-family düzeltilip yayımlanmadan ARTICLE_VERIFIED olmaz.
- general RAM görüşmesi ile mahkeme kararlı danışmanlık tedbiri ayrı parents.
- handbook/el kitabı provenance/evidence; son hukuki otorite değildir.
- compound workflow `WITHHELD/SPLIT` edilir.
- month labels national legal timing değildir.
- completed historical instances immutable.
- tenant override immutable legal core/source değiştiremez.

## Açık kritik kayıtlar
- `HB-2227` — RAM Merkez Komisyon Kurulu current exact named authority yok.
- `HB-2222` — legacy HEM organ adı current organlarla birebir değil.
- `HB-2229` / `HB-2218` — Okul Sağlığı source/scope/composition conflict.
- `HB-2212` — current BİLSEM Yönergesinde Sınıf/Şube Öğretmenler Kurulu yok.
- `HB-2210` — GSL/Spor Liseleri yetenek sınavı annual-guide dependent.
- `HB-2204/2205/2206` — exact title/scope reconciliation.
- `HB-0502` — obsolete annual guide + monthly report compound.
- `HB-0602` — scope correction publication pending.
- `HB-0603` — actor/action rewrite pending.

## V49 önceliği — 300+ atom
1. `HB-0602` için source-exact Md5/4-a alt bent crosswalk + corrected durable-definition payload hazırla.
2. RAM Yönergesi Md5 service-area duties ile standalone master IDs (`HB-0141`, `HB-0208`, `HB-0280`, `HB-0396`, `HB-0685`, `HB-0948` ve benzerleri) birebir eşleştir; exact olanları terfi et.
3. `HB-0603` provenance/source-line ayrıştırmasıyla hangi risk-map actionının amaçlandığını belirle.
4. Counseling-measure monthly family için tam alias/calendar-instance manifestini genişlet.
5. School Health `HB-2218/HB-2229` conflict split.
6. BİLSEM Md29 operational duties + NEW_CANDIDATE publication paketini ilerlet.
7. Migration **0**.

## Repo sınırı
Yalnız `halisbozoglu-design/okulos-edu-suite` üzerinde çalış.
Kullanıcı `Devam` dediğinde soru sormadan **V49** başlat; tek mesajda minimum **300 atom** hedefle.
