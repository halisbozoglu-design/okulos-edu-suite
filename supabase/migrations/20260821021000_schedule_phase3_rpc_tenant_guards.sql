-- Phase 3 RPC boundary: every scenario-mutating/read-validation RPC must prove tenant ownership.

create or replace function public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id uuid)
returns void language plpgsql stable security definer set search_path=public as $$
declare v_tenant text:=public.current_tenant_code();
begin
  if v_tenant is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  if not exists(select 1 from public.schedule_scenarios s where s.id=p_scenario_id and s.institution_code=v_tenant) then
    raise exception 'SCENARIO_NOT_FOUND_IN_TENANT';
  end if;
end $$;
revoke all on function public.assert_schedule_scenario_tenant_phase3_v1(uuid) from public;

alter function public.validate_schedule_scenario_v2(uuid)
rename to validate_schedule_scenario_pre_phase3_tenant;
create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return public.validate_schedule_scenario_pre_phase3_tenant(p_scenario_id);
end $$;

alter function public.repair_schedule_scenario_v2(uuid)
rename to repair_schedule_scenario_pre_phase3_tenant;
create or replace function public.repair_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_before integer;v_after integer;v_result integer;
begin
  perform public.open_permission_context('schedule.generate');
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  select coalesce(sum(affected_count),0)::integer into v_before from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);
  v_result:=public.repair_schedule_scenario_pre_phase3_tenant(p_scenario_id);
  perform public.validate_schedule_scenario_v2(p_scenario_id);
  select coalesce(sum(affected_count),0)::integer into v_after from public.get_schedule_scenario_hard_issues_v2(p_scenario_id);
  if v_after>v_before then raise exception 'REPAIR_WORSENED_HARD_ISSUES: % -> %',v_before,v_after;end if;
  return v_result;
end $$;

alter function public.rescore_schedule_scenario_v2(uuid)
rename to rescore_schedule_scenario_pre_phase3_tenant;
create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
begin
  perform public.open_permission_context('schedule.generate');
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return public.rescore_schedule_scenario_pre_phase3_tenant(p_scenario_id);
end $$;

alter function public.assign_classrooms_to_scenario(uuid)
rename to assign_classrooms_to_scenario_pre_phase3_tenant;
create or replace function public.assign_classrooms_to_scenario(p_scenario_id uuid)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql security definer set search_path=public as $$
begin
  if not(public.has_permission('schedule.generate') or public.has_permission('classrooms.manage')) then
    raise exception 'PERMISSION_DENIED: schedule.generate/classrooms.manage';
  end if;
  perform set_config('app.okulos_permission',case when public.has_permission('schedule.generate') then 'schedule.generate' else 'classrooms.manage' end,true);
  perform public.assert_schedule_scenario_tenant_phase3_v1(p_scenario_id);
  return query select * from public.assign_classrooms_to_scenario_pre_phase3_tenant(p_scenario_id);
end $$;

-- Re-wrap generation: permission is explicit and every returned scenario must belong to caller tenant.
alter function public.generate_schedule_scenarios_v2()
rename to generate_schedule_scenarios_pre_phase3_tenant;
create or replace function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare r record;
begin
  perform public.open_permission_context('schedule.generate');
  if public.current_tenant_code() is null then raise exception 'TENANT_CONTEXT_REQUIRED';end if;
  for r in select * from public.generate_schedule_scenarios_pre_phase3_tenant() loop
    perform public.assert_schedule_scenario_tenant_phase3_v1(r.scenario_id);
    generation_group:=r.generation_group;scenario_id:=r.scenario_id;scenario_no:=r.scenario_no;
    score:=r.score;unplaced_count:=r.unplaced_count;row_count:=r.row_count;return next;
  end loop;
end $$;

revoke all on function public.validate_schedule_scenario_v2(uuid),public.repair_schedule_scenario_v2(uuid),public.rescore_schedule_scenario_v2(uuid),public.assign_classrooms_to_scenario(uuid),public.generate_schedule_scenarios_v2() from public;
grant execute on function public.validate_schedule_scenario_v2(uuid),public.repair_schedule_scenario_v2(uuid),public.rescore_schedule_scenario_v2(uuid),public.assign_classrooms_to_scenario(uuid),public.generate_schedule_scenarios_v2() to authenticated;
