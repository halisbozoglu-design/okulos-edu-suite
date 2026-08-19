-- One authoritative post-generation pipeline for a scenario.
-- Repair may move rows; therefore room assignment, hard validation and score must be refreshed together.
create or replace function public.finalize_schedule_scenario_v2(p_scenario_id uuid)
returns table(repaired_count integer,hard_issue_count integer,score integer,applicable boolean)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_repaired integer;
  v_hard integer;
  v_score integer;
  v_unplaced integer;
  v_rooms integer;
begin
  if not public.is_manager_or_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if not exists(select 1 from public.schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND'; end if;

  v_repaired:=public.repair_schedule_scenario_v2(p_scenario_id);
  v_hard:=public.validate_schedule_scenario_v2(p_scenario_id);
  v_score:=public.rescore_schedule_scenario_v2(p_scenario_id);

  select count(*)::integer into v_unplaced from public.schedule_unplaced_items where scenario_id=p_scenario_id;
  select count(*)::integer into v_rooms from public.schedule_room_assignment_issues where scenario_id=p_scenario_id;

  return query select v_repaired,v_hard,v_score,(v_unplaced=0 and v_rooms=0 and v_hard=0);
end;
$$;
revoke all on function public.finalize_schedule_scenario_v2(uuid) from public;
grant execute on function public.finalize_schedule_scenario_v2(uuid) to authenticated;
