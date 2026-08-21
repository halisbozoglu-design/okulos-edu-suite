\set ON_ERROR_STOP on

-- Phase 4 real-DB contract checks. These run only after every migration has been applied
-- to a clean local Supabase PostgreSQL instance.

do $$
begin
  if to_regprocedure('public.current_tenant_code()') is null then raise exception 'current_tenant_code missing'; end if;
  if to_regprocedure('public.generate_schedule_scenarios_v2()') is null then raise exception 'generate_schedule_scenarios_v2 missing'; end if;
  if to_regprocedure('public.apply_schedule_scenario(uuid)') is null then raise exception 'apply_schedule_scenario missing'; end if;
  if to_regprocedure('public.publish_current_schedule(date,text,text,text)') is null then raise exception 'publish_current_schedule missing'; end if;
  if to_regprocedure('public.get_schedule_preparation_readiness()') is null then raise exception 'preflight missing'; end if;
  if to_regprocedure('public.get_schedule_integrity_report()') is null then raise exception 'integrity report missing'; end if;
  if to_regprocedure('public.get_effective_schedule_rule_v2(uuid,uuid)') is null then raise exception 'effective scoped rule missing'; end if;
end $$;

do $$
declare r record;
begin
  for r in select * from (values
    ('teacher_schedule'),('schedule_scenarios'),('schedule_scenario_rows'),('schedule_rule_overrides'),
    ('schedule_rule_modes'),('schedule_time_profiles'),('academic_years'),('profiles')
  ) v(table_name)
  loop
    if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=r.table_name and c.relrowsecurity) then
      raise exception 'RLS missing on %',r.table_name;
    end if;
  end loop;
end $$;

do $$
begin
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='uq_schedule_time_profile_active_per_tenant') then raise exception 'tenant active-time-profile unique index missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='uq_schedule_rule_override_tenant_requirement') then raise exception 'tenant requirement override unique index missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='uq_schedule_rule_override_tenant_assignment') then raise exception 'tenant assignment override unique index missing'; end if;
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.tenant_scope_registry where scope='tenant';
  if n < 10 then raise exception 'tenant scope registry unexpectedly small: %',n; end if;
  if exists(
    select 1 from public.tenant_scope_registry r
    join pg_class c on c.relname=r.table_name
    join pg_namespace ns on ns.oid=c.relnamespace and ns.nspname='public'
    where r.scope='tenant' and c.relkind='r' and not c.relrowsecurity
  ) then raise exception 'tenant registry contains a table without RLS'; end if;
end $$;

do $$
begin
  -- Phase 3 hardening must be physically present in the final migrated definitions.
  if pg_get_functiondef('public.validate_schedule_scenario_v2(uuid)'::regprocedure) not ilike '%assert_schedule_scenario_tenant_phase3_v1%' then raise exception 'scenario validation tenant gate missing'; end if;
  if pg_get_functiondef('public.apply_schedule_scenario(uuid)'::regprocedure) not ilike '%validate_schedule_scenario_v2%' then raise exception 'apply scenario validation gate missing'; end if;
  if pg_get_functiondef('public.publish_current_schedule(date,text,text,text)'::regprocedure) not ilike '%PUBLISH_BLOCKED_BY_HARD_ISSUES%' then raise exception 'publish hard gate missing'; end if;
  if pg_get_functiondef('public.get_schedule_preparation_readiness()'::regprocedure) not ilike '%SYNC_GROUP_NO_COMMON_WINDOW%' then raise exception 'Phase 3 sync preflight missing'; end if;
end $$;

select 'phase4_schema_contract_ok' as result;
