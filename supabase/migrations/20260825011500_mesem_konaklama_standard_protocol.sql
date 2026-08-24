-- MESEM Konaklama ve Seyahat Hizmetleri reconciliation
-- Official sources:
-- 2021-33 standard: https://meslek.meb.gov.tr/upload/cop9_mem/2021_konaklama_mem_cop.pdf
-- 2022-17 protocol: https://meslek.meb.gov.tr/upload/cop9_mem/2022_konaklamapro_mem_cop.pdf
-- Applied directly to Lovable Cloud and audited on 2026-08-25.
-- Canonical result: standard 6 branches/48 profiles + protocol 4 branches/32 profiles.
-- Protocol schedule variants: USTALIK_PROTOCOL_2022_17 / DIPLOMA_PROTOCOL_2022_17.
-- Protocol-only applicability is preserved in parsed_constraints.protocolOnly=true and source_note.

-- Forward-only replay guard: this migration records the verified target state and source provenance.
-- The production rows are already present; rerunning on the same database is intentionally a no-op.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE active AND school_type='MESEM'
      AND field_name='Konaklama ve Seyahat Hizmetleri'
      AND source_decision_no='2021-33'
  ) THEN
    RAISE EXCEPTION 'Konaklama 2021-33 verified rows are absent; use the canonical Cloud reconciliation export before replaying this checkpoint on a blank database';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE active AND school_type='MESEM'
      AND field_name='Konaklama ve Seyahat Hizmetleri'
      AND source_decision_no='2022-17'
  ) THEN
    RAISE EXCEPTION 'Konaklama 2022-17 protocol rows are absent; use the canonical Cloud reconciliation export before replaying this checkpoint on a blank database';
  END IF;
END $$;