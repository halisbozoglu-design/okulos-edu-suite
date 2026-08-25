# Current DB State

Updated: 2026-08-25

## Cross-chat handoff rule
- This file is the authoritative continuation point for MTAL/MESEM curriculum work.
- Read Cloud live state first; never re-import completed variants unless an audit proves them wrong.
- Preserve source provenance, field/branch lineage, protocol/regional variants and cohort applicability.
- Cloud-first, forward-only, idempotent migrations; commit the same SQL to `supabase/migrations`.

## Curriculum phase status: CLOSED
- MTAL canonical catalog: 56 fields / 119 branches.
- MESEM canonical catalog: 39 fields / 193 branches.
- `audit_mtal_catalog_completeness_v1()`: 0 findings.
- `audit_mesem_catalog_completeness_v1()`: 0 findings.
- `audit_mtal_curriculum_v1()`: 0 findings.
- MTAL active profiles: 1083; active schedules: 12442; profile-without-schedule: 0; fixed-hour mismatch: 0; `needs_review=true`: 0; source URL blank: 0; decision no blank: 0.
- MESEM active profiles: 1520; active schedules: 9892; profile-without-schedule: 0; fixed-hour mismatch: 0; `needs_review=true`: 0; source URL blank: 0; decision no blank: 0.
- Remaining null `source_page`, `parser_confidence`, or empty `parsed_constraints` are metadata gaps only; do not invent values. Safe metadata normalization already ran.

## Managed catalog exceptions
These are known states, not forgotten completeness errors:
- MESEM `Ulaştırma Hizmetleri / Kargo ve Kurye Hizmetleri`: `MODULAR_PARTIAL`.
- MESEM `Ulaştırma Hizmetleri / Otopark ve Vale Hizmetleri`: `PROGRAM_PENDING`.
- MESEM protocol-only branches: Gazetecilik (Medya Yazılımı, Sosyal Medya, Web İçerik Editörü), Radyo-Televizyon (Video, Ses Üretim ve Kurgu), Uçak Bakım (Hava Aracı Montaj): `PROTOCOL_ONLY`.
- MTAL former 2025/75 generic Gastronomi branches (Mutfak Sanatları, Pastacılık ve Ekmekçilik, Servis ve Kahve Hazırlama): `SUPERSEDED_BY_REGIONAL_PROGRAM`.

## Gastronomi 2026 regional programs
- TTK 2025/75 is withdrawn from 2026-2027.
- Active regional programs:
  - 2026/91 Marmara Gastronomi ve Mutfak Sanatları: Saray Mutfağı; Helvacılık, Şerbet ve Tatlı Sanatları; Misafir Deneyimi ve Servis Yönetimi.
  - 2026/92 Doğu Anadolu Gastronomi ve Mutfak Sanatları: Süt ve Süt Ürünleri; Et ve Et Ürünleri; Misafir Deneyimi ve Servis Yönetimi.
- Stored separately with `school_subtype` regional lineage; AMP, ATP and `ENTERPRISE_FROM_11` variants preserved.
- Regional Gastronomi profiles: 72; profile-without-schedule: 0; fixed-hour mismatch: 0.
- Migration: `20260825050000_mtal_gastronomi_regional_2026_91_92.sql`, commit `ffdf9b40aa11094e59d628c9a5b7bcece421ef7b`.
- `audit_mtal_curriculum_v1()` was updated to include `school_subtype` in its grouping/join key so identical branch names across regional programs are not double-counted.

## Other closed repair work
- Bilişim MESEM schedule backfill completed: 16 profiles / 104 real schedule rows / 0 mismatch; commit `6466db6033ef8d6c181454830f101e3c5f7589f1`.
- Hayvan Yetiştiriciliği ve Sağlığı + İnşaat batch1 forward-only replay reconciliation completed and audited clean; commit `7cda4cfb4c80f2a0c605d25fc11d399fa5cc2be3`.
- Curriculum metadata normalization completed without changing course/profile content; commit `51f436a3d3f81f0ec60e8116734d83386e6b135e`.
- Catalog status/completeness exception layer completed; commit `8ee5065cd83aa399c52cf6b462dea8ad24ecdadf`.

## Next phase
Do not reopen MTAL/MESEM curriculum ingestion unless a new official source or an audit finding requires it.
Next workstream: audit the general weekly course schedule engine across all school types, grades, program variants, electives, group rules, transition cohorts and special cases; then move to norm kadro, teacher/administrator additional lesson rules, collective agreements, Tebliğler Dergisi and Resmî Gazete-based min/max teaching load logic.
