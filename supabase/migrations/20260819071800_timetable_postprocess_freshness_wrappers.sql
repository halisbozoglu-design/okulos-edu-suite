-- Freshness wrappers for post-generation mutations.
-- Keep the proven core implementations intact and guard their public entry points.

alter function public.repair_schedule_scenario_v2(uuid)
rename to repair_schedule_scenario_core_v2;

create or replace function public.repair_schedule_scenario_v2(p_scenario_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.assert_schedule_scenario_fresh_v2(p_scenario_id);
  return public.repair_schedule_scenario_core_v2(p_scenario_id);
end;
$$;
revoke all on function public.repair_schedule_scenario_v2(uuid) from public;
grant execute on function public.repair_schedule_scenario_v2(uuid) to authenticated;

alter function public.assign_classrooms_to_scenario(uuid)
rename to assign_classrooms_to_scenario_core_v2;

create or replace function public.assign_classrooms_to_scenario(p_scenario_id uuid)
returns table(assigned_count integer,unassigned_count integer)
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.assert_schedule_scenario_fresh_v2(p_scenario_id);
  return query
  select * from public.assign_classrooms_to_scenario_core_v2(p_scenario_id);
end;
$$;
revoke all on function public.assign_classrooms_to_scenario(uuid) from public;
grant execute on function public.assign_classrooms_to_scenario(uuid) to authenticated;
