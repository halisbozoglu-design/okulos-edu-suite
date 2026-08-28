# NEW_CANDIDATE Super Admin Publication Pack — V45

Date: 2026-08-28
Migration: 0
Publication mode: STAGING_SUPERADMIN_APPROVAL

## Candidate set

### Special Education
- Özel Eğitim Hizmetleri Kurulu — Özel Eğitim Hizmetleri Yönetmeliği Md39-42 — level IL_ILCE_MEM.

### BİLSEM
- Merkez Tanılama Sınav Komisyonu — Md26-27
- Görsel Sanatlar Değerlendirme Komisyonu — Md30
- Müzik Değerlendirme Komisyonu — Md31
- Okul Yönlendirme Komisyonu — Md32-33
- Bölge Sözlü Sınav Komisyonu — Md34
- İl Öğretmen Değerlendirme Komisyonu — Md35
- Proje Jürisi — Md40

## Required publication fields
Each candidate must receive on approval:
- new durable workflow_id
- canonical title
- legal source/version
- exact article/paragraph
- institution/school-type applicability
- organizational level
- member/composition model when fixed by source
- role routes
- trigger/cadence
- evidence/output model
- annual parameter children where applicable
- effective_from/effective_to
- source snapshot/provenance
- impact level
- Super Admin approval event

## Non-negotiable guards
- Never reuse unrelated legacy HB-ID.
- Do not mutate completed historical records.
- Annual guide dates remain YEAR_PARAMETER.
- Current directive/regulation beats old handbook labels.
- School-level BEP unit, RAM Özel Eğitim Değerlendirme Kurulu, and il/ilçe Özel Eğitim Hizmetleri Kurulu remain distinct entities.

## Approval transaction without migration
Publication is data/version release, not schema migration:
`DRAFT -> LEGAL_REVIEWED -> SUPERADMIN_APPROVED -> PUBLISHED`

Master workflow denominator changes only after approved publication is committed to the production master inventory; until then ARTICLE_VERIFIED remains measured over the existing 2,229 legacy master.
