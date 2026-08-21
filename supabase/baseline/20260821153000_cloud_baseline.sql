-- OkulOS canonical production baseline: 2026-08-21 15:30 Europe/Istanbul
-- This file is a verified baseline CONTRACT, not a historical replay script.
-- Legacy migrations before this version remain immutable and must not be replayed from zero.
-- New database changes must be forward-only migrations with versions > 20260821153000.

DO $$ BEGIN
  IF to_regclass('public.profiles') IS NULL
     OR to_regclass('public.institutions') IS NULL
     OR to_regclass('public.academic_years') IS NULL
     OR to_regclass('public.legislation_library') IS NULL
     OR to_regclass('public.personnel_registry') IS NULL
     OR to_regclass('public.teacher_schedule') IS NULL
     OR to_regclass('public.schedule_scenarios') IS NULL
     OR to_regprocedure('public.current_tenant_code()') IS NULL
     OR to_regprocedure('public.get_schedule_phase3_preflight_issues_v1()') IS NULL
     OR to_regprocedure('public.apply_schedule_edge_slot_repairs_v1(uuid)') IS NULL
  THEN
    RAISE EXCEPTION 'OkulOS canonical cloud baseline signature mismatch';
  END IF;
END $$;
