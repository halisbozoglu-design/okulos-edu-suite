-- Surface configuration-integrity problems in the same report used by the validation UI.

alter function public.get_schedule_integrity_report()
rename to get_schedule_integrity_report_core_v2;

create or replace function public.get_schedule_integrity_report()
returns table(severity text,code text,affected_count integer,detail text)
language sql
stable
security definer
set search_path=public
as $$
  select * from public.get_schedule_integrity_report_core_v2()
  union all
  select 'error'::text,i.code,i.affected_count,i.detail
  from public.get_schedule_configuration_issues_v2() i;
$$;
revoke all on function public.get_schedule_integrity_report() from public;
grant execute on function public.get_schedule_integrity_report() to authenticated;
