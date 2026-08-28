# V44 — NEW current named legal-organ candidates

Date: 2026-08-28
Status: STAGING_SUPERADMIN_APPROVAL
Migration: 0

These current named legal organs were confirmed in current official sources but exact durable retained master rows were not found in the existing 2,229-workflow master. They are therefore staged as `NEW_CANDIDATE`; no guessed legacy ID mapping is permitted.

## BİLSEM Yönergesi
1. NEW-BILSEM-MERKEZ-TANILAMA — Merkez Tanılama Sınav Komisyonu — Md26; duties Md27.
2. NEW-BILSEM-GORSEL-DEGERLENDIRME — Görsel sanatlar/resim bireysel değerlendirme komisyonu — Md30.
3. NEW-BILSEM-MUZIK-DEGERLENDIRME — Müzik bireysel değerlendirme komisyonu — Md31.
4. NEW-BILSEM-OKUL-YONLENDIRME — Okul Yönlendirme Komisyonu — Md32; duties Md33.
5. NEW-BILSEM-BOLGE-SOZLU — Bölge Sözlü Sınav Komisyonu — Md34.
6. NEW-BILSEM-IL-OGRETMEN-DEGERLENDIRME — İl Öğretmen Değerlendirme Komisyonu — Md35.
7. NEW-BILSEM-PROJE-JURISI — Proje Jürisi — Md40.

## Special Education Services Regulation
8. NEW-SPED-HIZMETLER-KURULU — Özel Eğitim Hizmetleri Kurulu — Md39; duties/work/placement family Md40-42.

## Existing representations excluded from NEW
- İl Tanılama Sınav Komisyonu — existing durable workflow HB-0501; ARTICLE_VERIFIED in V43.
- BİLSEM Öğretmenler Kurulu — HB-2211; already verified.
- BİLSEM AR-GE Birimi — HB-2219; already verified.
- RAM Özel Eğitim Değerlendirme Kurulu — HB-2228; already verified; distinct from Özel Eğitim Hizmetleri Kurulu.

## Publication policy
`OFFICIAL_CURRENT_SOURCE -> EXACT_NAMED_ORGAN -> MASTER_GAP -> NEW_CANDIDATE -> SUPERADMIN_APPROVAL -> MASTER_ID_ASSIGN -> PUBLISH -> SCHOOL_TYPE/ROLE ROUTING`

No database migration is required. New durable workflows should be introduced through catalog/config seed data and versioned legal-source records.
