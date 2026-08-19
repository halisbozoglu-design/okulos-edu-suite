-- Make scenario validation a single-source-of-truth operation.
-- All scenario hard issues are derived from get_schedule_scenario_hard_issues_v2(),
-- which already contains the latest parallel-subgroup slot accounting and guards.

create or replace function public.validate_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_manager_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then
    raise exception 'SCENARIO_NOT_FOUND';
  end if;

  delete from public.schedule_scenario_integrity_issues
  where scenario_id=p_scenario_id;

  insert into public.schedule_scenario_integrity_issues(
    scenario_id,
    code,
    affected_count,
    detail
  )
  select
    p_scenario_id,
    i.code,
    greatest(coalesce(i.affected_count,1),1),
    i.detail
  from public.get_schedule_scenario_hard_issues_v2(p_scenario_id) i
  where coalesce(i.affected_count,0)>0;

  select coalesce(sum(affected_count),0)::integer
  into v_count
  from public.schedule_scenario_integrity_issues
  where scenario_id=p_scenario_id;

  return v_count;
end;
$$;

revoke all on function public.validate_schedule_scenario_v2(uuid) from public;
grant execute on function public.validate_schedule_scenario_v2(uuid) to authenticated;

-- Keep scenario status derived from the same refreshed issue store.
create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_score integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;

  perform public.validate_schedule_scenario_v2(p_scenario_id);
  v_score:=public.calculate_schedule_scenario_score_v2(p_scenario_id);

  update public.schedule_scenarios
  set score=v_score,
      unplaced_count=(select count(*) from public.schedule_unplaced_items where scenario_id=p_scenario_id),
      row_count=(select count(*) from public.schedule_scenario_rows where scenario_id=p_scenario_id)
  where id=p_scenario_id;

  return v_score;
end;
$$;

revoke all on function public.rescore_schedule_scenario_v2(uuid) from public;
grant execute on function public.rescore_schedule_scenario_v2(uuid) to authenticated;
