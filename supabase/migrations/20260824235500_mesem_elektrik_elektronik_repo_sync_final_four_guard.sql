-- MESEM Elektrik-Elektronik Teknolojisi / 2021-33
-- Repo provenance synchronization guard for four branches that already existed in Cloud.
-- IMPORTANT: this migration does not insert or rewrite curriculum data.
-- It asserts that the pre-existing Cloud state matches the official MTEGM source before
-- the repository is considered synchronized.
-- Official source: https://meslek.meb.gov.tr/upload/cop9_mem/2021_elektrik_mem_cop.pdf
-- Source pages: Görüntü ve Ses=15, Güvenlik=16, Haberleşme=17, Yüksek Gerilim=18.

DO $$
DECLARE
  v_profiles integer;
  v_rows integer;
  v_bad_profiles integer;
  v_bad_ime integer;
BEGIN
  SELECT count(*) INTO v_profiles
  FROM official_curriculum_profiles
  WHERE school_type='MESEM' AND active=true
    AND field_name='Elektrik-Elektronik Teknolojisi'
    AND branch_name IN ('Görüntü ve Ses Sistemleri','Güvenlik Sistemleri','Haberleşme Sistemleri','Yüksek Gerilim Sistemleri');

  IF v_profiles <> 32 THEN
    RAISE EXCEPTION 'MESEM EET provenance guard: expected 32 profiles, got %', v_profiles;
  END IF;

  SELECT count(*) INTO v_rows
  FROM official_course_schedule_catalog
  WHERE school_type='MESEM' AND active=true
    AND field_name='Elektrik-Elektronik Teknolojisi'
    AND branch_name IN ('Görüntü ve Ses Sistemleri','Güvenlik Sistemleri','Haberleşme Sistemleri','Yüksek Gerilim Sistemleri');

  IF v_rows <> 224 THEN
    RAISE EXCEPTION 'MESEM EET provenance guard: expected 224 course rows, got %', v_rows;
  END IF;

  IF (SELECT count(*) FROM official_course_schedule_catalog WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi' AND branch_name='Görüntü ve Ses Sistemleri') <> 55 THEN
    RAISE EXCEPTION 'Görüntü ve Ses Sistemleri expected 55 course rows';
  END IF;
  IF (SELECT count(*) FROM official_course_schedule_catalog WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi' AND branch_name='Güvenlik Sistemleri') <> 57 THEN
    RAISE EXCEPTION 'Güvenlik Sistemleri expected 57 course rows';
  END IF;
  IF (SELECT count(*) FROM official_course_schedule_catalog WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi' AND branch_name='Haberleşme Sistemleri') <> 57 THEN
    RAISE EXCEPTION 'Haberleşme Sistemleri expected 57 course rows';
  END IF;
  IF (SELECT count(*) FROM official_course_schedule_catalog WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi' AND branch_name='Yüksek Gerilim Sistemleri') <> 55 THEN
    RAISE EXCEPTION 'Yüksek Gerilim Sistemleri expected 55 course rows';
  END IF;

  SELECT count(*) INTO v_bad_profiles
  FROM official_curriculum_profiles
  WHERE school_type='MESEM' AND active=true
    AND field_name='Elektrik-Elektronik Teknolojisi'
    AND branch_name IN ('Görüntü ve Ses Sistemleri','Güvenlik Sistemleri','Haberleşme Sistemleri','Yüksek Gerilim Sistemleri')
    AND (
      enterprise_hours <> 32
      OR source_decision_no <> '2021-33'
      OR source_file_name <> 'https://meslek.meb.gov.tr/upload/cop9_mem/2021_elektrik_mem_cop.pdf'
      OR schedule_variant NOT IN ('USTALIK','DIPLOMA')
      OR grade_level NOT BETWEEN 9 AND 12
    );

  IF v_bad_profiles <> 0 THEN
    RAISE EXCEPTION 'MESEM EET provenance guard: % profile(s) violate 2021-33/source/IME invariants', v_bad_profiles;
  END IF;

  SELECT count(*) INTO v_bad_ime
  FROM official_course_schedule_catalog o
  JOIN course_catalog c ON c.id=o.course_id
  WHERE o.school_type='MESEM' AND o.active=true
    AND o.field_name='Elektrik-Elektronik Teknolojisi'
    AND o.branch_name IN ('Görüntü ve Ses Sistemleri','Güvenlik Sistemleri','Haberleşme Sistemleri','Yüksek Gerilim Sistemleri')
    AND c.name='İşletmelerde Mesleki Eğitim'
    AND o.hour_options <> ARRAY[32]::smallint[];

  IF v_bad_ime <> 0 THEN
    RAISE EXCEPTION 'MESEM EET provenance guard: % IME row(s) are not 32 hours', v_bad_ime;
  END IF;

  IF EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi'
      AND branch_name='Görüntü ve Ses Sistemleri' AND source_page<>15
  ) OR EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi'
      AND branch_name='Güvenlik Sistemleri' AND source_page<>16
  ) OR EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi'
      AND branch_name='Haberleşme Sistemleri' AND source_page<>17
  ) OR EXISTS (
    SELECT 1 FROM official_curriculum_profiles
    WHERE school_type='MESEM' AND active=true AND field_name='Elektrik-Elektronik Teknolojisi'
      AND branch_name='Yüksek Gerilim Sistemleri' AND source_page<>18
  ) THEN
    RAISE EXCEPTION 'MESEM EET provenance guard: source-page mismatch';
  END IF;
END $$;
