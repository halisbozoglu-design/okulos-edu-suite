-- Reject post-processing of scenarios generated from an obsolete timetable revision.

create or replace function public.assert_schedule_scenario_fresh_v2(p_scenario_id uuid)
returns void
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_basis bigint;
  v_current bigint;
  v_status text;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED';end if;

  select basis_revision,status
  into v_basis,v_status
  from public.schedule_scenarios
  where id=p_scenario_id;

  if not found then raise exception 'SCENARIO_NOT_FOUND';end if;
  if v_status not in ('generated','selected') then raise exception 'SCENARIO_NOT_APPLICABLE_STATUS: %',v_status;end if;

  select revision into v_current
  from public.schedule_engine_state
  where id=true;

  if v_basis is null or v_basis<>v_current then
    raise exception 'STALE_SCENARIO_REGENERATE: scenario revision %, current revision %',coalesce(v_basis,-1),v_current;
  end if;
end;
$$;
revoke all on function public.assert_schedule_scenario_fresh_v2(uuid) from public;
grant execute on function public.assert_schedule_scenario_fresh_v2(uuid) to authenticated;

-- Rescore is the final post-processing step used by the client. It must fail closed
-- if any critical timetable input changed after generation.
create or replace function public.rescore_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_score integer;
begin
  perform public.assert_schedule_scenario_fresh_v2(p_scenario_id);
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
