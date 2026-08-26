create or replace function public.optimize_classrooms_to_scenario_v2(p_scenario_id uuid,p_preserve_locked boolean default true)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql security definer set search_path=public as $$
begin
  if not(public.has_permission('schedule.generate') or public.has_permission('classrooms.manage')) then raise exception 'PERMISSION_DENIED: schedule.generate/classrooms.manage';end if;
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  perform public.assert_schedule_scenario_fresh_v2(p_scenario_id);
  update public.schedule_scenario_rows set classroom_id=null where scenario_id=p_scenario_id and (not p_preserve_locked or not locked);
  return query select * from public.assign_classrooms_to_scenario_core_v2(p_scenario_id);
end $$;
revoke all on function public.optimize_classrooms_to_scenario_v2(uuid,boolean) from public;
grant execute on function public.optimize_classrooms_to_scenario_v2(uuid,boolean) to authenticated;
