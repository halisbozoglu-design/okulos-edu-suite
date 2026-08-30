-- Close legacy Data API exposure left by the pre-ledger Cloud baseline.
-- Access to these relations is through permission-checked RPCs; direct client
-- access must be explicitly added later with a tenant-scoped RLS policy.
do $$
declare
  relation_name text;
  fn regprocedure;
begin
  foreach relation_name in array array[
    'class_timetable_application_selections',
    'legal_rule_definitions',
    'official_curriculum_catalog_status',
    'official_general_timetable_profiles',
    'official_general_timetable_rows',
    'official_institution_timetable_overrides',
    'official_source_change_queue',
    'official_source_registry',
    'official_source_snapshots',
    'official_timetable_application_profiles',
    'official_timetable_application_rules',
    'official_timetable_scope_catalog',
    'schedule_repair_suggestions'
  ] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('revoke all on table public.%I from anon, authenticated', relation_name);
  end loop;

  -- PostgreSQL otherwise grants EXECUTE to PUBLIC by default. Explicit grants
  -- to authenticated made by canonical migrations remain in force.
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('revoke all on function %s from public', fn);
  end loop;
end
$$;
