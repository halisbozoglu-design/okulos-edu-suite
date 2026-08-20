create or replace function public.calculate_schedule_scenario_score_v2(p_scenario_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  s public.schedule_generation_settings%rowtype;
  score bigint:=0;
  v integer;
begin
  select * into s from public.schedule_generation_settings where id=true;

  score:=score+(select count(*)*10000 from public.schedule_unplaced_items where scenario_id=p_scenario_id);
  score:=score+(select count(*)*5000 from public.schedule_room_assignment_issues where scenario_id=p_scenario_id);

  select coalesce(sum(gaps),0)::integer into v from (
    select teacher_id,weekday,greatest(max(period)-min(period)+1-count(*),0) gaps
    from public.schedule_scenario_rows where scenario_id=p_scenario_id group by teacher_id,weekday
  ) q;
  score:=score+v*coalesce(s.gap_penalty,8);

  select coalesce(sum(gaps),0)::integer into v from (
    select class_id,weekday,greatest(max(period)-min(period)+1-count(distinct period),0) gaps
    from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null group by class_id,weekday
  ) q;
  score:=score+v*greatest(coalesce(s.gap_penalty,8)/2,1);

  select coalesce(sum(greatest(period-6,0)),0)::integer into v
  from public.schedule_scenario_rows where scenario_id=p_scenario_id;
  score:=score+v*coalesce(s.late_period_penalty,2);

  select coalesce(sum(greatest(day_course_hours-coalesce(s.max_same_course_per_day,2),0)),0)::integer into v
  from (
    select class_id,course_id,weekday,count(distinct period)::integer day_course_hours
    from public.schedule_scenario_rows
    where scenario_id=p_scenario_id and class_id is not null and course_id is not null
    group by class_id,course_id,weekday
  ) q;
  score:=score+v*coalesce(s.repeated_course_penalty,12);

  select coalesce(sum(case p.preference when 'avoid' then p.weight else -p.weight end),0)::integer into v
  from public.schedule_scenario_rows r
  join public.teacher_schedule_preferences p
    on p.teacher_id=r.teacher_id and p.weekday=r.weekday and p.period=r.period and p.active
  where r.scenario_id=p_scenario_id;
  score:=score+v;

  select coalesce(sum(q.c*12),0)::integer into v from (
    select r.teacher_id,count(*) c
    from public.schedule_scenario_rows r
    join public.teacher_schedule_constraints tc on tc.teacher_id=r.teacher_id
    where r.scenario_id=p_scenario_id and tc.preferred_free_day=r.weekday
    group by r.teacher_id
  ) q;
  score:=score+v;

  select coalesce(sum(
    (case when cardinality(cr.preferred_days)>0 and not(r.weekday=any(cr.preferred_days)) then 6 else 0 end)+
    (case when cardinality(cr.preferred_periods)>0 and not(r.period=any(cr.preferred_periods)) then 4 else 0 end)+
    (case when cr.avoid_last_period and r.period=(select periods_per_day from public.schedule_time_profiles where active=true limit 1) then 10 else 0 end)
  ),0)::integer into v
  from public.schedule_scenario_rows r
  join public.course_schedule_rules cr on cr.course_id=r.course_id and cr.active
  where r.scenario_id=p_scenario_id;
  score:=score+v;

  select coalesce(sum(maxc-minc),0)::integer into v from (
    select teacher_id,max(c) maxc,min(c) minc from (
      select teacher_id,weekday,count(*) c
      from public.schedule_scenario_rows where scenario_id=p_scenario_id group by teacher_id,weekday
    ) d group by teacher_id
  ) q;
  score:=score+v*2;

  select coalesce(sum(maxc-minc),0)::integer into v from (
    select class_id,max(c) maxc,min(c) minc from (
      select class_id,weekday,count(distinct period) c
      from public.schedule_scenario_rows where scenario_id=p_scenario_id and class_id is not null group by class_id,weekday
    ) d group by class_id
  ) q;
  score:=score+v*3;

  select coalesce(sum(greatest(room_count-1,0)),0)::integer into v from (
    select class_id,course_id,count(distinct classroom_id) room_count
    from public.schedule_scenario_rows
    where scenario_id=p_scenario_id and classroom_id is not null
    group by class_id,course_id
  ) q;
  score:=score+v*2;

  return greatest(least(score,2147483647),-2147483648)::integer;
end;
$$;

revoke all on function public.calculate_schedule_scenario_score_v2(uuid) from public;
grant execute on function public.calculate_schedule_scenario_score_v2(uuid) to authenticated;