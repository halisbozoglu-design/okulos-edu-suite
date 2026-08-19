create or replace view public.schedule_scenario_status_v2
with (security_invoker=true)
as
select s.generation_group,s.id as scenario_id,s.scenario_no,s.score,s.row_count,s.unplaced_count,
  coalesce((select sum(i.affected_count)::integer from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id),0) as hard_issue_count,
  coalesce((select count(*)::integer from public.schedule_room_assignment_issues r where r.scenario_id=s.id),0) as room_issue_count,
  (s.unplaced_count=0
   and not exists(select 1 from public.schedule_scenario_integrity_issues i where i.scenario_id=s.id)
   and not exists(select 1 from public.schedule_room_assignment_issues r where r.scenario_id=s.id)) as applicable
from public.schedule_scenarios s;
grant select on public.schedule_scenario_status_v2 to authenticated;
