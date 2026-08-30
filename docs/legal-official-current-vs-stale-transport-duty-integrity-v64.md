# V64 — Official-current source integrity / transport & duty reconciliation

Date: 2026-08-30
Repo: halisbozoglu-design/okulos-edu-suite
Migration: 0
Lovable: 0

## Source policy
Only official current sources are eligible for ARTICLE_VERIFIED: mevzuat.gov.tr, mevzuat.meb.gov.tr, meb.gov.tr official units, resmigazete.gov.tr.
A File Library copy may prove master wording/history but cannot outrank a currently served official consolidated text.

## Duty-profile duplicate search
Master/File Library search for school-type-specific durable equivalents of HB-1655..HB-1665 returned the same broad ALL master rows and derivative copies; no clean separate durable LİSE/MID sibling was established. Therefore correction path remains MASTER_SCOPE_REWRITE/SPLIT -> Super Admin approval -> publish, not duplicate promotion.

## Stale-copy conflict confirmed
Some uploaded historical OÖKY PDFs contain older Md91 wording (30-minute default / postpartum two years). Current official MEB consolidated `mevzuat.meb.gov.tr/dosyalar/1657.pdf` currently serves Md91 with:
- Md91/1: duty by roster;
- Md91/2-a: least-teaching-day assignment;
- Md91/2-b: kadrosunun bulunduğu okul / otherwise most courses;
- Md91/2-c: 15 minutes before + 15 minutes after; transport-school council may extend to 30 minutes;
- Md91/2-ç: 12 weeks before birth + one year after birth;
- Md91/2-d/e/f/g/ğ/h as currently served.
Current official OÖİKY `1703.pdf` Md44 separately uses 30-minute default reducible to minimum 15, three months before birth + one year after birth, and its own conditions.
Guard: CURRENT_OFFICIAL_CONSOLIDATED_OVERRIDES_STALE_UPLOADED_COPY.

## HB-1574 — annual-source expiry integrity rollback
Master: school-bus rear `OKUL TAŞITI` sign carries readable il/ilçe MEM complaint telephone wording.
Previously ARTICLE_VERIFIED from 2025-2026 official annual technical specification clause 2.3.
As of 2026-08-30, DHGM official page has published a 2026-2027 İlk-Ortaöğretim Taşıma Teknik Şartname and therefore the 2025-2026 annual child cannot by itself prove current-year exact effect.
The new 2026-2027 DOCX link is officially present, but the web reader cannot parse its DOCX content in this pass. No secondary fallback is allowed.
Status: ROLLBACK_ARTICLE_VERIFIED + YEAR_PARAMETER_CURRENT_CLAUSE_RECHECK.
Delta -1.
Historical 2025-2026 instances remain immutable.

## HB-1575 — fire extinguisher
Master: usable fire extinguisher exists in service vehicle.
Official current MEB `1959.pdf` Md5/1-ç requires equipment/materials prescribed by AİTM and Karayolları Traffic legislation to be present and usable, but it does not itself name fire extinguisher in the exact provision text. Exact cross-regulation provision not locked in this pass.
Status: WITHHELD_CURRENT_EXACT_CHILD_NOT_LOCKED.

## HB-1576 — new exact
Master: vehicle doors are automatic or manually controlled by driver.
Official current MEB `1959.pdf`, Md5/1-d: doors may be automatic and driver-operated or mechanically/manual driver-controlled; if automatic, open/closed status is transmitted optically/acoustically.
Actor/object/action/alternative semantics match the master.
No prior ARTICLE_VERIFIED occurrence found in Batch11 excerpt; HB-1576 is promoted.
Status: ARTICLE_VERIFIED.
Delta +1.

## HB-1577
Current transport Regulation 2024 amendment Md13/1-ğ requires monthly school-bus and guide-personnel puantajs to be sent at each month end to MEM. Retained from prior verification; delta 0.

## HB-1666 precision guard
Transport Regulation can require a transport problem to be entered into a duty book or documented by minutes in its conditional context. This does not establish a universal school-wide duty-book-maintenance workflow. HB-1666 remains withheld.

## V64 counter effect
ARTICLE_VERIFIED: 467 -> 467 (+1 HB-1576 / -1 HB-1574).
No denominator change.
