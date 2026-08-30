# V55 — RPD privacy + School Health scope reconciliation

Date: 2026-08-29
Migration: 0
Lovable: 0

## HB-2047 — exact current parent recovered
Canonical master action: `Öğrenci hakkındaki özel ve gizlilik içeren bilgiler korunmaktadır.`

Current source chain:
- MEB Rehberlik ve Psikolojik Danışma Hizmetleri Etik Yönergesi is still listed by ORGM/MEB as current guidance.
- Md4/1-c: confidentiality is a basic ethical principle.
- Md9/1-ç: education institution principal does not request service-required private/confidential information and documents concerning students from counsellor/psychological counsellor.
- Md10/1-b,c: assistant principal protects security/confidentiality of RPD records and does not request service-required private/confidential information/documents.
- Md11/1-c/1: counsellor/psychological counsellor does not share service-required private/confidential information/documents without individual consent (or guardian consent for minors), except judicial/administrative investigation scope.
- Current RPD Regulation definition of `danışan dosyası` independently confirms that service-required private/confidential information is protected against unauthorized disclosure.

Verdict: `ARTICLE_VERIFIED_NEW` for HB-2047, anchored primarily to Etik Yönerge Md11/1-c/1 and operationally reinforced by Md9/1-ç + Md10/1-b,c. This is actor/action/scope exact enough for the canonical compliance action.

## HB-2045 — do not promote yet
Canonical: `e-Okul sistemindeki öğrenci gelişim dosyaları doldurulmaktadır.`

The old 2008 primary-education provision explicitly required e-Okul student development files, but that historical article cannot be treated as current universal authority. Current secondary-school legislation still contains an electronic `öğrenci gelişim dosyası` construct, while current primary/lower-secondary rules increasingly use `Gelişim Raporu/e-Rapor` and school-type-specific structures. Therefore the master row is too broad for a universal ARTICLE_VERIFIED state.

Status: `SCHOOL_TYPE_SPLIT_REQUIRED + CURRENT_PARENT_RESEARCH`.

## HB-2218 — BİLSEM / School Health team
Master scope: BİLSEM.
Current 2022 School Health Nurses Directive Md1-2 is limited to MEB official/private schools and school-health nursing services. Md4/ç defines the School Health Management Team with school employer/representative, OHS members, school health nurse and guidance teacher. Md6/2 obliges school management to establish and operate the team.

BİLSEM is a special education institution/center; the school-health directive must not be automatically extended merely because a handbook listed the team under BİLSEM.

Status: `WITHHELD_SCOPE_APPLICABILITY_REVIEW`.

## HB-2229 — RAM / School Health team
Master scope: RAM.
RAM is not a school under the exact scope language of the 2022 School Health Nurses Directive. The directive does not create a RAM-specific School Health Management Team. Handbook listing is insufficient.

Status: `WRONG_SCOPE_CANDIDATE + WITHHELD_CURRENT_PARENT_NOT_FOUND`.

## Scope rule added
A named organ may be exact by title but still fail ARTICLE_VERIFIED when the source's institution class excludes the master scope. Required tuple remains:
`workflow_id + current source + exact provision + exact actor/action + exact institutional applicability`.
