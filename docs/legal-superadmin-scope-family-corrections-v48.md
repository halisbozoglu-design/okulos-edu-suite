# Super Admin Scope / Legal-Family Corrections — V48

Date: 2026-08-29
Migration: 0

## HB-0602
Current master title: `Okullardan gelen okul rehberlik programlarının incelenmesi ve inceleme formlarının okullara ulaştırılması`
Current erroneous scope: `PANSİYONLU OKULLAR İŞ VE İŞLEMLERİ`
Correct target scope: RAM / Rehberlik ve Psikolojik Danışma
Current authority: MEB Rehberlik ve Araştırma Merkezi Yönergesi Md5/4-a, especially school RPD program examination/evaluation/feedback duty.
Action: `SCOPE_CORRECTION_READY`.
Publication rule: Super Admin approves durable definition correction; historical completed instances remain unchanged.
Count rule: do not ARTICLE_VERIFY before corrected scope is published.

## HB-0603
Current title: `Okul risk haritalarının uygulanması`
Current candidate legal family was incorrectly weak/ambiguous.
Current law distinguishes creation and delivery responsibilities:
- RPD Yönetmeliği Md21/4-b/3: school guidance service aggregates risk data and creates school risk map.
- RPD Yönetmeliği Md18/1-m: education institution director ensures the risk map reaches the relevant RAM in November.
The wording `uygulanması` does not identify which atomic action/actor is intended.
Action: `ACTION_SCOPE_REWRITE_REQUIRED`.
Proposed split candidates after source provenance review:
1. SCHOOL_RISK_MAP_CREATE
2. SCHOOL_RISK_MAP_SEND_TO_RAM
3. RAM_RISK_DATA_REVIEW/FEEDBACK only if an exact RAM authority is recovered.
Do not infer item 3 from item 1 or 2.

## HB-0943 / HB-0944
Same source page/lines, same month and same text.
Action: `DUPLICATE_EXTRACTION_REVIEW`.
No deletion without provenance audit. One durable parent may remain with historical alias/cross-reference if confirmed.

## Counseling + violence-plan compounds
HB-0206, HB-0600, HB-0763, HB-1040 = `SPLIT_REQUIRED`.
Create independent legal parents for counseling-measure case and violence-plan responsibility. Month remains calendar-instance metadata.

## Safety guards
- no unrelated HB-ID reuse;
- no scope correction retroactively mutates completed evidence;
- legal-family change requires Super Admin review;
- future workflow generation uses corrected durable parent;
- notification routing follows school type / feature / geography / role after global legal scan.
