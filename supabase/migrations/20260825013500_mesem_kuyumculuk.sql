-- MESEM Kuyumculuk Teknolojisi 2021-33
-- Official source: https://meslek.meb.gov.tr/upload/cop9_mem/2021_kuyumculuk_mem_cop.pdf
-- Applied directly to Lovable Cloud and audited on 2026-08-25.
-- Canonical result: 3 branches, 24 profiles, 0 fixed-hour mismatches.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM official_curriculum_profiles WHERE active AND school_type='MESEM' AND field_name='Kuyumculuk Teknolojisi' AND source_decision_no='2021-33') THEN
    RAISE EXCEPTION 'Kuyumculuk 2021-33 canonical Cloud reconciliation rows are absent';
  END IF;
END $$;