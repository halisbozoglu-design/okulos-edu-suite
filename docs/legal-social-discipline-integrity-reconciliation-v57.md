# V57 — Social Activities + Discipline Integrity Reconciliation

Date: 2026-08-29
Migration: 0
Lovable: 0

## Social Activities — source corrections, no counter delta
Batch02 had these rows ARTICLE_VERIFIED against generic OÖİKY 2026 Md9. The actions survive, but the exact legal family/source is the current MEB Eğitim Kurumları Sosyal Etkinlikler Yönetmeliği.

- HB-2082 — society-service participants + documents entered into e-Okul Social Activities Module -> Md9/3. RETAIN ARTICLE_VERIFIED; source correction only.
- HB-2083 — planned society-service work determined by Social Activities Board after stakeholder views -> Md9/5. RETAIN; source correction only.
- HB-2088 — school/class competitions, rules/topics determined under principal chair with relevant club advisers in Social Activities Board -> Md11/2. RETAIN; source correction only.
- HB-2089 — Eser İnceleme ve Seçme Kurulu composition and publication review responsibility -> Md12/2-a and Md12/2-b. RETAIN; source correction only.
- HB-2095 — work/transactions of Social Activities Board evaluated in teachers-board meetings -> Md6/8. RETAIN; source correction only.

## Discipline / archive integrity
- HB-2132 — Onur Kurulu decisions written in Onur Kurulu decision book -> current OÖKY Md184. RETAIN ARTICLE_VERIFIED; prior OÖİKY Md36 mapping superseded. Counter delta 0.
- HB-2136 — in schools with a guidance service, guidance service prepares the student's personality/social-status report for the principal in a disciplinary case -> current OÖKY Md192/1. RETAIN; prior generic OÖİKY Md9 mapping superseded. Counter delta 0.
- HB-2139 — compound master row combines two legally distinct actions:
  1. reasoned discipline-board decision written/attached to decision book -> OÖKY Md196/1;
  2. all penalties notified to parents under service-of-notice rules and receipt retained -> OÖKY Md169/5.
  Whole-row ARTICLE_VERIFIED violates atomicity guard. Status: ROLLBACK_ARTICLE_VERIFIED + SPLIT_REQUIRED. Counter delta -1.

## Atomic staging for HB-2139
Child A candidate: DISCIPLINE_DECISION_WRITE_AND_SIGN -> OÖKY Md196/1-3.
Child B candidate: DISCIPLINE_PENALTY_NOTIFY_PARENT -> OÖKY Md169/5.
Before NEW IDs are created, search master for existing standalone equivalents. Denominator remains 2,229 until durable IDs are SA-approved/published.

## Result
ARTICLE_VERIFIED: 467 -> 466.
Migration: 0.
Lovable: 0.
