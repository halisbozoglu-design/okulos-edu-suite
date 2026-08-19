-- Connect configuration-integrity issues to the existing timetable preparation and publish gates.

alter function public.get_schedule_preparation_readiness()
rename to get_schedule_preparation_readiness_core_v2;

create or replace function public.get_schedule_preparation_readiness()
returns table(category text,code text,status text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select * from public.get_schedule_preparation_readiness_core_v2()
  union all
  select 'yapılandırma'::text,i.code,'error'::text,i.affected_count,i.detail
  from public.get_schedule_configuration_issues_v2() i;
$$;
revoke all on function public.get_schedule_preparation_readiness() from public;
grant execute on function public.get_schedule_preparation_readiness() to authenticated;

create or replace function public.assert_schedule_publishable()
returns boolean
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_bad record;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  perform public.assert_curriculum_ready_for_timetable();

  select * into v_bad
  from public.get_schedule_configuration_issues_v2()
  limit 1;
  if found then
    raise exception 'SCHEDULE_CONFIGURATION_INVALID: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;
  end if;

  select * into v_bad
  from public.get_schedule_integrity_report()
  where severity='error'
  limit 1;
  if found then
    raise exception 'SCHEDULE_NOT_PUBLISHABLE: % (% kayıt) - %',v_bad.code,v_bad.affected_count,v_bad.detail;
  end if;

  return true;
end;
$$;
revoke all on function public.assert_schedule_publishable() from public;
grant execute on function public.assert_schedule_publishable() to authenticated;
