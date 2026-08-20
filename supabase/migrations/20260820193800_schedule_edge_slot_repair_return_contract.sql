-- Preserve the public RPC return contract exactly after the edge-slot post processor.
drop function if exists public.generate_schedule_scenarios_v2();
create function public.generate_schedule_scenarios_v2()
returns table(generation_group uuid,scenario_id uuid,scenario_no smallint,score integer,unplaced_count integer,row_count integer)
language plpgsql security definer set search_path=public as $$
declare
  r record;
  v_score integer;
begin
  for r in select * from public.generate_schedule_scenarios_pre_edge_v2() loop
    perform public.apply_schedule_edge_slot_repairs_v1(r.scenario_id);
    v_score:=public.calculate_schedule_scenario_score_v2(r.scenario_id);
    update public.schedule_scenarios set score=v_score where id=r.scenario_id;
    generation_group:=r.generation_group;
    scenario_id:=r.scenario_id;
    scenario_no:=r.scenario_no::smallint;
    score:=v_score;
    unplaced_count:=r.unplaced_count;
    row_count:=r.row_count;
    return next;
  end loop;
end;$$;
revoke all on function public.generate_schedule_scenarios_v2() from public;
grant execute on function public.generate_schedule_scenarios_v2() to authenticated;
