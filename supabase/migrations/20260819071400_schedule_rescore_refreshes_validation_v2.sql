-- Scenario status must never depend on stale integrity rows after repair/manual scenario edits.
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

  -- Refresh hard issues first; schedule_scenario_status_v2 reads this table.
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
